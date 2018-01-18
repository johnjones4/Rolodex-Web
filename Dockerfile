FROM node:carbon

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app/server
RUN npm install
RUN npm install sqlite3 --build-from-source

WORKDIR /usr/src/app/client
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/server

VOLUME ["/var/rolodex"]

CMD ["node", "index.js"]
