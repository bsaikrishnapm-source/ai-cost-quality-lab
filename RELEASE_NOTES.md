# Flagship demo iteration — 2026-09-23

## Shipped

- One-click baseline, doubled-review-cost and 99% quality-floor scenarios.
- Saved comparisons now show recommendation, cost, margin and key assumptions rather than only timestamps.
- History survives recalculation, retains the latest five snapshots and can be cleared.
- Changed inputs invalidate the last result until recalculated. Failed comparisons cannot export or save stale decisions.
- Five controller regression tests supplement seven decision-engine tests.

## Verification

Run `node --test test_demo.cjs test_ui.cjs`: 12 tests passed during this iteration. Controller tests use a minimal DOM double, not a real browser. CSV and JSON output contents are checked; actual browser download behavior, responsive layout, keyboard navigation and screen-reader behavior still need browser QA.

## Evidence boundary

This iteration came from code review, not customer interviews. No user study or production deployment impact is claimed. All scenario inputs are fictional. Prior Python results are unchanged; Python tests were not rerun successfully in this iteration because the local checkout did not contain them.

## Next validation

Use the tasks in [USER_TEST_PLAN.md](USER_TEST_PLAN.md). Do not call the demo user-validated until actual sessions are recorded and findings are reviewed.
