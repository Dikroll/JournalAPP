import UIKit
import Capacitor

@objc(JournalBridgeViewController)
class JournalBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        NSLog("[JournalBridge] capacitorDidLoad fired, registering WidgetBridgePlugin")
        bridge?.registerPluginInstance(WidgetBridgePlugin())
    }
}
