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
- [NodeJS v10 LTS or better](https://nodejs.org/en/)

After downloading and extracting the source to a directory, on a terminal, run the following command:

```bash
$ git clone https://github.com/comnetunb/dispatcher-master
$ cd dispatcher-master
$ npm install
$ npm run dev
```

### Deploy to production

If you'd like to let the server run without being attached to a terminal, in a fault tolerance manner (restarts when it crashes), you can do the following:

```bash
$ git clone https://github.com/comnetunb/dispatcher-master
$ cd dispatcher-master
$ npm install
$ npm run build
$ forever start dist/app.js
```

You also have to start a static server for the front-end, an Angular application.

In this case, assuming you are at the root of the directory, execute the following commands:


```bash
$ cd src/servers/web/client/
$ npm install
$ npm run build
```

Right now you have a full generate website under the `dispatcher-master/src/servers/web/client/dist/client` directory. You can serve it using the server of your choice, such as Nginx, Apache or related.

Here you can find more details: [Angular Deployment Guide - Server Configuration](https://angular.io/guide/deployment#server-configuration)
