# Project Architecture

## 1. Purpose of This Document

This document defines the **authoritative architectural rules, constraints, and design principles** for the project.

It is intended to:

* Act as the **single source of truth** for architecture and structure
* Guide all current and future development
* Constrain agents, contributors, and refactors within approved boundaries

> This document defines **rules**, not tasks.
> It is **read-only** unless explicitly updated by the PRIMARY ARCHITECT.

---

## 2. Project Overview

### Domain

* Financial / FinTech administration panel
* Internal-facing (Admin / Operator / Manager roles)
* Security-first, permission-driven UI

### Core Principles

* Menu-driven authorization
* Backend as the source of truth
* Fully dynamic UI
* Offline-safe operation
* Clean, maintainable, scalable architecture

---

## 3. Technology Stack

### Frontend

* JavaScript (ES2022+)
* Vue 3 (Composition API)
* Vue Router 4
* Pinia (state management)
* Vite (build tool)

> TypeScript is **not enabled by default**.
> Any use of TypeScript must be explicitly approved.

### Styling

* Tailwind CSS (local build, no CDN)
* Design System (Atomic Design methodology)

### Dependencies Policy

* No CDN usage
* All libraries must work in **offline environments**
* All assets bundled locally

---

## 4. High-Level Architecture

### Folder Structure (Canonical)

```
src/
├── app/                # App bootstrap & global setup
├── router/             # Router, guards, dynamic route loader
├── stores/             # Pinia stores
├── features/           # Feature-based modules (domain-driven)
├── pages/              # Route-level pages
├── shared/              # Shared logic (composables, utils, constants)
├── design-system/      # UI components (atomic structure)
└── shared/api/           # API clients & integration layer
```

This structure is **non-negotiable**.

---

## 5. Design System Rules

### Methodology

* Atomic Design

  * atoms
  * molecules
  * organisms
  * templates (optional)

### Rules

* No business logic inside UI components
* Components must be:

  * Reusable
  * Stateless where possible
  * Configurable via props

Pages may compose components, but **features own logic**.

---

## 6. Data & State Management

### Backend as Source of Truth

All dynamic data must originate from backend APIs, including:

* Menus
* Permissions
* User profile
* Access rules

### State Rules

* Global state only when required
* Feature-local state preferred
* No duplicated state across stores

---

## 7. Menu-Driven Authorization Model

### Core Rule

**If a page is not present in the backend menu tree, it must not be accessible.**

### Menu Tree API

* Single authoritative API ("my-tree")
* Provides:

  * Menu hierarchy
  * Permissions
  * Path identifiers

### Enforcement

* Navigation guards must validate access against the menu tree
* Authorization failures must fail-secure

---

## 8. Routing Architecture

### Dynamic Routing (Mandatory)

Routes must be generated dynamically from the backend menu tree.

Hardcoded feature routes are **not allowed**, except:

* Authentication routes
* Error pages

### Component Resolution

Routes resolve components via an approved mapping strategy:

* Convention-based mapping
* Registry-based mapping
* Backend-provided identifiers

The chosen strategy must remain consistent across the project.

---

## 9. Security Requirements

### General

* Fail-secure by default
* No silent permission bypass
* No public access on error

### Routing & Guards

* On error: deny access or redirect to a safe page
* Logging is mandatory
* No implicit allow rules

### Frontend Security

* No secrets in frontend
* No sensitive logic in UI

---

## 10. Code Quality Standards

### Principles

* Clean Code
* SOLID (adapted for frontend)
* DRY
* Explicit over implicit

### Rules

* No duplicated logic
* Shared logic must live in `shared/`
* Features must be isolated

Refactors must improve clarity, not just reduce lines of code.

---

## 11. Agent Governance Model

### PRIMARY ARCHITECT (Agent 1)

* Holds full architectural knowledge
* Enforces rules and constraints
* Read-only authority
* Does **not** implement code

### ARCHITECTURE REVIEWER (Agent 2)

* Validates new prompts and agents
* Ensures alignment with this document
* Blocks non-compliant changes

### IMPLEMENTATION AGENTS

* Execute scoped tasks only
* Must comply with this document
* No architectural decisions

---

## 12. Change Management

### Allowed Changes

* New features within existing structure
* Extension of menu-driven logic
* New reusable components

### Restricted Changes

* Structural changes
* Routing model changes
* State management paradigm changes

These require explicit architectural approval.

---

## 13. Final Notes

* This document is **binding**
* When in doubt, prefer safety, clarity, and maintainability
* Architecture drift is considered a defect

---

Maintained by: PRIMARY ARCHITECT
