#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const args = new Set(process.argv.slice(2));
const includeIgnoredLocal = args.has('--include-ignored-local');
const maxFileBytes = 1024 * 1024;

const allowlistedFiles = new Set([
  'package-lock.json',
]);

const safePlaceholderPattern = /(?:your_|test-|example|dummy|fake|mock|placeholder|changeme|xxx|redacted|<[^>]+>)/i;

const rules = [
  {
    id: 'private-key',
    severity: 'high',
    pattern: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    id: 'telegram-bot-token',
    severity: 'high',
    pattern: /\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/,
  },
  {
    id: 'openai-api-key',
    severity: 'high',
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  },
  {
    id: 'github-token',
    severity: 'high',
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{30,}\b/,
  },
  {
    id: 'google-api-key',
    severity: 'high',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/,
  },
  {
    id: 'aws-access-key',
    severity: 'high',
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    id: 'jwt',
    severity: 'medium',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    id: 'sensitive-assignment',
    severity: 'medium',
    pattern: /\b(?:api[_-]?key|secret|token|password|passwd|pwd|service[_-]?role[_-]?key|bot[_-]?token|admin[_-]?user[_-]?ids?)\b\s*[:=]\s*['"]?([^'"\s#]{8,})/i,
    valueGroup: 1,
  },
];

const maybePrivateAssignment = /\b(?:telegram[_-]?admin[_-]?user[_-]?ids?|admin[_-]?user[_-]?ids?)\b\s*[:=]\s*['"]?\d{6,}/i;

function gitLines(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listFiles() {
  const files = new Set(gitLines(['ls-files', '--cached', '--others', '--exclude-standard']));

  if (includeIgnoredLocal) {
    for (const file of ['.env', '.env.local', '.env.development', '.env.production']) {
      if (existsSync(resolve(root, file))) {
        files.add(file);
      }
    }
  }

  return [...files].sort();
}

function isTextFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz',
    '.tgz', '.mp4', '.mov', '.woff', '.woff2', '.ttf', '.eot',
  ]);

  return !binaryExtensions.has(ext);
}

function redact(line) {
  return line
    .replace(/\b\d{6,12}:[A-Za-z0-9_-]{12,}\b/g, '<REDACTED_TELEGRAM_BOT_TOKEN>')
    .replace(/\bsk-(?:proj-)?[A-Za-z0-9_-]{8,}\b/g, '<REDACTED_OPENAI_KEY>')
    .replace(/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{8,}\b/g, '<REDACTED_GITHUB_TOKEN>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<REDACTED_JWT>')
    .replace(/([:=]\s*['"]?)[^'"\s#]{8,}/g, '$1<REDACTED>');
}

function shouldSkipRule(file, line, rule, match) {
  if (allowlistedFiles.has(file)) {
    return true;
  }

  if (line.includes('process.env.') || /^\s*\w+\??:\s*\w+/.test(line)) {
    return true;
  }

  const value = rule.valueGroup ? match[rule.valueGroup] : match[0];
  return safePlaceholderPattern.test(value) || safePlaceholderPattern.test(line);
}

const findings = [];
const warnings = [];

if (existsSync(resolve(root, '.env'))) {
  warnings.push('.env exists locally. It is ignored by git; do not add it before publishing.');
}

for (const file of listFiles()) {
  const fullPath = resolve(root, file);

  if (!fullPath.startsWith(root) || !existsSync(fullPath) || !statSync(fullPath).isFile()) {
    continue;
  }

  if (!isTextFile(fullPath) || statSync(fullPath).size > maxFileBytes) {
    continue;
  }

  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of rules) {
      const match = line.match(rule.pattern);
      if (match && !shouldSkipRule(file, line, rule, match)) {
        findings.push({
          file,
          line: index + 1,
          rule: rule.id,
          severity: rule.severity,
          preview: redact(line.trim()),
        });
      }
    }

    if (maybePrivateAssignment.test(line) && !safePlaceholderPattern.test(line)) {
      findings.push({
        file,
        line: index + 1,
        rule: 'private-admin-id-assignment',
        severity: 'medium',
        preview: redact(line.trim()),
      });
    }
  });
}

if (warnings.length > 0) {
  console.error('Security scan warnings:');
  for (const warning of warnings) {
    console.error(`- ${warning}`);
  }
}

if (findings.length > 0) {
  console.error('Security scan failed. Potential secrets/private identifiers found:');
  for (const finding of findings) {
    console.error(
      `- [${finding.severity}] ${finding.rule} ${relative(root, resolve(root, finding.file))}:${finding.line} ${finding.preview}`,
    );
  }
  process.exit(2);
}

console.log('Security scan passed: no obvious committed/unignored secrets found.');
