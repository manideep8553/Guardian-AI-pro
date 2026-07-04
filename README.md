# GuardianAI Pro

Predictive Multimodal Personal Safety Ecosystem for industrial workplace safety.

## Architecture

```
GuardianAI-Pro/
├── services/
│   ├── frontend/          # React + TypeScript + Vite + Tailwind CSS + shadcn/ui
│   ├── backend/           # Node.js + Express + TypeScript
│   └── ai-service/        # FastAPI + Python (AI/ML microservice)
├── docker-compose.yml     # Multi-service orchestration
├── .github/workflows/     # CI/CD pipelines
└── .husky/                # Git hooks
```

## Tech Stack

| Service | Technology |
|---------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Socket.IO Client |
| Backend | Node.js, Express, TypeScript, Mongoose, Socket.IO, BullMQ, Winston |
| AI Service | FastAPI, Python 3.12, scikit-learn, Pydantic |
| Database | MongoDB 7 |
| Cache/Queue | Redis 7 |
| Auth | JWT + Refresh Tokens, RBAC |

## Quick Start

```bash
# Copy environment variables
cp .env.example .env

# Start all services
docker compose up -d

# Or run locally:
npm install
npm run dev:backend & npm run dev:frontend
cd services/ai-service && uvicorn app.api.v1.api:app --reload
```

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 5000 | http://localhost:5000 |
| API Docs (Swagger) | 5000 | http://localhost:5000/api-docs |
| AI Service | 8000 | http://localhost:8000 |
| AI Docs (Swagger) | 8000 | http://localhost:8000/docs |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |

## API Endpoints

### Auth (prefix: `/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout (requires auth)
- `GET /me` - Get current user (requires auth)

### Incidents (prefix: `/api/v1/incidents`)
- `POST /` - Create incident (requires auth)
- `GET /` - List incidents (requires auth)
- `GET /:id` - Get incident (requires auth)
- `PATCH /:id` - Update incident (Admin, Supervisor, Safety Officer)
- `DELETE /:id` - Delete incident (Admin, Supervisor)

### AI Service (prefix: `/api/v1`)
- `POST /predict` - Make prediction
- `POST /risk-assessment` - Assess risk
- `GET /health` - Health check

## Environment Variables

See `.env.example` for all available variables.

## RBAC Roles

- **Admin** - Full system access
- **Supervisor** - Manage incidents and team
- **Safety Officer** - Investigate and resolve incidents
- **Worker** - Report incidents and view alerts
