/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable ddd/require-spec-file */
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Test fixtures directory
const fixturesDir = join(__dirname, 'fixtures', 'update-latest-version')

// Helper to create a test directory structure
function createTestFixture(name) {
  const testDir = join(fixturesDir, name)

  // Clean up if exists
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true })
  }

  // Create directory structure
  mkdirSync(testDir, { recursive: true })
  mkdirSync(join(testDir, 'schema'), { recursive: true })

  return testDir
}

// Helper to create a schema version directory
function createSchemaVersion(testDir, version) {
  const versionDir = join(testDir, 'schema', `v${version}`)
  mkdirSync(versionDir, { recursive: true })
  writeFileSync(
    join(versionDir, 'block.schema.json'),
    JSON.stringify({ version }, null, 2)
  )
  return versionDir
}

// Helper to create a test README
function createTestReadme(testDir, latestVersion) {
  const content = `# Test Package

## Version Guide

- **v${latestVersion}** (Recommended) - Latest version
- **v0.1** (Stable) - Base version

## Usage

\`\`\`javascript
import blockSchema from '@lumina-study/block-schema' // v${latestVersion} (default for stability)
\`\`\`
`
  writeFileSync(join(testDir, 'README.md'), content)
  return content
}

// Helper to create a test package.json
function createTestPackageJson(testDir, currentVersion) {
  const packageJson = {
    name: 'test-package',
    version: '1.0.0',
    main: `./schema/v${currentVersion}/block.schema.json`,
    exports: {
      '.': `./schema/v${currentVersion}/block.schema.json`,
      './v0.1': './schema/v0.1/block.schema.json',
      './v0.2': './schema/v0.2/block.schema.json',
    },
  }
  writeFileSync(
    join(testDir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )
  return packageJson
}

describe('getLatestSchemaVersion', () => {
  let getLatestSchemaVersion

  beforeEach(async () => {
    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Import the module
    const modulePath = join(rootDir, 'scripts', 'update-latest-version.js')
    const module = await import(`${modulePath}?update=${Date.now()}`)
    getLatestSchemaVersion = module.getLatestSchemaVersion
  })

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks()
  })

  test('returns latest version when multiple versions exist', () => {
    const testDir = createTestFixture('multiple-versions')
    createSchemaVersion(testDir, '0.1')
    createSchemaVersion(testDir, '0.2')
    createSchemaVersion(testDir, '0.3')

    const result = getLatestSchemaVersion(testDir)

    expect(result).toBeDefined()
    expect(result.version).toBe('0.3')
    expect(result.dir).toBe('v0.3')
  })

  test('handles semantic versioning correctly', () => {
    const testDir = createTestFixture('semantic-versions')
    createSchemaVersion(testDir, '0.9')
    createSchemaVersion(testDir, '0.10')
    createSchemaVersion(testDir, '1.0')
    createSchemaVersion(testDir, '1.1')

    const result = getLatestSchemaVersion(testDir)

    expect(result).toBeDefined()
    expect(result.version).toBe('1.1')
    expect(result.dir).toBe('v1.1')
  })

  test('returns only version when one exists', () => {
    const testDir = createTestFixture('single-version')
    createSchemaVersion(testDir, '0.1')

    const result = getLatestSchemaVersion(testDir)

    expect(result).toBeDefined()
    expect(result.version).toBe('0.1')
    expect(result.dir).toBe('v0.1')
  })

  test('returns undefined when no schema versions exist', () => {
    const testDir = createTestFixture('no-versions')

    const result = getLatestSchemaVersion(testDir)

    expect(result).toBeUndefined()
  })

  test('correctly compares versions with different segment counts', () => {
    const testDir = createTestFixture('mixed-segments')
    createSchemaVersion(testDir, '0.1')
    createSchemaVersion(testDir, '0.2.1')
    createSchemaVersion(testDir, '0.2.0')
    createSchemaVersion(testDir, '1.0.0.0')

    const result = getLatestSchemaVersion(testDir)

    expect(result).toBeDefined()
    expect(result.version).toBe('1.0.0.0')
  })
})

describe('updateReadme', () => {
  let updateReadme

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const modulePath = join(rootDir, 'scripts', 'update-latest-version.js')
    const module = await import(`${modulePath}?update=${Date.now()}`)
    updateReadme = module.updateReadme
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('updates recommended version marker', () => {
    const testDir = createTestFixture('readme-update')
    createTestReadme(testDir, '0.1')

    updateReadme('0.2', testDir)

    const content = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(content).toContain('**v0.2** (Recommended)')
    expect(content).not.toContain('**v0.1** (Recommended)')
  })

  test('updates default for stability comment', () => {
    const testDir = createTestFixture('readme-stability')
    createTestReadme(testDir, '0.1')

    updateReadme('0.2', testDir)

    const content = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(content).toContain('// v0.2 (default for stability)')
    expect(content).not.toContain('// v0.1 (default for stability)')
  })

  test('does not modify file when already up to date', () => {
    const testDir = createTestFixture('readme-current')
    const originalContent = createTestReadme(testDir, '0.2')

    updateReadme('0.2', testDir)

    const content = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(content).toBe(originalContent)
  })

  test('handles multiple updates correctly', () => {
    const testDir = createTestFixture('readme-multiple')
    createTestReadme(testDir, '0.1')

    // First update
    updateReadme('0.2', testDir)
    let content = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(content).toContain('**v0.2** (Recommended)')

    // Second update
    updateReadme('0.3', testDir)
    content = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(content).toContain('**v0.3** (Recommended)')
    expect(content).toContain('// v0.3 (default for stability)')
  })
})

describe('updatePackageJson', () => {
  let updatePackageJson

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const modulePath = join(rootDir, 'scripts', 'update-latest-version.js')
    const module = await import(`${modulePath}?update=${Date.now()}`)
    updatePackageJson = module.updatePackageJson
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('updates main field', () => {
    const testDir = createTestFixture('package-main')
    createTestPackageJson(testDir, '0.1')

    updatePackageJson('v0.2', testDir)

    const packageJson = JSON.parse(
      readFileSync(join(testDir, 'package.json'), 'utf8')
    )
    expect(packageJson.main).toBe('./schema/v0.2/block.schema.json')
  })

  test('updates exports field', () => {
    const testDir = createTestFixture('package-exports')
    createTestPackageJson(testDir, '0.1')

    updatePackageJson('v0.2', testDir)

    const packageJson = JSON.parse(
      readFileSync(join(testDir, 'package.json'), 'utf8')
    )
    expect(packageJson.exports['.']).toBe('./schema/v0.2/block.schema.json')
  })

  test('preserves other package.json fields', () => {
    const testDir = createTestFixture('package-preserve')
    const original = createTestPackageJson(testDir, '0.1')

    updatePackageJson('v0.2', testDir)

    const packageJson = JSON.parse(
      readFileSync(join(testDir, 'package.json'), 'utf8')
    )

    expect(packageJson.name).toBe(original.name)
    expect(packageJson.version).toBe(original.version)
    expect(packageJson.exports['./v0.1']).toBe(original.exports['./v0.1'])
    expect(packageJson.exports['./v0.2']).toBe(original.exports['./v0.2'])
  })

  test('does not modify file when already up to date', () => {
    const testDir = createTestFixture('package-current')
    createTestPackageJson(testDir, '0.2')

    const before = readFileSync(join(testDir, 'package.json'), 'utf8')

    updatePackageJson('v0.2', testDir)

    const after = readFileSync(join(testDir, 'package.json'), 'utf8')
    expect(after).toBe(before)
  })

  test('maintains JSON formatting', () => {
    const testDir = createTestFixture('package-format')
    createTestPackageJson(testDir, '0.1')

    updatePackageJson('v0.2', testDir)

    const content = readFileSync(join(testDir, 'package.json'), 'utf8')

    // Should have 2-space indentation and trailing newline
    expect(content).toMatch(/"name": "test-package"/)
    expect(content.endsWith('\n')).toBe(true)

    // Should be valid JSON
    expect(() => JSON.parse(content)).not.toThrow()
  })
})

describe('Integration: Full workflow', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()

    // Clean up fixtures
    if (existsSync(fixturesDir)) {
      rmSync(fixturesDir, { recursive: true, force: true })
    }
  })

  test('full workflow updates all files correctly', async () => {
    const testDir = createTestFixture('full-workflow')

    // Create schema versions
    createSchemaVersion(testDir, '0.1')
    createSchemaVersion(testDir, '0.2')
    createSchemaVersion(testDir, '0.3')

    // Create initial files pointing to v0.1
    createTestReadme(testDir, '0.1')
    createTestPackageJson(testDir, '0.1')

    // Import and run functions
    const modulePath = join(rootDir, 'scripts', 'update-latest-version.js')
    const module = await import(`${modulePath}?update=${Date.now()}`)

    const latest = module.getLatestSchemaVersion(testDir)
    expect(latest.version).toBe('0.3')

    module.updateReadme(latest.version, testDir)
    module.updatePackageJson(latest.dir, testDir)

    // Verify README was updated
    const readmeContent = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(readmeContent).toContain('**v0.3** (Recommended)')
    expect(readmeContent).toContain('// v0.3 (default for stability)')

    // Verify package.json was updated
    const packageJson = JSON.parse(
      readFileSync(join(testDir, 'package.json'), 'utf8')
    )
    expect(packageJson.main).toBe('./schema/v0.3/block.schema.json')
    expect(packageJson.exports['.']).toBe('./schema/v0.3/block.schema.json')
  })

  test('handles transition from v0.x to v1.x', async () => {
    const testDir = createTestFixture('version-jump')

    createSchemaVersion(testDir, '0.9')
    createSchemaVersion(testDir, '1.0')

    createTestReadme(testDir, '0.9')
    createTestPackageJson(testDir, '0.9')

    const modulePath = join(rootDir, 'scripts', 'update-latest-version.js')
    const module = await import(`${modulePath}?update=${Date.now()}`)

    const latest = module.getLatestSchemaVersion(testDir)
    expect(latest.version).toBe('1.0')

    module.updateReadme(latest.version, testDir)
    module.updatePackageJson(latest.dir, testDir)

    const readmeContent = readFileSync(join(testDir, 'README.md'), 'utf8')
    expect(readmeContent).toContain('**v1.0** (Recommended)')

    const packageJson = JSON.parse(
      readFileSync(join(testDir, 'package.json'), 'utf8')
    )
    expect(packageJson.main).toBe('./schema/v1.0/block.schema.json')
  })
})
