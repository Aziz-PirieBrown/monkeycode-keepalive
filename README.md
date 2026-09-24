# MonkeyCode VM Monitor

Public GitHub Actions health monitor for a MonkeyCode development VM.

- Runs every 2 hours at minute 23 UTC.
- Checks the current 3x-ui HTTPS endpoint and ttyd preview endpoint.
- Can also be run manually from the Actions tab.
- Does not call MonkeyCode's Task Control keepalive API and does not attempt to bypass the platform's idle/hibernation lifecycle.

The current task ID is documented only for identification:
`3790648b-5049-450b-bfce-ff5d8b03949f`
