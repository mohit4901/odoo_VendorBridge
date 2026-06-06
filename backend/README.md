# VendorBridge — Backend API

Procurement & Vendor Management ERP backend. **Node + Express + Mongoose**, JWT auth, role-based access,
Joi validation, PDF/CSV generation, Nodemailer + Cloudinary integrations. All responses use the envelope
`{ success, data, message }` and live under `/api/v1`.

The API is shaped to match the existing (mock-driven) React frontend, so the frontend's `services/*` layer
can be wired to it without changing component code.

## Quick start

```bash
cd backend
cp .env.example .env        # optional — sensible defaults work out of the box
npm install
npm run dev                 # http://localhost:5000  (nodemon)
```

**Zero-setup database:** if `MONGODB_URI` is blank, the server boots an **in-memory MongoDB** automatically and
seeds demo data — ideal for a hackathon demo. Set `MONGODB_URI` to a real MongoDB/Atlas string for persistence.

```bash
npm run seed                # wipe + reseed demo data (RFQs, quotes, approvals, PO, invoice, ...)
npm start                   # production start
```

### Demo accounts (seeded)

| Role    | Email                      | Password    |
| ------- | -------------------------- | ----------- |
| Admin   | `admin@vendorbridge.com`   | `admin123`  |
| Officer | `officer@vendorbridge.com` | `officer123`|
| Manager | `manager@vendorbridge.com` | `manager123`|
| Vendor  | `vendor@vendorbridge.com`  | `vendor123` |

`admin` bypasses all role checks. Login/register return `{ user, token }`; the token is also set as an
httpOnly `vb_token` cookie. Send it back as `Authorization: Bearer <token>`.

## Configuration (`.env`)

| Var | Default | Notes |
| --- | --- | --- |
| `PORT` | `5000` | |
| `CORS_ORIGIN` | `http://localhost:5173` | comma-separated allowlist |
| `MONGODB_URI` | _(empty)_ | blank ⇒ in-memory Mongo |
| `JWT_SECRET` / `JWT_EXPIRE` | dev key / `7d` | |
| `SEED_ON_START` | `true` | seed if DB empty on boot |
| `CLOUDINARY_*` | _(empty)_ | blank ⇒ attachment uploads return placeholder URLs |
| `EMAIL_*` | _(empty)_ | blank ⇒ emails logged to console instead of sent |
| `INVOICE_TAX_RATE` / `INVOICE_DUE_DAYS` | `0.18` / `30` | |

## Architecture

Package-by-feature modules, each with `model · repository · service · controller · routes · validations`:

```
src/
  app.js · server.js              # express app + bootstrap (db → seed → listen → jobs)
  config/   (env, db, jwt, cloudinary, mail)
  middleware/ (auth, role, error, validation)
  utils/    (responseHandler, ApiError, mongoose[id transform], events, time, template, logger)
  interfaces/ (BaseRepository)
  helpers/  (pdfGenerator, csvExporter)
  modules/  (auth, users, vendors, rfqs, quotations, approvals, purchaseOrders, invoices,
             notifications, activityLogs, dashboard, reports)
  jobs/     (reminderJobs — daily invoice/RFQ deadline alerts)
  seed/     (seedData — demo dataset mirroring the frontend mocks)
```

**Procurement lifecycle (auto-orchestrated):**
`Vendor registers → Admin approves → Officer publishes RFQ → vendors quote → compare → award`
`→ approval workflow (Manager Review → Finance Approval → Issued) → PO auto-generated`
`→ Invoice auto-generated (18% GST, +30d due) → pay / print / email`. Every step emits an in-app
notification and an audit-trail entry.

## API reference (all under `/api/v1`)

### Auth
| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | Register user/vendor → `{ user, token }` |
| POST | `/auth/login` | public | Authenticate → `{ user, token }` |
| GET | `/auth/me` | auth | Current session user |
| POST | `/auth/logout` | auth | Clear auth cookie |

### Users (admin)
`GET /users` · `GET /users/:id` · `POST /users` · `PATCH /users/:id/role` · `DELETE /users/:id`

### Vendors
`GET /vendors` (`?status=&category=&search=`) · `GET /vendors/:id` · `POST /vendors` · `PUT /vendors/:id` ·
`DELETE /vendors/:id` · `PATCH /vendors/:id/status` · `POST /vendors/:id/approve` (admin)

### RFQs
`GET /rfqs` (`?status=&category=&search=&vendorId=`) · `GET /rfqs/:id` · `POST /rfqs` · `PUT /rfqs/:id` ·
`PATCH /rfqs/:id/status` · `PATCH /rfqs/:id/assign` · `POST /rfqs/:id/publish`

### Quotations
`GET /quotations` (`?rfqId=&vendorId=&status=`) · `GET /quotations/rfq/:rfqId` · `GET /quotations/:id` ·
`POST /quotations` · `PUT /quotations/:id` · `POST /quotations/compare` · `POST /quotations/:id/award`

### Approvals (manager)
`GET /approvals` (`?status=`) · `GET /approvals/:id` · `POST /approvals` ·
`POST /approvals/:id/action` (`{action:'approve'|'reject', remark}`) · `POST /approvals/:id/approve` · `POST /approvals/:id/reject`

### Purchase Orders
`GET /purchase-orders` (`?status=&vendorId=&search=`) · `GET /purchase-orders/:id` ·
`POST /purchase-orders` (`{approvalId}` or `{quotationId}`) · `PATCH /purchase-orders/:id/status`

### Invoices
`GET /invoices` (`?status=&search=`) · `GET /invoices/:id` · `POST /invoices` (`{poId}`) ·
`PATCH /invoices/:id/pay` · `GET /invoices/:id/pdf` · `GET /invoices/:id/print` · `POST /invoices/:id/email`

### Notifications
`GET /notifications` (`?unread=true`) · `POST /notifications` · `PATCH /notifications/:id/read` ·
`PATCH /notifications/read-all` · `DELETE /notifications/:id` · `DELETE /notifications`

### Activity Logs
`GET /activity-logs` (`?type=`) · `POST /activity-logs` · `GET /activity-logs/export` (CSV)

### Dashboard
`GET /dashboard/summary` · `/metrics` · `/pipeline` · `/spend-analysis` · `/rfq-status` · `/recent-activity` · `/pending-approvals`

### Reports
`GET /reports/summary` · `/spend-by-category` · `/spend-trend` · `/monthly-trend` · `/top-vendors` ·
`/vendor-performance` · `/rfq-distribution` · `/export` (`?format=csv|pdf`) · `/export/csv` · `/export/pdf`

## Health

`GET /health` → liveness. `GET /api/v1` → list of mounted modules.
