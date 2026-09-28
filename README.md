# Depths Saviors website

Public information site for the private main-server Discord bot. Home, Bot Guide and Community explain member use; Privacy and Terms describe current behavior. The staff dashboard and verification API enforce access on the bot server. Frontend restrictions complement those checks and are not an authorization boundary.

The existing /bot, /joinds, /privacy, /terms, /dashboard and /verify URLs remain supported by GitHub Pages. CNAME preserves the production domain. No build step is required.

Public features are preserved in Git history; see [ARCHIVE.md](ARCHIVE.md).

Run behavioral checks with `node --test private-dashboard.test.cjs` and syntax checks with `node --check dashboard.js`. Preview with a static server that resolves extensionless paths to .html.

Policy wording describes the current implementation. Encryption at rest, automatic retention and third-party account settings have not been certified by this website update.
