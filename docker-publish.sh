#!/bin/bash
set -e -u -o pipefail

CUR_VERSION=$(npm -s run env echo '$npm_package_version')

docker build -t comnetunb/dispatcher-master:latest -t comnetunb/dispatcher-master:$CUR_VERSION .

docker image push comnetunb/dispatcher-master:latest
docker image push comnetunb/dispatcher-master:$CUR_VERSION
