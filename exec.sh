#!/bin/bash
set -e -u -o pipefail

cd "$(dirname "$0")"

echo "Executing '$@' for first dir"

$@

cd ./src/servers/web/client

echo "Executing '$@' for second dir"

$@
