# SQC Rankings / Top Players / Quest Statistics Notes — 2026-05-04

## Product direction
As users arrive, SQC should show social proof and competition loops:
- which quests are popular
- which quests are trending
- who is completing the hardest quests
- which players are fastest/most absurd/most persistent

## Recommended surfaces

### Quest-level stats
- Attempts count
- Completion count
- Completion rate
- Trending score (recent attempts/completions)
- Difficulty reality signal: `Looks easy, ruins people` style copy when failure rate is high
- Recent completions feed

### Player rankings
- Total points
- Completed quests
- Absurd completions
- Brutal completions
- Current streak
- First completions / world-first style markers
- Most failed-but-persistent players (funny, opt-in framing)

### Quest rankings
- Most attempted
- Most completed
- Lowest completion rate
- Most shared
- Trending this week
- Most brutal/absurd verified completions

## UX recommendation
Start simple:
1. `/scoreboard` becomes `Top players` + `Top quests`.
2. Quest cards get lightweight stats: attempts, completions, completion rate/trending.
3. Each quest detail page gets a small social proof line near status/rules: `42 attempts · 3 completions · 7% clear rate`.

## Data model sketch
Need durable server-side attempt/completion storage. Current user metadata is not enough for global rankings.

Candidate tables/collections:
- `quest_attempts`
  - id
  - user_id
  - challenge_id
  - provider
  - game_id
  - status
  - checked_at
  - is_rated
  - result_summary
- `quest_completions`
  - id
  - user_id
  - challenge_id
  - provider
  - game_id
  - completed_at
  - points_awarded
  - difficulty
  - is_first_completion maybe
- `quest_stats_daily`
  - challenge_id
  - date
  - attempts
  - completions
  - shares

## Anti-abuse / privacy
- Public player names should be opt-in or use SQC display name.
- Avoid exposing private account metadata.
- Show public chess usernames only when user has opted into public profile/rankings.
- De-dupe repeated refreshes for same provider/game/quest.

## Recommendation
Make rankings a Phase 2 public-loop feature after quest activation/checker flow stabilizes. But add metadata hooks now so attempts/completions are not trapped only in Clerk public metadata.
