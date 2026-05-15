# SQC Three-Lane Operating Plan — 2026-05-15

## Directive

Andreas set three active SQC focus lanes on 2026-05-15:

1. **Website quality / operations** — make sure the website works well, has no errors, and quality-control / usage monitoring stays active.
2. **Marketing** — build a content/outreach engine: YouTube tutorials/demo, Instagram/TikTok funny/meme content, Reddit paid ads, plus organic posts/comments elsewhere when appropriate.
3. **SQC Mobile app development** — deliver a launch-ready mobile app before the end of next week. Operational target: launch-ready by Friday 2026-05-22 unless Andreas gives a different definition of “end of next week”.

## Operating posture

- Web remains under the existing website feature freeze: no new website features without explicit Andreas approval.
- Web lane may do bug fixes, production-hardening, analytics/monitoring, copy clarity, and regression fixes.
- Marketing lane may prepare assets and organic content drafts autonomously, but external posting/spend still requires explicit approval unless already separately approved for a specific post/action.
- Reddit paid ads are an approved channel to plan for; campaign launch still needs explicit budget/creative approval before spend.
- Mobile is the main build deadline and should receive priority engineering effort until launch-ready.

## Immediate actions started

- Roadmap updated with the three-lane priority directive.
- Website smoke check started against key production routes.
- Provider QA started against Lichess and Chess.com public data for `and72nor`.
- Marketing content-system subagent started to produce a 2-week calendar, YouTube script, short-form scripts, and Reddit ad variants.
- Mobile launch-readiness audit subagent started to produce the critical path and day-by-day plan.

## Initial website QA result

Production HTTP smoke at 2026-05-15 09:24 Europe/Stockholm:

- `https://sidequestchess.com/` — 200
- `https://sidequestchess.com/challenges` — 200
- `https://sidequestchess.com/challenges/finish-any-game` — 200
- `https://sidequestchess.com/result` — 200
- `https://sidequestchess.com/account` — 200
- `https://sidequestchess.com/support` — 200
- `https://sidequestchess.com/terms` — 200

Provider QA at 2026-05-15 09:24 Europe/Stockholm:

- Lichess public latest games for `and72nor` — pass, HTTP 200, game data present.
- Chess.com public monthly archive for `and72nor` — pass, HTTP 200, PGN/game data present.

## Next execution queue

1. Convert mobile audit into concrete code tasks and start Solo Quest Loop parity implementation.
2. Produce marketing draft assets and shortlist first 3 pieces to make.
3. Add/confirm a repeatable website ops check/report cadence.
4. Review analytics/admin data path and make sure usage monitoring is actionable.
