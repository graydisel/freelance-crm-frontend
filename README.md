# 💻 Freelance CRM — Frontend Application

A modern, responsive Single-Page Application (SPA) for the Freelance CRM & Project Management platform built with **Angular (v19/22)**, **Angular Signals**, **Angular CDK**.

Engineered for freelancers, digital agencies, and project managers to track clients, oversee contract budgets, and manage tasks on an interactive drag-and-drop Kanban board.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Features](#-key-features)
- [Application Views & Navigation](#-application-views--navigation)
- [UI Design System & Components](#-ui-design-system--components)
- [Default Login Credentials](#-default-login-credentials)
- [Prerequisites](#-prerequisites)
- [Installation & Getting Started](#-installation--getting-started)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Deployment & CI/CD](#-deployment--cicd)

---

## 🌟 Overview

The **Freelance CRM Frontend** is designed to deliver a desktop-class user experience. It combines fine-grained reactive state management with **Angular Signals**, an interactive **Kanban Board** with drag-and-drop workflows via **Angular CDK**, and a clean, responsive aesthetic powered by **SCSS**.

---

## 🛠 Architecture & Tech Stack

- **Framework:** [Angular](https://angular.dev/) (Standalone Components, `ChangeDetectionStrategy.OnPush`)
- **Reactivity & State Management:** Angular Signals (`signal()`, `computed()`, `takeUntilDestroyed()`) for seamless, zone-less-ready reactive updates without unnecessary change detection passes.
- **Styling & Layout:**
  - SCSS stylesheets for modular component styles and design tokens
- **Interactive Drag & Drop:** [Angular CDK Drag & Drop](https://material.angular.io/cdk/drag-drop/overview) for the Kanban board columns and task movement
- **Modal & Dialogs:** Angular CDK Dialog (`@angular/cdk/dialog`)
- **Form Controls & Validation:** Angular Reactive Forms with dynamic validation and [ngx-mask](https://www.npmjs.com/package/ngx-mask) for phone number inputs
- **Unit Testing:** [Vitest](https://vitest.dev/) with `jsdom`
- **Routing & Guards:** Angular Router with role-based functional route guards (`dashboardGuard`, `clientsGuard`, `projectsGuard`)
- **Hosting Target:** [Vercel](https://vercel.com/) with client-side SPA rewrites (`vercel.json`)

---

## ⚡ Key Features

### 1. 📊 Executive Dashboard (`/dashboard`)
- High-level KPI metric cards (`crm-metric-card`): total active projects, client count, and aggregated contract values.
- Real-time project progress tracking list with percentage progress bars.
- Recent client portfolio and transaction breakdown.

### 2. 🗂 B2B Client Directory (`/clients`)
- Comprehensive client data table (`crm-table`) with column sorting, live search, and status badges (`ACTIVE`, `INACTIVE`, `LEAD`).
- Slide-out details and creation drawer (`crm-drawer`) for seamless editing without leaving the page.
- Input validation with phone number masking.
- Integrated pagination controls (`crm-pagination`).

### 3. 📂 Project Management Hub (`/projects`)
- Grid and table views for client projects with status filtering (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `ON_HOLD`).
- Fast status transition dropdowns.
- Project creation drawer with budget, deadline, and client association fields.

### 4. 📌 Dual Task Management Views (`/projects/:id`)
- **Interactive Kanban Desk (`/projects/:id/kanban`):**
  - Multi-column visual board: `BACKLOG`, `TO DO`, `IN PROGRESS`, `REVIEW`, `DONE`.
  - Smooth drag-and-drop between columns with immediate status persistence to the backend API.
  - Quick task addition, status chips, priority indicators (`LOW`, `MEDIUM`, `HIGH`), and task detail drawers.
- **Project Tasks Table (`/projects/:id/tasks`):**
  - Tabular view with advanced filter chips by priority and status.
  - Searchable task lists with assignee avatars and due dates.

### 5. 🔐 Security & Role-Based Access Control (RBAC)
- Clean login page with credential validation and error messaging.
- Persistent session handling with JWT storage and automatic Bearer token injection via HTTP Interceptors.
- Route protection preventing unauthorized roles from accessing restricted sections:
  - **Admin & Manager:** Access to Dashboard, Clients, Projects, Tasks, and creation tools.
  - **Developer:** Access to Projects and Task Kanban boards.
  - **Client:** View-only access to relevant project progress.

---

## 🗺 Application Views & Navigation

```text
/login                 ── Authenticate with email and password
/dashboard             ── KPI metrics, financial summary, and progress overview (Guarded)
/clients               ── Manage client companies, contracts, and contacts (Guarded)
/projects              ── Project portfolio catalog & status management (Guarded)
├── /projects/:id/tasks   ── Tabular task management for a selected project (Guarded)
└── /projects/:id/kanban  ── Interactive drag-and-drop Kanban desk for a selected project (Guarded)
```

---

## 🧩 UI Design System & Components

The application contains a standalone UI component library located in `src/app/shared/components/`:

| Component | Selector | Description |
| :--- | :--- | :--- |
| **Drawer** | `<crm-drawer>` | Slide-over side panel for forms and detail views |
| **Table** | `<crm-table>` | Generic data table with custom row templates and sorting |
| **Pagination** | `<crm-pagination>` | Responsive pagination controls with page-size selectors |
| **Metric Card** | `<crm-metric-card>` | KPI cards with icon slots, trends, and statistics |
| **Status Badge** | `<crm-status-badge>` | Color-coded badges for project, client, and task statuses |
| **Button** | `<crm-button>` | Styled buttons with primary, secondary, and destructive variants |
| **Modal** | `<confirmation-modal>`| Dialog modal for confirming sensitive operations (e.g. deletion) |
| **Search Input** | `<crm-search-input>` | Debounced input for instantaneous filtering |
| **Filter Chips** | `<crm-filter-chips>` | Interactive tag chips for multi-attribute filtering |
| **Avatar** | `<crm-avatar>` | User and company avatar with fallback initials |
| **Dropdown** | `<crm-dropdown>` | Contextual menu and status selection dropdown |

---

## 🔑 Default Login Credentials

If running alongside the seeded backend API (`npm run seed`), use the following pre-configured credentials:

| Role | Email | Password | Allowed Views |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `password123` | Dashboard, Clients, Projects, Tasks, Kanban |
| **Manager** | `manager@crm.com` | `password123` | Dashboard, Clients, Projects, Tasks, Kanban |
| **Developer** | `developer@crm.com` | `password123` | Projects, Tasks, Kanban |
| **Client** | `client@crm.com` | `password123` | Projects (Assigned) |

---

## 📋 Prerequisites

- **Node.js**: v20.x or v24.x
- **npm**: v10+ or v11+
- **Backend API**: The backend server running at `http://localhost:8080` (or a remote endpoint)

---

## 🚀 Installation & Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/graydisel/freelance-crm-frontend.git
cd freelance-crm-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Verify environment configuration
Check `src/environments/environment.development.ts` to ensure the API endpoint points to your backend instance:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  token: 'crm_token',
  userKey: 'crm_user'
};
```

### 4. Start the development server
```bash
npm start
```
Or with Angular CLI:
```bash
npx ng serve
```

Open your browser and navigate to **`http://localhost:4200`**. The application will automatically reload if you change any source files.

---

## 🧪 Testing & Code Quality

The frontend uses **Vitest** for fast unit testing:

```bash
# Run unit tests
npm test

# Run linter
npm run lint
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Run development server on `http://localhost:4200` |
| `npm run build` | Compile production build into `dist/freelance-crm` |
| `npm run watch` | Build in watch mode for development configuration |
| `npm test` | Run Vitest unit tests |

---

## 🌐 Deployment & CI/CD

- **Vercel Deployment:** The repository includes `vercel.json` with rewrite rules directing all sub-routes to `/index.html` for seamless HTML5 pushState routing.
- **GitHub Actions (`ci.yml`):** Automatically runs on pull requests and pushes to `master`, validating dependency installation, code quality, and production compilation (`ng build --configuration production`).
- **Production API:** In production, the app connects to the deployed backend on Render via `src/environments/environment.ts`.
