#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

function run(cmd, args, options = {}) {
  const output = execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
    ...options,
  });
  return typeof output === 'string' ? output.trim() : '';
}

function fail(message) {
  console.error(`\n🚫 Production deploy blocked: ${message}\n`);
  process.exit(1);
}

run('git', ['fetch', 'origin', 'main'], { stdio: 'inherit' });

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch !== 'main') {
  fail(`current branch is ${branch}, expected main.`);
}

const head = run('git', ['rev-parse', 'HEAD']);
const origin = run('git', ['rev-parse', 'origin/main']);
if (head !== origin) {
  const shortHead = run('git', ['rev-parse', '--short', 'HEAD']);
  const shortOrigin = run('git', ['rev-parse', '--short', 'origin/main']);
  fail(`local HEAD ${shortHead} does not match origin/main ${shortOrigin}. Run: git reset --hard origin/main`);
}

const trackedStatus = run('git', ['status', '--porcelain', '--untracked-files=no']);
if (trackedStatus) {
  fail(`tracked files are modified:\n${trackedStatus}`);
}

const envOutput = run('vercel', ['env', 'pull', '--environment=production', '/tmp/sqc-production-env-check.env']);
const envText = run('cat', ['/tmp/sqc-production-env-check.env']);
if (!/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=["']?pk_live_/m.test(envText)) {
  fail('production NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not a pk_live_ key.');
}
if (!/^CLERK_SECRET_KEY=["']?sk_live_/m.test(envText)) {
  fail('production CLERK_SECRET_KEY is not an sk_live_ key.');
}
run('rm', ['-f', '/tmp/sqc-production-env-check.env']);

console.log('✅ Production deploy guard passed: main == origin/main, tracked tree clean, Clerk live keys present.');
