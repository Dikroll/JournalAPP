import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)

function readArg(flag, fallback = '') {
	const index = args.indexOf(flag)
	if (index === -1) return fallback
	return args[index + 1] ?? fallback
}

const version = readArg('--version')
const build = readArg('--build')
const appName = readArg('--app-name', 'Journal')

if (!version || !build) {
	console.error(
		'Usage: node scripts/prepare-android-release.mjs --version 1.0.1 --build 2 [--app-name "Journal"]',
	)
	process.exit(1)
}

const projectRoot = process.cwd()

const files = {
	packageJson: path.join(projectRoot, 'package.json'),
	capacitorConfig: path.join(projectRoot, 'capacitor.config.ts'),
	buildGradle: path.join(projectRoot, 'android/app/build.gradle'),
	stringsXml: path.join(
		projectRoot,
		'android/app/src/main/res/values/strings.xml',
	),
}

async function replaceInFile(filePath, transform) {
	const previous = await readFile(filePath, 'utf8')
	const next = transform(previous)

	if (previous === next) {
		console.warn(
			`No changes applied to ${path.relative(projectRoot, filePath)}`,
		)
		return
	}

	await writeFile(filePath, next, 'utf8')
	console.log(`Updated ${path.relative(projectRoot, filePath)}`)
}

await replaceInFile(files.packageJson, content =>
	content.replace(/"version":\s*"[^"]+"/, `"version": "${version}"`),
)

await replaceInFile(files.capacitorConfig, content =>
	content.replace(/appName:\s*'[^']+'/g, `appName: '${appName}'`),
)

await replaceInFile(files.buildGradle, content =>
	content
		.replace(/versionCode\s+\d+/g, `versionCode ${build}`)
		.replace(/versionName\s+"[^"]+"/g, `versionName "${version}"`),
)

// Generate version.json for server deployment
const versionJson = {
	version,
	build: parseInt(build, 10),
	file_name: `${appName}-v${version}.apk`,
	changelog: `${appName} Release ${version}`,
}
await writeFile(
	path.join(projectRoot, 'version.json'),
	JSON.stringify(versionJson, null, '\t'),
	'utf8',
)
console.log('Generated version.json')

await replaceInFile(files.stringsXml, content =>
	content
		.replace(
			/<string name="app_name">[^<]+<\/string>/g,
			`<string name="app_name">${appName}</string>`,
		)
		.replace(
			/<string name="title_activity_main">[^<]+<\/string>/g,
			`<string name="title_activity_main">${appName}</string>`,
		),
)
