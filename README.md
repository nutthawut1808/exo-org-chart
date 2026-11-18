# EXO Travel - Organization Chart Mini App (Complete Summary & Submission Guide)

A secure, high-performance full-stack web application built for the EXO Travel candidate assignment. It visualizes an organization of 1,000 employees across 6 departments and 11 divisions, providing interactive exploration, instant search, dependent filtering, and detailed employee insights.

---

## 🚀 Tech Stack & Architecture

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, `@xyflow/react` (React Flow)
- **Backend:** Next.js API Routes (Node.js runtime)
- **Authentication:** Auth.js (NextAuth v5) with Google OAuth Provider (Stateless JWT session, no database required)
- **Layout Engine:** `dagre` for automated hierarchical top-down tree calculation
- **Data Source:** Static JSON dataset (`data/employees.json`) containing exactly 1,000 fictional employee records.

---

## 🛠️ Quick Setup & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- Google Cloud Console account (for Google OAuth credentials setup)

### 2. Environment Configuration
Create a `.env` file in your project root:
```env
AUTH_SECRET=your_generated_random_secret_string
GOOGLE_CLIENT_ID=your_google_client_id_from_gcp
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_gcp
NEXTAUTH_URL=http://localhost:3000
```
*(Ensure `http://localhost:3000/api/auth/callback/google` is added to your Google Cloud Console Authorized redirect URIs).*

### 3. Run Commands
```bash
# Install dependencies
npm install

# Generate dataset
npx tsx scripts/generate-employees.ts

# Run development server
npm run dev
```

---

## 📂 API Behavior & Endpoints
- **`GET /api/employees`**: Returns list of employees. Supports query parameters `?q=`, `?department=`, and `?division=`. Protected by authentication middleware.
- **`GET /api/employees/[id]`**: Returns detailed employee info. Returns HTTP `404` if the employee ID does not exist.

---

## 🤖 AI Assistance Disclosure
AI assistance (Gemini) was utilized for drafting the dataset generation script, setting up NextAuth v5 configuration, and integrating React Flow with Dagre tree layout. The codebase has been fully inspected and tested to ensure complete compliance.