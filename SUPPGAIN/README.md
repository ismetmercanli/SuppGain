# SuppGain Backend

Layered backend starter built with ASP.NET Core Web API.

## Projects

- `src/SuppGain.Api` - API entry point, controllers, middleware, configuration
- `src/SuppGain.Application` - use-case layer, interfaces, business orchestration
- `src/SuppGain.Domain` - entities, enums, domain rules
- `src/SuppGain.Infrastructure` - EF Core, PostgreSQL, external integrations
- `tests/SuppGain.UnitTests` - unit tests
- `tests/SuppGain.IntegrationTests` - integration tests

## Docker Setup (PostgreSQL + pgAdmin)

1. Copy env template:

```bash
copy .env.example .env
```

2. Start Docker services:

```bash
docker compose up -d
docker compose ps
```

3. Optional: open pgAdmin (Docker) at `http://localhost:5050`
   - Email: value of `PGADMIN_DEFAULT_EMAIL`
   - Password: value of `PGADMIN_DEFAULT_PASSWORD`

4. Register server in pgAdmin (Docker web UI):
   - Host: `postgres`
   - Port: `5432`
   - Username: value of `POSTGRES_USER`
   - Password: value of `POSTGRES_PASSWORD`

5. If you use pgAdmin Desktop (installed app), connect with host port mapping:
   - Host: `localhost`
   - Port: value of `POSTGRES_PORT` (default `5433`)
   - Database: value of `POSTGRES_DB` (default `suppgain`)
   - Username: value of `POSTGRES_USER`
   - Password: value of `POSTGRES_PASSWORD`

6. Quick DB verify query (pgAdmin Query Tool):

```sql
SELECT "Email", "FirstName", "LastName"
FROM "Users"
ORDER BY "CreatedAtUtc" DESC
LIMIT 20;
```

## Database Migration

Run these from solution root:

```bash
dotnet tool update --global dotnet-ef --version 7.0.5
dotnet ef database update --project src/SuppGain.Infrastructure --startup-project src/SuppGain.Api
```

If model changes are made:

```bash
dotnet ef migrations add <MigrationName> --project src/SuppGain.Infrastructure --startup-project src/SuppGain.Api --output-dir Persistence/Migrations
dotnet ef database update --project src/SuppGain.Infrastructure --startup-project src/SuppGain.Api
```

## Run API

```bash
dotnet run --project src/SuppGain.Api
```

## Auth and User Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me` (JWT required, current user profile)
- `PUT /users/me` (JWT required, current user profile update)
- `DELETE /users/me` (JWT required, current user account delete)
- `GET /users/{userId}` (JWT required, self or admin)
- `PUT /users/{userId}` (JWT required, self or admin)
- `DELETE /users/{userId}` (JWT required, self or admin)

## Product Endpoints

- `GET /products` (public, supports `name`, `category`, `minPrice`, `maxPrice`, `isActive`)
- `GET /products/{productId}` (public)
- `POST /products` (JWT required, Admin role)
- `PUT /products/{productId}` (JWT required, Admin role)
- `DELETE /products/{productId}` (JWT required, Admin role)

## Athlete Package Endpoints

- `GET /packages` (public, supports `athleteType`, `isActive`)
- `GET /packages/{packageId}` (public)
- `POST /packages` (JWT required, Admin role)
- `PUT /packages/{packageId}` (JWT required, Admin role)
- `DELETE /packages/{packageId}` (JWT required, Admin role)

## Cart Endpoints

- `POST /cart` (JWT required, adds item to current user cart)
- `GET /cart` (JWT required, returns current user active cart)

## Order Endpoints

- `POST /orders` (JWT required, creates order from active cart and updates stock)
- `GET /orders/{orderId}` (JWT required, owner or admin)

## Weekly Program Endpoints

- `POST /weekly-program` (JWT required, creates weekly program for current user)
- `PUT /weekly-program/{programId}` (JWT required, current user can update own program)

## Supplement Info Endpoints

- `GET /supplement-info` (public, only published content for non-admin users)
- `GET /supplement-info/{id}` (public, only published content for non-admin users)
- `POST /supplement-info` (JWT required, Admin role)
- `PUT /supplement-info/{id}` (JWT required, Admin role)
- `DELETE /supplement-info/{id}` (JWT required, Admin role)

## Supplement Tracking Endpoints

- `POST /supplement-tracker` (JWT required, create personal supplement tracking with stock details)
- `GET /supplement-tracker/me` (JWT required, list current user tracking records)
- `PUT /supplement-tracker/{id}` (JWT required, update own tracking configuration)
- `DELETE /supplement-tracker/{id}` (JWT required, delete own tracking record)
- `POST /supplement-tracker/{id}/consume` (JWT required, register supplement intake and decrease stock)
- `GET /supplement-tracker/{id}/stock-status` (JWT required, get low-stock and estimated remaining days)

## Notification Endpoints

- `POST /notifications/reminders` (JWT required, create reminder for supplement intake)
- `GET /notifications/reminders/me` (JWT required, list current user reminders)
- `PUT /notifications/reminders/{id}` (JWT required, update own reminder)
- `DELETE /notifications/reminders/{id}` (JWT required, delete own reminder)
- `POST /notifications/reminders/{id}/send-now` (JWT required, create immediate send log)
- `GET /notifications/logs/me` (JWT required, list current user notification logs)

## Error Response Standard

- Validation errors return: `{ "errorCode": "VALIDATION_ERROR", "message": "...", "traceId": "..." }`
- Unhandled exceptions return: `{ "errorCode": "UNHANDLED_EXCEPTION", "message": "...", "traceId": "..." }`

## Admin Seed

- Startup creates/updates admin from `AdminSeed` section in `appsettings*.json`
- Default admin email: `admin@suppgain.local`
- Default admin password: `Admin123!`

Swagger runs at:

- `https://localhost:xxxx/swagger`

## Deployment (GitHub + Vercel + Render)

Recommended setup:

- Frontend: Vercel (`frontend/`)
- Backend API: Render (`backend/src/SuppGain.Api`)

### 1) Push to GitHub

```bash
git init
git add .
git commit -m "prepare deployment setup"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 2) Deploy Backend (Render)

This repo includes `render.yaml` at root.

- Create new Render Blueprint and select the repository.
- Render will use:
  - `rootDir`: `backend/src/SuppGain.Api`
  - build: `dotnet restore && dotnet publish -c Release -o ./publish`
  - start: `dotnet ./publish/SuppGain.Api.dll`

Set secret env vars on Render:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`

Other important env vars:

- `ASPNETCORE_ENVIRONMENT=Production`
- `ASPNETCORE_URLS=http://0.0.0.0:10000`
- `Swagger__Enabled=true`
- `Cors__AllowedOrigins__0=https://<your-vercel-domain>.vercel.app`

Swagger URL after deploy:

- `https://<your-render-api-domain>/swagger`

### 3) Deploy Frontend (Vercel)

- Import repository on Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add env var:
  - `VITE_API_BASE_URL=https://<your-render-api-domain>`

`frontend/vercel.json` is included for SPA rewrite support.

### 4) Move Docker DB to Production PostgreSQL

When your local data in Docker is ready, export it and restore to your cloud PostgreSQL service:

1. Export from local Docker PostgreSQL:

```powershell
cd .\SUPPGAIN
.\scripts\export-docker-db.ps1 -ContainerName suppgain-postgres -DatabaseName suppgain -DbUser postgres -OutputFile .\suppgain_prod_seed.sql
```

2. Restore to cloud PostgreSQL (Railway/Render/Neon/Supabase):

```powershell
.\scripts\restore-dump-to-cloud.ps1 `
  -DumpFile .\suppgain_prod_seed.sql `
  -CloudHost "<CLOUD_HOST>" `
  -CloudPort 5432 `
  -CloudDatabase "<CLOUD_DB>" `
  -CloudUser "<CLOUD_USER>" `
  -CloudPassword "<CLOUD_PASSWORD>" `
  -SslMode require
```

3. Point backend to cloud DB connection string:

```env
ConnectionStrings__DefaultConnection=Host=<CLOUD_HOST>;Port=<CLOUD_PORT>;Database=<CLOUD_DB>;Username=<CLOUD_USER>;Password=<CLOUD_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
```

## Useful Docker Commands

```bash
docker compose logs -f postgres
docker compose stop
docker compose start
docker compose down
docker compose down -v
```
