#!/usr/bin/env bash
# Push the current feature branch to its origin tracking remote.
#
# This is the ONLY allowlisted git push path in the project OpenCode permission
# policy: raw `git push*` is denied in opencode.jsonc so an automated agent
# (including --auto mode, which auto-approves ask-tier operations) cannot update
# `main` directly and bypass the PR/review/merge wrapper.
#
# Safety conditions (fail closed; any failure exits non-zero and pushes nothing):
#   1. The current branch is not `main` (direct main updates are not permitted;
#      integrate through a Pull Request and merge-approved-pr.sh instead).
#   2. The branch is a real named branch (not detached HEAD).
#   3. The push targets only the current branch's origin remote.
#
# The script accepts NO arguments. It rejects any flags (e.g. --force) so a
# caller cannot escalate to a force-push or target another ref.
#
# Exit codes: 0 = pushed; 1 = precondition failed (nothing pushed); 2 = usage error.

set -euo pipefail

# --- Reject any arguments (defense in depth against --force / ref targeting) ---
if [ "$#" -gt 0 ]; then
  echo "ERROR: push-feature-branch accepts no arguments (no --force, no extra refs)." >&2
  exit 2
fi

branch="$(git branch --show-current)"
if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
  echo "ERROR: could not determine a current branch (detached HEAD?)." >&2
  exit 1
fi

if [ "$branch" = "main" ]; then
  echo "ERROR: refusing to push branch 'main' directly. Integrate via a Pull Request and merge-approved-pr.sh." >&2
  exit 1
fi

echo "Pushing branch '$branch' to origin."
git push -u origin "$branch"
echo "Pushed branch '$branch'."
