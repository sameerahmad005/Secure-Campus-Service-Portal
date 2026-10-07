# Secure Campus Service Portal
### Institutional Grievance Redressal & Digital Campus Service Desk
**Aligarh Muslim University (AMU) • Group 5 Project**

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel_Ready-000000?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🏛️ Project Overview

The **Secure Campus Service Portal** is a production-grade, enterprise institutional web platform designed for higher education campuses. It provides a structured, auditable, and transparent digital infrastructure for campus grievances, official administrative service requests, departmental notice broadcasts, and role-governed administrative oversight.

Built specifically to replace fragmented paper tickets and unverified messaging groups, this portal adheres to formal institutional compliance, strict role-based access control (RBAC), and SLA-driven resolution workflows.

---

## 👥 Multi-Role Campus Workflows

| Role | Key Capabilities & Modules |
| :--- | :--- |
| **🎓 Student** | • Formal grievance submission with category-driven prioritization and file attachments.<br>• Official service catalog (Bonafide certificates, Hall accommodation, ID reissue, WiFi credentials).<br>• Real-time progress timeline & SLA milestone tracking.<br>• Verified institutional bulletin board with urgent priority banners.<br>• Post-resolution satisfaction rating & feedback submission loop. |
| **🛠️ Staff / Department Officer** | • Departmental intake triage queue categorized by priority and resolution SLA.<br>• Lifecycle status progression (*Investigating*, *In Progress*, *Transferred*, *Resolved*, *Escalated*).<br>• Internal operational remarks & administrative resolution notes.<br>• Direct assignment delegation across department officers. |
| **🛡️ Institutional Administrator** | • Global grievance & service ticket governance across all faculties and departments.<br>• Comprehensive system performance analytics & average SLA metrics.<br>• User directory management and role delegation.<br>• Department routing management.<br>• Official campus notice publisher and global broadcast manager.<br>• Tamper-evident security audit trail with actor logging and IP provenance tracking. |

---

## 🛠️ Technology Stack

- **Core Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/) (lightning-fast HMR and optimized production bundling)
- **Styling Architecture:** [Tailwind CSS](https://tailwindcss.com/) + Custom institutional design tokens (`amu-green`, `amu-slate`, `amu-gold`)
- **Routing Engine:** [React Router v7](https://reactrouter.com/) (declarative nested routing with SPA rewrite support)
- **Icons & UI Primitives:** [Lucide React](https://lucide.dev/)
- **Decoupled Service Layer:** Pure TypeScript service contracts (`types/index.ts` & `services/types.ts`) backed by a stateful local persistence store simulating real-world network latency (350ms) for frictionless transition to production REST/GraphQL APIs.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/sameerahmad005/Secure-Campus-Service-Portal.git
cd Secure-Campus-Service-Portal
```

### 2. Install Dependencies
You can install dependencies directly from the root:
```bash
npm run install:all
```
*Or navigate into the frontend folder:*
```bash
cd frontend
npm install
```

### 3. Run the Development Server
From the root directory:
```bash
npm run dev
```
The application will launch at: **`http://localhost:5173`**

### 4. Build for Production
```bash
npm run build
```
The compiled, type-checked production bundle will be generated in `frontend/dist/`.

---

## 🎭 Persona Switcher (Development Mode)

The application includes an instant **Development Persona Switcher** mounted in the top navigation banner. This enables instant role verification between:
- **Student Persona:** `Zaid Khan` (Computer Engineering, B.Tech)
- **Staff Persona:** `Er. Tariq Ahmad` (Computer Engineering Department)
- **Admin Persona:** `Prof. M. Rizwan` (Chief Proctor / Central Administration)

*No password entry is required during prototype validation; all changes persist safely within browser local storage.*

---

## ☁️ Deploying to Vercel

This repository is pre-configured for **zero-configuration deployment on Vercel**. SPA deep links (such as `/student/complaints` and `/admin/audit`) automatically resolve without 404 errors via pre-configured rewrite rules.

### Method 1: Deploy via Vercel Dashboard (Recommended)
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import `Secure-Campus-Service-Portal`.
4. Keep the **Root Directory** as `./` (or select `frontend`—both are supported out of the box).
5. Click **Deploy**. Vercel will run the build automatically!

### Method 2: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 📂 Project Structure

```text
Secure-Campus-Service-Portal/
├── .gitignore                   # Ignore rules for node_modules, build outputs, and logs
├── package.json                 # Root script runner for monorepo / subfolder builds
├── vercel.json                  # Root Vercel SPA routing and build configuration
├── README.md                    # Project documentation
├── docs/                        # Formal project specification & control documents
│   ├── MEMORY.md                # Engineering decision log & active state tracking
│   ├── PRD.md                   # Product Requirements Document
│   ├── REQUIREMENT.md           # Functional & non-functional requirements
│   ├── SECURITY.md              # Security policies, RBAC matrix & audit protocols
│   ├── TECHSTACK.md             # Architecture stack & technical constraints
│   └── PROMPT.md                # Development instructions & phase guidelines
└── frontend/                    # React 19 + TypeScript + Vite SPA
    ├── package.json             # Frontend dependencies & scripts
    ├── vercel.json              # Subdirectory Vercel SPA rewrite fallback
    ├── vite.config.ts           # Vite build and plugin configurations
    ├── tailwind.config.js       # Institutional color palette & token definitions
    └── src/
        ├── components/          # Reusable UI elements (Header, Sidebar, Modals, Badges)
        ├── layouts/             # Responsive full-viewport AppShell
        ├── mocks/               # Realistic AMU mock seed datasets (tagged isMockData)
        ├── pages/               # Student, Staff, and Administrator portal pages
        ├── services/            # Service contracts & latency-simulated persistence store
        └── types/               # Strict TypeScript domain interfaces
```

---

## 🔒 Security & Data Integrity Compliance

- **Mock Data Isolation:** All demonstration datasets carry explicit `isMockData: true` identifiers.
- **Strict Anti-Hallucination:** System rules, departmental hierarchies, and escalation paths follow genuine institutional procedures without fabricating university policies.
- **Role-Based Routing:** Client-side route guards prevent unauthorized view access, structured for seamless pairing with server-side JWT verification in Phase 2.

---

## 👨‍💻 Contributors

- **Author & Maintainer:** Sameer Ahmad ([sameerabraransari@gmail.com](mailto:sameerabraransari@gmail.com))
- **Team:** Project Group 5
- **Institution:** Aligarh Muslim University (AMU), Aligarh, UP, India

---

## 📄 License
This project is developed for academic, institutional, and educational purposes.
