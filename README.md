# Dispatcher Master

See also: 

- [Worker](https://github.com/comnetunb/dispatcher-worker)
- [Protocol](https://github.com/comnetunb/dispatcher-protocol)

## Introduction

This system will manage simulations dispatching on a distributed system, in a fault tolerance manner.

It will also provide a WEB interface in which users will be able to input the simulations to be analysed and also monitor its progress as the state of the workers.

The simulation application must deal with Optical Network Simulator input and output directives (see more: http://comnet.unb.br/br/grupos/get/ons) to work. It will treat the simulator as a black box.

## Getting started

### Building and installing

#### Prereqs:
- [MongoDB v3.0.15 or better](https://www.mongodb.com/download-center?jmp=nav#community) *Up and running!* I advise to install MongoDB as a service so it will automatically run once the operating system boots.
- [NodeJS v8.10.0 LTS or better](https://nodejs.org/en/)

After downloading and extracting the source to a directory, on a terminal, run the following command:

```bash
$ npm install --only=prod
```

And that's it!

#### For Docker

If you want to run it as a dockerized container, everything you need is to install Docker CE (Community Edition):

- [CentOS](https://docs.docker.com/install/linux/docker-ce/centos/)
- [Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
- [Fedora](https://docs.docker.com/install/linux/docker-ce/fedora/)
- [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Others](https://docs.docker.com/install/linux/docker-ce/binaries)

And also install [Docker Compose](https://docs.docker.com/compose/install/).

## Running

Clone the web dispatcher and run it

```bash
$ git clone https://github.com/comnetunb/dispatcher-master
$ cd dispatcher-master
$ node app.js
```

It will run a server on port 8080 (you can access it on your browser: http://localhost:8080).

You can do your tweaks on your configuration file, located at *web_dispatcher/servers/config/config.json*

### Running non-stop

If you'd like to let the server run without being attached to a terminal, in a fault tolerance manner (restarts when it crashes), you can do the following:

1. Download `forever` on your machine using `sudo npm install -g forever`
2. `forever start app.js`

If you want to limit the number of restarts in case of failure, 5 for example, you can use `forever -m5 start app.js`

### For Docker

After installing Docker, just `cd` into the directory and execute `docker-compose up`:

```bash
$ git clone https://github.com/comnetunb/dispatcher-master
$ cd dispatcher-master
$ docker-compose up
```


### Properties
- cpu.threshold: defines the cpu threashold that should be available on worker machines
- memory.threshold: defines the memory threashold that should be available on worker machines
- requestResourceInterval: interval where dispatcher demands all workers resources
- dispatchInterval: interval where batch dispatch routine is done
