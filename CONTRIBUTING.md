# Contributing

## Adding New Versions

When you need to update the schema:

1. Create a new directory: `schema/v0.2/` (or appropriate version)
2. Add the new schema file: `schema/v0.2/block.schema.json`
3. Update the `$id` and `version` fields in the schema:
   - `$id`: `https://raw.githubusercontent.com/luminastudy/block/main/schema/v0.2/block.schema.json`
   - `version`: `"0.2"`
4. Create example files with `$schema` references:
   - `schema/v0.2/example.json` - Simple example
   - `schema/v0.2/example-advanced.json` - Advanced example (if applicable)
5. Add the version to package.json exports:

   ```json
   "./v0.2": "./schema/v0.2/block.schema.json"
   ```

6. Optionally update the default export to the new version
7. Update the Examples section in README.md to reference the new example files

This allows you to maintain backward compatibility while evolving the schema.
