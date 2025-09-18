# Fridge Inventory App - MVP

## 1. Main Goal
A simple app to help users:

- **Track and manage** food items in the fridge, freezer, and pantry.  
- **Chat with an AI assistant** to check ingredients and get simple recipe suggestions.  
- **Reduce food waste** by tracking expiry dates and highlighting items that need to be used soon.  
- Quickly view **inventory status** in a clear and organized way.

---

## 2. Core Features

### 2.1 Food Inventory Management
- **Add, edit, and delete** food items with:
  - **Name**  
  - **Category**  
  - **Quantity & unit** (e.g., 1 liter, 500 g)  
  - **Date added**  
  - **Expiry date**  
  - **Notes** (optional)
- Organize items by **zones**: Fridge, Freezer, Pantry.  
- Sort and filter items by **expiry date**, **category**, or **zone**.  
- **Search bar** to quickly find items.

**Core Categories:**  
Fruits, Vegetables, Dairy & Eggs, Meat, Seafood, Grains & Bread, Beverages, Condiments & Sauces, Snacks, Frozen Foods, Leftovers.

---

### 2.2 AI Chat Assistant
- Ask simple questions like:
  - “Do I have eggs and butter?”  
  - “What meals can I make with chicken and broccoli?”
- Get **basic recipe suggestions** using current inventory.

---

### 2.3 Expiry Tracking
- Color-coded status:
  - **Green** – Fresh  
  - **Yellow** – Expiring Soon  
  - **Red** – Expired
- Visual alerts for items nearing expiry.

---

### 2.4 Dashboard
- Overview of **inventory health**:
  - **Total items available**  
  - **Items expiring soon**  
  - **Recently expired items**  
  - **Simple waste statistics** (items discarded)  

---

## 3. Database Schema

| Table Name     | Purpose |
|----------------|---------|
| **categories** | Food categories (Fruits, Vegetables, etc.) |
| **food_items** | Track food items and expiry |

### 3.1 food_items Fields
- `item_id` – **Unique ID**  
- `zone_id` – **Storage location**  
- `category_id` – **Category**  
- `name` – **Item name**  
- `quantity` & `unit` – **Amount and measurement type**  
- `date_added` – **Date added**  
- `expiry_date` – **Expiration date**  
- `status` – **Fresh, Expiring Soon, Expired**  
- `notes` – **Optional extra info**

---

## 4. Tech Stack

| Layer               | Technology / Tool       | Purpose |
|--------------------|-----------------------|---------|
| **Frontend**        | React Native           | Mobile app for iOS and Android |
| **Backend / API**   | Node.js + Next.js      | Handles API and AI requests |
| **Database**        | PostgreSQL             | Stores inventory data |
| **AI Integration**  | Gemini 2.5 Flash API   | AI chat and simple recipe suggestions |
| **Deployment**      | Vercel (frontend), Render/Railway (backend + DB) | Hosts app and database |

---

## 5. API Endpoints 

| Action              | Endpoint           | Method |
|--------------------|------------------|--------|
| **Get all food items**  | /api/food        | GET    |
| **Add a food item**     | /api/food        | POST   |
| **Update a food item**  | /api/food/:id    | PUT    |
| **Delete a food item**  | /api/food/:id    | DELETE |
| **Get expiring items**  | /api/food/expiring | GET  |
| **Chat with AI**        | /api/chat        | POST   |
| **Get dashboard data**  | /api/dashboard   | GET    |

---

## 6. Roadmap

### Step 1: **Design / UI & UX**
- Wireframes for **inventory list**, **add/edit item form**, **AI chat interface**, and **dashboard**.  
- Decide **layout**, **colors** (expiry status), and **navigation flow**.  
- Keep design simple and minimal.

### Step 2: **Backend & Database**
- Setup PostgreSQL tables:  **categories**, **food_items**.  
- Implement **CRUD endpoints** and **expiry status logic** (**Fresh, Expiring Soon, Expired**).  
- Create endpoints for **AI chat** and **dashboard data**.

### Step 3: **Frontend Development**
- Build screens based on wireframes.  
- Connect frontend to **API endpoints** (**inventory**, **AI**, **dashboard**).  
- Implement **search/filter**, **expiry color indicators**, and **dashboard metrics**.  
- Simple **AI chat interface** to call AI API and display responses.

### Step 4: **AI Integration**
- Connect AI API (**Gemini** or equivalent).  
- Test queries like:
  - “What can I cook with chicken and broccoli?”  
  - “Do I have eggs and butter?”

### Step 5: **Testing & Iteration**
- **Functional tests**: add/edit/delete items, AI queries, dashboard data.  
- **UI tests**: layout, expiry color coding, dashboard visualization.  
- **Integration tests**: ensure frontend and backend communicate correctly.  
- **Iterate** on any issues found.

### Step 6: **Demo Preparation**
- Seed database with **sample items** (include expiring items).  
- Prepare demo script:
  - Add/edit items  
  - Show AI chat  
  - Show **expiry indicators**  
  - Display **dashboard** with total items and items expiring soon

---