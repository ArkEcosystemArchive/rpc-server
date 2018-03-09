FROM zenika/alpine-node:latest

COPY . /src/ark-rpc

RUN cd /src/ark-rpc \
    && npm install -g forever \
    && npm install

WORKDIR /src/ark-rpc
ENTRYPOINT ["forever","./server.js","--allow-remote"]

EXPOSE 8081
