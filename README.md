# Lead Filter Query API

This is a standalone Express + TypeScript + Postgres microservice for querying and filtering CRM leads. It implements a flexible filter DSL supporting system columns, role-based visibility, multi-tenant isolation, and custom fields stored as Entity-Attribute-Value (EAV).

---

## Live Deployment

The API is deployed and hosted live in the cloud on Vercel:
* **Base Endpoint:** `https://crm-backend-theta-five.vercel.app/api/v1`
* **Query URL:** `POST https://crm-backend-theta-five.vercel.app/api/v1/leads/query`
* **Cloud Database:** Backed by a serverless Postgres instance on Neon.

*Note: You can direct your curls and Postman requests directly to the live URL above using the standard request headers and body schemas to test the API immediately without any local setup.*

---

## 1. Getting Started

### Prerequisites
* Node.js (v20+)
* PostgreSQL database instance running

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the root of the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/crm_database?schema=public"
   ```

### Database Migration & Seeding
1. Run Prisma migrations to create the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Seed the database with sample tenant, user, lead, and custom field data:
   ```bash
   npm run seed
   ```
   *Note: Seeding is idempotent and automatically cleans up the database tables in correct constraint order before inserting fresh, deterministic test data.*

### Running the Server
* Start in development mode (with auto-reload):
  ```bash
  npm run dev
  ```
* Run test suite (using Vitest):
  ```bash
  npm run test
  ```

---

## 2. Design Decisions & Tradeoffs

### 1. ORM Choice (Prisma)
I chose **Prisma** for schema definition, typescript generation, and database interactions. Prisma provides excellent type safety and automatically handles relation queries.
* **Tradeoff:** Prisma's query generator can sometimes produce complex SQL for deeply nested relationships. To counter this, I implemented raw SQL queries (`$queryRaw`) for number, date, and boolean custom field calculations, ensuring index usage and optimal performance.

### 2. Multi-Tenant Scoping & Security
* Tenant scoping is strictly enforced at the database repository query layer (`tenantId: auth.tenantId`).
* **Custom Field Scope:** Validation checks on custom field IDs (in `lead.repository.ts`) are scoped to the caller's tenant. A user from Tenant A cannot filter or validate using Tenant B's field IDs.
* **Role Visibility:** Admins, owners, and managers see all leads for their tenant, while agents are restricted to leads where `assignedTo = currentUserId`.

### 3. Hydration without N+1 Queries
Hydrating custom field values is done by combining Prisma's eager-loading `include` capability. When fetching leads, their EAV attributes are retrieved in the same query batch, avoiding separate database trips per lead row.

### 4. Custom Field Operators (EAV Querying Strategy)
* **String Filters:** Translated to Prisma `some`/`none` clauses on the nested `customValues` array. This compiles directly to highly efficient `EXISTS` or `NOT EXISTS` subqueries in SQL, avoiding row explosions.
* **Number, Date, Boolean Filters:** Handled by executing a fast, parameterized `$queryRaw` query first to retrieve matching `leadId`s, checking regular expressions to prevent database casting exceptions (e.g. attempting to cast string text "Chennai" into a numeric type). The matched lead IDs are then passed into the main Prisma `where` clause.

### 5. Empty-Value Semantics & Shortcuts
* **Empty-Value Semantics:** For system nullable fields (like `assignedTo`), `is empty` translates directly to a `NULL` column check. For custom EAV fields, `is empty` matches leads where no relation record exists in the `lead_custom_field_values` table for that specific custom field ID.
* **Shortcuts:** 
  * Header-based identity verification is used as simulated auth instead of JWT/OAuth session tokens.
  * Custom field validation checks for ID existence but skips full type validation of custom values during payload insertion (assumes correct types are sent).

### 6. Architectural Pattern (Layered Architecture + Repository Pattern)
* **Layered Separation:** Decoupled the codebase into a clean **3-Tier structure** consisting of the API controllers (HTTP input/output and schema parsing), service layer (pure logic mapping filters), and the data access layer.
* **Repository Pattern:** Extracted database operations into a generic repository pattern (`ILeadRepository` and `LeadRepository`). This isolates the ORM (Prisma) from the rest of the application, simplifies test mocking, and ensures database queries remain easily swap-able.

---

## 3. Recommended Production Indexes

To maintain performance under heavy filtering, I recommend adding the following Postgres indexes:

```sql
-- Speed up tenant separation and sorting
CREATE INDEX idx_leads_tenant_sort ON leads (tenant_id, created_at DESC);
CREATE INDEX idx_leads_tenant_followup ON leads (tenant_id, follow_up_date ASC NULLS LAST);

-- Index EAV values table for custom field joins and value matching
CREATE INDEX idx_eav_lookup ON lead_custom_field_values (field_id, value);
CREATE INDEX idx_eav_lead ON lead_custom_field_values (lead_id);
```

---

## 4. Seeding Metadata Reference (UUIDs)

Use these IDs to simulate your curls and verify endpoint functionality:

* **Tenant A ID:** `747188d0-a004-4a01-bac5-6ad0d8e7f891`
* **Tenant B ID:** `88e03f00-82d8-4db7-a983-f30ff327ab77`
* **Admin (Tenant A):** `1aef87fb-4672-4761-a828-488e03e5928b`
* **Agent A1 (Tenant A - Rahul):** `2aef87fb-4672-4761-a828-488e03e5928e`
* **Agent A2 (Tenant A - Anil):** `2aef87fb-4672-4761-a828-488e03e5928f`
* **Custom Field 'City' ID (String):** `d0982642-e45a-4031-8d33-b8cb683a1910`
* **Custom Field 'Budget' ID (Number):** `f33e69d1-45eb-4ad3-81b7-c02da4d1a578`
* **Custom Field 'Interested' ID (Boolean):** `7b4d0472-b7f4-4c6f-a5ac-8d31ff63e298`
* **Custom Field 'Follow Up' ID (Date):** `34501a86-9792-4aad-a660-9810590f8d74`

---

## 5. Example CURL Commands

### Scenario 1: Admin Queries 'City' containing "Kochi" AND 'Budget' > 60000
```bash
curl -X POST 'http://localhost:5000/api/v1/leads/query?page=1&limit=20&sortBy=createdAt&sortDirection=desc' \
  -H 'Content-Type: application/json' \
  -H 'x-tenant-id: 747188d0-a004-4a01-bac5-6ad0d8e7f891' \
  -H 'x-user-id: 1aef87fb-4672-4761-a828-488e03e5928b' \
  -H 'x-user-role: admin' \
  -d '{
    "logic": "AND",
    "filters": [
      {
        "fieldId": "d0982642-e45a-4031-8d33-b8cb683a1910",
        "fieldType": "string",
        "condition": "contain",
        "value": "Kochi"
      },
      {
        "fieldId": "f33e69d1-45eb-4ad3-81b7-c02da4d1a578",
        "fieldType": "number",
        "condition": "greater than",
        "value": "60000"
      }
    ]
  }'
```

### Scenario 2: Agent A1 queries own leads using free text search "Priya" (Returns empty because Priya is assigned to Agent A2)
```bash
curl -X POST 'http://localhost:5000/api/v1/leads/query?page=1&limit=10' \
  -H 'Content-Type: application/json' \
  -H 'x-tenant-id: 747188d0-a004-4a01-bac5-6ad0d8e7f891' \
  -H 'x-user-id: 2aef87fb-4672-4761-a828-488e03e5928e' \
  -H 'x-user-role: agent' \
  -d '{
    "q": "Priya"
  }'
```

### Scenario 3: Request with invalid parameter (Triggers validation 400 error formatted to spec)
```bash
curl -X POST 'http://localhost:5000/api/v1/leads/query?sortBy=invalidField' \
  -H 'Content-Type: application/json' \
  -H 'x-tenant-id: 747188d0-a004-4a01-bac5-6ad0d8e7f891' \
  -H 'x-user-id: 1aef87fb-4672-4761-a828-488e03e5928b' \
  -H 'x-user-role: admin' \
  -d '{}'
```
*Expected Error Output:*
```json
{
  "message": "sortBy: Invalid enum value. Expected 'createdAt' | 'followUpDate', received 'invalidField'",
  "statusCode": 400
}
```

---

## 6. OpenAPI / Swagger Specification

The API contract is fully documented using the OpenAPI 3.0 standard.
* The specification file is available at [openapi.yaml](openapi.yaml).
* You can copy and paste the contents of `openapi.yaml` into the online [Swagger Editor](https://editor.swagger.io) to view interactive API documentation, payload descriptions, and test HTTP request structures.

---

## 7. Project Retrospective

### Time Spent
* **Total Time:** ~5.5 Hours (Database setup, core filter service logic, custom EAV query execution, test suite verification, casing normalizations, OpenAPI definition, and documentation).

### What I Would Improve With Another Day
1. **Cursor-Based Pagination:** Replace offset-based pagination (`skip` & `take`) with cursor-based pagination to ensure fast querying on databases with millions of leads.
2. **Interactive UI Hosting:** Set up `swagger-ui-express` inside the server to serve the API docs dynamically at `/docs`.
3. **Comprehensive Integration Testing:** Implement endpoint integration testing with `supertest` to test routes, middlewares, error boundaries, and payloads end-to-end.

