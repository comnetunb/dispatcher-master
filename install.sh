#!/bin/bash
set -e -u -o pipefail

mkdir -p /tmp/dispatcher-master
cd /tmp/dispatcher-master

curl -L https://raw.githubusercontent.com/comnetunb/dispatcher-master/master/docker-compose.prod.yml -o docker-compose.yml

echo "Auth Secret Key is used for user authentication, please use a secure value."
read -s -p "Auth Secret Key:" AUTH_SECRET_KEY

export DISPATCHER_MASTER_PORT=8080

sudo docker-compose up -d
