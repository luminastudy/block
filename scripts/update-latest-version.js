#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

function getLatestSchemaVersion() {
  const schemaDir = path.join(rootDir, 'schema')
  const versions = fs
    .readdirSync(schemaDir)
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe: schemaDir is constructed from known __dirname
    .filter(
      dir =>
        dir.startsWith('v') &&
        fs.statSync(path.join(schemaDir, dir)).isDirectory()
    )
    .map(dir => {
      const version = dir.slice(1)
      const parts = version.split('.').map(Number)
      return { dir, version, parts }
    })
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.parts.length, b.parts.length); i++) {
        // eslint-disable-next-line security/detect-object-injection -- Safe: accessing numeric array indices
        const aPart = a.parts[i] || 0
        // eslint-disable-next-line security/detect-object-injection -- Safe: accessing numeric array indices
        const bPart = b.parts[i] || 0
        if (aPart !== bPart) return bPart - aPart
      }
      return 0
    })

  return versions[0]
}

function updateReadme(latestVersion) {
  const readmePath = path.join(rootDir, 'README.md')
  let content = fs.readFileSync(readmePath, 'utf8')
  let updated = false

  const newContent = content.replace(
    /(- \*\*v)[0-9.]+(\*\* \(Recommended\))/,
    `$1${latestVersion}$2`
  )
  if (newContent !== content) {
    content = newContent
    updated = true
  }

  const newContent2 = content.replace(
    /(import blockSchema from '@lumina-study\/block-schema' \/\/ v)[0-9.]+( \(default for stability\))/,
    `$1${latestVersion}$2`
  )
  if (newContent2 !== content) {
    content = newContent2
    updated = true
  }

  if (updated) {
    fs.writeFileSync(readmePath, content, 'utf8')
    console.log(`✓ Updated README.md with latest version: v${latestVersion}`)
  } else {
    console.log(`ℹ README.md already up to date with v${latestVersion}`)
  }
}

function updatePackageJson(latestVersionDir) {
  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  const schemaPath = `./schema/${latestVersionDir}/block.schema.json`
  packageJson.main = schemaPath
  packageJson.exports['.'] = schemaPath

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  )
  console.log(`✓ Updated package.json main export to: ${schemaPath}`)
}

function main() {
  const latest = getLatestSchemaVersion()
  if (!latest) {
    console.error('✗ No schema versions found')
    process.exit(1)
  }

  console.log(`Found latest schema version: ${latest.dir}`)
  updateReadme(latest.version)
  updatePackageJson(latest.dir)
  console.log('✓ All files updated successfully')
}

main()
