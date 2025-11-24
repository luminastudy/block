# @lumina-study/block-schema

Versioned JSON Schema for Lumina Study block objects.

## Installation

```bash
npm install @lumina-study/block-schema
```

## Usage

### Latest Version (v0.1)

```javascript
const blockSchema = require('@lumina-study/block-schema')

// Use with any JSON Schema validator (e.g., ajv, jsonschema, etc.)
const Ajv = require('ajv')
const ajv = new Ajv()
const validate = ajv.compile(blockSchema)

const block = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: {
    he_text: 'בלוק לדוגמה',
    en_text: 'Example Block',
  },
  prerequisites: [],
  parents: [],
}

const isValid = validate(block)
if (!isValid) {
  console.log(validate.errors)
}
```

### Version 0.2 - External References

**New in v0.2**: Support for external block references via GitHub/GitLab repositories

```javascript
const blockSchemaV02 = require('@lumina-study/block-schema/v0.2')

const block = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: {
    he_text: 'בלוק מתקדם',
    en_text: 'Advanced Block',
  },
  prerequisites: [
    '550e8400-e29b-41d4-a716-446655440001', // Local UUID reference
    'github:lumina-study/math-blocks#v1.0.0', // External repository reference
  ],
  parents: [],
}
```

#### External Reference Format

External references follow this pattern:

```
<platform>:<org>/<repo>[/<block-id>][#<ref>]
```

**Components**:

- `platform`: `github` or `gitlab`
- `org/repo`: Repository identifier
- `block-id`: (Optional) Specific block UUID
- `ref`: (Optional) Git reference (tag, branch, commit)

**Examples**:

- `github:lumina-study/math-blocks` - Reference entire repository
- `github:lumina-study/math-blocks/550e8400-e29b-41d4-a716-446655440000` - Specific block
- `github:lumina-study/math-blocks#v1.2.3` - Pinned to version tag
- `gitlab:myorg/physics-blocks#main` - GitLab repository with branch

### Specific Version

```javascript
// Import a specific version
const blockSchemaV01 = require('@lumina-study/block-schema/v0.1')
const blockSchemaV02 = require('@lumina-study/block-schema/v0.2')

// Or using ES modules
import blockSchema from '@lumina-study/block-schema' // latest (v0.1)
import blockSchemaV01 from '@lumina-study/block-schema/v0.1'
import blockSchemaV02 from '@lumina-study/block-schema/v0.2'
```

## Examples

Example files with `$schema` references for IDE validation:

### Version 0.1

- [example.json](schema/v0.1/example.json) - Simple block example
- [example-advanced.json](schema/v0.1/example-advanced.json) - Advanced block with prerequisites and parents

### Version 0.2

- [example.json](schema/v0.2/example.json) - Simple block example
- [example-advanced.json](schema/v0.2/example-advanced.json) - Advanced block with external references

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new schema versions.

## License

MIT
