# @lumina-study/block-schema

Versioned JSON Schema for Lumina Study block objects.

## Installation

```bash
npm install @lumina-study/block-schema
```

## Usage

### Latest Version (v0.1)

```javascript
const blockSchema = require('@lumina-study/block-schema');

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
const blockSchemaV01 = require('@lumina-study/block-schema/v0.1');

// Or using ES modules
import blockSchema from '@lumina-study/block-schema'; // latest
import blockSchemaV01 from '@lumina-study/block-schema/v0.1'; // specific version
```

## Examples

Example files with `$schema` references for IDE validation:

- [example.json](schema/v0.1/example.json) - Simple block example
- [example-advanced.json](schema/v0.1/example-advanced.json) - Advanced block with prerequisites and parents

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding new schema versions.

## License

MIT
