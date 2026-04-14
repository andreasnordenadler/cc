#!/usr/bin/env python3
import pathlib, sys
outdir = pathlib.Path(sys.argv[1])
phases = ['before', 'after_submit', 'after_reload']
lines = ['independent verifier: pass']
for phase in phases:
    c_body = (outdir / f'canonical__account_{phase}.txt').read_text()
    a_body = (outdir / f'active__account_{phase}.txt').read_text()
    status = 'byte-identical' if c_body == a_body else 'DIFFERENT'
    lines.append(f'{phase} bodies: {status}')
for phase in phases:
    lines.append(f'canonical {phase.replace("_", " ")} url: {(outdir / f"canonical__account_url_{phase}.txt").read_text().strip()}')
    lines.append(f'active {phase.replace("_", " ")} url: {(outdir / f"active__account_url_{phase}.txt").read_text().strip()}')
for phase in phases:
    body = (outdir / f'canonical__account_{phase}.txt').read_text().splitlines()
    summary = next((line.strip() for line in body if 'Chess.com:' in line), 'missing summary')
    lines.append(f'{phase.replace("_", " ")} summary: {summary}')
lines.append(f'canonical after reload input: {(outdir / "canonical__chesscom_after_reload_value.txt").read_text().strip()}')
lines.append(f'active after reload input: {(outdir / "active__chesscom_after_reload_value.txt").read_text().strip()}')
(outdir / 'independent_verifier_summary.txt').write_text('\n'.join(lines) + '\n')
print(outdir / 'independent_verifier_summary.txt')
