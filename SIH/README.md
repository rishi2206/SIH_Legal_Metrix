# LegalMetrix - Statutory LMPC Compliance & Mobile Inspection Platform

LegalMetrix is a full-stack, enterprise-grade statutory packaged commodity compliance and inspection platform for Legal Metrology Packaged Commodities (LMPC) Rules 2011 enforcement.

---

## 🏛 Platform Architecture

```
[ Mobile Frontend (React Native CLI JS) ]
              │ (JWT REST API)
              ▼
[ Main Backend (Spring Boot 3.2 Java 21) ]
     │                │                  │
     ▼                ▼                  ▼
[Supabase DB] [Supabase Storage] [FastAPI AI Microservice]
 (PostgreSQL)  (Images & PDFs)   (OpenCV → PaddleOCR → Gemini)
```

1. **Mobile Frontend**: React Native CLI JavaScript application (`legalmetrix-frontend`) with React Navigation (Stacks & Bottom Tabs), mobile UI components, camera/gallery evidence uploading, OCR & AI product data extraction review/editing, product verification, LMPC statutory rule engine breakdown, and PDF report downloads.
2. **Main Backend & LMPC Rule Engine**: Spring Boot (`interconn-backend`) handling authentication (JWT), user/role management (ADMIN & SUPERVISOR), inspection workflows, Supabase PostgreSQL database persistence, Supabase Storage bucket uploading (`evidence-images`, `reports`), expanded modular LMPC compliance rule validation, OpenPDF report generation, and system-wide Audit Logging.
3. **Primary Database**: Supabase PostgreSQL replacing local localhost database.
4. **Cloud Object Storage**: Supabase Storage REST API replacing local `uploads/` disk filesystem for evidence photos and generated PDF reports.
5. **AI Microservice**: FastAPI (`ai-service`) executing OpenCV image preprocessing (contrast enhancement, noise reduction, adaptive thresholding), PaddleOCR text detection & recognition, and Gemini 3.5 Flash structured product extraction, with regex/rule fallback handling.

---

## 🔐 Environment Variables & Security Setup

All sensitive keys, passwords, and secrets have been removed from source code. Configure the `.env` file in each project root:

### 1. `interconn-backend/.env`
```ini
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_OR_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET_EVIDENCE=evidence-images
SUPABASE_STORAGE_BUCKET_REPORTS=reports
JWT_SECRET=YOUR_SECURE_JWT_SECRET_KEY_AT_LEAST_256_BITS_LONG
JWT_EXPIRATION=86400000
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_CONNECT_TIMEOUT_MS=5000
AI_SERVICE_READ_TIMEOUT_MS=60000
OCR_PROVIDER=ai-service
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://10.0.2.2:8080
```

### 2. `ai-service/.env`
```ini
GEMINI_API_KEY=YOUR_VALID_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash
PORT=8000
HOST=0.0.0.0
```

### 3. `legalmetrix-frontend/.env`
```ini
VITE_API_BASE_URL=http://localhost:8080
REACT_NATIVE_API_BASE_URL=http://10.0.2.2:8080
```

---

## ⚡ Quick Start & Run Commands

### 1. Start FastAPI AI Service
```bash
cd ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Verify health status: `GET http://localhost:8000/health`

### 2. Start Spring Boot Backend
```bash
cd interconn-backend
./mvnw spring-boot:run
```
Or run tests: `./mvnw test`

### 3. Start React Native Mobile Frontend
```bash
cd legalmetrix-frontend
npm install

# Start Metro Bundler
npx react-native start

# Run Android (in another terminal with emulator running)
npx react-native run-android

# Run iOS (macOS only)
npx react-native run-ios
```

---

## 📦 Supabase Setup Steps

1. **Database**: Create a project in [Supabase Dashboard](https://supabase.com). Obtain connection host, database name (`postgres`), user (`postgres`), and database password.
2. **Storage Buckets**: In Supabase Dashboard -> Storage, create two public buckets:
   - `evidence-images`
   - `reports`
3. **API Keys**: Copy Project URL (`SUPABASE_URL`) and Anon/Service Role key (`SUPABASE_KEY`) to `interconn-backend/.env`.

---

## ⚖️ LMPC Statutory Compliance Rules Engine

Modular rules registered in `com.interconn.rules`:
1. `MrpValidationRule`: Validates MRP presence & format.
2. `NetQuantityRule`: Validates Net Quantity declaration & units.
3. `ManufacturerDeclarationRule`: Validates Manufacturer name & address.
4. `DateDeclarationRule`: Validates Manufacturing/Packing date and Expiry/Best-Before date.
5. `DeclarationPresenceRule`: Validates essential product identity declarations.
6. `CountryOfOriginRule` (LMPC Rule 6(1)(aa)): Mandatory Country of Origin declaration.
7. `ConsumerCareRule` (LMPC Rule 6(1)(n)): Mandatory Consumer Care helpline/email/address details.
8. `UnitSalePriceRule` (LMPC Rule 6(11)): Mandatory Unit Sale Price calculation requirements.

---

## 📋 Audit Logging

Every critical system action is recorded in `AuditLog` table and viewable via `/api/audit-logs`:
- `LOGIN`
- `SUPERVISOR_ACTIVATED`
- `INSPECTION_CREATED`
- `EVIDENCE_UPLOADED`
- `OCR_PROCESSED`
- `AI_EXTRACTED`
- `PRODUCT_MODIFIED`
- `PRODUCT_VERIFIED`
- `COMPLIANCE_VALIDATED`
- `REPORT_GENERATED`

---

## ✅ Final Architecture Checklist

- [x] **React Native Mobile Frontend**: Pure JavaScript CLI app (no Expo, no TypeScript), React Navigation, mobile UI screens.
- [x] **Spring Boot Backend**: REST APIs, JWT Security, Role-Based Access Control (`ADMIN`, `SUPERVISOR`).
- [x] **Supabase PostgreSQL**: Database connection parameters configurable via environment variables.
- [x] **Supabase Storage**: Object uploads for evidence photos & PDF inspection certificates.
- [x] **FastAPI AI Microservice**: OpenCV preprocessing, PaddleOCR, Gemini structured extraction, fallback regex handler.
- [x] **LMPC Rule Engine**: Modular compliance rule evaluation returning violation reasons & evidence details.
- [x] **Audit Log System**: Comprehensive audit logging across all workflows.
- [x] **Secrets & Security**: Hardcoded keys removed, `.env.example` provided, production CORS enabled.
- [x] **Automated Testing**: JUnit 5 / MockMvc tests for Spring Boot, pytest for FastAPI.
