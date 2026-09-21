# Verification record

## Local checks performed

- 7 Node behavioral tests passed with `node --test test_demo.cjs`.
- Original Python entry point completed successfully against the bundled baseline.
- demo/engine.js, demo/app.js and demo/data.js passed `node --check`.
- Scenario data and test assertions are synthetic; no external service was exercised.

## Coverage and limits

Tests exercise the decision engine and workflow state transitions described in DEMO_GUIDE.md. They do not drive a real browser or establish complete UI, accessibility, security or production coverage. A cloud-browser preview attempt was blocked because local data URLs are unsupported, so visual rendering has not been inspected here.

## Manual acceptance checklist

- [ ] Open demo/index.html in a current desktop browser and follow the walkthrough.
- [ ] Navigate controls using only the keyboard.
- [ ] Check the layout at a narrow mobile width.
- [ ] Save two different snapshots and inspect the JSON download.
- [ ] Trigger the documented invalid-input or failure state and verify its explanation.

Do not mark these manual checks complete until performed.
