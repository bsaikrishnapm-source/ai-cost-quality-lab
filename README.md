# AI Cost Quality Decision Lab

## Start here

**Problem:** Compare three hypothetical AI approaches before choosing a pilot.

**What is built:** A configurable Python decision tool with validated scenario inputs, quality and latency gates, sensitivity analysis, and CSV result exports.

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

[Full PM portfolio](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source) · [Portfolio roadmap](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/ROADMAP.md) · [Project backlog](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab/issues) · [Planning board](https://github.com/users/bsaikrishnapm-source/projects/1)

## Inspect the data in Excel

```bash
python3 export_data.py --output exports
```

Creates CSV tables from the bundled synthetic data. The terminal output identifies each table and its row count. For a different JSON file, add `--input path/to/data.json`. Existing table CSV files in the output directory are replaced. These exports contain scenario inputs, not production results.

## Explore a product decision

Change assumptions without editing the code:

```bash
python3 analyze.py --monthly-tasks 20000 --review-cost 0.40 --csv exports/scenarios.csv
python3 analyze.py --minimum-success-rate 0.99
python3 analyze.py --maximum-p95-seconds 4 --revenue-per-task 0.15
```

The first scenario compares baseline and doubled review cost at your chosen volume. The second returns **NONE** because no fictional variant meets the 99% success floor. The third relaxes latency and changes the revenue assumption. These are decision exercises, not measured vendor performance.

| Option | Meaning | Validation |
| --- | --- | --- |
| `--monthly-tasks` | Monthly task volume | Non-negative integer |
| `--review-cost` | Cost of one human review | Finite, non-negative |
| `--revenue-per-task` | Revenue for each task | Finite, non-negative; zero yields N/A margin |
| `--minimum-success-rate` | Quality floor | Fraction from 0 to 1 |
| `--maximum-p95-seconds` | Latency ceiling | Finite, non-negative |
| `--input` | Alternative scenario JSON | Same schema as data.json; unique variant names |
| `--csv` | Results file | Six rows for default variants; replaces the chosen file |

CSV results include variant assumptions, effective review cost, volume, release gates, eligibility reasons and the recommended option. Recommendations minimize variable cost **among variants passing both gates**. Equal costs use the variant name as a deterministic tie-breaker. No qualifying variant means no recommendation. Negative contribution margins remain visible.

## Verification

```bash
python3 -m unittest -v
```

Seven automated tests cover baseline and sensitivity results, exact gate boundaries, no feasible option, zero revenue/volume, invalid inputs, command-line errors and CSV auditability. The bundled baseline remains $270 monthly hybrid variable cost and 73% contribution margin; doubled review cost gives $430 and 57%.
