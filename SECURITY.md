# Security Policy

## 🔐 Security Best Practices

### Private Key Management

**Your private key is the most important piece of data in CLAWD Wallet.**

✅ **DO:**
- Keep your private key secure in your OS keychain
- Backup your private key in a secure location (encrypted USB, password manager)
- Test with small amounts first ($1-5 USDC)
- Use strong system passwords to protect your keychain
- Enable full disk encryption on your computer
- Log out of your computer when not in use

❌ **DON'T:**
- Share your private key with anyone
- Store your private key in plain text files
- Email or message your private key
- Take screenshots of your private key
- Use `clawd export-key` unless absolutely necessary
- Commit private keys to git repositories

### Spending Limits

Configure appropriate spending limits for your use case:

```bash
# Set maximum per transaction (default: $10)
clawd config set max-transaction 5.00

# Set auto-approve threshold (default: $0.10)
clawd config set auto-approve-under 0.50

# Set daily spending limit (default: $50)
clawd config set daily-limit 25.00
```

### Transaction Verification

Before approving any payment:
- ✅ Verify the service URL is correct
- ✅ Check the payment amount matches expectations
- ✅ Ensure you have sufficient balance
- ✅ Review the payment description
- ✅ Confirm the transaction is intentional

### Monitoring

Regularly review your activity:

```bash
# Check recent transactions
clawd history

# Review audit logs
cat ~/.clawd/audit.log

# Monitor balance
clawd balance
```

### System Security

- Keep your operating system updated
- Use antivirus/anti-malware software
- Be cautious of phishing attempts
- Only install CLAWD Wallet from official sources
- Verify package integrity (npm, GitHub)

## 🐛 Reporting Security Vulnerabilities

**We take security seriously.** If you discover a security vulnerability, please report it responsibly.

### Reporting Process

**DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, please:

1. **Email**: [Create an issue on GitHub with "SECURITY" tag and we'll provide secure contact]
2. **Provide details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Give us time**: We aim to respond within 48 hours
4. **Coordinate disclosure**: Work with us on responsible disclosure timeline

### What to Report

Report any security issues including:
- Vulnerabilities that could lead to fund loss
- Private key exposure risks
- Authentication bypasses
- Command injection vulnerabilities
- Spend limit bypasses
- Cryptographic weaknesses
- Denial of service vulnerabilities

### What We'll Do

When you report a vulnerability:
1. **Acknowledge** within 48 hours
2. **Investigate** and confirm the issue
3. **Develop a fix** and test thoroughly
4. **Release a patch** as soon as safely possible
5. **Credit you** (if desired) in the security advisory
6. **Notify users** of the vulnerability and recommended actions

## 🏆 Security Hall of Fame

We'll recognize security researchers who responsibly disclose vulnerabilities:

<!-- List will be maintained here -->
*No vulnerabilities reported yet.*

## 📜 Security Audit

This project has undergone security review:
- ✅ Automated security scanning (vibe-codebase-audit)
- ✅ Manual code review
- ✅ Dependencies reviewed for known vulnerabilities
- ⏳ Professional security audit (planned for future)

## 🔄 Security Updates

### Current Version Security Status

**v0.1.0** (Current)
- No known security vulnerabilities
- Initial release - use with caution
- Recommended for testing with small amounts

### Update Policy

- **Critical vulnerabilities**: Patch released within 24-48 hours
- **High severity**: Patch released within 1 week
- **Medium severity**: Patch released in next minor version
- **Low severity**: Patch released in next feature release

### How to Update

```bash
# Check current version
clawd --version

# Update to latest version
npm update -g @clawd/x402-wallet-mcp

# Verify update
clawd --version
```

## 🛡️ Threat Model

### What CLAWD Wallet Protects Against

✅ Accidental overspending (spend limits)
✅ Unauthorized transactions (approval required)
✅ Private key exposure in code (OS keychain storage)
✅ Transaction replay attacks (nonce-based x402 protocol)

### What CLAWD Wallet Does NOT Protect Against

❌ Compromised operating system
❌ Keyloggers or malware on your machine
❌ Physical access to unlocked computer
❌ Social engineering attacks
❌ Phishing for private keys
❌ Loss of OS keychain access

**Your security is a shared responsibility.** CLAWD Wallet provides tools, but you must use them securely.

## 📚 Additional Resources

- [x402 Security Best Practices](https://docs.cdp.coinbase.com/x402)
- [Base Network Security](https://docs.base.org/security)
- [Ethereum Wallet Security](https://ethereum.org/en/security/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

## 🔗 Contact

- **GitHub Issues**: https://github.com/csmoove530/clawd-wallet/issues (non-security)
- **Security Reports**: [See reporting process above]
- **General Questions**: Open a GitHub discussion

---

**Remember: You are responsible for your own security. Use CLAWD Wallet at your own risk.**

Last updated: 2026-01-15
