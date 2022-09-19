# Dispatcher Master

See also:

- [Worker](https://github.com/comnetunb/dispatcher-worker)
- [Protocol](https://github.com/comnetunb/dispatcher-protocol)

## Introduction

This system will manage simulations dispatching on a distributed system, in a fault tolerance manner.

It will also provide a WEB interface in which users will be able to input the simulations to be analysed and also monitor its progress as the state of the workers.

The simulation application must deal with Optical Network Simulator input and output directives (see more: http://comnet.unb.br/br/grupos/get/ons) to work. It will treat the simulator as a black box.

## Installation

Pre-requisites:

- Install [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

Replace the environment variable values and run the following snippet:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/comnetunb/dispatcher-master/master/install.sh | sh
```

Or, you can execute the script contents yourself.

```sh
mkdir -p /tmp/dispatcher-master
cd /tmp/dispatcher-master

curl -L https://raw.githubusercontent.com/comnetunb/dispatcher-master/master/docker-compose.prod.yml -o docker-compose.yml

echo "Auth Secret Key is used for user authentication, please use a secure value."
read -s -p "Auth Secret Key:" AUTH_SECRET_KEY

export DISPATCHER_MASTER_PORT=8080

sudo docker-compose up -d
```

## Development

### Building and installing

#### Prereqs:

- [MongoDB v3.0.15 or better](https://www.mongodb.com/download-center?jmp=nav#community) _Up and running!_
- [NodeJS v10 LTS or better](https://nodejs.org/en/)

After downloading and extracting the source to a directory, on a terminal, run the following command:

```bash
$ git clone https://github.com/comnetunb/dispatcher-master
$ cd dispatcher-master
$ ./exec.sh npm i
$ ./build.sh
$ node dist/app.js
```
