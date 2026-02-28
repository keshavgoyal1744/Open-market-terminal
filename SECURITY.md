# Security Policy

## Supported scope

Security reports are welcome for the current main branch of Open Market Terminal.

Priority areas:

- authentication and session handling
- serverless and API routing
- alert and notification delivery paths
- workspace, notes, and persistence flows
- any issue that could expose secrets, stored user data, or privileged actions

## Reporting a vulnerability

Please report vulnerabilities privately.

Recommended report contents:

- short summary of the issue
- affected file, route, or feature
- impact
- reproduction steps
- proof of concept if relevant
- suggested fix if you have one

If the project owner publishes a dedicated security contact later, use that channel. Until then, report privately through GitHub security reporting if enabled for the repository, or contact the maintainer directly rather than opening a public issue.

## Disclosure expectations

- Do not publicly disclose the issue before a fix is available.
- Do not include live secrets, production credentials, or third-party user data in public reports.
- Give reasonable time for triage and remediation before disclosure.

## Safe testing rules

Allowed:

- local testing against your own clone
- responsible testing of public routes without destructive actions
- proof-of-concept reports with minimized impact

Not allowed:

- denial-of-service attempts
- destructive data modification
- social engineering
- credential stuffing
- exfiltrating real user data

## Response goals

Best effort targets:

- acknowledge receipt within a reasonable time
- reproduce and triage the issue
- patch or mitigate if confirmed
- credit the reporter if they want attribution

## Secrets

If you discover an exposed API key, token, or secret:

1. report it privately
2. assume rotation is required
3. do not reuse or redistribute the secret
