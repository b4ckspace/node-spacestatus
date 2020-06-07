FROM node:10-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add nmap nmap-scripts \
    && npm install

COPY . /app

CMD [ "node", "index.js", "--config /app/config/config.js" ]