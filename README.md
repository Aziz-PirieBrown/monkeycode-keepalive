# MonkeyCode Keepalive

GitHub Actions backup keepalive for a MonkeyCode task VM.

- Runs every 2 hours at minute 23 UTC.
- Opens the official Task Control WebSocket.
- Keeps it connected for 4 minutes so MonkeyCode's server-side keepalive loop refreshes the VM idle timer multiple times.
- Also probes the current 3x-ui HTTPS endpoint as a secondary liveness check.
- No AI messages are sent.

The sensitive `monkeycode_ai_session` value is stored only as a GitHub Actions secret named `MONKEYCODE_SESSION`.
