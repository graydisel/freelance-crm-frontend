# 💻 Freelance CRM — Frontend Application

A high-performance, responsive Single-Page Application (SPA) for the Freelance CRM & Project Management platform built with **Angular 21**, **Angular Signals**, **NgRx SignalStore**, and **Angular CDK**.

Engineered for digital agencies, freelance collectives, and project managers to streamline client management, monitor project budgets, manage deliverables on an interactive drag-and-drop Kanban desk, and provide a dedicated, modular **Client Portal**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Reactivity & State Management (SignalStore)](#-reactivity--state-management-signalstore)
- [Security & Access Control (PBAC & Role Guards)](#-security--access-control-pbac--role-guards)
- [Key Features](#-key-features)
- [Dedicated Client Portal (`/portal`)](#-dedicated-client-portal-portal)
- [Application Views & Routing Structure](#-application-views--routing-structure)
- [Reusable UI Component Library](#-reusable-ui-component-library)
- [Default Login & Demo Access](#-default-login--demo-access)
- [Prerequisites](#-prerequisites)
- [Installation & Getting Started](#-installation--getting-started)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Deployment & CI/CD](#-deployment--cicd)

---

## 🌟 Overview

The **Freelance CRM Frontend** is designed to deliver a desktop-class user experience. It combines fine-grained reactive state management with **Angular Signals** and **NgRx SignalStore**, an interactive **Kanban Board** with drag-and-drop workflows via **Angular CDK**, and a clean, modular design system powered by **SCSS** design tokens.

---

## 🛠 Architecture & Tech Stack

- **Framework:** [Angular 21](https://angular.dev/) (Standalone Components, `ChangeDetectionStrategy.OnPush`)
- **State Management:** [@ngrx/signals](https://ngrx.io/guide/signals) (SignalStore architecture for predictable, isolated domain states)
- **Reactivity & Inputs/Outputs:**
  - Modern Signal Inputs (`input()`, `input.required()`)
  - Modern Outputs (`output<T>()`)
  - Computed Signals (`computed()`) and cleanup via `takeUntilDestroyed()`
- **Interactive Drag & Drop:** [Angular CDK Drag & Drop](https://material.angular.io/cdk/drag-drop/overview) for interactive Kanban columns and task cards
- **Modal & Dialogs:** Angular CDK Dialog (`@angular/cdk/dialog`)
- **Forms & Validation:** Angular Reactive Forms with dynamic validation and [ngx-mask](https://www.npmjs.com/package/ngx-mask) for phone inputs
- **Styling:** Modular SCSS design tokens (`_variables.scss`, `_animations.scss`, `_forms.scss`), zero `::ng-deep` violations, and component host modifiers
- **Unit Testing:** [Vitest](https://vitest.dev/) with `jsdom`
- **Routing & Guards:** Functional Angular route guards (`authGuard`, `clientPortalGuard`, `internalStaffGuard`, `permissionGuard`)
- **Hosting Target:** [Vercel](https://vercel.com/) with client-side SPA rewrites (`vercel.json`)

---

## ⚡ Reactivity & State Management (SignalStore)

Application state is decoupled into domain-driven SignalStores under `src/app/core/stores/`:

| Store | Location | Responsibility |
| :--- | :--- | :--- |
| **`AuthStore`** | `src/app/core/stores/auth.store.ts` | Session persistence, JWT tokens, active user profile, permission array, demo mode detection |
| **`ProjectsStore`** | `src/app/core/stores/projects.store.ts` | Project catalog, pagination metadata, status filters, search queries, active drawer selection |
| **`TasksStore`** | `src/app/core/stores/tasks.store.ts` | Project deliverables, Kanban column buckets, drag-and-drop transitions, priority/assignee filters |
| **`DashboardStore`** | `src/app/core/stores/dashboard.store.ts` | Executive KPIs, financial metrics, and high-level progress aggregation |

---

## 🔐 Security & Access Control (PBAC & Role Guards)

The frontend enforces strict Permission-Based Access Control (**PBAC**) and role boundaries at both route and template levels:

### 1. Functional Route Guards
- **`authGuard`**: Validates JWT session in `AuthStore`; redirects unauthenticated requests to `/login`.
- **`permissionGuard(requiredPermission)`**: Enforces specific permission checks (e.g., `'projects:read'`, `'clients:read'`, `'analytics:read'`). If the user lacks the permission, they are routed to `/forbidden`.
- **`clientPortalGuard`**: Protects the Client Portal route (`/portal`), ensuring client users can access their portal view.
- **`internalStaffGuard`**: Restricts internal administration pages (`/dashboard`, `/clients`, `/projects`) from client accounts, redirecting clients directly to `/portal`.

### 2. Template-Level Authorization Directive
- **`*hasPermission="['projects:create']"`**: The custom structural directive `HasPermissionDirective` conditionally renders UI action buttons, drawers, or tabs based on the active user's permissions.

### 3. Demo Mode Safeguards
- A dedicated `isDemo()` signal disables destructive actions (deletions, mutations) and visually flags demo users with a styled badge.

---

## ⚡ Key Features

### 1. 📊 Executive Dashboard (`/dashboard`)
- High-level KPI cards (`crm-metric-card`): active projects, client portfolio counts, and aggregated contract values.
- Real-time project delivery progress bars with live activity indicators.
- Guarded by `permissionGuard('analytics:read')` and `internalStaffGuard`.

### 2. 🗂 B2B Client Directory (`/clients`)
- Comprehensive client data table (`crm-table`) with column sorting, live search, and status badges (`ACTIVE`, `INACTIVE`, `LEAD`, `ARCHIVED`).
- Slide-out details and creation drawer (`crm-drawer`) for editing without leaving the page.
- Input validation with phone number masking via `ngx-mask`.
- Signal-based pagination controls (`crm-pagination`).

### 3. 📂 Project Management Hub (`/projects`)
- Grid and table view toggling for projects with status filtering (`PLANNING`, `ACTIVE`, `REVIEW`, `COMPLETED`, `PAUSED`).
- Project creation and editing drawer with manager and client dropdown selectors (`crm-dropdown`).
- **Deletion Safety Checks:** Prevents deletion of projects that contain active deliverables, alerting the user via `confirmation-modal`.

### 4. 📌 Dual Task Management Views (`/projects/:id`)
- **Interactive Kanban Desk (`/projects/:id/kanban`):**
  - Visual status columns: `TODO`, `IN PROGRESS`, `REVIEW`, `DONE`, `BACKLOG`.
  - Smooth drag-and-drop between columns with immediate status persistence to the backend.
  - Quick task addition, priority chips, assignee avatars, and task detail drawers.
- **Project Tasks Table (`/projects/:id/tasks`):**
  - Tabular view with advanced filter chips by priority and status.
  - Clickable task titles to inspect and edit details inside `crm-drawer`.
  - Direct in-table priority selector dropdowns.

---

## 🏢 Dedicated Client Portal (`/portal`)

Built specifically for client accounts to review deliverables, milestone tracking, and project delivery leads. Decomposed into modular components under `src/app/features/client-portal/components/`:

- **`PortalHeaderComponent` (`app-portal-header`):** Brand logo, client company badge, user pill avatar with fallback initials, and sign-out action.
- **`PortalOverviewComponent` (`app-portal-overview`):**
  - **Project Summary Card:** Eyebrow, project title, status badge, description, target delivery date, completion percentage, and total task count.
  - **Dedicated Manager Card:** Project manager profile, avatar, delivery lead title, and SLA support contacts.
- **`PortalMilestoneTrackerComponent` (`app-portal-milestone-tracker`):** Gradient milestone progress bar with real-time percentage display and 4 KPI metric cards (*Completed*, *In Progress*, *Review*, *Backlog*).
- **`PortalTasksTableComponent` (`app-portal-tasks-table`):** Read-only table of client deliverables with status pills, priority indicators, and assignee information.
- **Project Selector Tabs:** Multi-project tab switcher for clients with multiple contracts, styled using the shared `crm-btn` directive.

---

## 🗺 Application Views & Routing Structure

```text
/login                 ── Authenticate with email/password or 1-click demo login
/portal                ── Dedicated Client Portal for client accounts (Guarded)
/dashboard             ── KPI metrics, financial summary, and progress overview (Guarded)
/clients               ── Manage client companies, contracts, and contacts (Guarded)
/projects              ── Project portfolio catalog & status management (Guarded)
├── /projects/:id/tasks   ── Tabular task management for a selected project (Guarded)
└── /projects/:id/kanban  ── Interactive drag-and-drop Kanban desk for a selected project (Guarded)
/forbidden             ── Access Denied view when lacking permissions
/**                    ── 404 Not Found fallback view
```

---

## 🧩 Reusable UI Component Library

The application features a standalone UI component library located in `src/app/shared/components/`:

| Component | Selector / Usage | Description |
| :--- | :--- | :--- |
| **Button** | `<button crm-btn>` | Directive supporting `primary`, `secondary`, and `danger` variants, `sm`/`md`/`lg` sizes, and animated loading spinner |
| **Drawer** | `<crm-drawer>` | Accessible slide-over side panel for forms, task details, and project editing |
| **Table** | `<crm-table>` | Flexible table with `[crm-table-header]` and `[crm-table-body]` content projection |
| **Pagination** | `<crm-pagination>` | Signal-based pagination controls with page-size selectors |
| **Metric Card** | `<crm-metric-card>` | KPI cards with live badges, hint text, and status highlights |
| **Status Badge** | `<crm-status-badge>` | Color-coded status badges with dot indicators for projects, clients, and tasks |
| **Avatar** | `<crm-avatar>` | User and company avatar with fallback initials generation |
| **Dropdown** | `<crm-dropdown>` | Contextual menu and status selection dropdown with content projection |
| **Search Input** | `<crm-search-input>` | Debounced search input implementing `ControlValueAccessor` for Reactive Forms |
| **Filter Chips** | `<crm-filter-chips>` | Interactive tag chips for multi-attribute filtering |
| **Expandable Text**| `<crm-expandable-text>`| Smooth expanding description panel without breaking grid layouts |
| **Modal** | `<confirmation-modal>`| Reusable modal dialog for destructive actions (deletions, status changes) |

---

## 🔑 Default Login & Demo Access

The login view includes **1-click demo access buttons** to quickly test role-specific interfaces:

| Role | Email | Password | Allowed Views |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `password123` | Dashboard, Clients, Projects, Tasks, Kanban, User Management |
| **Manager** | `manager@crm.com` | `password123` | Dashboard, Clients, Projects, Tasks, Kanban |
| **Developer** | `developer@crm.com` | `password123` | Projects, Tasks Table, Kanban Desk |
| **Client** | `client@crm.com` | `password123` | Client Portal (`/portal`) |

---

## 📋 Prerequisites

- **Node.js**: v20.x, v22.x, or v25.x
- **npm**: v10+ or v11+
- **Backend API**: The backend server running at `http://localhost:8080` (or configured remote URL)

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
Check `src/environments/environment.development.ts`:
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
Open **`http://localhost:4200`** in your browser. The app will automatically reload when source files change.

---

## 🧪 Testing & Code Quality

```bash
# Run unit tests via Vitest
npm test

# Run ESLint with auto-fix
npm run lint

# Compile production bundle
npm run build
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Launch Angular development server on `http://localhost:4200` |
| `npm run build` | Compile production build into `dist/freelance-crm` |
| `npm run watch` | Build in watch mode for development configuration |
| `npm test` | Run Vitest unit tests |
| `npm run lint` | Run ESLint with automatic fixes |

---

## 🌐 Deployment & CI/CD

- **Vercel Deployment:** Configured via `vercel.json` with SPA rewrite rules routing all subpaths to `/index.html`.
- **GitHub Actions (`ci.yml`):** Runs on pushes and pull requests to `master`, verifying dependency integrity, linting, and production compilation (`ng build`).
- **Production API:** Automatically connects to the hosted backend on Render via `src/environments/environment.ts`.
