# @luminastudy/block-schema

Versioned JSON Schema for Lumina Study block objects.

## Installation

```bash
npm install @luminastudy/block-schema
```

## Usage

### Latest Version (v0.1)

```javascript
const blockSchema = require('@luminastudy/block-schema');

// Use with any JSON Schema validator (e.g., ajv, jsonschema, etc.)
const Ajv = require('ajv');
const ajv = new Ajv();
const validate = ajv.compile(blockSchema);

const block = {
  title: {
    he_text: "בלוק לדוגמה",
    en_text: "Example Block"
  },
  prerequisites: [],
  parents: []
};

const isValid = validate(block);
if (!isValid) {
  console.log(validate.errors);
}
```

### Specific Version

```javascript
// Import a specific version
const blockSchemaV01 = require('@luminastudy/block-schema/v0.1');

// Or using ES modules
import blockSchema from '@luminastudy/block-schema'; // latest
import blockSchemaV01 from '@luminastudy/block-schema/v0.1'; // specific version
```

## Schema Structure

A valid block object must have the following structure:

```json
{
  "title": {
    "he_text": "string",
    "en_text": "string"
  },
  "prerequisites": [],
  "parents": []
}
```

### Properties

- **title** (required): Object containing:
  - `he_text`: Hebrew text string
  - `en_text`: English text string
- **prerequisites** (required): Array of block objects (recursive)
- **parents** (required): Array of block objects (recursive)

## Examples

Example files with `$schema` references for IDE validation:

- [example.json](schema/v0.1/example.json) - Simple block example
- [example-advanced.json](schema/v0.1/example-advanced.json) - Advanced block with prerequisites and parents

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new schema versions.

## License

MIT
