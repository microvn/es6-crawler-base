FROM node:11.10-alpine

#RUN apk add --no-cache libc6-compat

RUN apk add --no-cache make gcc g++ python

RUN ls /home

WORKDIR /home/service

RUN npm config set unsafe-perm true

COPY package*.json ./

RUN npm cache clean --force \
  && npm install -g node-gyp \
  && npm install

ENV NODE_ENV production
ENV PORT 3355
EXPOSE 3355

CMD [ "npm", "start"]

