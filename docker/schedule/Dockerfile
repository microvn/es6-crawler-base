FROM node:11.10-alpine

#RUN apk add --no-cache libc6-compat
ENV CHROME_BIN /usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PREBOOT_CHROME true
ENV MAX_CONCURRENT_SESSIONS 1
ENV KEEP_ALIVE true

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories

RUN apk add --no-cache make gcc g++ python linux-headers binutils-gold gnupg libstdc++ chromium@edge nss@edge freetype@edge freetype-dev@edge harfbuzz@edge ttf-freefont@edge

WORKDIR /home/service

RUN npm config set unsafe-perm true

COPY package*.json ./

RUN npm cache clean --force \
  && npm install -g node-gyp \
  && npm install

ENV NODE_ENV production
ENV ENVIRONMENT production
ENV IS_QUEUE true
CMD [ "npm", "run","schedule"]

