# CateringOS — Full Flow Testing Guide

## Setup

### 1. Start the App

```bash
npm run dev
# App runs at http://localhost:3000
```

### 2. Login Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@example.com | admin123 |

> If the database is empty, run `npm run db:seed` first to create seed data (dishes, admin user).

---

## The 9-Stage Flow

```
[1] Create Enquiry (Planning)
        ↓
[2] Build Menu (Menu Tab)
        ↓
[3] Add Internal Costs (Costing Tab)
        ↓
[4] Set Selling Price (Pricing Tab)
        ↓
[5A] Client says YES → Mark as Success → Event Created
[5B] Client says NO  → Mark as Lost
        ↓ (if 5A)
[6] Download Grocery Sheet (Event → Grocery Tab)
        ↓
[7] Tick Off Pre-Event Checklist (Event → Status Tab)
        ↓
[8] Collect Payment (Event → Payments Tab)
        ↓
[9] Mark Event as Completed (Event → Status Tab)
```

---

## Scenario 1 — Full Happy Path (Enquiry → Event → Completion)

### Stage 1: Create a New Enquiry

1. Go to `/enquiries` → click **New Enquiry**
2. Fill in the form:
   - **Client Name**: e.g. `Ahmed Ali`
   - **Contact**: e.g. `9876543210`
   - **Event Date**: pick a future date
   - **Event Time**: e.g. `7:00 PM`
   - **Location**: e.g. `City Convention Hall`
   - **People Count**: e.g. `200`
   - **Occasion**: select one (e.g. `WEDDING`)
   - **Service Type**: select one (e.g. `BUFFET`)
3. Under **Dishes**: expand a category (e.g. `Main Course`) → select a dish → set quantity → click **Add**
4. Add 2–3 more dishes from different categories
5. Add a **Service** if needed (e.g. `Decoration – ₹5000`)
6. Click **Save Enquiry**

**Expected result:**
- Redirected to the enquiry detail page
- Status badge shows **"Planning"** (amber)
- Quotation number generated: `QT-2026-0001`
- Total Amount auto-calculated from dishes + services

---

### Stage 2: Build the Menu (Menu Tab)

1. Open the enquiry → click the **Menu** tab
2. Use **Add Dish** to add more dishes:
   - Select a category from the dropdown
   - Select a dish card
   - Adjust quantity and price
   - Click **Add Dish**
3. To edit a dish row → click **Edit**, change quantity or price → **Save**
4. To remove a dish → click **Remove**
5. Add a service → fill **Service Name** and **Price** → **Add Service**

**Expected result:**
- Total at the bottom updates live with every change
- All changes persist (server-saved, not just local)

---

### Stage 3: Build the Internal Cost Sheet (Costing Tab)

1. Click the **Costing** tab
2. Click **Add Cost Item**
3. Fill in:
   - **Section**: `Grocery`
   - **Item Name**: `Basmati Rice`
   - **Qty**: `50`
   - **Unit**: `kg`
   - **Rate**: `120`
4. Click **Add Item** → row appears under "Grocery" section, total auto-shows `₹6,000`
5. Add more items across different sections:

| Section | Item | Qty | Unit | Rate |
|---|---|---|---|---|
| Meat | Chicken | 80 | kg | 280 |
| Vegetables | Onion | 20 | kg | 40 |
| Vegetables | Tomato | 15 | kg | 60 |
| Rentals | Chafing Dishes | 10 | nos | 500 |
| Labour | Cook (Head) | 1 | day | 2000 |
| Labour | Helper | 4 | day | 800 |

6. To edit a row → click **Edit** on that row → change values → **Save**
7. To delete a row → click the trash icon

**Expected result:**
- Each section shows its subtotal on the right
- **Total Internal Cost** footer at the bottom shows the running grand total

---

### Stage 4: Set the Selling Price (Pricing Tab)

1. Click the **Pricing** tab
2. You'll see:
   - **Internal Cost** (read-only, auto-synced from Costing tab)
   - **Final Selling Price** input
   - **Advance Amount** input
   - **Payment Terms** text field
3. Fill in:
   - **Final Selling Price**: e.g. `75000`
   - **Advance Amount**: e.g. `25000`
   - **Payment Terms**: e.g. `25,000 advance, balance on event day`
4. Watch the **Margin %** card update live as you type the selling price
5. Click **Save Pricing**

**Expected result:**
- Status changes to **"Price Quoted"** (indigo badge)
- A history entry is logged automatically

---

### Stage 5A: Client Confirms — Convert to Event

1. In the right sidebar, click **Confirm & Convert to Event**
2. A confirmation prompt appears → confirm
3. You're redirected to the newly created Event page

**Expected result:**
- Enquiry status → **"Confirmed"** (green badge), all action buttons are hidden
- A new Event is created with:
  - `totalAmount` = the `finalPrice` you set (not the per-dish total)
  - `paidAmount` = the `advanceAmount` from Pricing tab
  - `balanceAmount` = finalPrice − advanceAmount
  - All dishes and services copied over
  - All costing items copied to Event's Costing tab
  - `internalCost` snapshotted on the Event

---

### Stage 6: Generate the Grocery Sheet

1. On the Event page, click the **Grocery** tab
2. You'll see only items from sections: **Grocery**, **Meat**, **Vegetables**
3. Items show: Item Name | Qty | Unit | Est. Rate | Est. Total
4. Click **Print** to open browser print dialog — rate/total columns are hidden in print, leaving a clean shopping list

**Expected result:**
- Only grocery-relevant items appear (Rentals/Labour/Others are excluded)
- Print layout is clean and readable

---

### Stage 7: Tick the Pre-Event Checklist

1. Click the **Status** tab on the Event page
2. Under **Pre-Event Checklist**, click each item once arranged:
   - ☐ Grocery Purchased → click to check ✅
   - ☐ Rentals Arranged → click to check ✅
   - ☐ Staff Assigned → click to check ✅
   - ☐ Transport Scheduled → click to check ✅

**Expected result:**
- Each checkbox toggles with a single click (saves to DB immediately)
- Checked items show strikethrough text and green color
- The checklist mini-summary in the right sidebar updates live

---

### Stage 8: Collect Payment

1. Click the **Payments** tab on the Event page
2. You'll see three summary cards:
   - **Total Agreed Price**: ₹75,000
   - **Paid So Far**: ₹25,000 (advance)
   - **Balance Due**: ₹50,000 (amber)
3. To record a partial payment:
   - Click **Record Partial Payment**
   - Enter `30000` → click **Save Payment**
   - Balance updates to ₹20,000
4. To mark fully paid:
   - Click **Mark Balance as Paid (₹20,000)**
   - Balance becomes ₹0, "Paid in Full" badge appears

---

### Stage 9: Mark Event as Completed

1. Click the **Status** tab
2. Under **Event Status**, click **Completed**

**Expected result:**
- Status badge in the header updates to **"Completed"** (green)
- Right sidebar shows the final margin% between internal cost and revenue

---

## Scenario 2 — Lost Enquiry

1. Create an enquiry (follow Stage 1–4 above)
2. In the right sidebar, click **Mark as Lost**
3. Confirm the action

**Expected result:**
- Status badge → **"Lost"** (red)
- All action buttons disappear — terminal state, no going back
- Enquiry remains in the list with Lost status for records

---

## Scenario 3 — Standalone Event (No Enquiry)

For walk-in bookings that don't go through the enquiry process:

1. Go to `/events` → click **Create Event**
2. Fill in all details and save
3. Open the Event page → click **Costing** tab
4. The costing sheet starts **empty** — add items manually (same UI as enquiry costing)
5. Use all tabs normally (Grocery, Payments, Status)

**Expected result:**
- Costing tab works identically to an enquiry-converted event
- No "from enquiry" banner shown in Overview tab

---

## Scenario 4 — Enquiry with No Costing Items

1. Create enquiry → add dishes and a selling price in Pricing tab
2. Skip the Costing tab entirely
3. Convert to Event (Confirm & Convert)

**Expected result:**
- Event is created with `internalCost = 0`
- Event Costing tab starts empty — can be filled in later
- Grocery tab shows "No grocery items yet" empty state
- Right sidebar cost summary is hidden (only appears when cost items exist)

---

## Scenario 5 — Edit Pricing After Setting Price Quoted

1. Create enquiry → add dishes → go to Pricing tab → set a price → Save (→ Price Quoted)
2. Go back to Pricing tab
3. Change the selling price → Save again

**Expected result:**
- Price updates without changing status (stays "Price Quoted" — not re-triggered)
- Margin% re-calculates

---

## Scenario 6 — Advance Payment Edit on Event

1. On any Event → Payments tab
2. Click **Edit** next to "Advance Received"
3. Change the advance amount → Save

**Expected result:**
- `paidAmount` on the event updates to the new advance figure
- `balanceAmount` recalculates automatically

---

## Key Things to Verify

| Check | Where |
|---|---|
| "Planning" label (not "Pending") | Enquiries list page stats + filter tabs |
| "Planning" badge on PENDING enquiry | Enquiry detail page header |
| "Confirmed" badge (not "Success") | Enquiry detail page after conversion |
| Costing total = sum of all qty × rate | Costing tab footer |
| Margin% = (selling − cost) / selling × 100 | Pricing tab (enquiry) + right sidebar (event) |
| Grocery sheet only shows Grocery/Meat/Veg | Event → Grocery tab |
| Checklist saves on single click | Event → Status tab |
| Balance updates after partial payment | Event → Payments tab |
| Event totalAmount = finalPrice (not per-dish total) | Event header / Payments tab |
| Cost items copied to Event from Enquiry | Event → Costing tab after conversion |

---

## Tab Reference

### Enquiry Detail — 4 Tabs

| Tab | Purpose |
|---|---|
| Menu | Add/edit/remove dishes and services |
| Costing | Internal cost sheet (manual, not visible to client) |
| Pricing | Set final selling price, advance, payment terms |
| History | Notes and status change timeline |

### Event Detail — 6 Tabs

| Tab | Purpose |
|---|---|
| Overview | Event info and client details |
| Menu | View dishes and services (read-only from conversion) |
| Costing | Edit/add internal cost items |
| Grocery | Printable shopping list (Grocery + Meat + Veg only) |
| Payments | Track advance and balance collection |
| Status | Pre-event checklist + status change buttons |
