# CiviTech Global Service Level Objectives

This document defines the initial SLOs for the CiviTech Global production stack. These targets guide alerting, on-call response, and prioritization of reliability work.

## API availability

- **SLO:** 99.9% of requests to the public API return a non-5xx response over a 30-day rolling window.
- **Error budget:** 0.1% of requests may fail.
- **Measurement:** Prometheus `http_request_duration_seconds` status-code labels, aggregated per month.

## API latency

- **SLO:** p99 latency for authenticated API endpoints is below 500 ms over a 1-hour window.
- **Target:** p50 below 50 ms, p95 below 200 ms.
- **Measurement:** Prometheus `http_request_duration_seconds` histogram.
- **Scope:** Excludes health probes, `/metrics`, and intentionally long-running admin exports.

## Lead submission success rate

- **SLO:** 99.5% of submitted insurance leads (API + Telegram bot) are successfully persisted and acknowledged.
- **Measurement:** API `POST /api/leads` success responses + bot conversation completion events.

## Telegram bot availability

- **SLO:** 99.5% of webhook updates are acknowledged within 5 seconds over a 24-hour window.
- **Measurement:** Bot webhook handler response status and duration.

## Recovery objectives

- **Recovery Time Objective (RTO):** 4 hours for a complete region/service outage.
- **Recovery Point Objective (RPO):** 1 hour maximum data loss for customer transactions.
- **Basis:** Daily automated backups plus continuous transaction logs (WAL) shipped to object storage.

## Frontend error rate

- **SLO:** Less than 0.1% of user sessions encounter an unhandled UI error captured by Sentry.
- **Measurement:** Sentry `crash_free_sessions` over a 30-day window.

## Review cadence

SLOs are reviewed quarterly. Breaches trigger a post-incident review and adjustment of error budgets or engineering priorities.
