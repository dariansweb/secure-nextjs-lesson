# Security Policy

Thanks for helping keep this project and its users safe. This page explains how to report a vulnerability and what to expect.

## Supported versions

We provide security fixes for the latest minor release only. Older versions may receive fixes at our discretion.

## How to report a vulnerability

**Preferred:** Use GitHub’s private “Report a vulnerability” flow on this repo’s **Security → Advisories** page.  
If that’s not available, email **security@[your-domain]** (PGP below). Please include steps to reproduce, affected versions, and impact. We’ll acknowledge receipt within **48 hours** and aim to provide a remediation timeline within **7 business days**.

- Publicly disclose **only after** we’ve shipped a fix or after **90 days**, whichever comes first, unless we agree to another date.

## Scope / rules of engagement

- Target this repository’s code and the demo app at **[your production URL or Vercel preview]**.
- **Do not** perform tests that could harm users or data (e.g., DDoS, spam, privacy violations, social engineering).
- Avoid automated scanning that generates large traffic volumes.
- If you discover user data exposure, **stop** and report immediately.

## Safe harbor (good-faith research)

We will not pursue civil or criminal action for **good-faith** security research that follows this policy and **does not** exploit data, privacy, or availability. Testing that violates laws or causes harm is out of scope.

## Out of scope examples

- Self-XSS, clickjacking on non-sensitive pages, missing security headers that don’t lead to exploit
- Best-practice suggestions without a demonstrable security impact
- Denial-of-service via volumetric attacks
- Vulnerabilities in third-party dependencies that are not exploitable in this project’s context

## Credit / recognition

With your consent, we’ll credit you in the security advisory and release notes.

## Encryption key (optional)

PGP: **[link to your public key or keyblock]**

## security.txt

We also publish a machine-readable policy at:
`https://yourdomain/.well-known/security.txt`
