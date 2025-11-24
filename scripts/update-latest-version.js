#!/usr/bin/env node
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultRootDir = path.join(__dirname, '..')

export function getLatestSchemaVersion(rootDir = defaultRootDir) {
  const schemaDir = path.join(rootDir, 'schema')
  const versions = fs
    .readdirSync(schemaDir)
    .filter(dir => {
      const fullPath = path.join(schemaDir, dir)
      return dir.startsWith('v') && fs.statSync(fullPath).isDirectory()
    })
    .map(dir => {
      const version = dir.slice(1)
      const parts = version.split('.').map(Number)
      return { dir, version, parts }
    })
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.parts.length, b.parts.length); i++) {
        const aPart = a.parts[i] || 0
        const bPart = b.parts[i] || 0
        if (aPart !== bPart) return bPart - aPart
      }
      return 0
    })

  return versions[0]
}

export function updateReadme(latestVersion, rootDir = defaultRootDir) {
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

export function updatePackageJson(latestVersionDir, rootDir = defaultRootDir) {
  const packageJsonPath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  const schemaPath = `./schema/${latestVersionDir}/block.schema.json`
  const needsUpdate =
    packageJson.main !== schemaPath || packageJson.exports['.'] !== schemaPath

  if (needsUpdate) {
    packageJson.main = schemaPath
    packageJson.exports['.'] = schemaPath
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8'
    )
    console.log(`✓ Updated package.json main export to: ${schemaPath}`)
  } else {
    console.log(`ℹ package.json already up to date with ${schemaPath}`)
  }
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

// Only run main if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
