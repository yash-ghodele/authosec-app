# AuthoSec Mobile App

Complete React Native mobile application with Clerk authentication and dual QR transaction system.

## Features Implemented

### ✅ Authentication
- **Clerk Integration**: Full authentication with email/password
- **Sign In/Sign Up**: Complete flows with email verification
- **Protected Routes**: Auto-redirect based on auth state
- **Secure Token Storage**: Uses expo-secure-store

### ✅ Main Screens
- **Home**: Dashboard with quick actions and transaction overview
- **Transactions**: List view with empty state
- **Profile**: User profile with settings and sign-out

### ✅ Transaction Flow
- **Initiate Transaction**: Form to start new payment
- **QR Scanner**: Camera-based QR code scanning with permissions
- **Navigation**: Modal-based transaction screens

## Tech Stack

- **Framework**: Expo 54 / React Native 0.81
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Clerk Expo SDK
- **Camera**: expo-camera for QR scanning
- **State Management**: React hooks
- **Styling**: StyleSheet API with dark theme

## Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Configure Environment**:
The `.env` file is already configured with:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk auth key
- `EXPO_PUBLIC_API_BASE_URL`: Backend API URL

3. **Run the App**:
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
app/
├── (auth)/                # Authentication screens
│   ├── sign-in.tsx       # Sign in screen
│   └── sign-up.tsx       # Sign up with email verification
├── (tabs)/               # Main tab navigation
│   ├── index.tsx         # Home screen
│   ├── transactions.tsx  # Transactions list
│   └── profile.tsx       # User profile
├── transaction/          # Transaction flow
│   ├── initiate.tsx      # Start new transaction
│   ├── scan-qr1.tsx      # Scan QR code (camera)
│   └── scan-qr2.tsx      # Scan second QR
└── _layout.tsx          # Root layout with Clerk provider
```

## Key Features

### Authentication Flow
- Auto-redirect to sign-in if not authenticated
- Email verification during sign-up
- Secure session management with Clerk
- Sign out with confirmation

### Home Screen
- Personalized greeting with user's name
- Quick action cards for:
  - Initiate Transaction → Generate QR1
  - Scan QR Code → Receive payment
- Transaction statistics overview

### Transaction Initiate
- Amount input with decimal keyboard
- Receiver ID field
- Optional description
- Form validation
- Generate QR code functionality (TODO: API integration)

### QR Scanner
- Camera permission handling
- Real-time QR code detection
- Visual scan frame with corner indicators
- Scan feedback and confirmation
- TODO: Process scanned data with backend API

### Profile Screen
- User avatar with initial
- Display name and email
- Menu sections:
  - Account (Edit Profile, Company Details, Security)
  - Support (Help Center, About)
- Sign out with confirmation dialog
- App version display

## Next Steps (Backend Integration)

1. **API Service**: Create `services/api.ts` for backend calls
2. **Transaction API**: Connect initiate screen to `/api/transactions/initiate`
3. **QR Processing**: Handle QR1/QR2 scan with backend validation
4. **Transaction List**: Fetch real data from `/api/transactions`
5. **Error Handling**: Add global error boundaries
6. **Loading States**: Implement skeleton screens
7. **Offline Support**: Add async storage caching

## Environment Variables

Required in `.env`:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Testing

- Run on iOS Simulator for best dev experience
- Use Android Studio emulator for Android testing
- Physical device: Use Expo Go app or development build

## Notes

- TypeScript JSX errors in IDE are expected and resolve at runtime
- Camera permissions required for QR scanning
- Dark theme optimized for OLED screens
- All screens use consistent color palette

## Color Scheme

- Background: `#0a0e27` (Dark Navy)
- Card Background: `#1f2937` (Gray 800)
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Text: `#ffffff` / `#9ca3af`
