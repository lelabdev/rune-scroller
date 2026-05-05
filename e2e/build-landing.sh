#!/usr/bin/env bash
# Build the landing site and copy to e2e/pages/landing/ for integration tests
set -e

LANDING_SRC="${LANDING_SRC:-$HOME/dev/rune-scroller-site}"
LANDING_DEST="$(dirname "$0")/pages/landing"

echo "Building rune-scroller-site from $LANDING_SRC..."
cd "$LANDING_SRC"
pnpm build

echo "Copying build to $LANDING_DEST..."
rm -rf "$LANDING_DEST"
cp -r "$LANDING_SRC/build" "$LANDING_DEST"

echo "Landing build copied ✓"
