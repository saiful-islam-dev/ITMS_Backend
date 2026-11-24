# Apex Garments ITMS Enterprise - Backend API & System Specification
**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS / WSS (WebSockets)  
**Authentication Scheme:** Bearer JWT (Header: `Authorization: Bearer <token>`)

---

## 1. System Overview & Architectural Standards

### 1.1 Core Tech Stack Recommendations
- **Runtime & Framework:** Node.js (TypeScript) with **NestJS** or **Fastify/Express**, or **Go (Gin/Fiber)** or **Python (FastAPI)**.
- **Primary Database:** **PostgreSQL 16+** (Relational integrity, JSONB support for telemetry/spec notes, high-concurrency connection pooling).
- **In-Memory Cache & Message Broker:** **Redis 7+** (Session tokens, rate-limiting counters, pub/sub for real-time telemetry and WebSocket broadcasts).
- **Object Storage:** AWS S3 / Cloudflare R2 / MinIO (PDF invoices, delivery challans, employee avatars).
- **Real-Time Layer:** WebSockets (`ws://`) for live ping latency, thermal sensor alerts, and immediate incident queue broadcast.

### 1.2 Universal Request & Response Envelopes

#### Standard Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-11-23T20:30:00Z",
    "requestId": "req-9842a1b7-e231-40c2"
  }
}
```

#### Standard Paginated Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 8,
    "totalItems": 1428,
    "totalPages": 179,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "meta": {
    "timestamp": "2026-11-23T20:30:00Z"
  }
}
```

#### Standard Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Field 'serialNumber' is required and must follow format SN-XXXXX-XX",
  "validationErrors": [
    {
      "field": "serialNumber",
      "rule": "matchesPattern",
      "message": "Serial number must start with SN-"
    }
  ],
  "meta": {
    "timestamp": "2026-11-23T20:30:00Z",
    "requestId": "req-9842a1b7-e231-40c2"
  }
}
```

---

## 2. Authentication & Role-Based Access Control (RBAC)

### 2.1 Role Definitions
- `SUPER_ADMIN`: Unrestricted read/write, user provisioning, SSO setup, system parameters.
- `FACILITY_ADMIN`: Campus-scoped administrative privileges, hardware write, ticket dispatch.
- `FIELD_TECH`: Ticket triage, asset updates, network ping execution, subtask completion.
- `COMPLIANCE_AUDITOR`: Read-only access to audit logs, equipment ledgers, ESG reports.
- `VIEWER`: Read-only operational overview.

---

### 2.2 Endpoints

#### 1. User Registration
`POST /api/v1/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "fullName": "Tanvir Hasan",
  "email": "tanvir.hasan@apexgarments.com",
  "password": "SecurePassword123!",
  "role": "field_technician",
  "facilityId": "loc-corp-01"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "usr-104",
      "fullName": "Tanvir Hasan",
      "email": "tanvir.hasan@apexgarments.com",
      "role": "field_technician",
      "facilityId": "loc-corp-01",
      "status": "pending_approval"
    }
  }
}
```

#### 2. User Login
`POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "tariq.rahman@apexgarments.com",
  "password": "MasterAdminPassword123!"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d820f18c-39b1-42e7-910c-512039ab...",
    "expiresIn": 3600,
    "user": {
      "id": "usr-001",
      "name": "Tariq Rahman",
      "email": "tariq.rahman@apexgarments.com",
      "role": "super_admin",
      "facilityId": "loc-corp-01",
      "facilityCode": "LOC-CORP-01",
      "facilityName": "Apex HQ & Design Studio",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  }
}
```

#### 3. Refresh Access Token
`POST /api/v1/auth/refresh`
- **Request Body:** `{ "refreshToken": "d820f18c-39b1-42e7-910c-512039ab..." }`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "expiresIn": 3600
  }
}
```

#### 4. Current Profile (`/me`)
`GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response `200 OK`:** Returns current authenticated user record with permissions array.

---

## 3. Employees Directory API

### 3.1 Data Model Specification (`Employee`)
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String (UUID) | Yes | Internal unique database key |
| `employeeId` | String | Yes | Monospace badge ID (e.g. `EMP-1042`) |
| `name` | String | Yes | Full employee name |
| `role` | String | Yes | Designation (e.g. `IT Ops Lead / Super Admin`) |
| `title` | String | Yes | Enterprise role title |
| `department` | String | Yes | Allocated department (e.g. `IT & Systems`, `Merchandising`, `Cutting & Sewing`) |
| `facilityId` | String | Yes | Campus foreign key |
| `facilityCode` | String | Yes | Campus code (`LOC-CORP-01`, `LOC-FCT-01`, etc.) |
| `facilityName` | String | Yes | Campus formal name |
| `shift` | Enum | Yes | `Shift A (06:00 - 14:00)`, `Shift B (14:00 - 22:00)`, `Night (22:00 - 06:00)`, `General (09:00 - 18:00)` |
| `phone` | String | Yes | Contact phone (e.g. `+880 1711-049821`) |
| `email` | String | Yes | Work email |
| `status` | Enum | Yes | `active`, `on_call`, `leave`, `suspended`, `offboarding` |
| `isAdmin` | Boolean | Yes | Super Admin badge flag |
| `avatar` | String | No | Image URL or empty string for two-letter initials circle |
| `certifications` | String[] | Yes | Array of certifications |
| `specialty` | String | Yes | Floor technical specialty |
| `linkedAssets` | String[] | No | Assigned asset names or tags |
| `openTickets` | Number | Yes | Current open tickets associated |

---

### 3.2 Endpoints

#### 1. List Employees (with Filtering, Search & Pagination)
`GET /api/v1/employees`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 8)
  - `tab` (options: `all`, `supervisors`, `corporate`, `it_systems`)
  - `department` (options: `IT & Systems`, `Merchandising`, `Cutting & Sewing`, `Design & CAD`, etc.)
  - `facilityId` or `location` (options: campus ID or name)
  - `status` (options: `active`, `leave`, `offboarding`, `suspended`)
  - `search` (searches name, employeeId, email, role, department)
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "emp-001",
      "employeeId": "EMP-1042",
      "name": "Tariq Rahman",
      "role": "IT Ops Lead / Super Admin",
      "title": "Lead Systems Architect",
      "department": "IT & Systems",
      "facilityId": "loc-corp-01",
      "facilityCode": "LOC-CORP-01",
      "facilityName": "Apex HQ & Design Studio",
      "shift": "General (09:00 - 18:00)",
      "phone": "+880 1711-049821",
      "email": "tariq.rahman@apexgarments.com",
      "status": "active",
      "isAdmin": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "certifications": ["CCNP Enterprise", "Fortinet NSE 7", "AWS Solutions Architect"],
      "specialty": "SD-WAN Core, Hybrid Cloud & ERP",
      "linkedAssets": ["ThinkPad T14 Gen 3", "Dell UltraSharp 27'", "Zebra ZT410"],
      "openTickets": 0
    },
    {
      "id": "emp-003",
      "employeeId": "EMP-3114",
      "name": "Kabir Hossain",
      "role": "Line Supervisor (Sewing Line #4)",
      "title": "Manufacturing Floor Supervisor",
      "department": "Cutting & Sewing",
      "facilityId": "loc-fct-01",
      "facilityCode": "LOC-FCT-01",
      "facilityName": "Factory Building A",
      "shift": "Shift A (06:00 - 14:00)",
      "phone": "+880 1819-332910",
      "email": "k.hossain@apexgarments.com",
      "status": "active",
      "isAdmin": false,
      "avatar": "",
      "certifications": ["Lean Six Sigma Yellow Belt", "Juki Automated Feed Specialist"],
      "specialty": "High-speed Sewing Floor Operations",
      "linkedAssets": ["Zebra TC57 Touch Computer"],
      "openTickets": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "totalItems": 1428,
    "totalPages": 179,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Get Employee Aggregate Metrics
`GET /api/v1/employees/metrics`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalHeadcount": 1428,
    "activeCount": 1392,
    "onLeaveCount": 36,
    "productionFloorStaff": {
      "count": 940,
      "percentage": 65.8,
      "subtext": "Cutting, Sewing, Washing & Finishing"
    },
    "merchandisingDesign": {
      "count": 312,
      "subtext": "CAD Workstations, Samplers, Merchandisers"
    },
    "hardwareAssets": {
      "linkedDevices": 1185,
      "coveragePercent": 83,
      "subtext": "Laptops, Desktops, Zebra Terminals"
    },
    "categoryCounts": {
      "all": 1428,
      "supervisors": 84,
      "corporate": 312,
      "it_systems": 24
    }
  }
}
```

#### 3. Provision New Employee
`POST /api/v1/employees`
- **Request Body:**
```json
{
  "name": "Mahfuzur Rahman",
  "employeeId": "EMP-5120",
  "role": "Floor Operations Specialist",
  "department": "Cutting & Sewing",
  "facilityId": "loc-fct-01",
  "shift": "Shift A (06:00 - 14:00)",
  "phone": "+880 1711-987654",
  "email": "mahfuz.rahman@apexgarments.com",
  "isAdmin": false,
  "specialty": "Automated Juki Sewing Machine Telemetry",
  "certifications": ["Lean Six Sigma", "OSHA 30"]
}
```
- **Response `201 Created`:** Returns created employee entity.

#### 4. Update / Toggle Status
`PATCH /api/v1/employees/:id/status`
- **Request Body:** `{ "status": "leave" }`
- **Response `200 OK`:** Returns updated employee entity.

#### 5. Export Directory (CSV)
`GET /api/v1/employees/export/csv`
- **Response Headers:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="apex_garments_employee_directory_2026-11-23.csv"`

---

## 4. IT Hardware Assets Fleet API

### 4.1 Data Model Specification (`ITAsset`)
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | Yes | Unique database primary key |
| `assetTag` | String | Yes | Hardware barcode tracking tag (e.g. `AST-8925`) |
| `serialNumber` | String | Yes | OEM chassis serial (e.g. `SN-4820199025-GB`) |
| `name` | String | Yes | Asset formal description |
| `category` | String | Yes | `Industrial Label Printer`, `Workstation`, `Laptop`, `Server`, `Switch`, `Access Point`, `IoT/Terminal` |
| `brand` | String | No | Manufacturer (e.g. `Zebra Technologies`, `Dell`, `Cisco`) |
| `modelRevision` | String | No | Model specs (e.g. `ZT410 (300 dpi Ethernet)`) |
| `purchaseDate` | Date (YYYY-MM-DD) | Yes | CAPEX procurement date |
| `costBdt` | Number | No | Acquisition price in BDT (e.g. `185000`) |
| `vendor` | String | No | Vendor/Supplier (e.g. `Flora Systems Ltd.`) |
| `warrantyExpires` | Date (YYYY-MM-DD) | Yes | Warranty expiration date |
| `attachedInvoice` | String | No | Uploaded challan filename / URL |
| `tags` | String[] | No | `["Factory Critical", "Line Automation"]` |
| `status` | Enum | Yes | `active`, `maintenance`, `offline`, `storage` |
| `assignedTo` | String | Yes | Custodian name + EMP badge |
| `facilityId` | String | Yes | Campus ID foreign key |
| `facilityName` | String | Yes | Manufacturing complex name |
| `locationDetail` | String | Yes | Floor & production station (e.g. `Floor 2 — Sewing Line 08`) |
| `department` | String | Yes | Linked organizational department |
| `ipAddress` | String | Yes | Allocated static IP |
| `macAddress` | String | Yes | Hardware MAC |
| `vlanSubnet` | String | No | VLAN identifier (e.g. `Industrial-VLAN-10`) |
| `lastPing` | String | No | Dynamic ICMP ping latency string |

---

### 4.2 Endpoints

#### 1. Register Hardware Asset (Stitch Modal Endpoint)
`POST /api/v1/assets/register`
- **Request Body:**
```json
{
  "assetTag": "AST-8925",
  "serialNumber": "SN-4820199025-GB",
  "name": "Zebra ZT410 Industrial Thermal Barcode Printer",
  "category": "Industrial Label Printer",
  "brand": "Zebra Technologies",
  "modelRevision": "ZT410 (300 dpi Ethernet)",
  "purchaseDate": "2025-05-18",
  "costBdt": 185000,
  "vendor": "Flora Systems Ltd.",
  "warrantyExpires": "2028-05-18",
  "attachedInvoice": "delivery_challan_8925.pdf",
  "tags": ["Factory Critical", "Line Automation"],
  "status": "active",
  "assignedTo": "Kabir Hossain (EMP-3114) — Line 08 Supervisor",
  "facilityName": "Gazipur Plant Complex (Plant A)",
  "locationDetail": "Floor 2 — Sewing Line 08 (Station D)",
  "department": "Cutting & Sewing Ops (DPT-002)",
  "macAddress": "00:1B:44:11:3A:B7",
  "ipAddress": "10.14.88.42",
  "vlanSubnet": "Industrial-VLAN-10",
  "isVlanEnabled": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hardware asset AST-8925 successfully registered into fleet ledger",
  "data": {
    "id": "ast-8925",
    "assetTag": "AST-8925",
    "serialNumber": "SN-4820199025-GB",
    "name": "Zebra ZT410 Industrial Thermal Barcode Printer",
    "status": "active",
    "ipAddress": "10.14.88.42",
    "registeredAt": "2026-11-23T20:30:00Z"
  }
}
```

#### 2. Upload Delivery Challan / Invoice
`POST /api/v1/assets/upload-challan`
- **Content-Type:** `multipart/form-data`
- **File Field:** `file` (PDF, JPG, PNG, max 10MB)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "filename": "delivery_challan_8925.pdf",
    "fileUrl": "https://storage.apexgarments.com/challans/delivery_challan_8925.pdf",
    "sizeBytes": 482104
  }
}
```

#### 3. Ping Asset ICMP Test
`POST /api/v1/assets/:id/ping`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "assetId": "ast-8925",
    "ipAddress": "10.14.88.42",
    "reachable": true,
    "latencyMs": 1.4,
    "lastPing": "Just now (1.4ms)"
  }
}
```

---

## 5. Support Tickets & Incident Queue API

### 5.1 Endpoints

#### 1. Create Support Incident Ticket
`POST /api/v1/tickets`
- **Request Body:**
```json
{
  "title": "Zebra ZT410 Thermal Barcode Printer offline on Sewing Line 08",
  "facilityId": "loc-fct-01",
  "scope": "Floor 2 — Sewing Line 08 (Station D)",
  "severity": "high",
  "category": "Hardware",
  "requester": "Kabir Hossain",
  "requesterRole": "Line 08 Supervisor",
  "assignee": "Tanvir Hasan",
  "description": "Thermal printhead communication fault. Machine unable to print buyer garment SKU tags."
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "tck-2024-1082",
    "ticketNumber": "#TCK-2024-1082",
    "title": "Zebra ZT410 Thermal Barcode Printer offline on Sewing Line 08",
    "status": "open",
    "severity": "high",
    "category": "Hardware",
    "facilityCode": "LOC-FCT-01",
    "facilityName": "Factory Building A",
    "createdAt": "2026-11-23 20:30"
  }
}
```

#### 2. Update Ticket Status
`PATCH /api/v1/tickets/:id/status`
- **Request Body:** `{ "status": "in_progress" }`
- **Response `200 OK`:** Returns updated ticket entity.

---

## 6. Facility, Network Topology & Telemetry API

### 6.1 Endpoints

#### 1. List Facilities with Live Health
`GET /api/v1/facilities`
- **Response `200 OK`:** Array of 4 campuses (`LOC-CORP-01`, `LOC-FCT-01`, `LOC-FCT-02`, `LOC-WH-01`) with live latency, jitter, uptime percentage, subnets, and lead engineer.

#### 2. Trigger Global Ping Latency Check
`POST /api/v1/facilities/ping-all`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "networkMeshLatencyMs": 14,
    "facilities": [
      { "id": "loc-corp-01", "pingMs": 4, "status": "healthy" },
      { "id": "loc-fct-01", "pingMs": 12, "status": "healthy" },
      { "id": "loc-fct-02", "pingMs": 18, "status": "warning" },
      { "id": "loc-wh-01", "pingMs": 8, "status": "healthy" }
    ]
  }
}
```

#### 3. Environmental Sensors / Thermals API
`GET /api/v1/facilities/:id/thermals`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "facilityId": "loc-fct-02",
    "tempC": 31.4,
    "humidity": 78,
    "status": "warning",
    "idfCabinet": "IDF-02 (Washing Plant)",
    "moistureDetected": false,
    "fanSpeedRpm": 3200,
    "ambientMaxC": 35.0,
    "lastReading": "12s ago"
  }
}
```

---

## 7. Real-Time WebSocket Specifications

### Connection URL
`wss://itms.apexgarments.com/ws/telemetry?token=<jwt_access_token>`

### Broadcast Channels & Events
1. **Network Ping Pulse (`telemetry:ping`)**
   ```json
   { "event": "telemetry:ping", "payload": { "meshLatencyMs": 14, "timestamp": 1795370000 } }
   ```
2. **Ticket Dispatched (`ticket:created`)**
   ```json
   { "event": "ticket:created", "payload": { "ticketNumber": "#TCK-2024-1082", "severity": "high" } }
   ```
3. **Sensor Warning Alert (`thermal:alert`)**
   ```json
   { "event": "thermal:alert", "payload": { "facilityCode": "LOC-FCT-02", "tempC": 32.1, "message": "High humidity warning in Washing IDF" } }
   ```

---

## 8. Relational Database Schema (Prisma ORM Reference)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  FACILITY_ADMIN
  FIELD_TECH
  COMPLIANCE_AUDITOR
  VIEWER
}

enum EmployeeStatus {
  ACTIVE
  ON_CALL
  LEAVE
  SUSPENDED
  OFFBOARDING
}

enum AssetStatus {
  ACTIVE
  MAINTENANCE
  OFFLINE
  STORAGE
}

enum TicketSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  PENDING_VENDOR
  RESOLVED
  ASSIGNED
  CLOSED
}

model Facility {
  id              String      @id @default(uuid())
  code            String      @unique
  name            String
  subtitle        String
  category        String
  status          String
  uptimePercent   Float
  address         String
  district        String
  subnet          String
  activeFleet     Int         @default(0)
  createdAt       DateTime    @default(now())

  employees       Employee[]
  assets          ITAsset[]
  tickets         SupportTicket[]
  tasks           TaskItem[]
}

model Employee {
  id              String         @id @default(uuid())
  employeeId      String         @unique
  name            String
  role            String
  title           String
  department      String
  shift           String
  phone           String
  email           String         @unique
  status          EmployeeStatus @default(ACTIVE)
  isAdmin         Boolean        @default(false)
  avatar          String?
  certifications  String[]
  specialty       String
  linkedAssets    String[]
  openTickets     Int            @default(0)

  facilityId      String
  facility        Facility       @relation(fields: [facilityId], references: [id])
  assignedAssets  ITAsset[]      @relation("CustodianRelation")
  createdTickets  SupportTicket[] @relation("TicketRequester")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model ITAsset {
  id              String       @id @default(uuid())
  assetTag        String       @unique
  serialNumber    String       @unique
  name            String
  category        String
  brand           String?
  modelRevision   String?
  purchaseDate    DateTime
  costBdt         Decimal?     @db.Decimal(12, 2)
  vendor          String?
  warrantyExpires DateTime
  attachedInvoice String?
  tags            String[]
  status          AssetStatus  @default(ACTIVE)
  locationDetail  String
  department      String
  ipAddress       String
  macAddress      String
  vlanSubnet      String?
  lastPing        String?

  custodianId     String?
  custodian       Employee?    @relation("CustodianRelation", fields: [custodianId], references: [id])

  facilityId      String
  facility        Facility     @relation(fields: [facilityId], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model SupportTicket {
  id              String         @id @default(uuid())
  ticketNumber    String         @unique
  title           String
  scope           String?
  severity        TicketSeverity @default(HIGH)
  status          TicketStatus   @default(OPEN)
  category        String
  description     String
  assigneeName    String

  requesterId     String?
  requester       Employee?      @relation("TicketRequester", fields: [requesterId], references: [id])

  facilityId      String
  facility        Facility       @relation(fields: [facilityId], references: [id])
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model TaskItem {
  id              String       @id @default(uuid())
  taskNumber      String       @unique
  title           String
  description     String
  category        String
  domainTag       String
  status          String       @default("todo")
  priority        String       @default("medium")
  progressPercent Int          @default(0)
  subtasks        Json?
  dueDate         DateTime?

  facilityId      String
  facility        Facility     @relation(fields: [facilityId], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}
```

---

## 9. Error Codes & Handling Guide87

| HTTP Status | Internal Code | Scenario | Action / Remedy |
|---|---|---|---|
| `400` | `ERR_VALIDATION_FAILED` | Missing mandatory field in Register Asset or Employee | Inspect `validationErrors` array |
| `401` | `ERR_UNAUTHORIZED` | Expired or missing Bearer token | Refresh via `/api/v1/auth/refresh` |
| `403` | `ERR_INSUFFICIENT_PERMISSIONS` | Non-admin attempting to provision user or change SSO | Require `SUPER_ADMIN` role |
| `404` | `ERR_RESOURCE_NOT_FOUND` | Employee ID or Asset Tag not found | Verify identifier |
| `409` | `ERR_DUPLICATE_ENTRY` | Serial number or employee badge already exists in fleet | Use unique hardware serial or badge |
| `503` | `ERR_TELEMETRY_UNREACHABLE` | Campus SD-WAN tunnel offline during live ping | Trigger failover link |
