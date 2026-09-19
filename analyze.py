"""Scenario model; all costs and quality rates are hypothetical, not vendor prices."""
import json
from pathlib import Path
d=json.loads(Path(__file__).with_name("data.json").read_text())
for multiplier in (1,2):
    print("Review cost multiplier:", multiplier)
    feasible=[]
    for v in d["variants"]:
        cost=v["model_cost_per_task"] + v["review_rate"]*d["review_cost"]*multiplier
        monthly=cost*d["monthly_tasks"]
        margin=(d["revenue_per_task"]-cost)/d["revenue_per_task"]
        eligible=v["success_rate"]>=d["minimum_success_rate"] and v["p95_seconds"]<=d["maximum_p95_seconds"]
        print(f'{v["name"]}: cost/task={cost:.3f}, monthly={monthly:.0f}, contribution_margin={margin:.0%}, eligible={eligible}')
        if eligible:
            feasible.append((cost,v["name"]))
    print("Lowest-cost feasible:",min(feasible)[1] if feasible else "NONE")
assert abs((.011+.08*.20)-.027)<1e-9
