.PHONY: dev web api compose

dev: compose

compose:
	docker compose up --build

web:
	pnpm --dir apps/web dev

api:
	uvicorn app.main:app --reload --app-dir apps/api
