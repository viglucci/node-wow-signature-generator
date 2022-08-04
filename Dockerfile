FROM node:18

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get -y install sudo \
    && sudo apt install imagemagick

ADD package.json .

RUN npm install --quiet

COPY fonts /usr/src/app/fonts
COPY images /usr/src/app/images
COPY services /usr/src/app/services
COPY oauth.js /usr/src/app/oauth.js
COPY constants.js /usr/src/app/constants.js
COPY app.js /usr/src/app/app.js
COPY server.js /usr/src/app/server.js

CMD ["node", "server.js"]
