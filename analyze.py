"""Configurable scenario analysis. All bundled inputs are fictional."""
import argparse
import csv
import json
import math
from pathlib import Path


def number(value, name, rate=False, integer=False):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"{name} must be finite and non-negative")
    if rate and value > 1:
        raise ValueError(f"{name} must be between 0 and 1")
    if integer and int(value) != value:
        raise ValueError(f"{name} must be a whole number")
    return value


def validate(data):
    if not isinstance(data, dict):
        raise ValueError("Input must be a JSON object")
    for key in ("monthly_tasks", "revenue_per_task", "review_cost",
                "minimum_success_rate", "maximum_p95_seconds"):
        number(data.get(key), key, rate=key == "minimum_success_rate",
               integer=key == "monthly_tasks")
    variants = data.get("variants")
    if not isinstance(variants, list) or not variants:
        raise ValueError("variants must be a non-empty list")
    names = set()
    for variant in variants:
        if not isinstance(variant, dict):
            raise ValueError("Each variant must be an object")
        name = variant.get("name")
        if not isinstance(name, str) or not name.strip() or name in names:
            raise ValueError("Variant names must be non-empty and unique")
        names.add(name)
        for key in ("model_cost_per_task", "success_rate", "review_rate", "p95_seconds"):
            number(variant.get(key), f"{name}.{key}",
                   rate=key in ("success_rate", "review_rate"))
    return data


def evaluate(data, multiplier=1):
    validate(data)
    number(multiplier, "review_multiplier")
    rows = []
    for v in data["variants"]:
        review = data["review_cost"] * multiplier
        cost = v["model_cost_per_task"] + v["review_rate"] * review
        revenue = data["revenue_per_task"]
        reasons = []
        if v["success_rate"] < data["minimum_success_rate"]:
            reasons.append("success below floor")
        if v["p95_seconds"] > data["maximum_p95_seconds"]:
            reasons.append("latency above ceiling")
        row = dict(v, monthly_tasks=data["monthly_tasks"],
                   revenue_per_task=revenue, base_review_cost=data["review_cost"],
                   review_multiplier=multiplier, effective_review_cost=review,
                   minimum_success_rate=data["minimum_success_rate"],
                   maximum_p95_seconds=data["maximum_p95_seconds"],
                   cost_per_task=cost, monthly_variable_cost=cost * data["monthly_tasks"],
                   contribution_margin=(revenue-cost)/revenue if revenue else None,
                   eligible=not reasons, gate_reason="; ".join(reasons) or "passes both gates")
        for value in row.values():
            if isinstance(value, (int, float)) and not math.isfinite(value):
                raise ValueError("Scenario arithmetic exceeds finite numeric range")
        rows.append(row)
    eligible = [r for r in rows if r["eligible"]]
    best = min(eligible, key=lambda r: (r["cost_per_task"], r["name"]))["name"] if eligible else None
    for row in rows:
        row["recommended"] = row["name"] == best
    return rows, best


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=Path(__file__).with_name("data.json"))
    parser.add_argument("--monthly-tasks", type=int)
    parser.add_argument("--review-cost", type=float)
    parser.add_argument("--revenue-per-task", type=float)
    parser.add_argument("--minimum-success-rate", type=float)
    parser.add_argument("--maximum-p95-seconds", type=float)
    parser.add_argument("--csv", type=Path, help="Export assumptions and results; replaces this file")
    args = parser.parse_args(argv)
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("Input must be a JSON object")
        for key in ("monthly_tasks", "review_cost", "revenue_per_task",
                    "minimum_success_rate", "maximum_p95_seconds"):
            value = getattr(args, key)
            if value is not None:
                data[key] = value
        all_rows = []
        for multiplier in (1, 2):
            rows, best = evaluate(data, multiplier)
            print(f"Review cost multiplier: {multiplier}")
            for r in rows:
                margin = "N/A (zero revenue)" if r["contribution_margin"] is None else f'{r["contribution_margin"]:.0%}'
                print(f'{r["name"]}: cost/task={r["cost_per_task"]:.3f}, monthly={r["monthly_variable_cost"]:.0f}, contribution_margin={margin}, eligible={r["eligible"]} — {r["gate_reason"]}')
            print("Lowest-cost feasible:", best or "NONE — no variant meets both gates")
            all_rows.extend(rows)
        if args.csv:
            args.csv.parent.mkdir(parents=True, exist_ok=True)
            with args.csv.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=list(all_rows[0]))
                writer.writeheader()
                writer.writerows(all_rows)
            print(f"Exported {len(all_rows)} scenario rows to {args.csv}")
    except (ValueError, OSError, OverflowError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
