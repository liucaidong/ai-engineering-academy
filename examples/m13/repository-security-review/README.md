# Sample Agent Skill: Repository Security Review

This directory is a teaching package illustrating the Agent Skills open format.

## Layout

- SKILL.md: portable metadata and task instructions.
- references/: focused review checklist and output schema.
- scripts/: optional deterministic report-shape validator.
- sample-report.json: synthetic report fixture.

## Run the example validator

From the repository root:

    python3 examples/m13/repository-security-review/scripts/validate_report.py examples/m13/repository-security-review/sample-report.json

The validator checks JSON shape only. It does not inspect a repository, execute code, verify finding evidence, enforce permissions or provide a sandbox. The package does not declare allowed-tools; Host/Runtime policy remains authoritative.
