FROM node:19-alpine3.15

COPY . /data

EXPOSE 8080

ENTRYPOINT ["node", "/data/index.js"]