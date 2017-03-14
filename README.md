CivisAnalysis
=============

## Running locally

You can start the application using a python module, by running the command below from within the `public` folder.
```console
  python -m SimpleHTTPServer
```

-- OR --

If you have [node/npm](https://nodejs.org/en/) installed in your machine, you can run the commands described below.

To install the dependencies:
```console
  npm install
```
To run the application:
```console
  grunt server
```
With that you will find the application running on http://localhost:9000/ with auto-reload when editing JavaScript or CSS files and compiling `.jade` files.

### Using Docker
As an alternative, you can install and run the application using a Docker container. This option allows you to isolate your application files from your system files. By using a container you don't have to worry about any of the dependencies and configuration for this application. All you have to do is to install [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/), and run a few commands to get up and running with the app.

#### Installing Docker

##### On Ubuntu
- [Install Docker Engine](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

##### On macOS
- [Installation on macOS](https://docs.docker.com/engine/installation/mac/)

##### On Windows
- [Installation on Windows](https://docs.docker.com/engine/installation/windows/)

#### Testing docker installation
Docker version:
```console
docker --version
```
Docker-compose version:
```console
docker-compose --version
```

#### Development
After having  `docker` and `docker-compose` setup on your machine you can simply run these commands to run the project:

1. Run `docker-compose build` (Setup container)
2. Run `docker-compose run --rm web npm install` (Install dependencies)
3. Run `docker-compose up` (Run webserver)

With that you will find the application running on http://localhost:3000/
