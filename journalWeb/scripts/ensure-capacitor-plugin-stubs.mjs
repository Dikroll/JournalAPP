import { mkdir, writeFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const apkInstallerRoot = path.join(
	root,
	'node_modules',
	'@bixbyte',
	'capacitor-apk-installer',
)

const iosPluginDir = path.join(apkInstallerRoot, 'ios', 'Plugin')
const podspecPath = path.join(
	apkInstallerRoot,
	'BixbyteCapacitorApkInstaller.podspec',
)
const swiftPath = path.join(iosPluginDir, 'ApkInstallerPlugin.swift')

const podspecContents = `Pod::Spec.new do |s|
  s.name = 'BixbyteCapacitorApkInstaller'
  s.version = '1.0.1'
  s.summary = 'iOS stub for Android-only capacitor-apk-installer plugin'
  s.license = 'MIT'
  s.homepage = 'https://github.com/bixbyte/capacitor-apk-installer'
  s.author = 'Bixbyte'
  s.source = { :git => 'https://github.com/bixbyte/capacitor-apk-installer.git', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '13.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.9'
end
`

const swiftContents = `import Foundation
import Capacitor

@objc(ApkInstallerPlugin)
public class ApkInstallerPlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "ApkInstallerPlugin"
  public let jsName = "ApkInstaller"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "checkInstallPermission", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "requestInstallPermission", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "installApk", returnType: CAPPluginReturnPromise)
  ]

  @objc func checkInstallPermission(_ call: CAPPluginCall) {
    call.resolve(["hasPermission": false])
  }

  @objc func requestInstallPermission(_ call: CAPPluginCall) {
    call.resolve(["hasPermission": false])
  }

  @objc func installApk(_ call: CAPPluginCall) {
    call.reject("APK install is not supported on iOS")
  }
}
`

async function exists(target) {
	try {
		await access(target, constants.F_OK)
		return true
	} catch {
		return false
	}
}

async function ensureApkInstallerIOSStub() {
	if (!(await exists(apkInstallerRoot))) return

	await mkdir(iosPluginDir, { recursive: true })

	if (!(await exists(podspecPath))) {
		await writeFile(podspecPath, podspecContents, 'utf8')
	}

	if (!(await exists(swiftPath))) {
		await writeFile(swiftPath, swiftContents, 'utf8')
	}
}

await ensureApkInstallerIOSStub()
