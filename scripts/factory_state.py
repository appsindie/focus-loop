#!/usr/bin/env python3
"""AppsIndie factory state validator and phase advisor.

FACTORY_STATE.json is the machine-readable position of one product (or one Squad 0
idea) in the AI software factory. See the knowledge note
`appsindie-factory-state-contract`.

Usage:
  python scripts/factory_state.py --selftest
  python scripts/factory_state.py validate FACTORY_STATE.json [more.json ...]
  python scripts/factory_state.py next FACTORY_STATE.json
  python scripts/factory_state.py fmt FACTORY_STATE.json      # rewrite byte-stably
  python scripts/factory_state.py sweep                       # portfolio digest for Slack
  python scripts/factory_state.py sweep --format json

Stdlib only, on purpose: this runs in CI, in a Devin session and on a laptop
without a virtualenv. Output is byte-stable (sorted keys, 2-space indent,
trailing newline) so a reviewer can re-run it and diff.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import re
import sys
from pathlib import Path
from typing import Any


def _today() -> str:
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")

SCHEMA_PATH = (
    Path(__file__).resolve().parent.parent / ".agents" / "state" / "factory-state.schema.json"
)

PHASE_NAMES = {0: "research", 1: "shape", 2: "build", 3: "release", 4: "grow"}

# Gates that are irreversible: they spend a portfolio slot, or they reach
# production and the app stores. Silence never carries these.
IRREVERSIBLE_GATES = (0, 3)


# --------------------------------------------------------------------------
# A small JSON Schema (draft-07 subset) validator.
#
# Only the constructs used by factory-state.schema.json are supported. Keeping
# the schema as the single source of truth beats hand-coding the same rules
# twice and letting them drift.
# --------------------------------------------------------------------------

_TYPES: dict[str, Any] = {
    "object": dict,
    "array": list,
    "string": str,
    "integer": int,
    "boolean": bool,
    "null": type(None),
}


def _type_ok(value: Any, expected: str) -> bool:
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    py = _TYPES.get(expected)
    if py is None:
        return True
    if isinstance(value, bool) and py is not bool:
        return False
    return isinstance(value, py)


def _resolve(schema: dict[str, Any], root: dict[str, Any]) -> dict[str, Any]:
    seen = 0
    while "$ref" in schema:
        seen += 1
        if seen > 16:
            raise ValueError("$ref cycle in schema")
        ref = schema["$ref"]
        if not ref.startswith("#/"):
            raise ValueError(f"unsupported $ref: {ref}")
        node: Any = root
        for part in ref[2:].split("/"):
            node = node[part]
        schema = node
    return schema


def _validate(value: Any, schema: dict[str, Any], root: dict[str, Any], path: str,
              errors: list[str]) -> None:
    schema = _resolve(schema, root)

    if "const" in schema and value != schema["const"]:
        errors.append(f"{path}: expected {schema['const']!r}, got {value!r}")
        return

    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: {value!r} is not one of {schema['enum']}")
        return

    if "type" in schema:
        expected = schema["type"]
        allowed = expected if isinstance(expected, list) else [expected]
        if not any(_type_ok(value, t) for t in allowed):
            errors.append(f"{path}: expected type {expected}, got {type(value).__name__}")
            return

    if isinstance(value, str):
        if "minLength" in schema and len(value) < schema["minLength"]:
            errors.append(f"{path}: must not be empty")
        if "pattern" in schema and not re.match(schema["pattern"], value):
            errors.append(f"{path}: {value!r} does not match {schema['pattern']}")

    if isinstance(value, int) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append(f"{path}: {value} < minimum {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            errors.append(f"{path}: {value} > maximum {schema['maximum']}")

    if isinstance(value, list) and "items" in schema:
        for i, item in enumerate(value):
            _validate(item, schema["items"], root, f"{path}[{i}]", errors)

    if isinstance(value, dict):
        props: dict[str, Any] = schema.get("properties", {})
        pattern_props: dict[str, Any] = schema.get("patternProperties", {})

        for key in schema.get("required", []):
            if key not in value:
                errors.append(f"{path}: missing required field {key!r}")

        for key, item in sorted(value.items()):
            child = f"{path}.{key}" if path else key
            if key in props:
                _validate(item, props[key], root, child, errors)
                continue
            matched = [s for pat, s in pattern_props.items() if re.match(pat, key)]
            if matched:
                for sub in matched:
                    _validate(item, sub, root, child, errors)
                continue
            if schema.get("additionalProperties") is False:
                errors.append(f"{path}: unexpected field {key!r}")


# --------------------------------------------------------------------------
# Factory invariants — the rules that make unattended advancement safe.
# Numbered to match the knowledge note.
# --------------------------------------------------------------------------


def check_invariants(state: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    gates = state.get("gates") or {}
    phase = state.get("phase")

    def status(n: int) -> str:
        return (gates.get(str(n)) or {}).get("status", "open")

    # 1. A phase may not start before the gate that admits it has passed.
    if isinstance(phase, int) and phase >= 1 and status(phase - 1) != "passed":
        errors.append(
            f"invariant 1: phase {phase} ({PHASE_NAMES.get(phase, '?')}) requires "
            f"gate {phase - 1} to be passed, it is {status(phase - 1)!r}"
        )

    # 2. Gates pass in order.
    for n in range(1, 5):
        if status(n) == "passed" and status(n - 1) != "passed":
            errors.append(
                f"invariant 2: gate {n} is passed while gate {n - 1} is {status(n - 1)!r}"
            )

    # 3. A passed gate is evidenced and signed by a human.
    for n in range(5):
        gate = gates.get(str(n)) or {}
        if gate.get("status") != "passed":
            continue
        for field in ("signed_by", "signed_at", "evidence"):
            if not gate.get(field):
                errors.append(f"invariant 3: gate {n} is passed but has no {field}")

    # 4. A blocking exception blocks its gate.
    exceptions = state.get("open_exceptions") or []
    for exc in exceptions:
        if not exc.get("blocking"):
            continue
        gate_no = exc.get("gate")
        if gate_no is None:
            continue
        if status(gate_no) == "passed":
            errors.append(
                f"invariant 4: gate {gate_no} is passed with blocking exception "
                f"{exc.get('id')!r} still open"
            )

    # 5. A hold must say what it is waiting for.
    if state.get("hold") and not (state.get("next_action") or "").strip():
        errors.append("invariant 5: hold is true but next_action is empty")

    # 6. Silence never ships an irreversible decision.
    for exc in exceptions:
        if exc.get("gate") in IRREVERSIBLE_GATES and exc.get("default_if_silent") == "proceed":
            errors.append(
                f"invariant 6: exception {exc.get('id')!r} on irreversible gate "
                f"{exc.get('gate')} defaults to 'proceed'; it must default to 'block'"
            )

    # 7. Squad 0 state files identify their idea; product state files their product.
    if not state.get("product") and not state.get("idea_id"):
        errors.append("invariant 7: state must carry either 'product' or 'idea_id'")

    return errors


def validate_state(state: Any, schema: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    _validate(state, schema, schema, "", errors)
    if errors:
        return errors
    return check_invariants(state)


# --------------------------------------------------------------------------
# `next` — what may start now, and if nothing may, exactly why not.
# --------------------------------------------------------------------------


def next_step(state: dict[str, Any]) -> dict[str, Any]:
    gates = state.get("gates") or {}
    phase = int(state.get("phase", 0))

    def status(n: int) -> str:
        return (gates.get(str(n)) or {}).get("status", "open")

    blockers: list[str] = []
    if state.get("hold"):
        blockers.append("human-hold is set; a human has taken control")

    for exc in state.get("open_exceptions") or []:
        if exc.get("blocking"):
            blockers.append(
                f"blocking exception {exc.get('id')}: {exc.get('title')} "
                f"(owner {exc.get('owner')}, default if silent: {exc.get('default_if_silent')})"
            )

    review = state.get("last_review") or {}
    if review.get("verdict") in {"rework", "RESEARCH REQUIRED", "REJECT"}:
        blockers.append(f"last review verdict is {review['verdict']!r}; rework first")

    may_advance = not blockers and status(phase) == "passed" and phase < 4
    target = phase + 1 if may_advance else phase

    result: dict[str, Any] = {
        "phase": phase,
        "phase_name": PHASE_NAMES.get(phase, "unknown"),
        "current_gate": phase,
        "current_gate_status": status(phase),
        "may_advance": may_advance,
        "next_phase": target if may_advance else None,
        "next_phase_name": PHASE_NAMES.get(target) if may_advance else None,
        "requires_human_go_ahead": may_advance and target in (1, 4),
        "blockers": blockers,
        "next_action": state.get("next_action", ""),
    }
    if not may_advance and not blockers and status(phase) != "passed":
        result["blockers"] = [
            f"gate {phase} is {status(phase)!r}; it must be signed by a human before "
            f"phase {phase + 1} may start"
        ]
    return result


def dumps(obj: Any) -> str:
    """Byte-stable JSON, same discipline as scoring.py output."""
    return json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


# --------------------------------------------------------------------------
# `sweep` — the observer surface.
#
# The point of a digest is that a human who reads nothing else still learns
# whether anything needs them. So it leads with what needs them, and "nothing
# needs you" is one line rather than a wall of green.
# --------------------------------------------------------------------------


def discover(root: Path) -> list[Path]:
    return sorted(
        p for p in root.rglob("FACTORY_STATE.json") if ".git" not in p.parts
    )


def _label(state: dict[str, Any]) -> str:
    return state.get("product") or state.get("idea_id") or "unknown"


def _overdue(deadline: str | None, today: str) -> bool:
    return bool(deadline) and deadline < today


def sweep(states: list[tuple[Path, dict[str, Any]]], today: str) -> dict[str, Any]:
    needs_human: list[dict[str, Any]] = []
    held: list[dict[str, Any]] = []
    advancing: list[dict[str, Any]] = []
    working: list[dict[str, Any]] = []

    for path, state in states:
        step = next_step(state)
        entry: dict[str, Any] = {
            "name": _label(state),
            "path": str(path),
            "phase": step["phase"],
            "phase_name": step["phase_name"],
            "gate": step["current_gate"],
            "gate_status": step["current_gate_status"],
            "next_action": state.get("next_action", ""),
            "open_pr": state.get("open_pr"),
            "owner": state.get("owner", ""),
        }

        if state.get("hold"):
            held.append(entry)
            continue

        exceptions = [
            {
                "id": exc.get("id"),
                "title": exc.get("title"),
                "severity": exc.get("severity"),
                "gate": exc.get("gate"),
                "deadline": exc.get("deadline"),
                "default_if_silent": exc.get("default_if_silent"),
                "overdue": _overdue(exc.get("deadline"), today),
                "owner": exc.get("owner"),
            }
            for exc in state.get("open_exceptions") or []
        ]

        # A gate waiting on a signature needs a human just as much as an open
        # exception does -- it is the commonest reason a product sits still.
        awaiting_gate = (
            entry["gate_status"] == "open"
            and (state.get("last_review") or {}).get("verdict") in {"pass", "APPROVE"}
        )

        if exceptions or awaiting_gate:
            entry["exceptions"] = exceptions
            entry["awaiting_gate_signature"] = awaiting_gate
            needs_human.append(entry)
        elif step["may_advance"]:
            entry["next_phase_name"] = step["next_phase_name"]
            entry["requires_human_go_ahead"] = step["requires_human_go_ahead"]
            advancing.append(entry)
        else:
            entry["blockers"] = step["blockers"]
            working.append(entry)

    return {
        "generated_at": today,
        "counts": {
            "total": len(states),
            "needs_human": len(needs_human),
            "held": len(held),
            "advancing": len(advancing),
            "working": len(working),
        },
        "needs_human": needs_human,
        "held": held,
        "advancing": advancing,
        "working": working,
    }


def render_digest(digest: dict[str, Any]) -> str:
    """Markdown suitable for a Slack message or a PR comment."""
    counts = digest["counts"]
    lines: list[str] = [f"*AppsIndie factory — {digest['generated_at']}*", ""]

    if counts["total"] == 0:
        return "*AppsIndie factory* — no products or ideas are being tracked yet.\n"

    if counts["needs_human"] == 0 and counts["held"] == 0:
        lines.append(
            f"Nothing needs you. {counts['advancing']} advancing, "
            f"{counts['working']} in progress, across {counts['total']} tracked."
        )
        return "\n".join(lines) + "\n"

    if digest["needs_human"]:
        lines.append(f"*Needs you ({counts['needs_human']})*")
        for item in digest["needs_human"]:
            head = f"• *{item['name']}* — phase {item['phase']} ({item['phase_name']})"
            if item.get("open_pr"):
                head += f" — <{item['open_pr']}|PR>"
            lines.append(head)
            if item.get("awaiting_gate_signature"):
                lines.append(
                    f"    ◦ Gate {item['gate']} reviewed and passing — waiting on your signature"
                )
            for exc in item.get("exceptions", []):
                flag = " *OVERDUE*" if exc["overdue"] else ""
                deadline = f" by {exc['deadline']}" if exc["deadline"] else ""
                lines.append(
                    f"    ◦ [{exc['severity']}] {exc['id']}: {exc['title']}{deadline}"
                    f" — default if silent: `{exc['default_if_silent']}`{flag}"
                )
        lines.append("")

    if digest["held"]:
        lines.append(f"*Held by you ({counts['held']})*")
        for item in digest["held"]:
            lines.append(f"• *{item['name']}* — {item['next_action']}")
        lines.append("")

    lines.append(
        f"_{counts['advancing']} advancing, {counts['working']} in progress, "
        f"{counts['total']} tracked._"
    )
    return "\n".join(lines) + "\n"


# --------------------------------------------------------------------------
# Selftest
# --------------------------------------------------------------------------


def _base_state() -> dict[str, Any]:
    return {
        "schema_version": "1",
        "product": "focus-loop",
        "repo": "appsindie/focus-loop",
        "phase": 2,
        "gates": {
            "0": {
                "status": "passed",
                "signed_by": "justin.nguyen@appsindie.com",
                "signed_at": "2026-08-05",
                "evidence": "research/i01/FINAL_DECISION.json",
            },
            "1": {
                "status": "passed",
                "signed_by": "justin.nguyen@appsindie.com",
                "signed_at": "2026-08-12",
                "evidence": "docs/product/PRODUCT_CONCEPT.md",
            },
            "2": {"status": "open"},
            "3": {"status": "open"},
            "4": {"status": "open"},
        },
        "active_branch": "release/v1",
        "open_pr": "https://github.com/appsindie/focus-loop/pull/12",
        "last_review": {
            "verdict": "pass",
            "routine": "code-review",
            "session_url": "https://claude.ai/code/session_01HJKLMNOPQRSTUVWXYZ",
            "round_count": 1,
            "fired_at": "2026-08-14T09:12:00Z",
        },
        "open_exceptions": [],
        "hold": False,
        "next_action": "Run SIT regression per docs/qa/QA_PLAN.md, then request Gate 2.",
        "owner": "justin.nguyen@appsindie.com",
        "updated_at": "2026-08-14T09:12:00Z",
    }


def selftest() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    failures: list[str] = []

    def expect_valid(name: str, state: dict[str, Any]) -> None:
        errs = validate_state(state, schema)
        if errs:
            failures.append(f"{name}: expected valid, got {errs}")

    def expect_error(name: str, state: dict[str, Any], fragment: str) -> None:
        errs = validate_state(state, schema)
        if not any(fragment in e for e in errs):
            failures.append(f"{name}: expected an error containing {fragment!r}, got {errs}")

    expect_valid("baseline", _base_state())

    committed = Path(__file__).resolve().parent.parent / ".agents" / "state" / "factory-state.example.json"
    if committed.exists():
        expect_valid("committed example", json.loads(committed.read_text(encoding="utf-8")))

    s = _base_state()
    s["phase"] = 3
    expect_error("phase ahead of gate", s, "invariant 1")

    s = _base_state()
    s["gates"]["3"] = {
        "status": "passed",
        "signed_by": "x",
        "signed_at": "2026-08-20",
        "evidence": "docs/release/v1/EXCEPTION_REPORT.md",
    }
    expect_error("out-of-order gate", s, "invariant 2")

    s = _base_state()
    s["gates"]["2"] = {"status": "passed"}
    expect_error("unsigned pass", s, "invariant 3")

    s = _base_state()
    s["gates"]["2"] = {
        "status": "passed",
        "signed_by": "x",
        "signed_at": "2026-08-20",
        "evidence": "docs/qa/SIT.md",
    }
    s["open_exceptions"] = [
        {
            "id": "E1",
            "title": "SIT defect accepted without an owner",
            "severity": "high",
            "blocking": True,
            "default_if_silent": "block",
            "gate": 2,
            "owner": "justin.nguyen@appsindie.com",
        }
    ]
    expect_error("passed gate with blocking exception", s, "invariant 4")

    s = _base_state()
    s["hold"] = True
    s["next_action"] = "   "  # passes minLength, still says nothing
    expect_error("silent hold", s, "invariant 5")

    s = _base_state()
    s["open_exceptions"] = [
        {
            "id": "E2",
            "title": "Rollback never rehearsed for this release",
            "severity": "high",
            "blocking": True,
            "default_if_silent": "proceed",
            "gate": 3,
            "owner": "justin.nguyen@appsindie.com",
        }
    ]
    expect_error("silence ships production", s, "invariant 6")

    s = _base_state()
    del s["product"]
    expect_error("unidentified state", s, "invariant 7")

    s = _base_state()
    s["gates"]["9"] = {"status": "open"}
    expect_error("unknown gate key", s, "unexpected field")

    s = _base_state()
    s["updated_at"] = "2026-08-14 09:12"
    expect_error("loose timestamp", s, "does not match")

    # `next` behaviour
    s = _base_state()
    if next_step(s)["may_advance"]:
        failures.append("next: advanced with gate 2 still open")
    s["gates"]["2"] = {
        "status": "passed",
        "signed_by": "x",
        "signed_at": "2026-08-20",
        "evidence": "docs/qa/SIT.md",
    }
    out = next_step(s)
    if not out["may_advance"] or out["next_phase"] != 3:
        failures.append(f"next: expected advance to phase 3, got {out}")
    if out["requires_human_go_ahead"]:
        failures.append("next: phase 3 should not need a separate human go-ahead")

    s["hold"] = True
    if next_step(s)["may_advance"]:
        failures.append("next: advanced while hold was set")

    # Byte stability
    state = _base_state()
    if dumps(json.loads(dumps(state))) != dumps(state):
        failures.append("dumps is not idempotent")

    # sweep: the digest must lead with what needs the human.
    # A genuinely quiet product is mid-slice: no verdict in yet, nothing open.
    quiet_state = _base_state()
    quiet_state["last_review"] = None
    quiet = sweep([(Path("a/FACTORY_STATE.json"), quiet_state)], "2026-08-20")
    if quiet["counts"]["needs_human"] != 0:
        failures.append(f"sweep: clean product should not need a human, got {quiet}")
    if "Nothing needs you" not in render_digest(quiet):
        failures.append("sweep: quiet digest should say nothing needs you in one line")

    s = _base_state()
    s["last_review"] = None
    s["open_exceptions"] = [
        {
            "id": "E1",
            "title": "Rollback owner unnamed",
            "severity": "high",
            "blocking": True,
            "default_if_silent": "block",
            "gate": 3,
            "deadline": "2026-08-10",
            "owner": "justin.nguyen@appsindie.com",
        }
    ]
    loud = sweep([(Path("a/FACTORY_STATE.json"), s)], "2026-08-20")
    if loud["counts"]["needs_human"] != 1:
        failures.append("sweep: an open exception must surface as needing a human")
    if not loud["needs_human"][0]["exceptions"][0]["overdue"]:
        failures.append("sweep: a deadline in the past must be flagged overdue")
    rendered = render_digest(loud)
    for fragment in ("Needs you", "OVERDUE", "E1"):
        if fragment not in rendered:
            failures.append(f"sweep: digest missing {fragment!r}")

    # A held product is the human's own doing -- reported, but not "needs you".
    s = _base_state()
    s["hold"] = True
    heldd = sweep([(Path("a/FACTORY_STATE.json"), s)], "2026-08-20")
    if heldd["counts"]["held"] != 1 or heldd["counts"]["needs_human"] != 0:
        failures.append(f"sweep: held product miscategorised: {heldd['counts']}")

    # A passing review on an open gate is waiting on a signature.
    s = _base_state()
    s["phase"] = 2
    s["last_review"] = dict(_base_state()["last_review"], verdict="pass")
    waiting = sweep([(Path("a/FACTORY_STATE.json"), s)], "2026-08-20")
    if not waiting["needs_human"] or not waiting["needs_human"][0]["awaiting_gate_signature"]:
        failures.append("sweep: a passing review on an open gate must await a signature")

    if sweep([], "2026-08-20")["counts"]["total"] != 0:
        failures.append("sweep: empty portfolio should not error")
    if "no products" not in render_digest(sweep([], "2026-08-20")):
        failures.append("sweep: empty portfolio should render a clear line")

    if failures:
        for f in failures:
            print(f"FAIL: {f}", file=sys.stderr)
        raise SystemExit(1)
    print("SELFTEST PASSED")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--selftest", action="store_true", help="Run built-in fixtures and exit")
    parser.add_argument("command", nargs="?", choices=["validate", "next", "fmt", "sweep"])
    parser.add_argument("paths", nargs="*")
    parser.add_argument(
        "--format",
        choices=["slack", "json"],
        default="slack",
        help="sweep only: digest rendering (default: slack)",
    )
    parser.add_argument(
        "--root",
        default=".",
        help="sweep only: directory to discover FACTORY_STATE.json under (default: .)",
    )
    args = parser.parse_args(argv)

    if args.selftest:
        selftest()
        return

    if not args.command:
        parser.error("a command is required unless --selftest")

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))

    if args.command == "sweep":
        paths = [Path(p) for p in args.paths] or discover(Path(args.root))
        states: list[tuple[Path, dict[str, Any]]] = []
        failed = False
        for path in paths:
            try:
                state = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                print(f"{path}: ERROR {exc}", file=sys.stderr)
                failed = True
                continue
            errors = validate_state(state, schema)
            if errors:
                # An invalid state file is itself something the human must see --
                # report it, do not drop the product silently out of the digest.
                for err in errors:
                    print(f"{path}: {err}", file=sys.stderr)
                failed = True
                continue
            states.append((path, state))

        today = _today()
        digest = sweep(states, today)
        if args.format == "json":
            print(dumps(digest), end="")
        else:
            print(render_digest(digest), end="")
        if failed:
            raise SystemExit(1)
        return

    if not args.paths:
        parser.error(f"{args.command} needs at least one FACTORY_STATE.json path")

    failed = False

    for raw in args.paths:
        path = Path(raw)
        try:
            state = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            print(f"{path}: ERROR {exc}", file=sys.stderr)
            failed = True
            continue

        if args.command == "fmt":
            path.write_text(dumps(state), encoding="utf-8")
            print(f"Wrote {path}")
            continue

        errors = validate_state(state, schema)
        if errors:
            failed = True
            for err in errors:
                print(f"{path}: {err}", file=sys.stderr)
            continue

        if args.command == "validate":
            print(f"{path}: OK")
        else:
            print(dumps(next_step(state)), end="")

    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
