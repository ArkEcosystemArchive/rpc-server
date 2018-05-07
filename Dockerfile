FROM node:alpine

RUN apk add --no-cache make gcc g++ python git

COPY . /src/ark-rpc

RUN cd /src/ark-rpc \
    && npm install -g pm2 \
    && npm install

WORKDIR /src/ark-rpc
ENTRYPOINT ["pm2","./server.js"]

EXPOSE 8080
