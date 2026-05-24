import Foundation
import Capacitor
import WidgetKit

@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "saveSchedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearSchedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveGoals", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearGoals", returnType: CAPPluginReturnPromise)
    ]

    private let payloadKey = "schedule_payload"
    private let goalsPayloadKey = "goals_payload"
    private let appGroupId = "group.com.Dikroll.Journal.shared"
    private let payloadFileName = "schedule_payload.json"
    private let goalsPayloadFileName = "goals-payload.json"
    private let goalsPayloadDirectory = "widgets"

    // инициализируем app group доступ при создании плагина
    override public func load() {
        NSLog("[WidgetBridge] plugin loaded, initializing app group access")
        _ = sharedDefaults
        _ = sharedContainerURL
    }

    private var sharedDefaults: UserDefaults? {
        let defaults = UserDefaults(suiteName: appGroupId)
        if defaults == nil {
            NSLog("[WidgetBridge] WARNING: failed to access app group suite: %@", appGroupId)
        }
        return defaults
    }

    private var sharedContainerURL: URL? {
        let url = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        )
        if url == nil {
            NSLog("[WidgetBridge] WARNING: failed to access app group container")
        }
        return url
    }

    private func reloadWidgets() {
        WidgetCenter.shared.reloadTimelines(ofKind: "ScheduleWidget")
        WidgetCenter.shared.reloadTimelines(ofKind: "ScheduleSummaryWidget")
        WidgetCenter.shared.reloadAllTimelines()
    }

    private func reloadGoalsWidget() {
        WidgetCenter.shared.reloadTimelines(ofKind: "GoalsSummaryWidget")
    }

    private func writeGoalsPayloadFile(_ payload: String) throws {
        guard let containerURL = sharedContainerURL else {
            throw NSError(domain: "WidgetBridge", code: 2)
        }
        let directoryURL = containerURL.appendingPathComponent(goalsPayloadDirectory, isDirectory: true)
        try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
        let fileURL = directoryURL.appendingPathComponent(goalsPayloadFileName)
        try payload.data(using: .utf8)?.write(to: fileURL, options: .atomic)
    }

    private func removeGoalsPayloadFile() throws {
        guard let containerURL = sharedContainerURL else { return }
        let nestedURL = containerURL
            .appendingPathComponent(goalsPayloadDirectory)
            .appendingPathComponent(goalsPayloadFileName)
        if FileManager.default.fileExists(atPath: nestedURL.path) {
            try FileManager.default.removeItem(at: nestedURL)
        }
    }

    private func writePayloadFile(_ payload: String) throws {
        guard let containerURL = sharedContainerURL else {
            throw NSError(domain: "WidgetBridge", code: 1)
        }

        let fileURL = containerURL.appendingPathComponent(payloadFileName)
        try payload.data(using: .utf8)?.write(to: fileURL, options: .atomic)
    }

    private func removePayloadFile() throws {
        guard let containerURL = sharedContainerURL else { return }
        let fileURL = containerURL.appendingPathComponent(payloadFileName)
        if FileManager.default.fileExists(atPath: fileURL.path) {
            try FileManager.default.removeItem(at: fileURL)
        }
    }

    @objc func saveSchedule(_ call: CAPPluginCall) {
        let payload = call.getString("payload") ?? ""

        var defaultsWritten = false
        if let defaults = sharedDefaults {
            defaults.set(payload, forKey: payloadKey)
            defaults.synchronize()
            defaultsWritten = true
        } else {
            NSLog("[WidgetBridge] sharedDefaults unavailable for suite %@", appGroupId)
        }

        var fileWritten = false
        var fileError: String? = nil
        do {
            try writePayloadFile(payload)
            fileWritten = true
        } catch {
            fileError = "\(error)"
            NSLog("[WidgetBridge] writePayloadFile failed: %@", fileError!)
        }

        if !defaultsWritten && !fileWritten {
            call.reject("Failed to save widget payload: app group inaccessible (\(fileError ?? "nil"))")
            return
        }

        reloadWidgets()
        call.resolve([
            "saved": true,
            "defaultsWritten": defaultsWritten,
            "fileWritten": fileWritten,
            "appGroupId": appGroupId,
        ])
    }

    @objc func clearSchedule(_ call: CAPPluginCall) {
        sharedDefaults?.removeObject(forKey: payloadKey)
        sharedDefaults?.synchronize()
        try? removePayloadFile()
        reloadWidgets()
        call.resolve([
            "cleared": true
        ])
    }

    @objc func saveGoals(_ call: CAPPluginCall) {
        let payload = call.getString("payload") ?? ""

        var defaultsWritten = false
        if let defaults = sharedDefaults {
            defaults.set(payload, forKey: goalsPayloadKey)
            defaults.synchronize()
            defaultsWritten = true
        }

        var fileWritten = false
        var fileError: String? = nil
        do {
            try writeGoalsPayloadFile(payload)
            fileWritten = true
        } catch {
            fileError = "\(error)"
            NSLog("[WidgetBridge] writeGoalsPayloadFile failed: %@", fileError!)
        }

        if !defaultsWritten && !fileWritten {
            call.reject("Failed to save goals widget payload (\(fileError ?? "nil"))")
            return
        }

        reloadGoalsWidget()
        call.resolve([
            "saved": true,
            "defaultsWritten": defaultsWritten,
            "fileWritten": fileWritten,
        ])
    }

    @objc func clearGoals(_ call: CAPPluginCall) {
        sharedDefaults?.removeObject(forKey: goalsPayloadKey)
        sharedDefaults?.synchronize()
        try? removeGoalsPayloadFile()
        reloadGoalsWidget()
        call.resolve(["cleared": true])
    }
}
