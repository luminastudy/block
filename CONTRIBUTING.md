# Contributing

## Adding New Versions

When you need to update the schema:

1. Create a new directory: `schema/v0.2/` (or appropriate version)
2. Add the new schema file: `schema/v0.2/block.schema.json`
3. Update the `$id` field to: `https://raw.githubusercontent.com/luminastudy/block/main/schema/v0.2/block.schema.json`
4. Add the version to package.json exports:

   ```json
   "./v0.2": "./schema/v0.2/block.schema.json"
   ```

5. Optionally update the default export to the new version
6. Update the "Available Versions" section in README.md

This allows you to maintain backward compatibility while evolving the schema.
