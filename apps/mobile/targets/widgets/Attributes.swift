import ActivityKit
import Foundation

// App-side Live Activity attributes (P23 / J4-R3). This file is compiled into
// the app target by react-native-widget-extension; the widget extension keeps
// its own identical copy in FocusLoopWidgets.swift — the two targets cannot
// share a Swift file, so the type is duplicated intentionally.
public struct FocusLoopActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var remainingSeconds: Int
        // Wall-clock end of the step in epoch ms; 0 while paused.
        public var endsAtMs: Double
        public var paused: Bool

        public init(remainingSeconds: Int, endsAtMs: Double, paused: Bool) {
            self.remainingSeconds = remainingSeconds
            self.endsAtMs = endsAtMs
            self.paused = paused
        }
    }

    // Immutable for the activity's life — a step kind or display-mode change
    // ends the activity and requests a new one.
    public var stepKind: String      // "focus" | "break" | "longBreak"
    public var displayMode: String   // "disc" | "numbers"
    // Localized copy for the activity's fixed labels — the extension has no
    // string catalog, so the app pipes its locale through the attributes.
    public var strings: [String: String]

    public init(stepKind: String, displayMode: String, strings: [String: String] = [:]) {
        self.stepKind = stepKind
        self.displayMode = displayMode
        self.strings = strings
    }
}
