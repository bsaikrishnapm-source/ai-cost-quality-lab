# AI Economics — product walkthrough

## Implemented user value

Browser controls for volume, human review cost, revenue, quality and latency gates; eligibility reasons; contribution margins; scenario snapshots; CSV and JSON exports.

## Five-minute review

Run defaults; double review cost; raise quality to 0.99; set revenue to zero; save multiple snapshots and export the underlying assumptions.

Choose **Save comparison snapshot** to retain up to five result snapshots in the current tab. **Download evidence JSON** exports the current result and captured snapshots. Refreshing clears all session state. Exports describe synthetic data and local actions only.

## Architecture

| File | Responsibility |
| --- | --- |
| demo/index.html | Page structure, local script references and evidence boundary |
| demo/style.css | Responsive workspace, focus styles and readable tables |
| demo/data.js | Bundled synthetic fixture data; no network requests |
| demo/engine.js | Pure decision functions and in-memory workflow state |
| demo/app.js | Labeled controls, local actions, result rendering and downloads |
| test_demo.cjs | Node built-in behavioral tests against the decision engine |

The UI inserts scenario text through textContent. CSV exports, where present, quote fields and neutralize formula-like leading characters. No external libraries, trackers, authentication credentials or model endpoints are used.

## Product scope and trade-offs

Every cost, label, rate and latency is fictional. JavaScript drives the browser demo; analyze.py remains the separate Python implementation. Baseline parity is tested, but no real models, vendor prices, customers or profitability claims are involved.

## Review criteria

A reviewer should be able to explain the decision, change an assumption, inspect a failure path and export the evidence. A successful prototype test demonstrates only the declared fixture behavior; it does not establish production readiness.

## Run verification

Requires Node.js 18 or newer for the built-in test runner (the demo itself requires only a browser).

```bash
node --test test_demo.cjs
```

Expected: 7 passing decision tests. The existing Python entry point remains available in the main README.

## Accessibility design

Controls use visible labels, keyboard focus outlines and native buttons/selects. Error text uses an alert region; metric updates and snapshot counts use polite live regions. A skip link targets scenario controls. Tables scroll inside the result panel on narrow displays. Browser rendering and assistive-technology testing have not been completed in this environment.

## Data and retention

Use synthetic records only. Demo decisions and logs live in memory, with no localStorage or remote persistence. Downloading evidence explicitly writes a file through the user's browser. Clearing a buffer or refreshing does not delete a previously downloaded export.
