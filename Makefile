build:
	docker build -t rolodex .
	docker tag rolodex johnjones4/rolodex
	docker push johnjones4/rolodex
