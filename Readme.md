# Rolodex

[![Build Status](https://travis-ci.org/johnjones4/Rolodex.svg?branch=master)](https://travis-ci.org/johnjones4/FeedPage)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

![App screenshot](screenshot.png)

Rolodex syncs Google, Exchange, and LinkedIn contacts into one master list and helps you manage and track relationships.

## Setup

Rolodex may be run in a container with the following command. Note that you will need to setup an API project on the Google APIs console and enable the Contacts API, Geocoding API, and the People API.

```sh
docker run \
  --env GOOGLE_CONTACTS_CLIENTID=<Obtain this from the Google APIs console> \
  --env GOOGLE_CONTACTS_CLIENT_SECRET=<Obtain this from the Google APIs console> \
  --env GOOGLE_API_KEY=<Obtain this from the Google APIs console> \
  --env JWT_SECRET=<Random string> \
  --env LOGIN_USERNAME=<Specify the login username> \
  --env LOGIN_PASSWORD=<Specify the login password> \
  --env PORT=80 \
  --port 80:80 \
  johnjones4/rolodex
```

## Development

To setup Rolodex for development, run the following:

```sh
git clone git@github.com:johnjones4/Rolodex.git
cd Rolodex/server
touch .env
```

In the `.env` file just created, declared the enviroment variables specified under Setup, except for the `PORT` variable. Then, in that same directory, run:

```
npm install
node index.js
```

In a new terminal tab or window, starting from the `Rolodex/server` directory, run:

```sh
cd ../client
npm install
npm start
```

The build script will automatically launch a browser pointing to the running application.
