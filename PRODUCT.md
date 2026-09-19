# AI Economics Product Decision

## User problem

An AI product team needs to select an approach that can deliver acceptable task quality within a latency budget and a sustainable variable cost. A cheap model can be expensive if humans frequently need to review its output.

## Instrumentation specification

Capture request ID, variant, input/output usage, billable amount, end-to-end duration, outcome label, review status, review time, and retry count. Do not infer task quality from a thumbs-up rate without accounting for response bias. Record failures in the denominator.

## Decision constraints

The scenario requires success of at least 90% and p95 latency at most three seconds. Review costs are included even if they occur after the automated response; the latency assumption is for the automated response only, not final reviewed resolution. If the user needs reviewed resolution within three seconds, none of these estimates proves feasibility.

## Experiment before procurement

Use the same blinded tasks across variants. Record paired outcomes, retry costs, queueing latency, human review effort, and quality labels. Include hard and unsupported tasks. Replace every fictional input with observed values and confidence intervals before committing.

## Release recommendation

Select hybrid only for a measurement pilot under these assumptions. Do not present its modeled 73% contribution margin as a realized business result. If quality falls below 90% or p95 exceeds three seconds, stop rollout and revisit constraints instead of relaxing the metric after observing results.
