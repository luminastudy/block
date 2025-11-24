# @lumina-study/block-schema

Versioned JSON Schema for Lumina Study block objects.

## Installation

```bash
npm install @lumina-study/block-schema
```

## Version Guide

### Which version should I use?

- **v0.2** (Recommended) - Use if you need to reference blocks across repositories (GitHub/GitLab)
- **v0.1** (Stable) - Use if you only need local block references via UUIDs

Both versions are fully supported and maintained.

## Quick Start

### Basic Usage (v0.1)

For simple, local-only block references:

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

### Advanced Usage (v0.2) - External References

When you need to reference blocks from other repositories:

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

## Version 0.2 - External References

### Use Cases

External references enable distributed block architectures:

- **Shared Prerequisites**: Reference foundational blocks from a common repository
- **Cross-Course Dependencies**: Link blocks between different course repositories
- **Organization-Wide Blocks**: Share standard blocks across multiple projects
- **Third-Party Content**: Reference blocks from external educational resources

### External Reference Format

```
<platform>:<org>/<repo>[/<block-id>][#<ref>]
```

**Components**:

- `platform`: `github` or `gitlab`
- `org/repo`: Repository identifier
- `block-id`: (Optional) Specific block UUID within the repository
- `ref`: (Optional) Git reference - tag, branch, or commit SHA

**Examples**:

```javascript
// Reference entire repository (consumer decides which block to use)
'github:lumina-study/math-blocks'

// Reference specific block
'github:lumina-study/math-blocks/550e8400-e29b-41d4-a716-446655440000'

// Pin to specific version tag (recommended for stability)
'github:lumina-study/algebra-basics#v1.2.3'

// Reference specific block with version
'github:lumina-study/algebra-basics/abc12345-6789-1234-5678-123456789abc#v1.2.3'

// Use specific branch
'gitlab:myorg/physics-blocks#main'

// Mix local and external references
prerequisites: [
  '550e8400-e29b-41d4-a716-446655440001', // Local
  'github:lumina-study/foundations#v2.0.0', // External
]
```

### Migration from v0.1 to v0.2

v0.2 is backward compatible with v0.1:

```javascript
// v0.1 blocks work as-is in v0.2
const v01Block = {
  id: '...',
  title: { he_text: '...', en_text: '...' },
  prerequisites: ['uuid-1', 'uuid-2'], // All UUIDs - works in both versions
  parents: [],
}

// v0.2 adds external reference support
const v02Block = {
  id: '...',
  title: { he_text: '...', en_text: '...' },
  prerequisites: [
    'uuid-1', // Still works
    'github:org/repo#v1.0.0', // New capability
  ],
  parents: [],
}
```

## Importing Specific Versions

```javascript
// CommonJS
const blockSchemaV01 = require('@lumina-study/block-schema/v0.1')
const blockSchemaV02 = require('@lumina-study/block-schema/v0.2')

// ES Modules
import blockSchema from '@lumina-study/block-schema' // v0.2 (default for stability)
import blockSchemaV01 from '@lumina-study/block-schema/v0.1'
import blockSchemaV02 from '@lumina-study/block-schema/v0.2'
```

Note: The default export remains v0.1 for backward compatibility. Explicitly import v0.2 to use external references.

## Examples

Example files with `$schema` references for IDE validation:

### Version 0.1

- [example.json](schema/v0.1/example.json) - Simple block
- [example-advanced.json](schema/v0.1/example-advanced.json) - Block with local prerequisites and parents

### Version 0.2

- [example.json](schema/v0.2/example.json) - Simple block
- [example-advanced.json](schema/v0.2/example-advanced.json) - Block with mixed local and external references

## Block Schema

All versions share this core structure:

```typescript
{
  id: string (UUID)           // Unique identifier
  title: {
    he_text: string          // Hebrew title
    en_text: string          // English title
  }
  prerequisites: string[]    // Blocks that must be completed first
  parents: string[]          // Blocks that contain/organize this block
}
```

**Field Details**:

- `id`: UUID v4 format identifier for the block
- `title`: Bilingual title supporting Hebrew and English
- `prerequisites`: Array of block references (must be completed before this block)
- `parents`: Array of block references (organizational hierarchy)

In v0.2, `prerequisites` and `parents` accept both UUID strings and external reference strings.

## Schema Design Notes

### Why Pattern-Based UUID Validation?

In v0.2's `oneOf` constraint for block references, we use explicit regex patterns for UUID validation instead of `format: "uuid"` because:

1. **Deterministic validation**: Format validation may be ignored by validators, causing `oneOf` to fail
2. **Mutual exclusivity**: Regex patterns ensure UUID and external reference schemas are strictly non-overlapping
3. **Reliable discrimination**: Pattern-based validation guarantees correct schema selection in the `oneOf` union

This is a technical implementation detail that ensures reliable validation across all JSON Schema validators.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Adding new schema versions
- Creating example files
- Running tests
- Release process

## License

MIT
