# Simple. Finance

A personal finance tracker built with an opinionated, long-term investment strategy in mind:
Simple **buy & hold with diversification**, where rebalancing means buying what is underweight - never panic selling.

> ⚠️ This project is in active development. It is not open to external contributions at this stage.

---

## Live Demo

🔗 [andrehgdias.github.io/SimpleFinance](https://andrehgdias.github.io/SimpleFinance/)

## Motivation

This project has two purposes:

1. **Personal use** - a privacy-first, offline finance tracker that fits my investment philosophy
2. **Learning** - a deliberate exercise in
   applying [Extreme Programming (XP)](https://www.agilealliance.org/glossary/xp/)
   and [Test-Driven Development (TDD)](https://martinfowler.com/bliki/TestDrivenDevelopment.html) in a real project,
   using Clean Architecture principles to keep things decoupled.

The architecture is intentionally more structured than a typical side project. The goal was to practice building a
frontend codebase where **the domain and application logic are fully independent of the UI framework and storage layer** - the same way you would in a backend service.

---

## Architecture

The project follows **Clean Architecture**, with a strict dependency rule: inner layers know nothing about outer layers.

```
src/
├── domain/          # Pure business logic. No framework, no I/O.
│   ├── entities/    # Transaction
│   └── value-objects/ # Money
├── application/     # Use cases and ports (interfaces)
│   ├── services/    # TransactionService
│   ├── interfaces/  # ITransactionRepository (the port)
│   └── errors/      # NotFoundError
├── infrastructure/  # Adapters: IndexedDB wrapper + repository implementations
│   ├── database/    # SimpleIndexedDB
│   └── repositories/ # TransactionRepository
└── ui/              # SolidJS components + ViewModels
    ├── transactions/ # TransactionForm, TransactionList, TransactionFormViewModel
    └── balance/      # BalanceCard
```

### Why Clean Architecture for a frontend app?

Most frontend projects couple business logic directly to components or state management libraries. This works fine until
you want to test, swap a library, or reason about behaviour in isolation.

Clean Architecture forces a clear answer to "where does this code live?" at every step. Combined with TDD, it means **the UI is the last thing built** - domain and service logic is fully tested and working before a single component
exists.

### Why MVVM in the UI layer?

SolidJS components are intentionally kept thin. All form state, validation logic and submission flow live in a dedicated
`ViewModel` class (e.g. `TransactionFormViewModel`). This makes the logic unit-testable without rendering anything, and
keeps the `.tsx` files as pure view declarations with minimal state handling.

---

## Key Design Decisions

### SolidJS over React/Vue

SolidJS is simpler, lighter, and more explicit about reactivity. It shares enough concepts with React (JSX, components,
signals / hooks) to be familiar, but without the overhead of a virtual DOM or a full framework. For a project that
doesn't need a router or global state manager yet, it's the right fit.

### IndexedDB - Privacy-first, offline-first

There is no backend, no account, no network request. All data lives in the user's browser via IndexedDB. This was a
deliberate choice:

- **Privacy** - your financial data never leaves your device
- **Offline-first** - works without an internet connection
- **Learning** - a chance to work directly with the IndexedDB API, wrapped in a clean Promise-based abstraction (
  `SimpleIndexedDB`)

### Only EUR for now

The `Money` value object and `Currency` enum are designed to support multiple currencies, but only EUR is implemented.

---

## The Investment Strategy (Roadmap)

The "opinionated" part of Simple. Finance is not yet built. The planned strategy is:

- **Buy & hold** - long-term positions, no panic selling
- **Diversification** - across asset classes and geographies
- **Rebalancing by buying** - when an asset class falls below its target allocation %, the action is to *buy more of
  it*, not to sell what's overweight

This logic will live entirely in the domain layer, as it is pure business logic with no UI or storage dependencies.

---

## Tech Stack

| Layer           | Technology                                     |
|-----------------|------------------------------------------------|
| UI Framework    | [SolidJS](https://www.solidjs.com/)            |
| Language        | TypeScript (strict)                            |
| Build Tool      | [Vite](https://vitejs.dev/) (rolldown-vite)    |
| Storage         | IndexedDB via custom `SimpleIndexedDB` wrapper |
| Testing         | [Vitest](https://vitest.dev/)                  |
| Package Manager | [pnpm](https://pnpm.io/)                       |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v24+
- [pnpm](https://pnpm.io/) v10+

### Install & Run

```bash
pnpm install
pnpm dev
```

The dev server runs over HTTPS locally via `mkcert`. Open [https://localhost:5173](https://localhost:5173).

### Build

```bash
pnpm build
pnpm preview
```

---

## Testing

The project is built TDD-first. Tests are the primary design tool.

```bash
pnpm test:full        # Run all tests once
pnpm test             # Watch mode
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:ui          # Vitest browser UI
```

### Test structure

Tests mirror `src/` exactly, split into `unit/` and `integration/`:

```
tests/
├── unit/
│   ├── domain/           # Entity & Value Object behaviour
│   ├── application/      # Service use cases, error handling
│   └── ui/               # ViewModel validation & submission logic
└── integration/
    └── infrastructure/   # Repository + IndexedDB with fake-indexeddb
```

**Unit tests** use mocks for all dependencies (repositories are injected via the `ITransactionRepository` interface).  
**Integration tests** use [`fake-indexeddb`](https://github.com/dumbmatter/fakeIndexedDB) to run real repository logic
without a browser.

---

## CI/CD

| Workflow         | Trigger                   | Description                         |
|------------------|---------------------------|-------------------------------------|
| `run-tests.yml`  | Every push & pull request | Runs the full test suite on Node 24 |
| `deploy-app.yml` | Push to `main`            | Builds and deploys to GitHub Pages  |
