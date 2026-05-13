# Security Policy

## Supported Versions
We actively provide security updates for the following versions of SchoolFix Digital POS:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability
We take the security of our users' financial and inventory data seriously. If you discover a security vulnerability (such as IDOR, RFI, or XSS), please do not report it publicly via GitHub Issues.

Instead, please follow these steps:
1. **Email us**: Send a detailed report to [Your Email/Business Email].
2. **Details**: Include a description of the vulnerability, the steps to reproduce it, and any potential impact.
3. **Response**: We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Our Security Commitments
As part of our commitment to secure software development, we focus on:
* **Input Validation**: Hardening all Java and JavaScript inputs to prevent injection.
* **Access Control**: Mitigating Insecure Direct Object Reference (IDOR) risks.
* **Regular Audits**: Testing our backend logic against Remote File Inclusion (RFI) patterns.
