# Expo and React Native Tutorial with FastAPI Backend

এই note-টা Expo + React Native শেখার জন্য। Backend হিসেবে ধরা হয়েছে **FastAPI**।

Main goal:

```txt
React Native app কীভাবে কাজ করে বুঝা
Expo কেন ব্যবহার করছি বুঝা
কোন component কেন ব্যবহার করছি বুঝা
Mobile app থেকে FastAPI backend call করা
Auth, navigation, storage, API, UI structure clean রাখা
```

Learning mindset:

```txt
প্রথমে mobile app mental model
তারপর Expo setup
তারপর core components
তারপর navigation
তারপর FastAPI API connection
তারপর auth/storage
তারপর production/build idea
```

<a id="index"></a>

## Index

<!-- tutorial-index:start -->
- [01. Big Picture: Expo, React Native, FastAPI](#section-1)
- [02. React Native কীভাবে Web React থেকে আলাদা](#section-2)
- [03. Expo কেন ব্যবহার করবো](#section-3)
- [04. Project Setup এবং Run Command](#section-4)
- [05. Folder Structure: Book-এর chapter-এর মতো সাজানো](#section-5)
- [06. Expo Router: File-Based Mobile Routing](#section-6)
- [07. Core Components: View, Text, Image, Pressable](#section-7)
- [08. Styling, Flexbox এবং Responsive Layout](#section-8)
- [09. Screen, Component, Hook, Service Layer](#section-9)
- [10. State Management: Local State, Context, Zustand](#section-10)
- [11. Form Handling: TextInput, Validation, Keyboard](#section-11)
- [12. Environment Variables এবং API Base URL](#section-12)
- [13. FastAPI Connection: Fetch/Axios Service Layer](#section-13)
- [14. Auth Flow: Login, Token, SecureStore](#section-14)
- [15. Protected Routes এবং Role-Based Screens](#section-15)
- [16. Lists, Refresh, Pagination এবং FlatList](#section-16)
- [17. Image, File Upload এবং Permissions](#section-17)
- [18. Loading, Error, Empty State এবং Offline Thinking](#section-18)
- [19. Platform Difference: Android, iOS, Web](#section-19)
- [20. Expo Native APIs: Camera, Location, Notifications](#section-20)
- [21. Build, Preview, EAS এবং App Store Thinking](#section-21)
- [22. Development Rules, Checklist এবং Summary](#section-22)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## 01. Big Picture: Expo, React Native, FastAPI

Mobile app-এর full-stack flow:

```txt
User phone
  -> Expo / React Native app
  -> Screen
  -> Component
  -> Hook
  -> Service function
  -> Fetch / Axios
  -> FastAPI backend
  -> Database / auth / business logic
```

Simple responsibility:

| Layer | কাজ |
|---|---|
| React Native | Native mobile UI বানায় |
| Expo | React Native app develop/build সহজ করে |
| Expo Router | screen navigation organize করে |
| FastAPI | real backend logic, auth, validation, database |
| SecureStore | token/local secret safely store করতে help করে |

Important idea:

```txt
React Native app browser না।
এটা native app, কিন্তু JavaScript/React দিয়ে লেখা।
```

FastAPI backend-এর সাথে mobile app-এর relation:

```txt
Mobile app শুধু UI আর interaction handle করবে।
FastAPI real validation, auth, role, database, permission handle করবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. React Native কীভাবে Web React থেকে আলাদা

Web React:

```tsx
<div>
  <p>Hello</p>
  <button>Click</button>
</div>
```

React Native:

```tsx
import { View, Text, Pressable } from "react-native";

export function HelloCard() {
  return (
    <View>
      <Text>Hello</Text>
      <Pressable>
        <Text>Click</Text>
      </Pressable>
    </View>
  );
}
```

Mapping:

| Web | React Native |
|---|---|
| `div` | `View` |
| `p`, `span`, `h1` | `Text` |
| `img` | `Image` |
| `input` | `TextInput` |
| `button` | `Pressable` বা `Button` |
| CSS file | `StyleSheet` বা style object |

Important:

```txt
React Native-এ normal HTML tag use করা যায় না।
সব text অবশ্যই Text component-এর ভিতরে থাকতে হবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. Expo কেন ব্যবহার করবো

Expo হলো React Native-এর উপর একটা developer-friendly framework/toolchain।

Expo helps with:

```txt
Project create
Development server
Expo Go preview
File-based routing
Native modules
App config
Build and submit
OTA update
```

কেন beginner/production app-এ Expo useful:

| Need | Expo কীভাবে help করে |
|---|---|
| দ্রুত project শুরু | `create-expo-app` |
| phone-এ test | Expo Go / development build |
| navigation | Expo Router |
| camera/location/storage | Expo SDK modules |
| Android/iOS build | EAS Build |
| app update | EAS Update |

Decision:

```txt
New React Native app হলে Expo দিয়ে শুরু করা practical।
যদি custom native code খুব বেশি লাগে, তখন development build/CNG/native config ভাববো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Project Setup এবং Run Command

Node.js LTS install থাকতে হবে।

Create project:

```bash
npx create-expo-app@latest --template default@sdk-56
cd my-app
```

Run:

```bash
npx expo start
```

Terminal থেকে:

```txt
Android emulator -> press A
iOS simulator    -> press I
Web browser      -> press W
Phone            -> scan QR with Expo Go / development build
```

Useful packages:

```bash
npx expo install expo-secure-store
npm install axios zod zustand @tanstack/react-query
```

কোন package কেন:

| Package | কাজ |
|---|---|
| `expo` | Expo framework/tooling |
| `expo-router` | file-based navigation |
| `react-native` | native UI components |
| `expo-secure-store` | token/secret local secure storage |
| `axios` | FastAPI API call client |
| `zod` | frontend form validation |
| `zustand` | global app state |
| `@tanstack/react-query` | API data cache/loading/refetch |

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. Folder Structure: Book-এর chapter-এর মতো সাজানো

Recommended structure:

```txt
my-app/
  app/
    _layout.tsx
    index.tsx
    (auth)/
      login.tsx
      register.tsx
    (protected)/
      _layout.tsx
      home.tsx
      profile.tsx
      admin/
        dashboard.tsx

  src/
    components/
      ui/
      layout/
      common/

    features/
      auth/
        components/
        hooks/
        services/
        schemas/
        types/
      users/
        components/
        hooks/
        services/
        types/

    lib/
      api.ts
      queryClient.ts

    store/
      authStore.ts

    constants/
      routes.ts

    theme/
      colors.ts
      spacing.ts

  assets/
    images/
    icons/

  .env
  app.json
  package.json
```

Meaning:

```txt
app/        -> screens/routes
src/components -> reusable UI
src/features   -> feature-wise code
src/lib        -> API client/common setup
src/store      -> global state
src/theme      -> colors/spacing/design tokens
assets/        -> image/icon/font
```

Rule:

```txt
Screen route app/ folder-এ
Feature logic src/features/ folder-এ
Reusable UI src/components/ folder-এ
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. Expo Router: File-Based Mobile Routing

Expo Router file-based routing use করে। `app/` folder-এর file route/screen হয়ে যায়।

Example:

```txt
app/index.tsx              -> /
app/(auth)/login.tsx       -> /login
app/(protected)/home.tsx   -> /home
app/users/[id].tsx         -> /users/123
```

`_layout.tsx`:

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
```

Route group:

```txt
(auth) এবং (protected) URL path-এ আসে না।
এগুলো শুধু screen organize করতে use হয়।
```

Navigate:

```tsx
import { router } from "expo-router";

router.push("/home");
router.replace("/login");
router.back();
```

Link:

```tsx
import { Link } from "expo-router";

export function LoginLink() {
  return <Link href="/login">Login</Link>;
}
```

কেন Expo Router:

```txt
Next.js App Router-এর মতো mental model
File দেখে route বুঝা যায়
Deep link/shareable route easier
Large app organize করা সহজ
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Core Components: View, Text, Image, Pressable

React Native core components:

| Component | কাজ |
|---|---|
| `View` | layout/container |
| `Text` | text দেখায় |
| `Image` | image দেখায় |
| `TextInput` | user input নেয় |
| `Pressable` | touch/click handle করে |
| `ScrollView` | small scrollable content |
| `FlatList` | long performant list |
| `ActivityIndicator` | loading spinner |
| `Modal` | overlay/modal |
| `StatusBar` | status bar control |

Example:

```tsx
import { View, Text, Pressable, StyleSheet } from "react-native";

export function WelcomeCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Welcome</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  button: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#2563eb",
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
  },
});
```

Important:

```txt
Text ছাড়া raw string render করবো না।
Long list হলে ScrollView না, FlatList use করবো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Styling, Flexbox এবং Responsive Layout

React Native styling CSS-এর মতো, কিন্তু সব CSS property support করে না।

Common style:

```tsx
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
```

Flexbox:

```txt
flex: 1             -> available space fill করে
flexDirection: row  -> horizontal layout
alignItems          -> cross-axis alignment
justifyContent      -> main-axis alignment
gap                 -> spacing between children
```

Responsive thinking:

```txt
Fixed pixel width কম use করবো
flex ব্যবহার করবো
percentage/dimensions carefully use করবো
Safe area maintain করবো
keyboard overlap handle করবো
```

Safe area:

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>;
}
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Screen, Component, Hook, Service Layer

Mobile app clean রাখতে layer আলাদা করবো।

```txt
Screen    = route/screen compose করে
Component = UI part দেখায়
Hook      = behavior/loading/error/state logic
Service   = FastAPI API call
Store     = global auth/user/UI state
```

Example flow:

```txt
app/(auth)/login.tsx
  -> LoginForm.tsx
  -> useLogin.ts
  -> authService.ts
  -> lib/api.ts
  -> FastAPI /api/v1/auth/login
```

Bad:

```txt
login.tsx file-এ UI + validation + API call + token save + navigation সব রাখা
```

Good:

```txt
Screen route compose করবে
Component UI দেখাবে
Hook submit/loading/error manage করবে
Service API call করবে
FastAPI auth করবে
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. State Management: Local State, Context, Zustand

State তিনভাবে ভাববো:

| State type | কোথায় রাখবো |
|---|---|
| এক component-এর input/loading | `useState` |
| screen subtree-এর shared value | Context |
| app-wide auth/theme/sidebar state | Zustand |
| backend/server data | React Query |

Local state:

```tsx
const [email, setEmail] = useState("");
```

Zustand auth store:

```ts
import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));
```

Rule:

```txt
Backend data cache করতে React Query
Frontend global state রাখতে Zustand
Single form input রাখতে useState
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Form Handling: TextInput, Validation, Keyboard

Basic login form:

```tsx
import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    // hook/service call হবে
  }

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <Pressable onPress={handleSubmit}>
        <Text>Login</Text>
      </Pressable>
    </View>
  );
}
```

Zod validation:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

Keyboard issue:

```txt
Mobile app-এ keyboard screen ঢেকে ফেলতে পারে।
Form screen-এ KeyboardAvoidingView / ScrollView ভাবতে হবে।
```

Important:

```txt
Zod frontend user experience ভালো করে।
FastAPI Pydantic backend real validation করে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. Environment Variables এবং API Base URL

Expo public env variable prefix:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8000/api/v1
```

Use:

```ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
```

Local backend URL depends on device:

| Running app | API base URL idea |
|---|---|
| Physical phone with Expo Go | computer LAN IP, e.g. `http://192.168.1.10:8000/api/v1` |
| Android emulator | often `http://10.0.2.2:8000/api/v1` |
| iOS simulator | often `http://localhost:8000/api/v1` |
| Web | `http://localhost:8000/api/v1` |

Important:

```txt
Phone-এর localhost মানে phone নিজে।
Computer backend call করতে phone থেকে computer LAN IP use করতে হবে।
```

Security:

```txt
EXPO_PUBLIC_ variable compiled app-এর ভিতরে visible থাকে।
Secret/private key এখানে রাখবো না।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. FastAPI Connection: Fetch/Axios Service Layer

API client:

```txt
src/lib/api.ts
```

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Service:

```txt
src/features/auth/services/authService.ts
```

```ts
import { api } from "@/src/lib/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: {
    id: number;
    email: string;
    role: "admin" | "teacher" | "student";
  };
};

export async function loginUser(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}
```

Fetch alternative:

```ts
export async function getUsers() {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json();
}
```

Important mobile networking note:

```txt
Native mobile app browser না, তাই native app-এ browser CORS concept থাকে না।
কিন্তু Expo web build হলে browser CORS লাগবে।
FastAPI CORS রাখা ভালো, কারণ web/admin/frontend থাকতেও পারে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. Auth Flow: Login, Token, SecureStore

Mobile auth flow:

```txt
Login screen
  -> FastAPI POST /auth/login
  -> access_token response
  -> SecureStore-এ token save
  -> auth store update
  -> protected screen redirect
```

Install SecureStore:

```bash
npx expo install expo-secure-store
```

Token storage helper:

```ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "access_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

Attach token:

```ts
import { getToken } from "@/src/features/auth/services/tokenStorage";

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Important:

```txt
Token সাধারণ AsyncStorage-এ না রেখে SecureStore-এ রাখা ভালো।
FastAPI backend token verify করবে।
Frontend token থাকা মানেই security complete না।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Protected Routes এবং Role-Based Screens

Protected route idea:

```txt
token নেই -> login screen
token আছে -> protected app screens
role admin -> admin screens
role student -> student screens
```

Expo Router protected layout:

```tsx
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/authStore";

export default function ProtectedLayout() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Stack />;
}
```

Role guard idea:

```tsx
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/authStore";

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "admin") {
    return <Redirect href="/home" />;
  }

  return <Stack />;
}
```

Important:

```txt
Expo route guard = app UX
FastAPI role/permission check = real security
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Lists, Refresh, Pagination এবং FlatList

Long list হলে `FlatList` use করবো।

```tsx
import { FlatList, Text, View } from "react-native";

type User = {
  id: number;
  name: string;
};

export function UsersList({ users }: { users: User[] }) {
  return (
    <FlatList
      data={users}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}
```

Why FlatList:

```txt
Long list performant হয়
সব item একসাথে render করে না
pull-to-refresh/pagination handle করা যায়
```

React Query with list:

```tsx
const { data, isLoading, refetch, isRefetching } = useQuery({
  queryKey: ["users"],
  queryFn: getUsers,
});
```

FlatList refresh:

```tsx
<FlatList
  data={data ?? []}
  refreshing={isRefetching}
  onRefresh={refetch}
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Image, File Upload এবং Permissions

Image দেখানো:

```tsx
import { Image } from "react-native";

export function Avatar() {
  return (
    <Image
      source={{ uri: "https://example.com/avatar.png" }}
      style={{ width: 80, height: 80, borderRadius: 40 }}
    />
  );
}
```

Image picker:

```bash
npx expo install expo-image-picker
```

Basic idea:

```ts
import * as ImagePicker from "expo-image-picker";

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0];
  }

  return null;
}
```

Upload to FastAPI:

```ts
export async function uploadAvatar(uri: string) {
  const formData = new FormData();

  formData.append("file", {
    uri,
    name: "avatar.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
```

Important:

```txt
Camera/gallery/location use করলে permission দরকার হতে পারে।
FastAPI backend file type/size/security validate করবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. Loading, Error, Empty State এবং Offline Thinking

Mobile app-এ network unstable হতে পারে। তাই UI states clear রাখতে হবে।

Common states:

```txt
loading
success
error
empty
refreshing
offline
unauthorized
```

Example:

```tsx
if (isLoading) {
  return <ActivityIndicator />;
}

if (error) {
  return <Text>Something went wrong</Text>;
}

if (!data?.length) {
  return <Text>No data found</Text>;
}
```

Rules:

```txt
API call মানেই loading state লাগবে।
Error হলে retry option ভালো।
List empty হলে blank screen রাখবো না।
Mobile network fail হতে পারে, সেটা normal ভাববো।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. Platform Difference: Android, iOS, Web

React Native same code দিয়ে Android/iOS app বানায়, কিন্তু সব behavior এক না।

Differences:

| Topic | Android | iOS | Web |
|---|---|---|---|
| Back button | hardware back আছে | নেই | browser back |
| Permission | Android permission model | iOS permission prompt | browser permission |
| File path | Android URI behavior আলাদা | iOS URI behavior আলাদা | File API |
| HTTP local API | emulator special host লাগতে পারে | simulator localhost কাজ করতে পারে | browser CORS লাগে |
| Status bar | Android/iOS আলাদা control | Android/iOS আলাদা control | browser |

Platform code:

```ts
import { Platform } from "react-native";

const shadowStyle =
  Platform.OS === "ios"
    ? { shadowOpacity: 0.2, shadowRadius: 8 }
    : { elevation: 4 };
```

Rule:

```txt
Design একই হতে পারে, কিন্তু platform behavior test করতেই হবে।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Expo Native APIs: Camera, Location, Notifications

Expo SDK অনেক native API দেয়।

Common APIs:

| API | Use case |
|---|---|
| Camera | ছবি/ভিডিও capture |
| ImagePicker | gallery/camera থেকে image pick |
| Location | GPS/location |
| Notifications | push/local notification |
| SecureStore | token/secret storage |
| FileSystem | local file operation |
| Haptics | touch feedback |
| LocalAuthentication | biometric auth |

Pattern:

```txt
Install module
Ask permission
Call API
Handle denied permission
Send result to FastAPI if needed
```

Permission thinking:

```txt
User permission না দিলে app crash করবে না।
Friendly message দেখাবো।
Settings থেকে permission enable করার পথ বলবো।
```

Important:

```txt
Native API add করলে Expo Go-তে সবসময় enough নাও হতে পারে।
Complex/native config দরকার হলে development build use করতে হয়।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Build, Preview, EAS এবং App Store Thinking

Development:

```txt
npx expo start
Expo Go / development build
```

Production thinking:

```txt
App icon
Splash screen
Bundle identifier/package name
Permissions text
API production URL
Error tracking
App signing
Store screenshots
Privacy policy
```

EAS:

```txt
EAS Build  -> Android/iOS app binary build
EAS Submit -> App Store / Play Store submit
EAS Update -> OTA JavaScript update
```

Build mindset:

```txt
Development app আর production app আলাদা config রাখবে।
Production API URL আলাদা হবে।
Secret কখনও app bundle-এ রাখবো না।
```

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Development Rules, Checklist এবং Summary

Rules:

1. React Native-এ HTML tag use করবো না; `View`, `Text`, `Image`, `Pressable` use করবো।
2. Long list হলে `FlatList` use করবো।
3. Screen route `app/` folder-এ রাখবো।
4. Feature code `src/features/<feature>/` folder-এ রাখবো।
5. API call `services/` folder-এ রাখবো।
6. Loading/error logic hook-এ রাখবো।
7. Token `expo-secure-store`-এ রাখবো।
8. FastAPI backend token/role verify করবে।
9. `EXPO_PUBLIC_` env variable-এ secret রাখবো না।
10. Phone থেকে backend call করতে computer LAN IP লাগতে পারে।
11. Native app CORS follow করে না, কিন্তু Expo web/FastAPI integration-এর জন্য CORS বুঝবো।
12. Permission denied state handle করবো।
13. Keyboard overlap form screen-এ test করবো।
14. Android/iOS দুই platform-এ UI test করবো।
15. SecureStore app data-এর single source of truth না; backend source of truth।
16. API data cache করতে React Query use করবো।
17. Global frontend state রাখতে Zustand use করবো।
18. Production build-এর আগে app icon/splash/env/permission config check করবো।

Final memory:

```txt
Expo        -> React Native app development/build সহজ করে
React Native -> native mobile UI
Expo Router -> file-based screen navigation
View/Text   -> mobile UI building blocks
Service     -> FastAPI API call
Hook        -> loading/error/submit logic
SecureStore -> token storage
FastAPI     -> real backend validation/security/database
```

Official references:

- Expo create project: https://docs.expo.dev/get-started/create-a-project/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo environment variables: https://docs.expo.dev/guides/environment-variables/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- React Native core components: https://reactnative.dev/docs/components-and-apis
- React Native networking: https://reactnative.dev/docs/network

এই sequence follow করলে Expo + React Native শেখা একটা book-এর মতো হবে: আগে concept, তারপর UI building blocks, তারপর routing, তারপর FastAPI API connection, তারপর auth/storage, তারপর production thinking।

<!-- tutorial-nav:back -->
[Back to Index](#index)
