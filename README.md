# GrowEasy AI-Powered CSV Importer

An intelligent lead extraction and mapping engine. This application allows users to upload raw CSV files with arbitrary formats and column headers, preview the raw rows locally, and automatically cleanse, standardize, and map columns to the GrowEasy CRM format using the Gemini AI API.

---

## Architecture Diagram

```
[User Interface (Next.js)]
           |
           | (1) Upload CSV
           v
[Upload Validator (Multer Memory Storage)]
           |
           | (2) Parse CSV Buffer
           v
[CSV Parser Helper (csv-parser Stream)]
           |
           | (3) JSON raw records
           v
[AI Mapper Service (Gemini API / Mock Fallback)]
           |
           | (4) Mapped CRM JSON schema
           v
[API Result Validator (Row validation)]
           |
           +---> [Successful CRM Leads]
           +---> [Skipped Records Log]
```

---

## Features

*   **Flexible CSV Handling**: Upload any CSV structure (e.g., Facebook Lead Exports, Excel files, custom spreadsheets) with unknown or varying column names.
*   **Zero-AI Local Preview**: View raw records with horizontal/vertical scrollbars and sticky column headers immediately upon file upload without consuming AI tokens.
*   **Intelligent AI Mapping**: Dynamically formats date fields, resolves status/source enums, and splits phone numbers into country codes and mobile digits.
*   **Double-Email & Double-Phone Processing**: If multiple emails or mobile numbers exist in a row, the primary is set and remaining items are aggregated into the `crm_note` field.
*   **Fail-Safe Skip Validation**: Excludes rows that contain neither a valid email nor phone number, routing them into the skipped records dashboard.
*   **Mock Mode Fallback**: Test the full frontend-to-backend workspace pipeline locally without a Gemini API Key using regex-based mapping heuristics.

---

## Tech Stack

*   **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, PapaParse
*   **Backend**: Node.js, Express, TypeScript, Multer, csv-parser
*   **AI Engine**: Google Gemini 2.5 Flash API (via `@google/genai` SDK)

---

## Environment Variables

Configure these settings inside `backend/.env`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Node port for Express server listener | `5000` |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | `""` (Empty) |
| `MOCK_MODE` | Toggles local regex fallback mapping | `true` |

---

## Installation & Local Development

### Prerequisites
*   Node.js (v20+ recommended)
*   npm (v10+ recommended)

### 1. Clone & Set Up Workspaces
From the root directory, run the workspace installer:
```bash
npm run install-all
```

### 2. Configure Environment Files
Copy the example environment file inside the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and edit your ports or API keys. Set `MOCK_MODE=true` to test offline.

### 3. Launch Development Servers
Run the dev servers concurrently from the root directory:
```bash
npm run dev
```
*   **Frontend** URL: `http://localhost:3000`
*   **Backend** URL: `http://localhost:5000`

---

## API Endpoints

### 1. `POST /api/upload`
*   **Purpose**: Accepts raw file, validates constraints, and parses CSV to JSON raw preview data.
*   **Payload**: `multipart/form-data` containing `file` (CSV format, max 5MB).
*   **Response**:
    ```json
    {
      "success": true,
      "filename": "leads.csv",
      "count": 150,
      "data": [
        { "Full Name": "John", "Email": "john@test.com", "Phone": "+9198765" }
      ]
    }
    ```

### 2. `POST /api/import`
*   **Purpose**: Accepts JSON arrays, runs batch mapping, validates records, and extracts leads.
*   **Payload**: `application/json`
    ```json
    {
      "records": [
        { "Full Name": "John", "Email": "john@test.com", "Phone": "+9198765" }
      ]
    }
    ```
*   **Response**:
    ```json
    {
      "success": true,
      "summary": { "imported": 1, "skipped": 0, "total": 1 },
      "records": [
        {
          "created_at": "2026-05-13 14:20:48",
          "name": "John",
          "email": "john@test.com",
          "country_code": "+91",
          "mobile_without_country_code": "98765"
        }
      ],
      "skipped": []
    }
    ```

---

## Deployment

### Backend (Render / Railway)
1. Deploy as a Web Service from the `backend` root folder.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Set env variables (`PORT`, `GEMINI_API_KEY`, `MOCK_MODE=false`).

### Frontend (Vercel)
1. Deploy from the `frontend` root folder.
2. Build Command: `next build`
3. Set the environment variable: `NEXT_PUBLIC_BACKEND_URL` pointing to your hosted backend URL.
