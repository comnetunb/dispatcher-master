#!/bin/sh
set -e
set -a

DEFAULT_WEB_API_PORT=8080
DEFAULT_WORKER_API_PORT=16180

echo -e "Settings for the dispatcher:\n"

echo -e "Auth Secret Key is a key used to sign JWTs that serve the purpose of authenticating user sessions."
echo -e "Please write a secure key below that will be used for this instance of the Dispatcher."
read -s -p "Auth Secret Key: " AUTH_SECRET_KEY

echo -e "\n\nPort used to listen for incoming connections for the web server, accessible to users."
read -p "Web server port ($DEFAULT_WEB_API_PORT): " WEB_API_PORT
if [ "$WEB_API_PORT" = "" ]; then
  WEB_API_PORT=$DEFAULT_WEB_API_PORT
fi

echo -e "\n\nPort used to listen for incoming connections for the worker API server, used by workers to communicate with the main server."
read -p "Worker API port ($DEFAULT_WORKER_API_PORT): " WORKER_API_PORT
if [ "$WORKER_API_PORT" = "" ]; then
  WORKER_API_PORT=$DEFAULT_WORKER_API_PORT
fi

echo -e "\nStarting installation..."
echo -e " - Creating temporary dir /tmp/dispatcher-master"
mkdir -p /tmp/dispatcher-master
cd /tmp/dispatcher-master

echo -e " - Downloading docker-compose definition from the GitHub repository"
curl --fail -L https://raw.githubusercontent.com/comnetunb/dispatcher-master/master/docker-compose.prod.yml >docker-compose.yml

echo -e " - Starting containers..."
sudo \
  DISPATCHER_MASTER_SECRET_KEY=$AUTH_SECRET_KEY \
  DISPATCHER_MASTER_WEB_API_PORT=$WEB_API_PORT \
  DISPATCHER_MASTER_WORKER_API_PORT=$WORKER_API_PORT \
  docker-compose up -d

echo -e "\n\n"

echo -e "Dispatcher is installed and running on port $WEB_API_PORT of this machine!\n"

echo -e "The database is stored inside a docker volume called 'mongodb_data_container', how that works can be read here: https://docs.docker.com/storage/volumes/\n"

read -p "Do you want to tail the logs? " -n 1 -r
echo # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]; then
  sudo docker logs dispatcher-master -f
fi
