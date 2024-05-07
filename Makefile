#!/usr/bin/env sh

.PHONY: reqs-base reqs-dev reqs-prod reqs-test reqs msg-py msg-js msg-make msg-compile dev-js dev-py dev test

# Requirements generation
reqs-base:
	pip-compile --resolver=backtracking --strip-extras --upgrade -o requirements.txt pyproject.toml

reqs-dev:
	pip-compile --resolver=backtracking --strip-extras --upgrade --extra dev -o requirements/dev.txt pyproject.toml

reqs-prod:
	pip-compile --resolver=backtracking --strip-extras --upgrade --extra prod -o requirements/prod.txt pyproject.toml

reqs-test:
	pip-compile --resolver=backtracking --strip-extras --upgrade --extra test -o requirements/test.txt pyproject.toml

reqs:
	@$(MAKE) -j reqs-base reqs-dev reqs-prod reqs-test


# I18n messages
msg-py:
	python manage.py makemessages -l cs --no-location -i=venv

msg-js:
	python manage.py makemessages -l cs --no-location -i=venv -i=node_modules -d djangojs

msg-make:
	@$(MAKE) -j msg-py msg-js

msg-compile:
	python manage.py compilemessages -i=venv


# Development servers
dev-js:
	npm run dev

dev-py:
	python manage.py runserver_plus

dev:
	@$(MAKE) -j dev-py dev-js


# Testing
test:
	DJANGO_SETTINGS_MODULE=config.settings.test coverage run -m pytest && coverage report
