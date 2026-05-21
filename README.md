# AI Resume Builder & Analyzer Pro

Production-style MERN SaaS app with AI-powered resume generation, ATS analysis, and resume improvement.

## Tech Stack
- Frontend: React + Vite + Tailwind + Framer Motion
- Backend: Node + Express + MongoDB (Mongoose)
- AI: Gemini API (OpenAI-compatible endpoint)
- Uploads: Multer + Cloudinary
- PDF Parse: pdf-parse
- PDF Export: html2canvas + jsPDF

## Project Structure
- `client/` frontend app
- `server/` backend API

## Setup
1. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
2. Create env files:
   - `cp server/.env.example server/.env`
   - `cp client/.env.example client/.env`
3. Add your credentials in `.env` files.
4. Run backend:
   - `cd server && npm run dev`
5. Run frontend:
   - `cd client && npm run dev`

## API Routes
- `/api/auth` (signup/login)
- `/api/resume` (CRUD + AI bullet generation)
- `/api/analyze` (ATS analysis + resume improvement)
- `/api/user` (profile + avatar upload)

## Highlights
- JWT auth with protected routes
- Glassmorphism dashboard UI with dark mode
- Resume builder with live preview and PDF download
- ATS score + job match + keyword gap analysis
- Before/after AI resume improvements with typing animation
