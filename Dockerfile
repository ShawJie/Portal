FROM node:19-alpine3.15

COPY . /data

WORKDIR /data

RUN npm install

EXPOSE 8080

ENTRYPOINT ["node", "/data/index.js"]