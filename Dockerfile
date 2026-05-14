FROM node:24-alpine

WORKDIR /workspace

RUN sed -i 's#https\?://dl-cdn.alpinelinux.org/alpine#https://mirrors.tuna.tsinghua.edu.cn/alpine#g' /etc/apk/repositories && \
    apk update && apk add git && \
    git clone https://github.com/ShawJie/Portal.git portal && cd portal && \
    npm config set registry http://mirrors.cloud.tencent.com/npm && \
    npm install && \
    cd web && npm install && npm run build

EXPOSE 8080

WORKDIR /workspace/portal

ENTRYPOINT ["npm", "run", "deploy"]
