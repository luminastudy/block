/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable ddd/require-spec-file */
import { readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { beforeEach, describe, expect, test } from 'vitest'
import Ajv from 'ajv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const schemaDir = join(rootDir, 'schema')

let ajv

// Helper to find all files matching a pattern
function findFiles(dir, pattern) {
  const files = []
  const items = readdirSync(dir)

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, pattern))
    } else if (pattern.test(item)) {
      files.push(fullPath)
    }
  }

  return files
}

const schemaFiles = findFiles(schemaDir, /\.schema\.json$/)
const exampleFiles = findFiles(schemaDir, /^example.*\.json$/)

describe('JSON Schema Validation', () => {
  beforeEach(() => {
    // Create a fresh AJV instance for each test to avoid schema caching issues
    ajv = new Ajv({
      strict: false, // Allow custom keywords like "version"
      allErrors: true,
    })
  })

  test.each(schemaFiles)('schema file is valid: %s', schemaFile => {
    const relativePath = relative(rootDir, schemaFile)

    expect(() => {
      const schema = JSON.parse(readFileSync(schemaFile, 'utf8'))
      ajv.compile(schema)
    }).not.toThrow()
  })
})

describe('Example Files Validation', () => {
  beforeEach(() => {
    ajv = new Ajv({
      strict: false,
      allErrors: true,
    })
  })

  test.each(exampleFiles)(
    'example validates against schema: %s',
    exampleFile => {
      const relativePath = relative(rootDir, exampleFile)
      const example = JSON.parse(readFileSync(exampleFile, 'utf8'))

      // Find corresponding schema file
      const versionDir = dirname(exampleFile)
      const schemaPath = join(versionDir, 'block.schema.json')

      expect(statSync(schemaPath).isFile()).toBe(true)

      const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
      const validate = ajv.compile(schema)

      const valid = validate(example)

      if (!valid) {
        console.error(`Validation errors for ${relativePath}:`, validate.errors)
      }

      expect(valid).toBe(true)
    }
  )
})

describe('Schema Structure', () => {
  test('all schemas have required metadata', () => {
    for (const schemaFile of schemaFiles) {
      const schema = JSON.parse(readFileSync(schemaFile, 'utf8'))

      expect(schema).toHaveProperty('$schema')
      expect(schema).toHaveProperty('$id')
      expect(schema).toHaveProperty('title')
      expect(schema).toHaveProperty('description')
      expect(schema).toHaveProperty('version')
    }
  })

  test('all examples have $schema reference', () => {
    for (const exampleFile of exampleFiles) {
      const example = JSON.parse(readFileSync(exampleFile, 'utf8'))

      expect(example).toHaveProperty('$schema')
      expect(example.$schema).toMatch(/https:\/\/raw\.githubusercontent\.com/)
    }
  })
})
