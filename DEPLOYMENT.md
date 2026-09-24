# ChromaMatrix deployment boundary

Production URL: <https://esail.ac.tamu.edu/pdata/>

The production `/pdata/` deployment is a static web application. The source
repository is <https://github.com/aoxilus/ChromaMatrix>. Upload only:

- `index.html`
- `src/core/**`
- `src/web/**`
- `src/vendor/**`

Do not upload project documentation, private notes, test fixtures, sample
artifacts, CLI tools, package metadata, or the Node development server.
`.deployignore` lists the excluded paths and is the deployment checklist.

The deployed runtime is intentionally separate from the complete local
development repository.
