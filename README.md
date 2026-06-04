# InsureFlow Hybrid POM Automation Framework

[![Playwright](https://img.shields.io/badge/Playwright-1.60.0-45ba4b)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-122%20Passing-brightgreen)](https://github.com/GaneshKambalapally/insureflow-automation)
[![Domain](https://img.shields.io/badge/Domain-BFSI-orange)](https://github.com/GaneshKambalapally/insureflow-automation)

## Overview

Enterprise Hybrid POM automation framework for InsureFlow Insurance Payment Portal.
Covers UI, API, and Database validation layers using Playwright + TypeScript.

**Author:** Ganesh Kambalapally | QA Architect | TCS Hyderabad | 12 Years BFSI

## Architecture

```
Hybrid POM Framework
├── UI Layer    → 78 tests  → 6 page objects (Login, Dashboard, Payment, History, Claims, Refund)
├── API Layer   → 31 tests  → 17 REST endpoints
└── DB Layer    → 13 tests  → SQLite data integrity validation
```

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Playwright | 1.60.0 | Browser + API automation |
| TypeScript | Strict mode | Type safety |
| Node.js | 20+ | Runtime |
| Allure | Latest | Advanced reporting |
| sql.js | Via app | DB validation |

## Test Results

| Suite | Tests | Status |
|---|---|---|
| API Tests | 31 | ✅ Passing |
| Payment Tests | 16 | ✅ Passing |
| Claims Tests | 15 | ✅ Passing |
| DB Tests | 13 | ✅ Passing |
| History Tests | 12 | ✅ Passing |
| Refund Tests | 12 | ✅ Passing |
| Auth Tests | 11 | ✅ Passing |
| Dashboard Tests | 9 | ✅ Passing |
| Setup | 3 | ✅ Passing |
| **TOTAL** | **122** | **100% ✅** |

## Quick Start

### Prerequisites
- Node.js 20+
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/GaneshKambalapally/insureflow-automation.git
cd insureflow-automation

# 2. Install automation dependencies
npm install

# 3. Install app dependencies
cd app && npm install && cd ..

# 4. Seed the database
cd app && node seed.js && cd ..

# 5. Create environment file
cp .env.test.example .env.test

# 6. Start InsureFlow app (keep terminal open)
cd app && node server.js
```

### Run Tests

```bash
# New terminal — from project root
npm test                    # All 122 tests
npm run test:smoke          # Critical path only
npm run test:regression     # Full regression
npm run test:payment        # Payment module
npm run test:claims         # Claims module
npm run test:api            # API layer only
npm run test:db             # DB validation only
npm run report              # Open HTML report
npm run allure:generate     # Generate Allure report
npm run allure:open         # Open Allure report
```

## Framework Structure

```
insureflow-automation/
├── app/                    ← InsureFlow application
├── pages/                  ← Page Object Model
│   ├── BasePage.ts         ← Shared methods for all pages
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── PaymentPage.ts
│   ├── ClaimsPage.ts
│   ├── HistoryPage.ts
│   └── RefundPage.ts
├── fixtures/
│   ├── auth.fixture.ts     ← Dependency injection
│   └── testData.json       ← Static test data
├── utils/
│   ├── apiHelper.ts        ← API testing layer
│   ├── dbHelper.ts         ← Database validation layer
│   └── fakerHelper.ts      ← Dynamic BFSI test data
├── tests/
│   ├── auth/               ← Login + Dashboard tests
│   ├── payments/           ← Payment + History tests
│   ├── claims/             ← Claims lifecycle tests
│   ├── refunds/            ← Refund tests
│   ├── api/                ← API contract tests
│   └── db/                 ← DB validation tests
├── playwright.config.ts    ← 9 projects configuration
├── tsconfig.json           ← TypeScript strict mode
└── .env.test.example       ← Environment template
```

## Key Design Decisions

- **Hybrid POM**: UI + API + DB layers for comprehensive coverage
- **Storage State**: JWT saved once, reused across 77 UI tests — saves 3+ minutes
- **Fixtures**: Dependency injection pattern — no manual page instantiation
- **TypeScript strict**: Compile-time error detection
- **9 Projects**: Independent module execution for targeted runs