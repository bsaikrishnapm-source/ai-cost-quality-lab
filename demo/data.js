window.DEMO_DATA = {
  "monthly_tasks": 10000,
  "revenue_per_task": 0.1,
  "review_cost": 0.2,
  "variants": [
    {
      "name": "lean",
      "model_cost_per_task": 0.005,
      "success_rate": 0.82,
      "review_rate": 0.18,
      "p95_seconds": 1.2
    },
    {
      "name": "premium",
      "model_cost_per_task": 0.02,
      "success_rate": 0.94,
      "review_rate": 0.06,
      "p95_seconds": 3.8
    },
    {
      "name": "hybrid",
      "model_cost_per_task": 0.011,
      "success_rate": 0.92,
      "review_rate": 0.08,
      "p95_seconds": 2.4
    }
  ],
  "minimum_success_rate": 0.9,
  "maximum_p95_seconds": 3
};
