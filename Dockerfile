from ubuntu

env NODE_VERSION 4.4.7

workdir /app

run apt-get update && \
    apt-get install --yes --no-install-recommends curl ca-certificates xz-utils bzip2 libfontconfig

run curl -sSLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" && \
    tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 && \
    rm -f "node-v$NODE_VERSION-linux-x64.tar.xz" && \
    npm install npm -g
