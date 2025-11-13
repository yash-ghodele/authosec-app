# 🔗 Mobile App Integration Guide

## Connecting Your Expo App to Next.js Backend

### Step 1: Remove Prisma from Mobile App

Since we now have a backend, remove Prisma dependencies from the mobile app:

```bash
# In the root directory (mobile app)
npm uninstall @prisma/client @prisma/react-native
```

Update `package.json` to remove Prisma-related dependencies and plugins from `app.json`.

### Step 2: Create API Service

Create an API service in your Expo app to communicate with the backend.

**File: `services/api.ts`**

```typescript
// API Configuration
const API_URL = __DEV__ 
  ? 'http://localhost:3001' // Development
  : 'https://your-production-url.vercel.app'; // Production

// API Response Type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
}

// Generic API fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// User API
export const userApi = {
  getAll: (page = 1, limit = 10) =>
    apiFetch<{ users: any[]; pagination: any }>(`/api/users?page=${page}&limit=${limit}`),
  
  getById: (id: string) =>
    apiFetch<any>(`/api/users/${id}`),
  
  create: (data: { email: string; name?: string }) =>
    apiFetch<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: { email?: string; name?: string }) =>
    apiFetch<any>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<any>(`/api/users/${id}`, {
      method: 'DELETE',
    }),
};

// Post API
export const postApi = {
  getAll: (page = 1, limit = 10, published?: boolean) => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(published !== undefined && { published: published.toString() }),
    });
    return apiFetch<{ posts: any[]; pagination: any }>(`/api/posts?${query}`);
  },
  
  getById: (id: string) =>
    apiFetch<any>(`/api/posts/${id}`),
  
  create: (data: { title: string; content?: string; authorId: string; published?: boolean }) =>
    apiFetch<any>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: { title?: string; content?: string; published?: boolean }) =>
    apiFetch<any>(`/api/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<any>(`/api/posts/${id}`, {
      method: 'DELETE',
    }),
};

// Health Check
export const healthApi = {
  check: () => apiFetch<any>('/api/health'),
};
```

### Step 3: Usage Examples

**Example 1: Fetch Users in a Component**

```typescript
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { userApi } from '@/services/api';

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll();
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.email}</Text>
        </View>
      )}
    />
  );
}
```

**Example 2: Create a New User**

```typescript
import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { userApi } from '@/services/api';

export default function CreateUserScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await userApi.create({ email, name });
      if (response.success) {
        Alert.alert('Success', 'User created!');
        setEmail('');
        setName('');
      } else {
        Alert.alert('Error', response.error || 'Failed to create user');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Create User" onPress={handleSubmit} />
    </View>
  );
}
```

### Step 4: Configure Network Access

#### For iOS Simulator
Update `ios/[YourApp]/Info.plist` to allow local network access:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

#### For Android Emulator

The `localhost:3001` URL won't work. Use your computer's IP address:

```typescript
// In services/api.ts
const API_URL = __DEV__
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3001' // Android emulator
    : 'http://localhost:3001' // iOS
  : 'https://your-production-url.vercel.app';
```

#### For Physical Devices

Find your computer's local IP address:

**Windows:**
```bash
ipconfig
# Look for IPv4 Address
```

**Mac/Linux:**
```bash
ifconfig | grep inet
```

Then update:
```typescript
const API_URL = 'http://192.168.1.XXX:3001'; // Your computer's IP
```

And update backend `.env`:
```env
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.XXX:8081
```

### Step 5: Environment Variables for Mobile

Create `.env` in mobile app root:

```env
# Development
EXPO_PUBLIC_API_URL=http://localhost:3001

# Production
# EXPO_PUBLIC_API_URL=https://your-backend.vercel.app
```

Then use in code:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
```

### Step 6: Testing the Connection

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Mobile App:**
   ```bash
   cd ..
   npm start
   ```

3. **Test Health Endpoint:**
   ```typescript
   import { healthApi } from '@/services/api';
   
   const checkConnection = async () => {
     const response = await healthApi.check();
     console.log('Backend Status:', response);
   };
   ```

### Troubleshooting

#### CORS Issues
- Make sure backend is running
- Check `ALLOWED_ORIGINS` in backend `.env`
- Verify the mobile app is using correct API URL

#### Network Issues
- iOS: Ensure `NSAllowsLocalNetworking` is set
- Android Emulator: Use `10.0.2.2` instead of `localhost`
- Physical Device: Use your computer's IP address

#### Backend Not Responding
- Check backend is running: `http://localhost:3001`
- Check database connection in backend `.env`
- Run `npm run prisma:generate` in backend

### Production Deployment

1. **Deploy Backend to Vercel:**
   ```bash
   cd backend
   vercel
   ```

2. **Update Mobile App API URL:**
   ```typescript
   const API_URL = 'https://your-backend.vercel.app';
   ```

3. **Update Backend CORS:**
   ```env
   ALLOWED_ORIGINS=https://your-app-domain.com
   ```

---

## Next Steps

1. ✅ Install dependencies in backend
2. ✅ Run Prisma migrations
3. ✅ Create API service in mobile app
4. ✅ Test connection
5. ✅ Build your features!

For questions, check the backend `README.md` or Next.js API routes documentation.
