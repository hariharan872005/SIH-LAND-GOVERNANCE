# India-Wide GIS Land Governance & Digital Twin Platform — Backend

A production-ready, scalable **Modular Monolith** backend engineered using **NestJS**, **TypeScript**, **PostgreSQL + PostGIS**, **Neo4j**, **Redis**, **Apache Kafka**, **MinIO / S3**, **OpenSearch**, and **Keycloak/JWT**.

---

## 🏛️ Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React 18 + TS Client   │
                          └─────────────┬────────────┘
                                        │ (REST / JSON / Bearer JWT)
                                        ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │                      NestJS Modular Monolith API                       │
    │  ┌────────────────────┬────────────────────┬────────────────────────┐  │
    │  │  JwtAuthGuard      │ RolesGuard         │ JurisdictionScopeGuard │  │
    │  └────────────────────┴────────────────────┴────────────────────────┘  │
    │                                                                        │
    │  ┌──────────────────────────────────────────────────────────────────┐  │
    │  │                       Business Modules                           │  │
    │  │  • Lands (Tahsildar)             • Survey (PostGIS Demarcation)  │  │
    │  │  • LandTransfer (Sub-Registrar)  • Municipal (Revenue Officer)   │  │
    │  │  • Verification (Normalized)     • DigitalTwin (Aggregator)      │  │
    │  │  • Documents (S3 Vault)          • Organization & RBAC           │  │
    │  │  • AuditLog (Immutable)          • Search (OpenSearch)           │  │
    │  └──────────────────────────────────────────────────────────────────┘  │
    └───────┬──────────────┬──────────────┬──────────────┬─────────────┬─────┘
            │              │              │              │             │
            ▼              ▼              ▼              ▼             ▼
      ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ ┌───────────┐
      │PostgreSQL │  │   Neo4j   │  │   Redis   │  │Kafka Bus  │ │ MinIO S3  │
      │ + PostGIS │  │Ownership  │  │  Cache &  │  │Distributed│ │ Certified │
      │  Spatial  │  │  Lineage  │  │Rate Limits│  │  Events   │ │Deeds Vault│
      └───────────┘  └───────────┘  └───────────┘  └───────────┘ └───────────┘
```

---

## 🚀 Quick Start with Docker

### 1. Start Infrastructure Stack
```bash
docker-compose up -d
```
This launches:
- **PostgreSQL 16 + PostGIS 3.4** on port `5432`
- **Neo4j 5.18 Community** on ports `7474` (Browser) and `7687` (Bolt)
- **Redis 7.2** on port `6379`
- **Apache Kafka + Zookeeper** on port `9092`
- **MinIO S3 Storage** on ports `9000` (API) and `9001` (Console)
- **OpenSearch 2.13** on port `9200`

### 2. Install Dependencies & Build
```bash
npm install
npm run build
```

### 3. Run Backend in Development Mode
```bash
npm run start:dev
```

- **API Base**: `http://localhost:3000/api/v1`
- **Interactive Swagger OpenAPI Docs**: `http://localhost:3000/api/v1/docs`
- **Health Check Probes**: `http://localhost:3000/api/v1/health`

---

## 🛡️ Role-Based Personas for Testing

| Persona | Role Code | Department | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | National Governance | All-India (National scope), Manage Officers, Audit Logs |
| **Tahsildar** | `TAHSILDAR` | Revenue / Land Records | Taluk-bound, Create & verify initial land records |
| **Cadastral Surveyor** | `SURVEYOR` | Survey & Land Records | Taluk-bound, PostGIS coordinate boundary demarcation |
| **Sub-Registrar** | `SUB_REGISTRAR` | Registration & Stamps | SRO-bound, Register title deeds, Neo4j ownership transfer |
| **Revenue Officer** | `REVENUE_OFFICER` | Municipality / Local Body | Ward-bound, Property assessment & tax clearance |

---

## 📦 Core Domain Modules & Endpoints

### 1. Land Parcels (`/api/v1/lands`)
- `POST /lands`: Tahsildar initiates primary land parcel (Locked to assigned Taluk).
- `GET /lands`: Query parcels with geographic scope enforcement and pagination.
- `GET /lands/:id`: Fetch single land parcel details.

### 2. Cadastral Survey & PostGIS (`/api/v1/surveys`)
- `POST /surveys/submit-verification`: Surveyor submits DGPS polygon vertices (`ST_SetSRID(ST_GeomFromGeoJSON(...), 4326)`) and signs survey verification.

### 3. Title Transfer & Deeds (`/api/v1/transfers`)
- `POST /transfers`: Sub-Registrar registers deed conveyance, creates immutable transaction, marks prior owner historical, and updates Neo4j graph lineage.
- `GET /transfers/land/:landId`: Retrieve transaction deed ledger for a parcel.

### 4. Municipal & Property Tax (`/api/v1/municipal`)
- `POST /municipal/verify`: Municipal Revenue Officer validates property ID and tax clearance. If all 4 pillars (Revenue + Survey + Registration + Municipality) are cleared, transitions state to `LAND_VERIFIED`.

### 5. Normalized Verification Matrix (`/api/v1/verifications`)
- `GET /verifications/land/:landId`: Fetch normalized 4-pillar verification statuses.
- `POST /verifications/flag-correction`: Request correction or reject verification.

### 6. Aggregated Digital Twins (`/api/v1/digital-twins/:landId`)
- `GET /digital-twins/:landId`: Composite response combining PostgreSQL + PostGIS spatial geometry + Neo4j ownership lineage + MinIO deeds + 4-pillar verification matrix.
