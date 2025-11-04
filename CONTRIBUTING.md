# Contributing

## Development

This project uses **pnpm** as the package manager and **vitest** for testing.

### Setup

Install dependencies:

```bash
pnpm install
```

### Running Tests

Run all tests (validates schemas and examples):

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

The test suite validates:
- Schema files are valid JSON Schema
- Example files are valid JSON
- Example files validate against their corresponding schemas
- All schemas have required metadata
- All examples have `$schema` references

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

## Releasing

This project uses [release-it](https://github.com/release-it/release-it) for automated releases.

### Local Release

To create a release locally:

```bash
# Install dependencies
pnpm install

# Run release (interactive)
pnpm release
```

This will:

1. Run tests to validate schemas and examples
2. Prompt for version increment (patch/minor/major)
3. Update package.json version
4. Create a git tag
5. Push to GitHub
6. Create a GitHub release
7. Publish to npm

### GitHub Actions Release

Alternatively, trigger a release via GitHub Actions:

1. Go to the [Actions tab](../../actions/workflows/release.yml)
2. Click "Run workflow"
3. Select the version increment (patch, minor, or major)
4. Click "Run workflow"

**Note:** You need to configure `NPM_TOKEN` secret in GitHub repository settings for automated npm publishing.

### Prerequisites for Publishing

- Install pnpm: `npm install -g pnpm` or `corepack enable`
- Ensure you have npm publish permissions for `@lumina-study/block-schema`
- For local releases: Be logged in to npm (`pnpm login`)
- For GitHub Actions: Configure `NPM_TOKEN` secret in repository settings
