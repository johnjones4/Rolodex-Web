PWD=$(shell pwd)

build:
	docker build -t rolodex .
	docker tag rolodex johnjones4/rolodex
	docker push johnjones4/rolodex

install:
	cd server && npm install
	cd client && npm install

run-database:
	docker run --env POSTGRES_USER=rolodex --env POSTGRES_DB=rolodex --env POSTGRES_PASSWORD=rolodex --volume "$(PWD)/pgdata:/var/lib/postgresql/data" -p 5432:5432 postgres 

run-server:
	cd server && nodemon index.js

run-sync:
	cd server && node bin/sync.js

run-client:
	cd client && npm start
