import ExpoModulesCore
import ActivityKit
import WidgetKit
import Foundation

// App-side Expo module for J4 surfaces. The react-native-widget-extension
// config plugin compiles this file into the app target; the JS side reaches
// it via requireNativeModule("ReactNativeWidgetExtension").
public class ReactNativeWidgetExtensionModule: Module {
    private let appGroupId = "group.com.appsindie.focusloop"

    public func definition() -> ModuleDefinition {
        Name("ReactNativeWidgetExtension")

        Function("areActivitiesEnabled") { () -> Bool in
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            }
            return false
        }

        // WidgetKit data channel: the app writes the widget snapshot JSON into
        // the shared App Group; home/lock-screen widgets decode it.
        Function("setSharedData") { (json: String) in
            UserDefaults(suiteName: self.appGroupId)?.set(json, forKey: "widgetData")
        }

        Function("reloadWidgetTimelines") { () in
            WidgetCenter.shared.reloadAllTimelines()
        }

        Function("startActivity") {
            (stepKind: String, displayMode: String, endsAtMs: Double, remainingSeconds: Int, paused: Bool, stringsJson: String) in
            if #available(iOS 16.2, *) {
                let strings = (try? JSONDecoder().decode([String: String].self, from: stringsJson.data(using: .utf8) ?? Data())) ?? [:]
                let attributes = FocusLoopActivityAttributes(stepKind: stepKind, displayMode: displayMode, strings: strings)
                let state = FocusLoopActivityAttributes.ContentState(
                    remainingSeconds: remainingSeconds,
                    endsAtMs: endsAtMs,
                    paused: paused
                )
                do {
                    _ = try Activity<FocusLoopActivityAttributes>.request(
                        attributes: attributes,
                        // CR-15: past the step end the system marks the
                        // activity stale instead of counting into negative
                        // time while the app is suspended.
                        content: ActivityContent(state: state, staleDate: paused ? nil : Date(timeIntervalSince1970: endsAtMs / 1000)),
                        pushType: nil
                    )
                } catch {
                    // Activity request failed (disabled, limit reached) — the
                    // in-app surface is unaffected.
                }
            }
        }

        Function("updateActivity") { (remainingSeconds: Int, endsAtMs: Double, paused: Bool) in
            if #available(iOS 16.2, *) {
                let state = FocusLoopActivityAttributes.ContentState(
                    remainingSeconds: remainingSeconds,
                    endsAtMs: endsAtMs,
                    paused: paused
                )
                Task {
                    for activity in Activity<FocusLoopActivityAttributes>.activities {
                        await activity.update(ActivityContent(state: state, staleDate: paused ? nil : Date(timeIntervalSince1970: endsAtMs / 1000)))
                    }
                }
            }
        }

        Function("endActivity") { () in
            if #available(iOS 16.2, *) {
                // CR-18: capture the live set BEFORE the Task runs — an end
                // issued back-to-back with startActivity must not reach the
                // just-requested replacement activity.
                let outgoing = Activity<FocusLoopActivityAttributes>.activities
                Task {
                    for activity in outgoing {
                        await activity.end(nil, dismissalPolicy: .immediate)
                    }
                }
            }
        }
    }
}
