# K - Full Stack Mobile App 🚀

A full-stack mobile application with **Expo React Native** frontend and **Next.js** backend.

## � Project Overview

This project consists of two main parts:

1. **Mobile App** (Expo React Native) - iOS, Android, and Web
2. **Backend API** (Next.js + Prisma + PostgreSQL) - RESTful API server

```
┌─────────────────┐
│   Mobile App    │  ← Expo React Native + TypeScript
│   (Expo)        │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │  ← Next.js + Prisma ORM
│   (Next.js)     │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │  ← Supabase Database
│   (Supabase)    │
└─────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)

```powershell
# Setup and start backend
.\backend\setup.ps1
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:push

# Start development server
npm run dev
```

Backend will run on: **http://localhost:3001**

#### Mobile App Setup

```bash
# In root directory
npm install

# Start Expo dev server
npm start
```

Choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

## 📁 Project Structure

```
k/
├── backend/                 # Next.js Backend API
│   ├── src/
│   │   ├── app/api/        # API Routes
│   │   └── lib/            # Utilities
│   ├── prisma/             # Database Schema
│   └── README.md           # Backend Documentation
│
├── app/                    # Expo App (Mobile)
│   ├── (tabs)/            # Tab Navigation
│   └── _layout.tsx        # Root Layout
│
├── services/              # API Client
│   └── api.ts            # Backend API Integration
│
├── components/           # UI Components
├── constants/           # Theme & Constants
└── hooks/              # React Hooks
```

## 📡 API Endpoints

The backend provides the following RESTful API endpoints:

### Health Check
- `GET /api/health` - Check API status

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Posts
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

## 🔧 Tech Stack

### Mobile App
- **Framework**: Expo SDK ~54
- **UI**: React Native 0.81.5
- **Navigation**: Expo Router 6.0
- **Language**: TypeScript 5.9
- **State Management**: React Hooks

### Backend
- **Framework**: Next.js 15
- **ORM**: Prisma 6.19
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod
- **Language**: TypeScript 5.9

## 📱 Using the API in Mobile App

```typescript
import { userApi, postApi } from '@/services/api';

// Fetch users
const response = await userApi.getAll();
if (response.success) {
  console.log(response.data.users);
}

// Create a post
const post = await postApi.create({
  title: 'My Post',
  content: 'Post content',
  authorId: 'user-id',
});
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="your_supabase_connection_url"
DIRECT_URL="your_supabase_direct_url"
PORT=3001
ALLOWED_ORIGINS=http://localhost:8081
```

### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Documentation

- **[CODE_ANALYSIS.md](./CODE_ANALYSIS.md)** - Complete code analysis and architecture
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - How to connect mobile app to backend
- **[backend/README.md](./backend/README.md)** - Backend API documentation

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
```

### Mobile Development

```bash
npm start               # Start Expo dev server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web          # Run on web
```

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/api/health

# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## 🚀 Deployment

### Backend (Vercel)

```bash
cd backend
vercel
```

### Mobile App

```bash
# Build for production
eas build --platform all

# Submit to stores
eas submit
```

## 📖 Learn More

### Expo Resources
- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

### Next.js Resources
- [Next.js documentation](https://nextjs.org/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma documentation](https://www.prisma.io/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

---

Built with ❤️ using Expo, Next.js, and Prisma
