"""Behavioral checks for the fictional decision model."""
import copy
import csv
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from analyze import evaluate

ROOT = Path(__file__).parent


class ScenarioTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT / "data.json").read_text())

    def test_baseline_and_review_sensitivity(self):
        rows, best = evaluate(self.data)
        self.assertEqual(best, "hybrid")
        self.assertEqual([r["eligible"] for r in rows], [False, False, True])
        self.assertAlmostEqual(rows[2]["monthly_variable_cost"], 270)
        self.assertAlmostEqual(rows[2]["contribution_margin"], .73)
        rows, best = evaluate(self.data, 2)
        self.assertEqual(best, "hybrid")
        self.assertAlmostEqual(rows[2]["monthly_variable_cost"], 430)

    def test_no_feasible_option(self):
        self.data["minimum_success_rate"] = .99
        rows, best = evaluate(self.data)
        self.assertIsNone(best)
        self.assertFalse(any(r["recommended"] for r in rows))

    def test_gate_equality_is_allowed(self):
        self.data["minimum_success_rate"] = .92
        self.data["maximum_p95_seconds"] = 2.4
        self.assertEqual(evaluate(self.data)[1], "hybrid")

    def test_zero_volume_and_revenue(self):
        self.data.update(monthly_tasks=0, revenue_per_task=0)
        rows, _ = evaluate(self.data)
        self.assertTrue(all(r["monthly_variable_cost"] == 0 for r in rows))
        self.assertTrue(all(r["contribution_margin"] is None for r in rows))

    def test_reject_invalid_inputs(self):
        for key, value in [("review_cost", -1), ("review_cost", float("nan")),
                           ("minimum_success_rate", 1.1), ("monthly_tasks", 1.5),
                           ("monthly_tasks", True), ("maximum_p95_seconds", "fast")]:
            with self.subTest(key=key, value=value):
                data = copy.deepcopy(self.data)
                data[key] = value
                with self.assertRaises(ValueError):
                    evaluate(data)
        self.data["variants"][0]["review_rate"] = 2
        with self.assertRaises(ValueError):
            evaluate(self.data)

    def test_cli_export_keeps_assumptions(self):
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / "result.csv"
            result = subprocess.run([sys.executable, str(ROOT / "analyze.py"),
                "--monthly-tasks", "20000", "--review-cost", "0.4",
                "--csv", str(output)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            with output.open() as handle:
                rows = list(csv.DictReader(handle))
            self.assertEqual(len(rows), 6)
            hybrid = next(r for r in rows if r["name"] == "hybrid" and r["review_multiplier"] == "1")
            self.assertEqual(hybrid["monthly_tasks"], "20000")
            self.assertAlmostEqual(float(hybrid["monthly_variable_cost"]), 860)
            self.assertEqual(hybrid["minimum_success_rate"], "0.9")

    def test_cli_errors_are_readable(self):
        for args in [("--review-cost", "-1"), ("--monthly-tasks", "many")]:
            result = subprocess.run([sys.executable, str(ROOT / "analyze.py"), *args],
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 2)
            self.assertIn("error:", result.stderr)
            self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__":
    unittest.main()
