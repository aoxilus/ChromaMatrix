# ChromaMatrix deployment boundary

The public `/pdata/` deployment is a static web application. Upload only:

- `index.html`
- `src/core/**`
- `src/web/**`

Do not upload project documentation, private notes, test fixtures, sample
artifacts, CLI tools, package metadata, or the Node development server.
`.deployignore` lists the excluded paths and is the deployment checklist.

The deployed runtime is intentionally separate from the complete local
development repository.
