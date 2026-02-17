# 🍽️ Catering Management System

**A complete, production-ready catering business management application**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-teal)](https://www.prisma.io/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-success)]()

---

## ✨ Features

### 🏠 Dashboard
- Real-time statistics (Orders, Cash Income, Enquiries)
- Upcoming events list
- Todo management
- Quick enquiry creation

### 📋 Enquiry Management
- Create quotations with auto-numbering
- Add dishes and services
- Track status (Pending/Lost/Success)
- Update history tracking
- Auto-conversion to events

### 📅 Event Management
- Local Orders (small orders)
- Main Events (full catering events)
- Financial tracking (Total/Paid/Balance)
- **Invoice generation (PDF)** ✅
- Grocery purchase list
- **Bulk upload via Excel** ✅

### 🍽️ Dishes & Menu
- Complete dish catalog
- Cost vs. Selling price analysis
- Profit margin calculation
- Ingredient management
- Veg/Non-veg classification
- **Bulk upload via Excel** ✅

### 💰 Expense Tracking
- Event-based expense tracking
- Multiple categories (Delivery, Manpower, etc.)
- Excel-like interface
- Expense reports

### 👥 User Management
- Super Admin with full access
- Manager with custom permissions
- Page-level access control
- Feature-level permissions

### 🔐 Authentication **NEW!** ✅
- Secure login/logout
- Password hashing (bcrypt)
- Protected routes
- Role-based access control
- Session management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Create database
psql postgres
CREATE DATABASE catering_app;
\q

# 3. Configure environment
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/catering_app"' > .env

# 4. Run migrations
npx prisma generate
npx prisma db push

# 5. Seed database (creates admin user + sample data)
npm run db:seed

# 6. Start application
npm run dev
```

### Login
Visit **http://localhost:3000**

**Default credentials:**
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Change password after first login!**

---

## 🛠️ Tech Stack

**Frontend:** Next.js 16, TypeScript, Tailwind CSS
**Backend:** Next.js Server Actions, Prisma ORM
**Database:** PostgreSQL 15
**Auth:** Custom (JWT-ready), bcrypt
**Files:** xlsx (Excel), jsPDF (PDF)

---

## 📚 Documentation

Comprehensive guides available:

- **[AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)** - Authentication system
- **[BULK_UPLOAD_GUIDE.md](BULK_UPLOAD_GUIDE.md)** - Excel bulk upload
- **[FEATURE_VERIFICATION.md](FEATURE_VERIFICATION.md)** - Feature checklist
- **[FINAL_STATUS.md](FINAL_STATUS.md)** - Project status

---

## 📁 Project Structure

```
src/
├── app/                # Next.js pages
│   ├── page.tsx        # Dashboard
│   ├── login/          # Authentication
│   ├── events/         # Event management
│   ├── dishes/         # Dish catalog
│   └── settings/       # Settings
├── components/         # UI components
├── contexts/           # React contexts (Auth)
└── lib/
    ├── actions/        # Server actions
    └── prisma.ts       # Database client
```

---

## 🔒 Security

✅ Password hashing (bcrypt, 10 rounds)
✅ Protected routes
✅ Role-based access control
✅ Session management
✅ Secure password verification

**Production recommendations:**
- Upgrade to NextAuth.js for JWT
- Enable HTTPS
- Add rate limiting
- Implement CSRF protection

---

## 🗄️ Database

**16 models** including:
- User (auth & permissions)
- Enquiry (quotations)
- Event (orders & catering)
- Dish (menu with ingredients)
- Invoice (PDF generation)
- Expense, GroceryPurchase, Todo, etc.

**Full schema:** `prisma/schema.prisma`

---

## 🎯 Key Workflows

### Enquiry → Event
```
Create Enquiry → Add Items → Mark Success → Auto-convert to Event → Download Invoice
```

### Bulk Upload
```
Download Template → Fill Data → Validate → Upload → Success!
```

### User Management
```
Super Admin → Create Manager → Set Permissions → Manager Login → Restricted Access
```

---

## 🧪 Testing Checklist

- [ ] Login/Logout
- [ ] Create enquiry
- [ ] Convert to event
- [ ] Download invoice
- [ ] Bulk upload (events/dishes)
- [ ] Create manager
- [ ] Test permissions

---

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://..."
```

### Build
```bash
npm run build
npm start
```

### Vercel
1. Push to GitHub
2. Import to Vercel
3. Add DATABASE_URL
4. Deploy!

---

## 📊 Features Status

| Feature | Status |
|---------|--------|
| Dashboard | ✅ Complete |
| Enquiries | ✅ Complete |
| Events | ✅ Complete |
| Invoices (PDF) | ✅ Complete |
| Dishes | ✅ Complete |
| Bulk Upload | ✅ Complete |
| Expenses | ✅ Complete |
| Users | ✅ Complete |
| Authentication | ✅ Complete |
| Password Security | ✅ Complete |

**Status:** 100% Complete 🎉

---

## 💡 What's Next?

### Planned Enhancements
- Email notifications
- Advanced reporting
- Multi-currency
- Mobile app
- Calendar integration
- Payment gateway
- WhatsApp integration

---

## 📞 Support

For support, refer to documentation files or open an issue.

---

## 📝 License

MIT License - See LICENSE file

---

**Built with ❤️ for the catering industry**

⭐ Star this repo if you find it helpful!

---

## 🎁 Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:seed      # Seed database with admin
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client

# Other
npm run lint         # Run ESLint
```

---

**Ready to manage your catering business? Get started in 5 minutes! 🚀**
