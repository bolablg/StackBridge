# AWS Data Engineer Goal — Completion Audit

Objective: prepare for and pass AWS Certified Data Engineer – Associate (DEA-C01) through a tailored GCP-to-AWS learning path with practical work and weekly accountability.

Status: **in progress; not complete**

This audit distinguishes prepared material from learner evidence. A guide, plan, or link does not prove that a skill was practiced or that the certification was passed.

## Requirement audit

| Requirement | Current evidence | Finding | Proof still needed |
|---|---|---|---|
| Tailored GCP-to-AWS learning path | [Study plan](aws-data-engineer-study-plan.md), [blueprint](aws-dea-c01-blueprint.md), and [Start Here](AWS-DATA-ENGINEER-START-HERE.md) | Prepared | Learner reflections showing correct AWS service choices in scenarios/labs |
| AWS learning resources and account-safety path | [Week 0 guide](aws-data-engineer-week-0-account-setup.md) with Skill Builder, AWS Educate, Free Tier, MFA, budget, and identity steps | Prepared; account status only reported as “new” | Region, plan/credit dates, MFA, non-root identity, budget/alerts, and CloudShell identity evidence |
| Practical AWS data-engineering skills | Weeks 1–10 labs and starter artifacts | Guides prepared; execution unverified | Command output/artifacts, troubleshooting notes, and teardown evidence for completed labs |
| Dataform alternative | Study plan and Week 10 dbt/Redshift lab | Mapping prepared: dbt is closest analogue; Glue remains AWS-native skill | A dbt model/test DAG or a documented no-account mapping, then evidence of execution when Redshift is ready |
| Security, governance, operations, quality, and cost | Weeks 8–9 guides and capstone worksheets | Exercises prepared; learner evidence missing | Policy validation, quality rules, monitoring/failure runbook, and cost worksheet/results |
| DEA-C01 baseline | [Original 16-question diagnostic](aws-dea-c01-baseline-diagnostic.md) | Not answered | Answer string, score, confidence, and domain-level error log |
| Weekly accountability | [Accountability tracker](aws-data-engineer-accountability.md) | Tracker prepared; cadence not selected | Preferred day/time and completed check-ins with evidence |
| Remediation and practice readiness | Weeks 11–12 guides | Gates defined; no scores reported | Domain scores, three timed sets, official practice/pretest result if available, and closed error log |
| Certification outcome | No exam result reported | Not attempted or not reported | Exam scheduling decision and official pass result |

## Immediate next proof packet

Send only status information—never credentials, access keys, MFA codes, or secrets:

```text
AWS Region:
Credit balance/expiration:
Free Plan expiration:
Root MFA:
Non-root identity:
Identity type (IAM user / assumed role / IAM Identity Center):
Budget/alerts:
Preferred weekly check-in day/time:
Diagnostic answers:
```

For chat, report identity type and yes/no status rather than a full account ID or ARN. Never send credentials, access keys, MFA codes, or secret values.

After the packet arrives, the next verified sequence is:

1. Confirm Week 0.
2. Score the diagnostic by domain.
3. Assign one time-bounded Week 1 commitment.
4. Update this audit and the accountability tracker only from reported evidence.

## Completion standard

Do not mark the objective complete until current evidence proves:

- the capstone runs end to end and can be explained;
- AWS-specific troubleshooting, security, quality, operational, and cost decisions are demonstrated;
- at least three timed practice sets meet the tracker threshold and errors are remediated;
- the official readiness assessment supports scheduling;
- the AWS certification result is reported as passed.
