# AI Cost Quality Decision Lab

## Start here

**Problem:** Compare three hypothetical AI approaches before choosing a pilot.

**What is built:** An independent Python prototype or analysis, with product documents and synthetic data.

**Code to run:** `python3 analyze.py`

**What you will see:** Calculates cost per task, monthly cost, contribution margin, and eligibility; repeats the comparison with doubled review cost.

**Scope:** Runs locally in a terminal. No live customer integration, deployed application, or real AI model call is included.


**Complete independent scenario model | AI unit economics and release trade-offs**

## Decision

Choose the hypothetical hybrid approach for a pilot: it is the only variant meeting both the 90% success floor and three-second p95 latency ceiling. Do not choose a model on token cost alone.

## Results at 10000 tasks per month

| Variant | Success assumption | p95 assumption | Cost per task including review | Monthly variable cost | Contribution margin | Meets both gates |
| --- | --- | --- | --- | --- | --- | --- |
| Lean | 82% | 1.2 sec | $0.041 | $410 | 59% | No |
| Premium | 94% | 3.8 sec | $0.032 | $320 | 68% | No |
| Hybrid | 92% | 2.4 sec | $0.027 | $270 | 73% | Yes |

Revenue assumption: $0.10 per task. Human review assumption: $0.20 per reviewed task. Cost per task = model cost + review rate × review cost. Revenue applies to every task; success rate is a separate quality measure and is not increased by review in this model.

Doubling review cost raises hybrid variable cost to $0.043 per task, or $430 monthly, and reduces contribution margin to 57%. It remains the only option meeting the stated quality and latency gates.

## Artifacts

- [Scenario inputs](data.json)
- [Executable analysis](analyze.py)
- [Decision memo and measurement requirements](PRODUCT.md)

Run `python3 analyze.py`. No dependencies or API keys are needed.

## Evidence boundary

Every model label, price, latency, success rate, and review rate is fictional. The margins exclude fixed engineering, infrastructure overhead, sales, taxes, and refunds. This is contribution analysis, not a profit forecast or vendor benchmark.

## Run locally

Requires Python 3. No additional packages or API keys are needed.

```bash
git clone https://github.com/bsaikrishnapm-source/ai-cost-quality-lab.git
cd ai-cost-quality-lab
python3 analyze.py
```

[View the full product management portfolio](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source)

## Inspect the data in Excel

```bash
python3 export_data.py --output exports
```

Creates CSV tables from the bundled synthetic data. The terminal output identifies each table and its row count. For a different JSON file, add `--input path/to/data.json`. Existing table CSV files in the output directory are replaced. These exports contain scenario inputs, not production results.
