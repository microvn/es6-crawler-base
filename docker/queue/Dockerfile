FROM node:11.10-alpine

#RUN apk add --no-cache libc6-compat

RUN apk add --no-cache make gcc g++ python3 py-pip musl-dev libc-dev python-dev

RUN pip install dateparser

WORKDIR /home/service

RUN npm config set unsafe-perm true

COPY package*.json ./

RUN npm cache clean --force \
  && npm install -g node-gyp \
  && npm install

CMD [ "npm", "run","queue"]

