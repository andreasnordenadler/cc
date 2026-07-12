# Multiplayer proof refresh integrity notes

- Web and mobile refresh handlers authenticate the caller and select that caller's stored provider username; request-body participant IDs are never used for proof selection.
- Duplicate quest IDs are normalized before provider checks, score updates, and completion-attempt creation.
- Chess.com daily (`time_control: 1/259200`) and Lichess correspondence (`speed: correspondence`, `daysPerTurn`) are treated as the `daily` class. `Any time control` and class-only `Daily` rules are supported. Exact `Daily N+N` rules fail closed because correspondence APIs do not provide a live initial-plus-increment clock.

## Residual concurrency limitation

Metadata persistence remains read-modify-write rather than an atomic compare-and-set transaction. Two refresh requests for the same participant can race after reading the same progress and both attempt equivalent metadata writes/completion receipts. In-process duplicate quest IDs and already-completed IDs are filtered, but cross-request idempotency is not guaranteed until persistence provides an atomic version/precondition or a durable unique attempt key.
