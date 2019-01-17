# Dispatcher - Master

See also: 

- [Worker](https://github.com/comnetunb/dispatcher-slave)
- [Protocol](https://github.com/comnetunb/dispatcher-protocol)

## Introduction
This system will manage simulations dispatching on a distributed system, in a fault tolerance manner.

It will also provide a web interface in which users will be able to input the simulations to be analysed and also monitor its progress as the state of the workers.

## Getting started

### Building and installing

### Pre requisites

Everything you need is to install Docker CE (Community Edition):

- [CentOS](https://docs.docker.com/install/linux/docker-ce/centos/)
- [Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
- [Fedora](https://docs.docker.com/install/linux/docker-ce/fedora/)
- [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Others](https://docs.docker.com/install/linux/docker-ce/binaries)

### Running

After installing Docker, just run... [TODO]

You can do your tweaks on your configuration file, located at *web_dispatcher/servers/config/config.json*

#### Properties
- cpu.threshold: defines the cpu threashold that should be available on worker machines
- memory.threshold: defines the memory threashold that should be available on worker machines
- requestResourceInterval: interval where dispatcher demands all workers resources
- dispatchInterval: interval where batch dispatch routine is done

## Development

[TODO]