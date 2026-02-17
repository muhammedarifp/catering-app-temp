#!/bin/bash

echo "🐳 Starting PostgreSQL in Docker..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Creating database tables..."
npx prisma db push

echo "🌱 Seeding initial data..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "🚀 Start the application:"
echo "   npm run dev"
echo ""
echo "🔐 Login credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📊 Open Prisma Studio (optional):"
echo "   npx prisma studio"
