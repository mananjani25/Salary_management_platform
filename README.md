## Overview

Salary Management Tool is a full-stack application for HR and operations teams to manage employee salary records and analyze compensation data.
It combines a FastAPI backend with a Next.js frontend and supports employee CRUD workflows, filtering, pagination, soft-deletion, and multi-dimensional salary insights.

The application is designed around a TDD workflow (RED, GREEN, REFACTOR) and includes both backend and frontend automated tests.
It is suitable for local development, staged deployment, and production usage with Render (backend) and Vercel (frontend).

## Live Demo

- Frontend (Vercel): Pending deployment
- Backend API (Render/Railway): Pending deployment

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14 (App Router), React, TypeScript, React Query, shadcn/ui, Recharts, react-hook-form |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| Testing | pytest, Vitest, React Testing Library, MSW |

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

## Installation

1. Clone the repository.
2. Install backend dependencies:
	- `cd backend`
	- `python -m venv .venv`
	- Windows: `.venv\\Scripts\\activate`
	- `pip install -r requirements.txt`
3. Install frontend dependencies:
	- `cd ../frontend`
	- `npm install`

## Running Dev Servers

1. Backend server:
	- `cd backend`
	- `uvicorn app.main:app --reload --port 8000`
2. Frontend server:
	- `cd frontend`
	- `npm run dev`
3. Open application:
	- `http://localhost:3000`

## Seeding

- Seed database with 10,000 employees:
  - `python backend/scripts/seed.py --reset`

## Running Tests

- Backend tests with coverage:
  - `cd backend`
  - `pytest tests/ --cov=app`
- Frontend tests:
  - `cd frontend`
  - `npm run test`

## Test Summary

- Backend: 56 total tests targeted in the project plan.
- Frontend: 40 tests passing.
- Grand target: 96 total tests across backend and frontend.

## Architecture Notes

- App Router + client boundaries: interactive Next.js components use the `use client` directive, while route-level layout and composition follow App Router patterns.
- Server state with React Query: list, CRUD, and insights data are fetched and cached through query keys; mutations invalidate relevant keys for automatic UI refresh.
- Soft delete strategy: employee deletion sets status to Inactive instead of removing records to preserve historical integrity.
- SQL-first analytics: backend insights endpoints use SQLAlchemy aggregation and grouping for performance on large datasets.
