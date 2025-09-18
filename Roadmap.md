# **Fridge Inventory App – Roadmap**

---

## **Timeline Overview**

| Phase | Focus | Days |
|-------|-------|------|
| Phase 1 | Backend + Database | 1-4 |
| Phase 2 | Frontend CRUD + Expiry Tracking | 5-8 |
| Phase 3 | Dashboard + AI Chat | 9-10 |
| Phase 4 | Testing + Deployment | 11-14 |

---

## **Day-by-Day Plan**

### **Phase 1 – Backend (Days 1-4)**
| Day | Tasks |
|-----|-------|
| **Day 1** | - Finalize wireframes (Inventory, Add/Edit, Dashboard, AI Chat)<br>- Finalize DB schema (`categories`, `food_items`)<br>- Define API endpoints<br>- Decide expiry threshold rules |
| **Day 2** | - Setup Node.js + Next.js backend<br>- Setup PostgreSQL with Prisma/pg<br>- Create tables and seed `zones` + `categories`<br>- Deploy backend skeleton to Railway/Render |
| **Day 3** | - Implement CRUD APIs:<br>  - `GET /api/food`<br>  - `POST /api/food`<br>  - `PUT /api/food/:id`<br>  - `DELETE /api/food/:id`<br>- Add expiry calculation logic |
| **Day 4** | - Implement `POST /api/chat`:<br>  - Fetch inventory data<br>  - Send to Gemini API<br>  - Return formatted response<br>- Test endpoints with Postman |

---

### **Phase 2 – Frontend CRUD (Days 5-8)**
| Day | Tasks |
|-----|-------|
| **Day 5** | - Setup React Native project<br>- Setup navigation (`react-navigation`)<br>- Create bottom tabs: Inventory, AI Chat, Dashboard<br>- Setup state management and Axios<br>- Mock Inventory screen with static data |
| **Day 6** | - Fetch live inventory from `/api/food`<br>- Display list with expiry color-coding<br>- Add search bar + filter by zone<br>- Create detail view screen |
| **Day 7** | - Implement Add/Edit form<br>- Connect POST & PUT APIs<br>- Implement delete action<br>- Auto-refresh list after changes |
| **Day 8** | - Show days-left countdown using `dayjs`<br>- Add “Expiring Soon” filter<br>- Add loading + error states |

---

### **Phase 3 – Dashboard + AI Chat (Days 9-10)**
| Day | Tasks |
|-----|-------|
| **Day 9** | - Backend: `/api/dashboard` → total items, expiring soon count, expired count<br>- Frontend: Dashboard screen with stat cards<br>- Optional: Mini bar graph for waste stats |
| **Day 10** | - Create chat UI (messages list + input box)<br>- Integrate `/api/chat`<br>- Test queries: ingredient checks + recipe suggestions |

---

### **Phase 4 – Testing + Deployment (Days 11-14)**
| Day | Tasks |
|-----|-------|
| **Day 11** | - Add confirmation dialogs (delete)<br>- Add empty states<br>- Minor UI cleanup |
| **Day 12** | - Full QA test:<br>  - CRUD<br>  - Expiry logic<br>  - AI<br>  - Dashboard<br>- Fix critical bugs |
| **Day 13** | - Seed DB with realistic sample data<br>- Prepare demo flow/script |
| **Day 14** | - Final backend + frontend deployment<br>- End-to-end smoke test |

---

## **Key Endpoints**
| Action | Endpoint | Method |
|--------|----------|--------|
| Get all food items | `/api/food` | GET |
| Add food item | `/api/food` | POST |
| Update food item | `/api/food/:id` | PUT |
| Delete food item | `/api/food/:id` | DELETE |
| Get expiring soon | `/api/food/expiring` | GET |
| Get dashboard data | `/api/dashboard` | GET |
| AI Chat | `/api/chat` | POST |

---

## **Final Milestones**
| Day Range | Milestone |
|-----------|-----------|
| 1-4 | Backend functional and deployed |
| 5-8 | Inventory CRUD + expiry tracking complete |
| 9-10 | Dashboard + AI integrated |
| 11-14 | Testing, polish, deployment |
