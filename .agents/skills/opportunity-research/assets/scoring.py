#!/usr/bin/env python3
"""AppsIndie opportunity scoring + ads economics calculator.

CANONICAL — this file is the only copy of the algorithm.
`scripts/scoring.py` is a shim that executes this file, so both invocations
are the same code. Never fork it.

Usage:
  python scoring.py --selftest
  python scoring.py inputs.json                 # writes scoring-output.json beside inputs
  python scoring.py inputs.json -o out.json
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any

# --- Weights and multipliers from V5 §4–§5 (research-process thresholds) ---

CRITERION_WEIGHTS: dict[str, float] = {
    "search_intent": 0.10,
    "usage_frequency": 0.10,
    "ad_inventory_quality": 0.10,
    "ads_monetizability": 0.10,
    "expansion_optionality": 0.07,
    "competitive_winnability": 0.15,
    "non_aso_distribution": 0.10,
    "tier1_market_opportunity": 0.07,
    "b2b_b2b2c_expansion": 0.07,
    "hub_reusable_assets": 0.10,
    "ai_leverage": 0.04,
}

RISK_PENALTY: dict[int, float] = {
    1: 0,
    2: 0,
    3: 3,
    4: 3,
    5: 7,
    6: 7,
    7: 12,
}

SCORE_KEYS_1_TO_10 = (
    list(CRITERION_WEIGHTS.keys())
    + ["execution_feasibility", "acquisition_plausibility"]
)


def feasibility_multiplier(execution_feasibility: float) -> float:
    return 0.50 + (execution_feasibility * 0.05)


def acquisition_multiplier(acquisition_plausibility: float) -> float:
    return 0.60 + (acquisition_plausibility * 0.04)


def risk_penalty(risk_level: int) -> float:
    """Return penalty for risk 1–7. Risk ≥ 8 is Auto Reject (caller handles)."""
    if risk_level >= 8:
        raise ValueError(f"Risk level {risk_level} is Auto Reject")
    if risk_level not in RISK_PENALTY:
        raise ValueError(f"Unsupported risk level: {risk_level}")
    return RISK_PENALTY[risk_level]


def _require_score_1_to_10(name: str, value: float) -> float:
    v = float(value)
    if v < 1.0 or v > 10.0:
        raise ValueError(f"{name}={v} out of range; criterion scores must be 1–10")
    return v


def base_score(scores: dict[str, float]) -> float:
    total = 0.0
    for key, weight in CRITERION_WEIGHTS.items():
        if key not in scores:
            raise KeyError(f"Missing criterion score: {key}")
        s = _require_score_1_to_10(key, scores[key])
        total += (s / 10.0) * weight
    result = total * 100.0
    if result < 0.0 or result > 100.0 + 1e-9:
        raise ValueError(f"base_score={result} outside 0–100 (check criterion inputs)")
    return result


def final_score(
    scores: dict[str, float],
    execution_feasibility: float,
    acquisition_plausibility: float,
    risk_level: int,
) -> dict[str, Any]:
    risk = int(risk_level)
    if risk >= 8:
        return {
            "auto_reject": True,
            "risk_level": risk,
            "base_score": None,
            "feasibility_multiplier": None,
            "acquisition_multiplier": None,
            "risk_penalty": None,
            "final_score": None,
        }

    ef = _require_score_1_to_10("execution_feasibility", execution_feasibility)
    ap = _require_score_1_to_10("acquisition_plausibility", acquisition_plausibility)
    base = base_score(scores)
    f_mult = feasibility_multiplier(ef)
    a_mult = acquisition_multiplier(ap)
    penalty = risk_penalty(risk)
    final = (base * f_mult * a_mult) - penalty
    return {
        "auto_reject": False,
        "risk_level": risk,
        "base_score": round(base, 6),
        "feasibility_multiplier": round(f_mult, 6),
        "acquisition_multiplier": round(a_mult, 6),
        "risk_penalty": penalty,
        "final_score": round(final, 6),
    }


def stddev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    var = sum((v - mean) ** 2 for v in values) / (len(values) - 1)
    return math.sqrt(var)


def top_gap(sorted_desc: list[float]) -> float | None:
    if len(sorted_desc) < 3:
        return None
    return sorted_desc[0] - sorted_desc[2]


def ranking_resolution(final_scores: list[float]) -> dict[str, Any]:
    ordered = sorted(final_scores, reverse=True)
    sd = stddev(final_scores)
    gap = top_gap(ordered)
    warn = False
    if len(final_scores) >= 8 and (sd < 4 or (gap is not None and gap < 3)):
        warn = True
    return {
        "count": len(final_scores),
        "standard_deviation": round(sd, 6),
        "top_1_to_3_gap": None if gap is None else round(gap, 6),
        "low_ranking_resolution": warn,
    }


# --- Economics (V5 S3.5–S3.7) ---


def cohort_mau(
    monthly_installs: list[float],
    retention_by_age_months: list[float],
) -> list[float]:
    """MAU in month t = sum over cohorts m of installs_m * P(still active at age t-m).

    retention_by_age_months[0] = fraction still monthly-active in install month (age 0),
    [1] = age 1 month, etc. Length must cover the horizon.
    """
    n = len(monthly_installs)
    if len(retention_by_age_months) < n:
        raise ValueError("retention_by_age_months shorter than monthly_installs horizon")
    mau: list[float] = []
    for t in range(n):
        total = 0.0
        for m in range(t + 1):
            age = t - m
            total += monthly_installs[m] * retention_by_age_months[age]
        mau.append(total)
    return mau


def format_revenue(
    mau: float,
    active_days_per_user_per_month: float,
    sessions_per_active_day: float,
    formats: list[dict[str, float]],
) -> dict[str, Any]:
    """formats items: name, eligible_impressions_per_session, fill_rate, ecpm."""
    by_format: list[dict[str, Any]] = []
    total_revenue = 0.0
    for fmt in formats:
        filled = (
            mau
            * active_days_per_user_per_month
            * sessions_per_active_day
            * float(fmt["eligible_impressions_per_session"])
            * float(fmt["fill_rate"])
        )
        # eCPM is revenue per 1000 impressions
        revenue = filled * (float(fmt["ecpm"]) / 1000.0)
        by_format.append(
            {
                "name": fmt.get("name", "unnamed"),
                "filled_impressions": filled,
                "revenue": revenue,
            }
        )
        total_revenue += revenue
    ad_arpu = (total_revenue / mau) if mau else 0.0
    return {
        "by_format": by_format,
        "total_ad_revenue": total_revenue,
        "ad_arpu": ad_arpu,
    }


def variable_contribution_per_mau(
    ad_arpu: float,
    subscription_per_mau: float = 0.0,
    iap_per_mau: float = 0.0,
    ai_cost_per_mau: float = 0.0,
    variable_infra_per_mau: float = 0.0,
    variable_support_per_mau: float = 0.0,
) -> float:
    return (
        ad_arpu
        + subscription_per_mau
        + iap_per_mau
        - ai_cost_per_mau
        - variable_infra_per_mau
        - variable_support_per_mau
    )


def net_monthly_contribution(
    variable_contribution_per_mau: float,
    mau: float,
    monthly_fixed_cash_operating_cost: float,
) -> float:
    return (variable_contribution_per_mau * mau) - monthly_fixed_cash_operating_cost


def cash_break_even_mau(
    monthly_fixed_cash_operating_cost: float,
    variable_contribution_per_mau: float,
) -> float | None:
    if variable_contribution_per_mau <= 0:
        return None
    return monthly_fixed_cash_operating_cost / variable_contribution_per_mau


def contribution_per_build_week(
    net_monthly_contribution: float,
    build_weeks: float,
    validation_weeks: float = 0.0,
) -> float | None:
    total_weeks = float(build_weeks) + float(validation_weeks)
    if total_weeks <= 0:
        return None
    return net_monthly_contribution / total_weeks


def validate_geo_mix(geo_mix: dict[str, float] | None) -> None:
    if geo_mix is None:
        return
    total = sum(float(v) for v in geo_mix.values())
    if abs(total - 100.0) > 1e-6:
        raise ValueError(f"geo_mix must sum to 100, got {total}")


def _economics_at_mau(
    mau: float,
    eco: dict[str, Any],
) -> dict[str, Any]:
    rev = format_revenue(
        mau,
        float(eco["active_days_per_user_per_month"]),
        float(eco["sessions_per_active_day"]),
        eco["formats"],
    )
    vc = variable_contribution_per_mau(
        rev["ad_arpu"],
        float(eco.get("subscription_per_mau", 0)),
        float(eco.get("iap_per_mau", 0)),
        float(eco.get("ai_cost_per_mau", 0)),
        float(eco.get("variable_infra_per_mau", 0)),
        float(eco.get("variable_support_per_mau", 0)),
    )
    fixed = float(eco["monthly_fixed_cash_operating_cost"])
    net = net_monthly_contribution(vc, mau, fixed)
    return {
        "mau": mau,
        "revenue": rev,
        "ad_arpu": rev["ad_arpu"],
        "total_ad_revenue": rev["total_ad_revenue"],
        "variable_contribution_per_mau": vc,
        "net_monthly_contribution": net,
        "cash_break_even_mau": cash_break_even_mau(fixed, vc),
    }


def run_economics(eco: dict[str, Any]) -> dict[str, Any]:
    validate_geo_mix(eco.get("geo_mix"))
    installs = [float(x) for x in eco["monthly_installs"]]
    retention = [float(x) for x in eco["retention_by_age_months"]]
    mau_series = cohort_mau(installs, retention)
    if len(mau_series) < 9:
        raise ValueError(
            f"economics requires a cohort horizon of at least 9 months "
            f"(Month 9 = index 8); got {len(mau_series)}. "
            "Do not treat a short horizon as failing the $2,000 Month-9 target."
        )
    if len(mau_series) < 12:
        raise ValueError(
            f"economics requires a 12-month cohort for Month-12 snapshots and "
            f"twelve_month_contribution_per_build_week; got {len(mau_series)}"
        )
    month_index = int(eco.get("report_month_index", 11))  # 0-based; 8 = month 9
    if month_index < 0 or month_index >= len(mau_series):
        raise ValueError("report_month_index out of range for monthly_installs")

    build_weeks = float(eco.get("build_weeks", 0))
    validation_weeks = float(eco.get("validation_weeks", 0))
    if "build_weeks" not in eco:
        raise KeyError(
            "economics.build_weeks is required to evaluate the Month-9 numeric target "
            "(Net ≥ $2,000 AND build-weeks ≤ 8)"
        )

    # Scenario multipliers apply to Base MAU only — do not also change retention
    # (V5: changing retention + MAU multiplier double-counts).
    scenarios_cfg = eco.get(
        "scenarios",
        {
            "conservative": {"mau_multiplier": 0.7},
            "base": {"mau_multiplier": 1.0},
            "optimistic": {"mau_multiplier": 1.3},
        },
    )

    month_snapshots: dict[str, Any] = {
        "month_9": _economics_at_mau(mau_series[8], eco),
        "month_12": _economics_at_mau(mau_series[11], eco),
    }

    base_month12_mau = mau_series[11]
    scenarios: dict[str, Any] = {}
    for name, cfg in scenarios_cfg.items():
        mult = float(cfg.get("mau_multiplier", 1.0))
        # Optional monetization overrides per scenario (eCPM etc.) — not retention.
        scenario_eco = dict(eco)
        if "formats" in cfg:
            scenario_eco["formats"] = cfg["formats"]
        snap = _economics_at_mau(base_month12_mau * mult, scenario_eco)
        snap["mau_multiplier"] = mult
        scenarios[name] = snap

    net_m9 = float(month_snapshots["month_9"]["net_monthly_contribution"])
    meets = (net_m9 >= 2000.0) and (build_weeks <= 8.0)

    base_realistic = month_snapshots["month_12"]
    cpw = contribution_per_build_week(
        float(base_realistic["net_monthly_contribution"]),
        build_weeks,
        validation_weeks,
    )

    # Cumulative twelve-month Net ÷ total build+validation weeks (V5 S3.7 / Final Decision JSON)
    cumulative_twelve_month_net = sum(
        float(_economics_at_mau(mau_series[t], eco)["net_monthly_contribution"])
        for t in range(12)
    )
    total_weeks = float(build_weeks) + float(validation_weeks)
    twelve_month_cpw = (
        cumulative_twelve_month_net / total_weeks if total_weeks > 0 else None
    )

    shadow = eco.get("developer_weekly_shadow_cost")  # [low, mid, high] optional
    opportunity_cost = None
    if shadow is not None:
        if len(shadow) != 3:
            raise ValueError("developer_weekly_shadow_cost must be [low, mid, high]")
        opportunity_cost = [float(c) * total_weeks for c in shadow]

    report = _economics_at_mau(mau_series[month_index], eco)
    return {
        "mau_series": mau_series,
        "report_month_index": month_index,
        "mau": report["mau"],
        "revenue": report["revenue"],
        "variable_contribution_per_mau": report["variable_contribution_per_mau"],
        "monthly_fixed_cash_operating_cost": float(eco["monthly_fixed_cash_operating_cost"]),
        "net_monthly_contribution": report["net_monthly_contribution"],
        "cash_break_even_mau": report["cash_break_even_mau"],
        "build_weeks": build_weeks,
        "validation_weeks": validation_weeks,
        "month_snapshots": month_snapshots,
        "scenarios": scenarios,
        "monthly_contribution_per_build_week": cpw,
        "cumulative_twelve_month_net_contribution": cumulative_twelve_month_net,
        "twelve_month_contribution_per_build_week": twelve_month_cpw,
        "developer_opportunity_cost_low_mid_high": opportunity_cost,
        "month_9_net_contribution_at_least_2000": net_m9 >= 2000.0,
        "meets_numeric_target_month_9": meets,
        "geo_mix": eco.get("geo_mix"),
    }


def run_from_inputs(data: dict[str, Any]) -> dict[str, Any]:
    has_ideas = "ideas" in data
    has_economics = "economics" in data
    if not has_ideas and not has_economics:
        raise ValueError(
            "inputs.json must contain 'ideas' and/or 'economics'; "
            f"got keys {sorted(data.keys())}"
        )

    out: dict[str, Any] = {"schema": "appsindie-scoring-output/v1"}

    if has_ideas:
        if not isinstance(data["ideas"], list):
            raise ValueError("'ideas' must be a list")
        scored = []
        finals: list[float] = []
        for idea in data["ideas"]:
            result = final_score(
                idea["scores"],
                idea["execution_feasibility"],
                idea["acquisition_plausibility"],
                int(idea["risk_level"]),
            )
            row = {"idea_id": idea.get("idea_id"), **result}
            scored.append(row)
            if not result.get("auto_reject") and result.get("final_score") is not None:
                finals.append(float(result["final_score"]))
        out["ideas"] = scored
        out["ranking_resolution"] = ranking_resolution(finals)

    if has_economics:
        out["economics"] = run_economics(data["economics"])

    return out


OUTPUT_PRECISION = 6


def _round_floats(obj: Any, precision: int = OUTPUT_PRECISION) -> Any:
    """Round every float before writing, so the same inputs always produce the
    same bytes.

    Without this, binary float noise leaks into the file (23244.739999999998 vs
    23244.74) and the reviewer's "re-run and diff scoring-output.json" check in
    gate-research-pr.md reports a difference that is not a difference.
    """
    if isinstance(obj, float):
        return round(obj, precision)
    if isinstance(obj, dict):
        return {k: _round_floats(v, precision) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_round_floats(v, precision) for v in obj]
    return obj


def _approx(a: float, b: float, tol: float = 1e-9) -> bool:
    return abs(a - b) <= tol


def selftest() -> None:
    failures: list[str] = []

    # Fixture 1: Execution Feasibility 8 → 0.90
    if not _approx(feasibility_multiplier(8), 0.90):
        failures.append(f"feasibility_multiplier(8)={feasibility_multiplier(8)} != 0.90")

    # Fixture 2: Acquisition Plausibility 7 → 0.88
    if not _approx(acquisition_multiplier(7), 0.88):
        failures.append(
            f"acquisition_multiplier(7)={acquisition_multiplier(7)} != 0.88"
        )

    # Fixture 3: eCPM / 1000 — 1_000_000 impressions at $2.50 eCPM → $2,500
    rev = format_revenue(
        mau=1.0,
        active_days_per_user_per_month=1.0,
        sessions_per_active_day=1.0,
        formats=[
            {
                "name": "test",
                "eligible_impressions_per_session": 1_000_000.0,
                "fill_rate": 1.0,
                "ecpm": 2.50,
            }
        ],
    )
    if not _approx(rev["total_ad_revenue"], 2500.0):
        failures.append(
            f"eCPM/1000 failed: revenue={rev['total_ad_revenue']} != 2500 "
            "(would be 2_500_000 if eCPM was not divided by 1000)"
        )

    # Fixture 4: fixed cost subtraction is real
    vc = 0.05
    mau = 60_000.0
    fixed = 800.0
    net = net_monthly_contribution(vc, mau, fixed)
    variable_only = vc * mau
    if not _approx(net, 2200.0):
        failures.append(f"net={net} != 2200")
    if _approx(net, variable_only):
        failures.append(
            f"net incorrectly equals Variable×MAU ({variable_only}); fixed cost not applied"
        )
    if not _approx(variable_only, 3000.0):
        failures.append(f"Variable×MAU={variable_only} != 3000")

    # Weights sum
    if not _approx(sum(CRITERION_WEIGHTS.values()), 1.0):
        failures.append(f"weights sum={sum(CRITERION_WEIGHTS.values())} != 1.0")

    # Cohort
    mau_s = cohort_mau([100, 100, 100], [1.0, 0.5, 0.25])
    expected = [100.0, 150.0, 175.0]
    if mau_s != expected:
        failures.append(f"cohort_mau={mau_s} != {expected}")

    # Empty input must fail
    try:
        run_from_inputs({"idea": []})
        failures.append("missing ideas/economics should raise")
    except ValueError:
        pass

    # Score out of range must fail
    try:
        base_score({k: 8 for k in CRITERION_WEIGHTS} | {"search_intent": 80})
        failures.append("score 80 should raise")
    except ValueError:
        pass

    # Auto reject continues batch
    sample_scores = {k: 7.0 for k in CRITERION_WEIGHTS}
    batch = run_from_inputs(
        {
            "ideas": [
                {
                    "idea_id": "ok",
                    "scores": sample_scores,
                    "execution_feasibility": 8,
                    "acquisition_plausibility": 7,
                    "risk_level": 3,
                },
                {
                    "idea_id": "bad",
                    "scores": sample_scores,
                    "execution_feasibility": 8,
                    "acquisition_plausibility": 7,
                    "risk_level": 9,
                },
            ]
        }
    )
    if not batch["ideas"][1].get("auto_reject"):
        failures.append("risk 9 should set auto_reject")
    if batch["ideas"][0].get("final_score") is None:
        failures.append("non-reject idea should still be scored")

    # Numeric target needs build_weeks
    eco_base = {
        "monthly_installs": [1000.0] * 12,
        "retention_by_age_months": [1.0] + [0.4] * 11,
        "active_days_per_user_per_month": 8,
        "sessions_per_active_day": 1.5,
        "formats": [
            {
                "name": "interstitial",
                "eligible_impressions_per_session": 1.0,
                "fill_rate": 0.8,
                "ecpm": 5.0,
            }
        ],
        "monthly_fixed_cash_operating_cost": 200,
        "build_weeks": 6,
        "validation_weeks": 2,
        "geo_mix": {"tier1": 40, "tier2": 35, "tier3": 25},
    }
    eco_out = run_from_inputs({"economics": eco_base})["economics"]
    if "meets_numeric_target_month_9" not in eco_out:
        failures.append("missing meets_numeric_target_month_9")
    if eco_out["build_weeks"] != 6:
        failures.append("build_weeks not echoed")
    if "scenarios" not in eco_out or "base" not in eco_out["scenarios"]:
        failures.append("scenarios missing")
    if eco_out.get("twelve_month_contribution_per_build_week") is None:
        failures.append("twelve_month_contribution_per_build_week missing")

    # build_weeks 12 must fail numeric target even when Month-9 Net ≥ $2,000.
    # Use ~60k installs so the net flag is True — otherwise and-short-circuit hides the bug.
    eco_long = dict(eco_base)
    eco_long["monthly_installs"] = [60_000.0] * 12
    eco_long["build_weeks"] = 12
    eco_long["monthly_fixed_cash_operating_cost"] = 0
    long_out = run_from_inputs({"economics": eco_long})["economics"]
    if not long_out.get("month_9_net_contribution_at_least_2000"):
        failures.append(
            f"fixture setup failed: expected Month-9 Net ≥ 2000, got "
            f"{long_out.get('month_snapshots', {}).get('month_9', {}).get('net_monthly_contribution')}"
        )
    if long_out.get("meets_numeric_target_month_9"):
        failures.append(
            "meets_numeric_target must be False when build_weeks > 8 even if Net ≥ 2000"
        )
    # Prove the build_weeks clause is what fails: same eco with build_weeks 6 should meet
    eco_long_ok = dict(eco_long)
    eco_long_ok["build_weeks"] = 6
    ok_out = run_from_inputs({"economics": eco_long_ok})["economics"]
    if not ok_out.get("meets_numeric_target_month_9"):
        failures.append("control case build_weeks=6 should meet numeric target")

    # Short horizon must raise with the matching guard message
    try:
        short = dict(eco_base)
        short["monthly_installs"] = [1000.0] * 6
        short["retention_by_age_months"] = [1.0] + [0.4] * 5
        run_from_inputs({"economics": short})
        failures.append("horizon < 9 months should raise")
    except ValueError as exc:
        if "at least 9 months" not in str(exc):
            failures.append(f"6-month horizon should hit <9 guard, got: {exc}")

    try:
        mid = dict(eco_base)
        mid["monthly_installs"] = [1000.0] * 10
        mid["retention_by_age_months"] = [1.0] + [0.4] * 9
        run_from_inputs({"economics": mid})
        failures.append("horizon 10 months should raise (<12)")
    except ValueError as exc:
        if "12-month cohort" not in str(exc):
            failures.append(f"10-month horizon should hit <12 guard, got: {exc}")

    # geo mix must sum 100
    try:
        bad = dict(eco_base)
        bad["geo_mix"] = {"tier1": 50, "tier2": 50, "tier3": 50}
        run_from_inputs({"economics": bad})
        failures.append("geo_mix != 100 should raise")
    except ValueError:
        pass

    # Output must be byte-stable so the reviewer's re-run-and-diff check works
    stable_out = run_from_inputs({"economics": eco_base})
    first = json.dumps(_round_floats(stable_out), indent=2)
    second = json.dumps(_round_floats(run_from_inputs({"economics": eco_base})), indent=2)
    if first != second:
        failures.append("scoring output is not byte-stable across identical runs")
    if "999999" in first or "000001" in first:
        failures.append(f"float noise survived rounding in output: {first[:200]}")

    if failures:
        print("SELFTEST FAILED:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        raise SystemExit(1)
    print("SELFTEST PASSED")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "inputs",
        nargs="?",
        help="Path to inputs.json (ideas and/or economics)",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Output path (default: scoring-output.json next to inputs)",
    )
    parser.add_argument(
        "--selftest",
        action="store_true",
        help="Run built-in fixtures and exit",
    )
    args = parser.parse_args(argv)

    if args.selftest:
        selftest()
        return

    if not args.inputs:
        parser.error("inputs.json required unless --selftest")

    path = Path(args.inputs)
    data = json.loads(path.read_text(encoding="utf-8"))
    try:
        result = run_from_inputs(data)
    except (ValueError, KeyError, TypeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2) from exc
    out_path = Path(args.output) if args.output else path.with_name("scoring-output.json")
    out_path.write_text(json.dumps(_round_floats(result), indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
