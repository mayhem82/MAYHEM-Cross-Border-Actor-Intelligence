# Cross-Border Protest Networks Worldwide

A standalone MAYHEM investigation published on [GitHub Pages](https://mayhem82.github.io/MAYHEM-Cross-Border-Actor-Intelligence/). The public register covers far-left and anarchist activity and relevant Palestine solidarity mobilisation worldwide. Each record identifies the claim its sources support. Judicial outcomes apply to the specific proceeding and count.

## Reading the register

The dashboard links to organisation profiles, country-level network relationships, judicial dispositions, a dated timeline, behavioural analysis and the evidence archive. Select a record to inspect its sources, limits and open questions. The map shows country coverage across six inhabited continents, with separate layers for affiliations, co-signatures and historical accounts. Each relationship has a source record.

## Source and revision history

The source registers in `docs/data/` carry permanent identifiers, dated references, short quotations and source locations. The preservation manifest records capture dates, available local artefacts, SHA-256 hashes and capture limitations. Editorial and source dates have distinct meanings. Keep original evidence records and captures when a source changes. Add a new ID and link a correction to the superseded record. Preserve conflicting accounts with their source and scope. Changes are reviewable in Git history.

The European solidarity and historical judicial records remain available under their original IDs. The worldwide register adds other regional sources and records. The public portal aggregates these for browsing. Inclusion carries no finding about an organisation's criminality, extremism or hatred. The [MAYHEM specification](https://github.com/mayhem82/mayhem-investigations/blob/main/SPEC.md) gives the underlying investigative framework.

## Run and publish

Open `docs/index.html` locally or serve the `docs` directory with a static HTTP server. HTML, CSS, and JavaScript run directly in the browser. GitHub Pages publishes `/docs` from `main`. Section, evidence and finding links use URL fragments and work under the repository path.

Run `node scripts/check.mjs` from the repository root to verify record identifiers, evidence links, source quotations, captured file checksums and map edges.

The generalised country outlines come from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), released into the public domain. Map markers represent country-level relationships.
