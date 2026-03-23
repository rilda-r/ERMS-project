# ERMS — Employee Resource Management System

**24BAI1497 | R. Rilda | DBMS — BCSE302L**

A full-stack Employee Resource Management System for a Power Plant, built as part of Digital Assignment 1.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 16 |
| Backend | Python FastAPI |
| Frontend | React + Vite |
| API | Axios |

---

## Features

- 12 normalized tables (1NF → 3NF)
- Full CRUD for all tables
- EER model with ISA hierarchy
- Ternary relationship (Intern–Department–College)
- Multivalued attribute handling (Employee Phone)
- Input validations on frontend and backend
- Pastel themed UI

---

## Project Structure
```
erms-project/
├── backend/          ← Python FastAPI
│   ├── main.py
│   ├── database.py
│   ├── models/
│   └── routes/
├── frontend/         ← React + Vite
│   └── src/
│       ├── components/
│       └── pages/
└── sql/
    └── schema.sql
```

---

## Setup Instructions

### Database
```bash
psql -U postgres -c "CREATE DATABASE erms;"
psql -U postgres -d erms -f sql/schema.sql
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Docs
Visit `http://127.0.0.1:8000/docs` after starting the backend.