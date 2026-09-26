#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

command_exists() {
	command -v "$1" >/dev/null 2>&1
}

if ! command_exists ncu; then
	echo "npm-check-updates is not installed"
	npm install --global npm-check-updates
fi

update_dependencies() {
	echo "Updating dependencies in $PWD..."
	ncu -u -x @types/node -x @babel/preset-typescript -x typescript
}

update_dependencies

for manifest in "$repo_root"/packages/*/package.json; do
	if [[ -f "$manifest" ]]; then
		cd "$(dirname "$manifest")"
		update_dependencies
	fi
done

cd "$repo_root"
npm install

echo "Great Success!"
