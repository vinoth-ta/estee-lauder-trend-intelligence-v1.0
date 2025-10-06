run-backend:
	uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8000

run-frontend:
	cd frontend && npm run dev