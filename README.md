# Incident Tracker

A full-stack web application for engineers to create, browse, filter, and manage production incidents.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Spring Boot 4, Java 21, PostgreSQL, Spring Data JPA |
| Frontend | React 19, TypeScript, Vite 7, React Router |
| Database | PostgreSQL |

---

## Setup & Run Instructions

### Prerequisites

- **Java 21**
- **Node.js 18+** and npm
- **PostgreSQL** (running locally or accessible)

### 1. Database Setup

Create a PostgreSQL database and user:

```sql
CREATE DATABASE incident_db;
-- Or use your existing database name
```

### 2. Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/incident_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

To disable seed data on startup:

```properties
app.seed.enabled=false
```

### 3. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at **http://localhost:8080**

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and proxies `/api` requests to the backend.

### 5. Seed Data

On first run (with `app.seed.enabled=true`), ~200 fake incidents are seeded if the table is empty. To re-seed, drop the `incidents` table and restart the backend.

---

## API Overview

Base URL: `http://localhost:8080/api/incidents`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/incidents` | Create a new incident |
| `GET` | `/api/incidents` | List incidents (paginated, filterable, sortable) |
| `GET` | `/api/incidents/{id}` | Get incident by ID |
| `PATCH` | `/api/incidents/{id}` | Partially update incident (status, severity, summary) |

### Query Parameters (GET /api/incidents)

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (0-based) |
| `size` | int | Page size (default: 20) |
| `sort` | string | Sort field and direction (e.g. `createdAt,desc`) |
| `severity` | enum | Filter by SEV1, SEV2, SEV3, SEV4 |
| `status` | enum | Filter by OPEN, MITIGATED, RESOLVED |
| `search` | string | Search in title, service, owner, summary (case-insensitive) |

### Request/Response Examples

**Create Incident (POST)**

```json
{
  "title": "API timeout in Payment Gateway",
  "service": "Payment Gateway",
  "severity": "SEV1",
  "status": "OPEN",
  "owner": "John Doe",
  "summary": "Intermittent 504 errors on checkout."
}
```

**Update Incident (PATCH)** – send only fields to update

```json
{
  "status": "MITIGATED",
  "severity": "SEV2",
  "summary": "Applied rate limiting; monitoring."
}
```

**Paginated Response (GET)**

```json
{
  "content": [...],
  "totalElements": 200,
  "totalPages": 10,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```

---

## Design Decisions & Tradeoffs

### Backend

- **Layered architecture (Controller → Service → Repository)** – Keeps responsibilities clear and testable.
- **DTOs instead of exposing entities** – Reduces coupling, validates input, and keeps API stable.
- **JPQL with parameterized queries** – Avoids SQL injection; all filters are parameterized.
- **Indexes on `severity` and `status`** – Speeds up filtered list queries.
- **Partial PATCH (status, severity, summary)** – Allows flexible updates without overwriting other fields.
- **`@PrePersist` / `@PreUpdate` plus explicit `updatedAt` in service** – Ensures timestamps are set even if JPA callbacks miss an update.
- **CommandLineRunner for seeding** – Simple and runs only when DB is empty; no Flyway/Liquibase for this scope.

**Tradeoffs:**
- `spring.jpa.hibernate.ddl-auto=update` – Convenient for dev; use schema migrations (Flyway) for production.
- No authentication/authorization – Suitable for internal tooling; add Spring Security for production.
- Single `search` param – Searches across multiple columns; more complex relevance ranking left for later.

### Frontend

- **Modal-based create/view** – Keeps users on the list page; no navigation to separate create/detail pages.
- **Debounced search (300ms)** – Reduces API calls while typing.
- **“Stale while revalidate” for filters** – Keeps previous data visible during refetch to avoid flicker.
- **Two-column layout in modals** – Compact, readable layout for forms and details.
- **Relevance sort when searching** – Titles that start with the search term appear first.
- **Vite proxy for `/api`** – No CORS setup during development; frontend and backend run separately.

**Tradeoffs:**
- No global state (Redux/Zustand) – State lives in components; fine for this size; consider context/store if it grows.
- Blur-triggered summary save – Simple; could add explicit Save or dirty-state indication later.
- Scrollbar hidden on modals – Cleaner look; scroll still works via wheel/trackpad.

---

## Improvements With More Time

1. **Authentication & authorization** – Login, roles (viewer, editor, admin), API security.
2. **Audit trail** – Track who changed what and when; store history of status/severity changes.
3. **Schema migrations** – Flyway or Liquibase instead of `ddl-auto=update`.
4. **Unit and integration tests** – Service and repository tests; API tests with `@WebMvcTest` and `MockMvc`.
5. **API versioning** – `/api/v1/incidents` to support future breaking changes.
6. **Full-text search** – PostgreSQL `tsvector` or Elasticsearch for better search and ranking.
7. **Rate limiting & API docs** – SpringDoc/OpenAPI for Swagger UI; rate limiting for abuse prevention.
8. **Error boundaries & retry** – React error boundaries; retry logic for failed API calls.
9. **Accessibility** – ARIA labels, keyboard navigation, screen reader support.
10. **Docker** – `docker-compose` for PostgreSQL + backend + frontend for one-command setup.
