# Fridge Inventory App

**Hybrid Expo (React Native) + Next.js API backend with Prisma and AI-powered food management**

A cross-platform inventory tracker that helps users manage food freshness, monitor expiry dates, and reduce waste with contextual AI suggestions.

---

## Overview

Fridge Inventory App is a mobile-first, cross-platform application designed to track food items, manage expiry status, and minimize waste. It combines:

* **Expo / React Native** for the mobile UI
* **Next.js API Routes** for backend endpoints
* **Prisma ORM with PostgreSQL** for data persistence
* **Google Gemini API** for AI-based suggestions and image classification

The architecture keeps backend logic lightweight (serverless-style API handlers) while centralizing shared utilities for expiry tracking, validation, and classification.

---

## Core Features

* Add, update, and delete food items and categories
* Guarded bulk deletion (prevents deleting categories with existing items)
* Expiry tracking with freshness status indicators (fresh, expiring, critical, expired)
* Dashboard metrics (totals, expiring soon, recently expired, AI suggestions)
* AI chat endpoint for contextual inventory guidance
* Image-based food item detection via Gemini multimodal API
* Suggestion engine combining heuristics and model-assisted prompts
* Consistent design system for colors, spacing, and typography

---

## Tech Stack

| Layer          | Technology                 | Description                                                |
| -------------- | -------------------------- | ---------------------------------------------------------- |
| Mobile UI      | Expo / React Native        | Navigation via React Navigation Stack & Tabs               |
| Backend        | Next.js API Routes         | Deployed as serverless endpoints                           |
| Database       | PostgreSQL with Prisma ORM | Singleton client prevents connection storms in development |
| AI Integration | Google Gemini              | Chat and image analysis for classification and suggestions |
| Styling        | Central Design System      | Shade-based color tokens and component variants            |
| Icons          | lucide-react-native        | Lightweight vector icon library                            |

---

## Data Model (Prisma)

The schema includes `FoodItem` and `Category` models supporting relational queries and freshness-based analytics.

Key fields:

* `expiryDate`: Used to compute `daysUntilExpiry`
* `status`: Serializable freshness state for queries and indexing
* `volume`: Replaces older `quantity` semantics

Indexes improve dashboard aggregation and expiry filtering performance.

---

## Directory Structure

```
App.js                # Root Expo entry point (navigation setup)
pages/api/*           # Next.js API route handlers
lib/prisma.js         # Prisma singleton client
prisma/schema.prisma  # Database models and relationships
src/constants/        # Design tokens and theming
src/components/       # Reusable UI components
src/screens/          # Feature screens (Inventory, Dashboard, etc.)
src/services/api.js   # API client wrapper for fetch calls
utils/*               # Validation, status logic, and config utilities
```

---

## API Endpoints

| Endpoint                      | Methods          | Purpose                                   |
| ----------------------------- | ---------------- | ----------------------------------------- |
| `/api/items`                  | GET, POST        | List or create food items                 |
| `/api/items/[id]`             | GET, PUT, DELETE | Retrieve, update, or delete a food item   |
| `/api/items/bulk-delete`      | POST             | Batch deletion by IDs                     |
| `/api/categories`             | GET, POST        | List or create categories                 |
| `/api/categories/[id]`        | PUT, DELETE      | Update or delete category (guarded)       |
| `/api/categories/bulk-delete` | POST             | Batch category deletion                   |
| `/api/dashboard`              | GET              | Aggregate metrics and activity summary    |
| `/api/dashboard/suggestions`  | GET              | AI and heuristic-based suggestions        |
| `/api/expiring`               | GET              | Items expiring within N days (`?days=7`)  |
| `/api/chat`                   | POST             | AI contextual chat for inventory guidance |
| `/api/detect`                 | POST             | Image classification (multipart upload)   |

Each handler includes in-file documentation describing request and response formats.

---

## Design System and Theming

The app uses a centralized design system with shade-based color tokens and semantic references, ensuring consistency and future extensibility (e.g., dark mode).

**Token categories:**

* Spacing scale (`xs` → `8xl`)
* Typography (sizes, weights, line heights, letter spacing)
* Border radius scale
* Shadows (platform-adjusted)
* Component variants (button, card, input)
* Layout metrics (header, tab bar, icon sizes)
* Animation durations
* Z-index layers

---

## Validation and Domain Logic

* `utils/validation.js`: Returns `{ isValid, errors }` for safe front-end handling.
* `utils/status.js`: Derives status labels and color indicators based on expiry date.
* `utils/categoryIcons.js`: Maps category names to icons and colors.
* `utils/config.js`: Central configuration for thresholds and constants.

---

## AI Integration

AI endpoints use the **Google Gemini API** for:

* **Chat**: Generating contextual recommendations based on current inventory.
* **Detect**: Image-to-item classification (with plans for structured suggestions).

Ensure the environment variable `GEMINI_API_KEY` is configured for these features.

---

## Environment Variables

Create a `.env` file or configure secrets in your deployment environment:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
API_BASE_URL=http://localhost:3000
GEMINI_API_KEY=your-key-here
```

---

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Apply database migrations**

   ```bash
   npx prisma migrate deploy
   ```

3. **(Optional) Seed sample data**

   ```bash
   npm run prisma:seed
   ```

4. **Start backend (Next.js)**

   ```bash
   npm run dev
   ```

5. **Start mobile app (Expo)**

   ```bash
   npm start
   ```

6. **Open on device or emulator**
   Use the QR code or run a platform-specific script (e.g., `npm run android`).

---
