import ActivityKit
import SwiftUI
import WidgetKit

// FocusLoopActivityAttributes lives in Attributes.swift — the config plugin
// compiles that file into BOTH this extension target and the app target
// (for Module.swift), so the type is declared once, shared by both.

// ── Shared widget data ─────────────────────────────────────────────────────
// Written by the app via Module.setSharedData into the App Group UserDefaults.

private let appGroupId = "group.com.appsindie.focusloop"

struct WidgetSnapshot: Codable {
    struct Running: Codable {
        var kind: String
        var displayMode: String
        var remainingSeconds: Int
        var endsAtMs: Double
        var paused: Bool
        var currentFocusNumber: Int
        var totalFocusCount: Int
    }
    var weekDaysMet: Int
    var weekGoalDays: Int
    var nextParkedText: String?
    var focusMinutes: Int
    var running: Running?
    // Localized {placeholder} templates piped from the app (managed workflow
    // gives the extension no string catalog of its own).
    var strings: [String: String]?
}

func loadWidgetSnapshot() -> WidgetSnapshot {
    guard
        let json = UserDefaults(suiteName: appGroupId)?.string(forKey: "widgetData"),
        let data = json.data(using: .utf8),
        let snapshot = try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    else {
        return WidgetSnapshot(weekDaysMet: 0, weekGoalDays: 4, nextParkedText: nil, focusMinutes: 25, running: nil, strings: nil)
    }
    return snapshot
}

private let inkColor = Color(red: 0.15, green: 0.13, blue: 0.11)
private let emberColor = Color(red: 0.83, green: 0.39, blue: 0.12)
private let canvasColor = Color(red: 0.98, green: 0.96, blue: 0.94)

// containerBackground is iOS 17+; the extension deploys at 16.2, so fall back
// to a plain background on earlier OS versions.
extension View {
    @ViewBuilder func widgetCanvasBackground() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(canvasColor, for: .widget)
        } else {
            self.background(canvasColor)
        }
    }
}

private func startURL() -> URL { URL(string: "focusloop://start")! }
private func pauseURL() -> URL { URL(string: "focusloop://pause")! }

// Resolve a snapshot-piped template ({name} placeholders) against vars, with
// the English literal as the fallback when the app hasn't published strings
// yet (older JS, wiped storage).
private func tr(_ snapshot: WidgetSnapshot, _ key: String, _ fallback: String, _ vars: [String: String] = [:]) -> String {
    var text = snapshot.strings?[key] ?? fallback
    for (name, value) in vars {
        text = text.replacingOccurrences(of: "{\(name)}", with: value)
    }
    return text
}

private func tra(_ attrs: FocusLoopActivityAttributes, _ key: String, _ fallback: String) -> String {
    attrs.strings[key] ?? fallback
}

// ── Timeline provider ──────────────────────────────────────────────────────

struct FocusLoopEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
}

struct FocusLoopProvider: TimelineProvider {
    func placeholder(in context: Context) -> FocusLoopEntry {
        FocusLoopEntry(date: Date(), snapshot: WidgetSnapshot(weekDaysMet: 2, weekGoalDays: 4, nextParkedText: nil, focusMinutes: 25, running: nil, strings: nil))
    }

    func getSnapshot(in context: Context, completion: @escaping (FocusLoopEntry) -> Void) {
        completion(FocusLoopEntry(date: Date(), snapshot: loadWidgetSnapshot()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FocusLoopEntry>) -> Void) {
        let now = Date()
        let snapshot = loadWidgetSnapshot()
        var entries = [FocusLoopEntry(date: now, snapshot: snapshot)]
        // CR-19: the running state is rendered against the entry's date, so an
        // entry just past endsAt flips the widget back to idle copy even when
        // the app never republishes (backgrounded, killed, rebooted).
        if let running = snapshot.running, !running.paused {
            let endsAt = Date(timeIntervalSince1970: running.endsAtMs / 1000)
            if endsAt > now {
                entries.append(FocusLoopEntry(date: endsAt.addingTimeInterval(1), snapshot: snapshot))
            }
        }
        completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(3600))))
    }
}

// CR-19: a running state only counts while its endsAt is still ahead —
// paused stays true (no wall-clock end), an expired countdown is idle.
private func liveRunning(_ snapshot: WidgetSnapshot, at date: Date) -> WidgetSnapshot.Running? {
    guard let running = snapshot.running else { return nil }
    if running.paused { return running }
    let endsAt = Date(timeIntervalSince1970: running.endsAtMs / 1000)
    return endsAt > date ? running : nil
}

// ── Home-screen widget (P24 small + medium) ────────────────────────────────

struct FocusLoopHomeWidgetView: View {
    let entry: FocusLoopEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("FOCUS LOOP")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(emberColor)
                .kerning(1)
            if let running = liveRunning(entry.snapshot, at: entry.date) {
                Text(running.kind == "focus" ? tr(entry.snapshot, "focusCounter", "Focus {n} of {total}", ["n": "\(running.currentFocusNumber)", "total": "\(running.totalFocusCount)"]) : tr(entry.snapshot, "breakLabel", "Break"))
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(inkColor)
                Text(running.paused ? tr(entry.snapshot, "pausedLabel", "Paused") : tr(entry.snapshot, "minLeft", "{minutes} min left", ["minutes": "\(max(1, Int(running.endsAtMs / 1000 - entry.date.timeIntervalSince1970) / 60))"]))
                    .font(.system(size: 12))
                    .foregroundColor(inkColor.opacity(0.6))
            } else {
                Text(tr(entry.snapshot, "focusStart", "Focus {minutes}", ["minutes": "\(entry.snapshot.focusMinutes)"]))
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(inkColor)
                Text(tr(entry.snapshot, "tapToStart", "Tap to start"))
                    .font(.system(size: 12))
                    .foregroundColor(inkColor.opacity(0.6))
            }
            Spacer(minLength: 0)
            Text(tr(entry.snapshot, "daysThisWeek", "{daysMet} of {goalDays} days this week", ["daysMet": "\(entry.snapshot.weekDaysMet)", "goalDays": "\(entry.snapshot.weekGoalDays)"]))
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(emberColor)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .widgetCanvasBackground()
    }
}

struct FocusLoopHomeWidget: Widget {
    let kind = "FocusLoopHomeWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FocusLoopProvider()) { entry in
            // CR-16: while idle the whole tile is the J4-R1 one-tap start;
            // during a session a tap just opens the app on the running step.
            FocusLoopHomeWidgetView(entry: entry)
                .widgetURL(liveRunning(entry.snapshot, at: entry.date) == nil ? startURL() : nil)
        }
        .configurationDisplayName("Focus Loop")
        .description("Week progress and a one-tap start.")
        .supportedFamilies([.systemSmall])
    }
}

struct FocusLoopNextWidgetView: View {
    let entry: FocusLoopEntry
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text(tr(entry.snapshot, "daysThisWeek", "{daysMet} of {goalDays} days this week", ["daysMet": "\(entry.snapshot.weekDaysMet)", "goalDays": "\(entry.snapshot.weekGoalDays)"]))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(emberColor)
                Text(nextLine)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(inkColor)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            Link(destination: startURL()) {
                Text(tr(entry.snapshot, "startLabel", "Start"))
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(canvasColor)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 9)
                    .background(Capsule().fill(emberColor))
            }
        }
        .padding(14)
        .widgetCanvasBackground()
    }

    private var nextLine: String {
        if let running = liveRunning(entry.snapshot, at: entry.date) {
            return running.kind == "focus"
                ? tr(entry.snapshot, "focusingNow", "Focusing now")
                : tr(entry.snapshot, "onABreak", "On a break")
        }
        if let parked = entry.snapshot.nextParkedText, !parked.isEmpty {
            return tr(entry.snapshot, "nextUp", "Next up: {text}", ["text": parked])
        }
        return tr(entry.snapshot, "nextUpFocus", "Next up: Focus {minutes}", ["minutes": "\(entry.snapshot.focusMinutes)"])
    }
}

struct FocusLoopNextWidget: Widget {
    let kind = "FocusLoopNextWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FocusLoopProvider()) { entry in
            FocusLoopNextWidgetView(entry: entry)
        }
        .configurationDisplayName("Focus Loop — Next up")
        .description("Week progress, your next focus, and a Start button.")
        .supportedFamilies([.systemMedium])
    }
}

// ── Lock-screen widget (J4-R4): circular disc gauge + "N of G days" ─────────

struct FocusLoopLockWidgetView: View {
    let entry: FocusLoopEntry
    var body: some View {
        Gauge(value: Double(entry.snapshot.weekDaysMet), in: 0...Double(max(1, entry.snapshot.weekGoalDays))) {
            Image(systemName: "circle.hexagongrid.fill")
        } currentValueLabel: {
            Text("\(entry.snapshot.weekDaysMet)/\(entry.snapshot.weekGoalDays)")
                .font(.system(size: 13, weight: .bold))
        }
        .gaugeStyle(.accessoryCircular)
    }
}

struct FocusLoopLockWidget: Widget {
    let kind = "FocusLoopLockWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FocusLoopProvider()) { entry in
            FocusLoopLockWidgetView(entry: entry)
                .widgetURL(startURL())
        }
        .configurationDisplayName("Focus Loop — Week")
        .description("This week's goal days at a glance.")
        .supportedFamilies([.accessoryCircular])
    }
}

// ── Live Activity (P23 / J4-R3) ────────────────────────────────────────────

@available(iOS 16.2, *)
struct FocusLoopLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusLoopActivityAttributes.self) { context in
            // Lock-screen / notification banner presentation.
            HStack(spacing: 12) {
                Image(systemName: context.attributes.stepKind == "focus" ? "circle.hexagongrid.fill" : "cup.and.saucer.fill")
                    .font(.title2)
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.attributes.stepKind == "focus" ? tra(context.attributes, "focusingLabel", "Focusing") : tra(context.attributes, "breakLabel", "Break"))
                        .font(.system(size: 16, weight: .bold))
                    if context.state.paused {
                        Text(tra(context.attributes, "pausedLabel", "Paused"))
                            .font(.system(size: 13))
                            .foregroundStyle(.secondary)
                    } else {
                        countdownLabel(context)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                if context.attributes.stepKind == "focus" {
                    Link(destination: pauseURL()) {
                        Image(systemName: "pause.fill")
                            .font(.system(size: 15, weight: .bold))
                            .frame(width: 34, height: 34)
                    }
                }
            }
            .padding(14)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.attributes.stepKind == "focus" ? tra(context.attributes, "focusLabel", "Focus") : tra(context.attributes, "breakLabel", "Break"), systemImage: context.attributes.stepKind == "focus" ? "circle.hexagongrid.fill" : "cup.and.saucer.fill")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if context.state.paused {
                        Text(tra(context.attributes, "pausedLabel", "Paused"))
                    } else {
                        countdownLabel(context)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if context.attributes.stepKind == "focus" {
                        Link(destination: pauseURL()) {
                            Label(tra(context.attributes, "pauseLabel", "Pause"), systemImage: "pause.fill")
                        }
                    }
                }
            } compactLeading: {
                Image(systemName: context.attributes.stepKind == "focus" ? "circle.hexagongrid.fill" : "cup.and.saucer.fill")
            } compactTrailing: {
                if context.state.paused {
                    Image(systemName: "pause.fill")
                } else {
                    countdownLabel(context)
                        .frame(width: 44)
                }
            } minimal: {
                Image(systemName: context.attributes.stepKind == "focus" ? "circle.hexagongrid.fill" : "cup.and.saucer.fill")
            }
        }
    }

    private func endsAt(_ state: FocusLoopActivityAttributes.ContentState) -> Date {
        Date(timeIntervalSince1970: state.endsAtMs / 1000)
    }

    // CR-15: Date()...endsAt is a ClosedRange and traps once endsAt is in the
    // past (the activity outlives the suspended app). Past the end we render
    // "Done" instead; staleDate in the pushed state also marks it stale.
    @ViewBuilder
    private func countdownLabel(_ context: ActivityViewContext<FocusLoopActivityAttributes>) -> some View {
        let end = endsAt(context.state)
        if end <= Date() {
            Text(tra(context.attributes, "doneLabel", "Done"))
        } else {
            Text(timerInterval: Date()...end, countsDown: true)
        }
    }
}

// ── Bundle ─────────────────────────────────────────────────────────────────

@main
struct FocusLoopWidgetBundle: WidgetBundle {
    var body: some Widget {
        FocusLoopHomeWidget()
        FocusLoopNextWidget()
        FocusLoopLockWidget()
        if #available(iOS 16.2, *) {
            FocusLoopLiveActivityWidget()
        }
    }
}
