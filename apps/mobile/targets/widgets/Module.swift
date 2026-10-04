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
            (stepKind: String, displayMode: String, endsAtMs: Double, remainingSeconds: Int, paused: Bool) in
            if #available(iOS 16.2, *) {
                let attributes = FocusLoopActivityAttributes(stepKind: stepKind, displayMode: displayMode)
                let state = FocusLoopActivityAttributes.ContentState(
                    remainingSeconds: remainingSeconds,
                    endsAtMs: endsAtMs,
                    paused: paused
                )
                do {
                    _ = try Activity<FocusLoopActivityAttributes>.request(
                        attributes: attributes,
                        content: ActivityContent(state: state, staleDate: nil),
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
                        await activity.update(ActivityContent(state: state, staleDate: nil))
                    }
                }
            }
        }

        Function("endActivity") { () in
            if #available(iOS 16.2, *) {
                Task {
                    for activity in Activity<FocusLoopActivityAttributes>.activities {
                        await activity.end(nil, dismissalPolicy: .immediate)
                    }
                }
            }
        }
    }
}
