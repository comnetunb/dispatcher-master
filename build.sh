#!/bin/bash
set -e -u -o pipefail

cd "$(dirname "$0")"

./exec.sh npm run build
cp ./src/servers/web/client/dist/client ./dist/client -r
