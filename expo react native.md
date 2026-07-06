# Expo and React Native Tutorial with FastAPI Backend

এই note-টা Expo + React Native শেখার জন্য। Backend হিসেবে ধরা হয়েছে **FastAPI**।

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
- [21. Emulator না থাকলে কীভাবে Run/Test করবো](#section-21)
- [22. Web Preview vs WebView: কোনটা কোন জিনিস](#section-22)
- [23. Expo Account, EAS CLI এবং Project Configure](#section-23)
- [24. Build-এর আগে Project Validate: Expo Doctor](#section-24)
- [25. APK File কীভাবে পাবো](#section-25)
- [26. Build, Preview, EAS এবং App Store Thinking](#section-26)
- [27. Development Rules, Checklist এবং Summary](#section-27)
<!-- tutorial-index:end -->

---

<a id="section-1"></a>

## 01. Big Picture: Expo, React Native, FastAPI

> 🎯 **এই section-এ বুঝব:** মোবাইল অ্যাপের পুরো ছবিটা — Expo, React Native, আর FastAPI মিলে কীভাবে একটা অ্যাপ বানায়, আর কে কোন কাজটা করে। (কোনো code মুখস্থ না, শুধু পুরো ম্যাপটা মাথায় বসাব।)

### 📱 আগে একটা গল্প

ভাবো একটা রেস্টুরেন্ট। **React Native** হলো রাঁধুনি — এক রেসিপি লিখলেই সে iOS আর Android দুই রকম প্লেটে খাবার সাজিয়ে দেয়। **Expo** হলো রেডিমেড রান্নাঘর আর টুলবক্স — চুলা, ওভেন, বাসন সব আগে থেকে সাজানো, ঢুকেই কাজ শুরু। আর **FastAPI** হলো পেছনের ম্যানেজার আর গুদাম — হিসাব, স্টক, নিয়ম, কে ঢুকতে পারবে সব সে সামলায়।

ফোনের অ্যাপটা আসলে **waiter** — অর্ডার নেয়, খাবার সাজিয়ে দেখায়। কিন্তু আসল রান্না আর হিসাব পেছনে (backend-এ) হয়।

### কেন এভাবে ভাগ করা?

অ্যাপ (UI) আর backend (logic) আলাদা রাখলে দুটো সুবিধা: সব গুরুত্বপূর্ণ যাচাই আর নিয়ম এক জায়গায় (FastAPI-তে) থাকে, আর অ্যাপ হালকা থাকে — শুধু দেখায় আর ছুঁলে সাড়া দেয়। waiter যদি নিজেই হিসাব করত, প্রতিটা টেবিলে ভুল হতো।

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
| React Native | Native mobile UI বানায় |
| Expo | React Native app develop/build সহজ করে |
| Expo Router | screen navigation organize করে |
| FastAPI | real backend logic, auth, validation, database |
| SecureStore | token/local secret safely store করতে help করে |

Important idea:

```txt
React Native app browser না।
এটা native app, কিন্তু JavaScript/React দিয়ে লেখা।
```

FastAPI backend-এর সাথে mobile app-এর relation:

```txt
Mobile app শুধু UI আর interaction handle করবে।
FastAPI real validation, auth, role, database, permission handle করবে।
```

> 🧠 **মনে রাখার ট্রিক:** অ্যাপ = waiter (দেখায় ও অর্ডার নেয়), FastAPI = kitchen + manager (আসল কাজ)। React Native রাঁধে, Expo রান্নাঘর দেয়।

> ✅ **নিজেকে যাচাই করো:** কোনো login সত্যিই বৈধ কিনা — এর চূড়ান্ত সিদ্ধান্ত কে নেয়, mobile app না FastAPI?
> <details><summary>উত্তর দেখো</summary>
> FastAPI। অ্যাপ শুধু UI দেখায় আর সুবিধার জন্য একটু চেক করে; আসল যাচাই সবসময় backend-এ হয়, কারণ অ্যাপকে user বদলে ফেলতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-2"></a>

## 02. React Native কীভাবে Web React থেকে আলাদা

> 🎯 **এই section-এ বুঝব:** কেন web-এর `div`/`p`/`button` সরাসরি চলে না, আর কোন web tag-এর বদলে কোন React Native component ব্যবহার করি।

### 🗣️ আগে একটা গল্প

ভাবো তুমি বাংলায় দারুণ কথা বলো (Web React)। এখন জাপানে গিয়ে জাপানি ভাষায় বলতে হবে (React Native)। ভাবটা (React-এর logic) একই, কিন্তু **শব্দগুলো আলাদা** — `div`-এর বদলে বলতে হবে `View`, `p`-এর বদলে `Text`। component হলো ঘর সাজানোর ইট; শুধু ইটের নাম দেশভেদে বদলায়।

### কেন আলাদা শব্দ?

ফোনের ভিতরে HTML বলে কিছু নেই — সেখানে native widget থাকে। React Native তাই তোমার লেখা `View`/`Text`-কে সরাসরি native widget-এ অনুবাদ করে। HTML tag চিনবেই না।

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
React Native-এ normal HTML tag use করা যায় না।
সব text অবশ্যই Text component-এর ভিতরে থাকতে হবে।
```

> 🧠 **মনে রাখার ট্রিক:** "div→View, p→Text, img→Image, input→TextInput"। আর সোনালি নিয়ম: সব লেখা অবশ্যই `Text`-এর ভিতরে, নাহলে অ্যাপ crash করবে।

> ✅ **নিজেকে যাচাই করো:** `<View>Hello</View>` — এটা কি চলবে?
> <details><summary>উত্তর দেখো</summary>
> না। raw text সরাসরি `View`-তে দেওয়া যায় না; লিখতে হবে `<View><Text>Hello</Text></View>`।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-3"></a>

## 03. Expo কেন ব্যবহার করবো

> 🎯 **এই section-এ বুঝব:** Expo আসলে কী কী দেয়, আর কেন খালি React Native-এর বদলে Expo দিয়ে শুরু করা সহজ।

### 🧰 আগে একটা গল্প

খালি React Native = একটা খালি ফ্ল্যাট — নিজে ওভেন, চুলা, পানির লাইন সব লাগাতে হবে, তারপর রান্না। **Expo** = আগে থেকে সাজানো রান্নাঘর আর টুলবক্স — ঢুকেই রান্না শুরু। যন্ত্রণার setup Expo আগেই করে রেখেছে।

### কেন Expo দিয়ে শুরু?

Project তৈরি, dev server, ফোনে preview, navigation, camera/storage-এর মতো native module, build — এসবের জটিলতা Expo অনেক কমিয়ে দেয়। তাই beginner থেকে অনেক production অ্যাপও Expo দিয়ে শুরু করে। খুব বেশি custom native code লাগলে তখন development build-এর কথা ভাবি।

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
New React Native app হলে Expo দিয়ে শুরু করা practical।
যদি custom native code খুব বেশি লাগে, তখন development build/CNG/native config ভাববো।
```

> 🧠 **মনে রাখার ট্রিক:** Expo = "ব্যাটারি সহ" React Native — box খুলেই কাজ শুরু, আলাদা করে যন্ত্র কিনতে হয় না।

> ✅ **নিজেকে যাচাই করো:** কখন খালি React Native বা development build লাগতে পারে?
> <details><summary>উত্তর দেখো</summary>
> যখন এমন custom native code দরকার যা Expo Go-তে নেই। সাধারণ অ্যাপে Expo-ই যথেষ্ট।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-4"></a>

## 04. Project Setup এবং Run Command

> 🎯 **এই section-এ বুঝব:** নতুন Expo project কীভাবে বানাব, চালাব, আর কোন package কেন লাগে।

### 🏗️ আগে একটা গল্প

`create-expo-app` = জমিতে রেডিমেড বাড়ির কাঠামো বসিয়ে দেওয়া। `expo start` = সেই বাড়ির লাইট জ্বালানো। ফোনে QR scan = সেই বাড়ির দরজা খুলে ভিতরে ঢোকা। আর প্রতিটা package = toolbox-এর আলাদা আলাদা যন্ত্র, একেকটার একেক কাজ।

### কেন আগেই package চিনব?

প্রতিটা package-এর আলাদা দায়িত্ব। শুরুতেই কে কী করে বুঝে নিলে পরে code পড়তে গিয়ে গুলিয়ে যাবে না — যেমন axios কার সাথে কথা বলে, zustand কী মনে রাখে।

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

> 🧠 **মনে রাখার ট্রিক:** `expo start` করে A/I/W চাপো — **A**ndroid, **I**OS, **W**eb। package মানে toolbox-এর আলাদা আলাদা যন্ত্র।

> ✅ **নিজেকে যাচাই করো:** `axios` আর `zustand` — কোনটা API call করে, কোনটা global state রাখে?
> <details><summary>উত্তর দেখো</summary>
> `axios` FastAPI-কে API call করে; `zustand` অ্যাপের global state (যেমন auth) মনে রাখে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-5"></a>

## 05. Folder Structure: Book-এর chapter-এর মতো সাজানো

> 🎯 **এই section-এ বুঝব:** কোন file কোথায় রাখলে অ্যাপ বড় হলেও গোছানো আর খুঁজে-পাওয়া সহজ থাকে।

### 📚 আগে একটা গল্প

ভাবো একটা বই। `app/` = অধ্যায়গুলো (প্রতিটা screen); `components/` = বারবার ব্যবহারের ছবি/বক্স; `features/` = বিষয়ভিত্তিক আলাদা ফোল্ডার; `lib/` = সাধারণ যন্ত্রপাতি। জামাকাপড় আলমারিতে ভাগ করে রাখলে যেমন দরকারে চট করে পাও, folder structure সেই কাজটাই করে।

### কেন এত ভাগ?

সব code এক ফাইলে জমালে বড় অ্যাপে হারিয়ে যাবে, বাগ খোঁজা কঠিন হবে। নির্দিষ্ট জিনিসের নির্দিষ্ট জায়গা থাকলে যেকোনো developer সহজে বুঝে ফেলে কোথায় কী।

Recommended structure:

```txt
my-app/
  src/
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
src/app/    -> screens/routes
src/components -> reusable UI
src/features   -> feature-wise code
src/lib        -> API client/common setup
src/store      -> global state
src/theme      -> colors/spacing/design tokens
assets/        -> image/icon/font
```

Rule:

```txt
Screen route src/app/ folder-এ
Feature logic src/features/ folder-এ
Reusable UI src/components/ folder-এ
```

> 🧠 **মনে রাখার ট্রিক:** "route → `app/`, reusable UI → `components/`, feature logic → `features/`"।

> ✅ **নিজেকে যাচাই করো:** login screen আর তার business logic — কোথায় কোথায় রাখব?
> <details><summary>উত্তর দেখো</summary>
> screen route যায় `src/app/`-এ, আর তার logic (hook/service/schema) যায় `src/features/auth/`-এ।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-6"></a>

## 06. Expo Router: File-Based Mobile Routing

> 🎯 **এই section-এ বুঝব:** file দেখে কীভাবে route ঠিক হয়, আর এক screen থেকে আরেক screen-এ কীভাবে যাই।

### 🚪 আগে একটা গল্প

router হলো অ্যাপের এক ঘর থেকে আরেক ঘরে যাওয়ার দরজা। এখানে প্রতিটা file = একটা ঘর, আর folder-এর নকশা = বাড়ির নকশা। মজার ব্যাপার: ঘর বানালেই (file বানালেই) দরজা (route) এমনি তৈরি হয়ে যায় — আলাদা করে দরজা লাগাতে হয় না।

### কেন file-based?

ফাইল দেখেই route বোঝা যায় বলে আলাদা করে route লেখার ঝামেলা নেই। বড় অ্যাপে নকশা দেখেই কে কোথায় বোঝা যায় — অনেকটা Next.js-এর মতো।

Expo Router file-based routing use করে। Modern Expo Router project-এ screen/page files সাধারণত `src/app/` folder-এর ভিতরে থাকে।

Example:

```txt
src/app/index.tsx              -> /
src/app/(auth)/login.tsx       -> /login
src/app/(protected)/home.tsx   -> /home
src/app/users/[id].tsx         -> /users/123
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
এগুলো শুধু screen organize করতে use হয়।
```

Old/manual React Navigation projects-এ অনেক সময় `src/screens/` folder দেখা যায়। Expo Router use করলে আলাদা `screens/` folder mandatory না; route screen হলো `src/app`-এর file।

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
File দেখে route বুঝা যায়
Deep link/shareable route easier
Large app organize করা সহজ
```

> 🧠 **মনে রাখার ট্রিক:** `push` = নতুন ঘরে ঢোকা (back করা যায়), `replace` = ঘর বদলে ফেরার পথ মুছে দেওয়া, `back` = আগের ঘরে ফেরা। `(auth)`/`(protected)` দরজায় নাম দেখায় না, শুধু গোছানোর জন্য।

> ✅ **নিজেকে যাচাই করো:** login সফল হওয়ার পরে `push` না `replace` — কোনটা ভালো, আর কেন?
> <details><summary>উত্তর দেখো</summary>
> `replace`। তাহলে user back চেপে আবার login screen-এ ফিরতে পারবে না, কারণ ফেরার পথটা মুছে যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-7"></a>

## 07. Core Components: View, Text, Image, Pressable

> 🎯 **এই section-এ বুঝব:** মোবাইল UI বানানোর মূল "ইট"গুলো — View, Text, Image, Pressable ইত্যাদি কে কী কাজ করে।

### 🧱 আগে একটা গল্প

component হলো ঘর সাজানোর ইট/ব্লক, ঠিক LEGO-র মতো। `View` = বাক্স বা দেয়াল (ভিতরে অন্য জিনিস রাখো), `Text` = লেখা, `Image` = ছবির ফ্রেম, `Pressable` = বোতাম (ছুঁলে সাড়া দেয়), `FlatList` = লম্বা লিস্ট (কাগজ গুটিয়ে অল্প অল্প দেখায়)। ছোট ছোট block জোড়া দিয়েই বড় screen বানাই।

### কেন এত component?

প্রতিটা block-এর নির্দিষ্ট কাজ। ঠিক block ঠিক জায়গায় বসালে UI পরিষ্কার আর দ্রুত হয় — যেমন লম্বা লিস্টে ScrollView-এর বদলে FlatList।

React Native core components:

| Component | কাজ |
|---|---|
| `View` | layout/container |
| `Text` | text দেখায় |
| `Image` | image দেখায় |
| `TextInput` | user input নেয় |
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
Text ছাড়া raw string render করবো না।
Long list হলে ScrollView না, FlatList use করবো।
```

> 🧠 **মনে রাখার ট্রিক:** `View` = বাক্স, `Text` = লেখা, `Pressable` = চাপ। আর লম্বা লিস্ট মানেই `FlatList` (ScrollView না)।

> ✅ **নিজেকে যাচাই করো:** ১০০০ item-এর লিস্ট দেখাতে ScrollView না FlatList?
> <details><summary>উত্তর দেখো</summary>
> FlatList। এটা সব item একসাথে না এঁকে যতটুকু চোখের সামনে ততটুকু render করে, তাই ফোন হাঁপায় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-8"></a>

## 08. Styling, Flexbox এবং Responsive Layout

> 🎯 **এই section-এ বুঝব:** React Native-এ কীভাবে সাজাই, আর Flexbox দিয়ে জিনিস সারি/কলামে সাজানোর নিয়ম।

### 🗄️ আগে একটা গল্প

Flexbox হলো তাকের ওপর জিনিস সাজানোর নিয়ম। `flexDirection` = তাকটা আড়াআড়ি (row) না লম্বালম্বি (column)। `justifyContent` = তাক বরাবর জিনিসগুলোর ফাঁক কেমন হবে। `alignItems` = তাকের প্রস্থ বরাবর সাজানো। আর `flex: 1` = "বাকি খালি জায়গাটা দখল করো"।

### কেন Flexbox আর flex?

ফোনের স্ক্রিন নানা মাপের। fixed pixel দিলে ছোট ফোনে জিনিস উপচে পড়ে, বড় ফোনে ফাঁকা লাগে। flex দিলে জিনিস নিজে থেকে জায়গা বুঝে মানিয়ে নেয়।

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

> 🧠 **মনে রাখার ট্রিক:** `flexDirection` = কোন দিকে সারি; `justifyContent` = main axis বরাবর ফাঁক; `alignItems` = cross axis বরাবর সাজানো। "flex:1 মানে বাকি জায়গা দখল করো"।

> ✅ **নিজেকে যাচাই করো:** একটা row-তে দুটো item ডানে-বামে ছড়িয়ে দিতে কোন property?
> <details><summary>উত্তর দেখো</summary>
> `justifyContent: "space-between"` — এটা main axis বরাবর দুই প্রান্তে ঠেলে দেয়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-9"></a>

## 09. Screen, Component, Hook, Service Layer

> 🎯 **এই section-এ বুঝব:** অ্যাপকে পরিষ্কার রাখতে কাজগুলো কীভাবে আলাদা স্তরে (layer) ভাগ করি।

### 🍽️ আগে একটা গল্প

সেই রেস্টুরেন্টেই ফিরি। **Screen** = টেবিল সাজিয়ে অতিথি বসানো; **Component** = প্লেট-গ্লাস (দেখায়); **Hook** = waiter (অর্ডার নেয়, loading/error সামলায়); **Service** = রান্নাঘরে ফোন (API call)। একজনকে দিয়ে সব করালে বিশৃঙ্খলা।

### কেন স্তরে ভাগ?

এক ফাইলে UI + validation + API + navigation সব রাখলে পরিবর্তন কঠিন, বাগ খোঁজা কঠিন। আলাদা করলে প্রতিটা অংশ ছোট, বোঝা সহজ, আর আলাদা করে ঠিক করা যায়।

Mobile app clean রাখতে layer আলাদা করবো।

```txt
Screen    = route/screen compose করে
Component = UI part দেখায়
Hook      = behavior/loading/error/state logic
Service   = FastAPI API call
Store     = global auth/user/UI state
```

Example flow:

```txt
src/app/(auth)/login.tsx
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

> 🧠 **মনে রাখার ট্রিক:** Screen সাজায়, Component দেখায়, Hook সামলায়, Service ফোন করে।

> ✅ **নিজেকে যাচাই করো:** API call-এর code কোথায় রাখব — screen file-এ না service-এ?
> <details><summary>উত্তর দেখো</summary>
> service-এ। screen শুধু compose করবে; API call service layer-এ থাকলে সব গোছানো ও পুনর্ব্যবহারযোগ্য থাকে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-10"></a>

## 10. State Management: Local State, Context, Zustand

> 🎯 **এই section-এ বুঝব:** কোন ধরনের তথ্য কোথায় রাখব — `useState`, Context, Zustand, না React Query।

### 🎒 আগে একটা গল্প

জিনিস রাখার জায়গা ভাবো। **পকেট** = `useState` (এক component-এর ছোট জিনিস); **ব্যাগ** = Context (কাছের কয়েকজনে শেয়ার); **আলমারি** = Zustand (পুরো অ্যাপের জিনিস); **দোকানের গুদাম** = React Query (backend থেকে আসা data)। ছোট জিনিস আলমারিতে রাখলে শুধুই জঞ্জাল।

### কেন সঠিক জায়গা জরুরি?

ভুল জায়গায় state রাখলে অ্যাপ জটিল আর ধীর হয়। প্রতিটা state-এর স্বভাব বুঝে জায়গা দিলে code পরিষ্কার থাকে।

State তিনভাবে ভাববো:

| State type | কোথায় রাখবো |
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

> 🧠 **মনে রাখার ট্রিক:** পকেট = `useState`, আলমারি = Zustand, গুদাম (backend data) = React Query।

> ✅ **নিজেকে যাচাই করো:** server থেকে আসা user list কোথায় রাখবে?
> <details><summary>উত্তর দেখো</summary>
> React Query-তে। এটা backend/server data cache করে, loading/refetch নিজে সামলায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-11"></a>

## 11. Form Handling: TextInput, Validation, Keyboard

> 🎯 **এই section-এ বুঝব:** user-এর input নেওয়া, তা যাচাই (validation) করা, আর keyboard-এর সমস্যা সামলানো।

### 📝 আগে একটা গল্প

form হলো দোকানের অর্ডার স্লিপ। `TextInput` = লেখার ঘর। **Zod** = দোকানের সামনেই দ্রুত চেক করা, স্লিপ ঠিকমতো ভরা হলো কিনা (দ্রুত feedback)। কিন্তু আসল যাচাই হয় গুদামে — সেটা **FastAPI-র Pydantic**।

### কেন দুই জায়গায় validation?

frontend-এর Zod user-কে দ্রুত ভুল দেখায় (ভালো অভিজ্ঞতা)। কিন্তু user চাইলে frontend bypass করতে পারে, তাই আসল নিরাপত্তার জন্য backend-এও যাচাই করতেই হয়।

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

> 🧠 **মনে রাখার ট্রিক:** Zod = ভদ্রতার চেক (UX), Pydantic = আসল পুলিশ (security)।

> ✅ **নিজেকে যাচাই করো:** শুধু Zod validation থাকলে কি যথেষ্ট নিরাপদ?
> <details><summary>উত্তর দেখো</summary>
> না। user Zod bypass করে সরাসরি খারাপ data পাঠাতে পারে, তাই FastAPI-তেও (Pydantic) validate করতেই হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-12"></a>

## 12. Environment Variables এবং API Base URL

> 🎯 **এই section-এ বুঝব:** backend-এর ঠিকানা অ্যাপকে কীভাবে দিই, আর কেন ফোন থেকে `localhost` কাজ করে না।

### 🏠 আগে একটা গল্প

ফোনে `localhost` মানে ফোন নিজেই তার নিজের ঠিকানা — কম্পিউটার না। ব্যাপারটা এমন: বন্ধুকে বললে "আমার বাসায় আয়", কিন্তু ঠিকানা না বললে সে নিজের বাসাতেই চলে যাবে! তাই ফোনকে কম্পিউটারের আসল ঠিকানা (LAN IP) বলে দিতে হয়।

### কেন device-ভেদে URL বদলায়?

প্রতিটা device-এ `localhost` আলাদা জিনিস বোঝায় (ফোন নিজে, emulator নিজে)। তাই কোথায় অ্যাপ চলছে সেই অনুযায়ী base URL ঠিক করতে হয়।

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

> 🧠 **মনে রাখার ট্রিক:** "phone-এর localhost = phone নিজে"। আর `EXPO_PUBLIC_` = সবার সামনে খোলা, তাই secret এখানে রাখবে না।

> ✅ **নিজেকে যাচাই করো:** physical phone-এ Expo Go দিয়ে test করছ — API base URL কী হবে?
> <details><summary>উত্তর দেখো</summary>
> কম্পিউটারের LAN IP, যেমন `http://192.168.1.10:8000/api/v1` — `localhost` না, কারণ phone-এর localhost মানে phone নিজে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-13"></a>

## 13. FastAPI Connection: Fetch/Axios Service Layer

> 🎯 **এই section-এ বুঝব:** service layer দিয়ে কীভাবে গুছিয়ে FastAPI-কে call করি (axios বা fetch)।

### ☎️ আগে একটা গল্প

API call হলো দোকানে ফোন করে অর্ডার দেওয়া। `api` client = তোমার সেভ করা দোকানের নম্বর (baseURL একবার ঠিক করা)। আর প্রতিটা service function (`loginUser`, `getUsers`) = নির্দিষ্ট একেকটা অর্ডার।

### কেন এক জায়গায় client বানাই?

একবার `api` client বানিয়ে নিলে সব call একই নিয়ম (baseURL, header) মানে। ঠিকানা বদলালে এক জায়গায় বদলালেই হয়, সব service-এ খুঁজতে হয় না।

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

> 🧠 **মনে রাখার ট্রিক:** `api` = দোকানের নম্বর সেভ (baseURL), service function = নির্দিষ্ট অর্ডার কল।

> ✅ **নিজেকে যাচাই করো:** native mobile app-এ কি browser CORS লাগে?
> <details><summary>উত্তর দেখো</summary>
> না, native app browser না, তাই CORS concept খাটে না। কিন্তু Expo web build হলে browser-এ চলবে বলে CORS লাগবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-14"></a>

## 14. Auth Flow: Login, Token, SecureStore

> 🎯 **এই section-এ বুঝব:** login-এর পর token কীভাবে নিরাপদে রাখি আর প্রতিটা request-এ পাঠাই।

### 🔐 আগে একটা গল্প

**SecureStore** হলো মোবাইলের লকার। **token** হলো অনুষ্ঠানে ঢোকার হাতের সিল বা টিকিট — প্রতিবার দেখালে ভেতরে ঢুকতে দেয়। token লকারে রাখলে চোর সহজে পায় না; সাধারণ AsyncStorage-এ রাখা মানে খোলা ড্রয়ারে রাখা। আর **interceptor** = দরজায় প্রতিবার automatically টিকিট দেখানোর ব্যবস্থা।

### কেন এত সাবধানতা?

token পেয়ে গেলে যে কেউ তোমার হয়ে ঢুকতে পারে, তাই এটা সংবেদনশীল। interceptor একবার সেট করলে প্রতিটা call-এ token নিজে যোগ হয়, হাতে হাতে করতে হয় না।

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
import { api } from "@/src/lib/api";
import { getToken } from "@/src/features/auth/services/tokenStorage";

// এই interceptor module load-এর সময় একবারই register হবে (per-render নয়)।
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

> 🧠 **মনে রাখার ট্রিক:** SecureStore = লকার, token = টিকিট, interceptor = প্রতিবার দরজায় টিকিট দেখানো।

> ✅ **নিজেকে যাচাই করো:** frontend-এ token থাকলেই কি নিরাপত্তা সম্পূর্ণ?
> <details><summary>উত্তর দেখো</summary>
> না। FastAPI-কে প্রতিটা request-এ token verify করতেই হবে — শুধু frontend-এ token থাকা মানে security complete না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-15"></a>

## 15. Protected Routes এবং Role-Based Screens

> 🎯 **এই section-এ বুঝব:** token আর role অনুযায়ী কোন screen কাকে দেখাব।

### 🚧 আগে একটা গল্প

Protected route হলো দারোয়ানসহ দরজা। token নেই → login screen-এ ফেরত পাঠায়; role student → admin ঘরে ঢুকতে দেয় না। কিন্তু মনে রেখো, এই দারোয়ান শুধু সৌন্দর্য আর সুবিধার জন্য (UX); আসল তালা লাগানো থাকে backend-এ।

### কেন frontend guard যথেষ্ট না?

frontend-এর code চতুর user বদলে ফেলতে পারে। তাই route guard দেখতে সুন্দর অভিজ্ঞতা দেয়, কিন্তু আসল রক্ষক FastAPI — সে-ই role/permission যাচাই করে data দেয়।

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

> 🧠 **মনে রাখার ট্রিক:** Route guard = ভদ্র দারোয়ান (UX), FastAPI role check = আসল তালা (security)।

> ✅ **নিজেকে যাচাই করো:** শুধু Expo route guard দিয়ে কি admin API সুরক্ষিত রাখা যায়?
> <details><summary>উত্তর দেখো</summary>
> না। FastAPI-তে role/permission check করতেই হবে; frontend guard শুধু UX, নিরাপত্তা না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-16"></a>

## 16. Lists, Refresh, Pagination এবং FlatList

> 🎯 **এই section-এ বুঝব:** লম্বা লিস্ট কীভাবে দ্রুত দেখাই, আর pull-to-refresh/pagination কীভাবে যোগ করি।

### 📜 আগে একটা গল্প

`FlatList` হলো লম্বা কাগজের রোল — যতটুকু চোখের সামনে ততটুকুই খোলে। ভাবো ১০০০টা নাম একসাথে এঁকে ফেললে ফোন হাঁপিয়ে যাবে; FlatList শুধু দৃশ্যমান অংশটুকু আঁকে, বাকিটা রেখে দেয় গুটিয়ে।

### কেন FlatList?

সব item একসাথে render করা ব্যয়বহুল আর ধীর। FlatList দৃশ্যমান অংশই render করে, তাই performance ভালো থাকে। প্রতিটা item-এর আলাদা পরিচয় দিতে `keyExtractor` লাগে।

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
Long list performant হয়
সব item একসাথে render করে না
pull-to-refresh/pagination handle করা যায়
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

> 🧠 **মনে রাখার ট্রিক:** "লম্বা লিস্ট = FlatList; `keyExtractor` দিয়ে প্রতিটার আলাদা পরিচয়"।

> ✅ **নিজেকে যাচাই করো:** pull-to-refresh পেতে FlatList-এ কোন দুটো prop লাগে?
> <details><summary>উত্তর দেখো</summary>
> `refreshing` (এখন refresh হচ্ছে কিনা) আর `onRefresh` (টান দিলে কী চলবে)।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-17"></a>

## 17. Image, File Upload এবং Permissions

> 🎯 **এই section-এ বুঝব:** ছবি দেখানো, gallery থেকে ছবি pick করা, আর FastAPI-তে upload করা।

### 🖼️ আগে একটা গল্প

image picker = অ্যালবাম থেকে ছবি বেছে আনা। `FormData` = খামে ছবি ভরে ডাকে পাঠানো। এখানে একটা ছোট ফাঁদ আছে: খামের সিল (`Content-Type`-এর boundary) নিজে হাতে না লাগিয়ে axios-কে লাগাতে দাও — নিজে লাগালে সিল ভুল হয়ে খাম ছিঁড়ে যায়।

### কেন এই সাবধানতা?

multipart upload-এ boundary ঠিক না থাকলে backend খাম খুলতে পারে না, upload ভাঙে। আর camera/gallery ব্যবহারে permission লাগে — না পেলে ভদ্রভাবে সামলাতে হয়।

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

  // Content-Type manually দেবো না; axios/FormData নিজে থেকে সঠিক
  // boundary সহ multipart header সেট করবে। manually দিলে boundary বাদ পড়ে upload ভাঙতে পারে।
  const response = await api.post("/files/upload", formData);

  return response.data;
}
```

Important:

```txt
Camera/gallery/location use করলে permission দরকার হতে পারে।
FastAPI backend file type/size/security validate করবে।
```

> 🧠 **মনে রাখার ট্রিক:** FormData-র `Content-Type` নিজে দিও না — axios boundary সহ ঠিক করে দেবে।

> ✅ **নিজেকে যাচাই করো:** upload-এ কেন manually `Content-Type` সেট করব না?
> <details><summary>উত্তর দেখো</summary>
> manually দিলে multipart boundary বাদ পড়ে upload ভেঙে যেতে পারে; axios/FormData নিজেই সঠিক boundary সহ header বসায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-18"></a>

## 18. Loading, Error, Empty State এবং Offline Thinking

> 🎯 **এই section-এ বুঝব:** network অনিশ্চিত মোবাইলে UI-এর নানা অবস্থা কীভাবে পরিষ্কার দেখাই।

### 🚦 আগে একটা গল্প

অ্যাপের অবস্থাগুলোকে ভাবো ট্রাফিক সিগন্যাল। loading = হলুদ (একটু অপেক্ষা করো), success = সবুজ (এসে গেছে), error = লাল (কিছু ভাঙল), empty = ফাঁকা রাস্তা (কিছু নেই)। user-কে সবসময় জানাও এখন কোন সিগন্যাল।

### কেন এত অবস্থা সামলাব?

মোবাইল network প্রায়ই দুর্বল বা কেটে যায়। blank সাদা screen দেখলে user ভাবে অ্যাপ নষ্ট। প্রতিটা অবস্থা পরিষ্কার দেখালে অভিজ্ঞতা বিশ্বাসযোগ্য হয়।

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

> 🧠 **মনে রাখার ট্রিক:** প্রতিটা API call-এ তিন প্রশ্ন করো — loading? error? empty?

> ✅ **নিজেকে যাচাই করো:** list খালি এলে কী দেখাবে?
> <details><summary>উত্তর দেখো</summary>
> blank screen না, বরং একটা "No data found" জাতীয় empty state message — যাতে user বোঝে কিছু ভাঙেনি, শুধু data নেই।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-19"></a>

## 19. Platform Difference: Android, iOS, Web

> 🎯 **এই section-এ বুঝব:** এক code লিখলেও Android/iOS/Web-এ কেন behavior একটু আলাদা হয়।

### 🌍 আগে একটা গল্প

একই রেসিপি তিন দেশে রান্না করলে মশলা একটু বদলাতে হয়। তেমনি এক code তিন platform-এ চলে, কিন্তু আচরণ পুরো এক না — যেমন Android-এ hardware back button আছে, iOS-এ নেই; permission চাওয়ার নিয়মও আলাদা।

### কেন test করতেই হবে?

প্রতিটা platform-এর নিজস্ব নিয়ম আছে। "চলবে ধরে নেওয়া" বিপজ্জনক; তাই দরকারে `Platform.OS` দিয়ে আলাদা করি আর প্রতিটাতে test করি।

React Native same code দিয়ে Android/iOS app বানায়, কিন্তু সব behavior এক না।

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

> 🧠 **মনে রাখার ট্রিক:** "design এক, behavior test করো"; দরকারে `Platform.OS` দিয়ে আলাদা করো।

> ✅ **নিজেকে যাচাই করো:** hardware back button কোন platform-এ থাকে?
> <details><summary>উত্তর দেখো</summary>
> Android-এ; iOS-এ hardware back button নেই।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-20"></a>

## 20. Expo Native APIs: Camera, Location, Notifications

> 🎯 **এই section-এ বুঝব:** Expo দিয়ে camera, location, notification-এর মতো ফোনের ক্ষমতা কীভাবে ব্যবহার করি।

### 🎛️ আগে একটা গল্প

Native API হলো ফোনের বিশেষ যন্ত্র — ক্যামেরা, GPS, নোটিফিকেশন। এগুলো ব্যবহারের আগে permission চাওয়া = কারো ঘরে ঢোকার আগে দরজায় নক করা। user না বললে জোর করে ঢুকব না।

### কেন permission নিয়ে এত ভাবনা?

permission ছাড়া যন্ত্র ধরতে গেলে অ্যাপ crash করতে পারে। তাই একটা নির্দিষ্ট pattern মানি — install করো, permission চাও, API চালাও, না পেলে ভদ্রভাবে সামলাও।

Expo SDK অনেক native API দেয়।

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
Native API add করলে Expo Go-তে সবসময় enough নাও হতে পারে।
Complex/native config দরকার হলে development build use করতে হয়।
```

> 🧠 **মনে রাখার ট্রিক:** "Install → permission চাও → API call → denied সামলাও"।

> ✅ **নিজেকে যাচাই করো:** user permission না দিলে অ্যাপ কী করবে?
> <details><summary>উত্তর দেখো</summary>
> crash করবে না; একটা friendly message দেখাবে আর দরকারে settings থেকে permission চালু করার পথ বলবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-21"></a>

## 21. Emulator না থাকলে কীভাবে Run/Test করবো

> 🎯 **এই section-এ বুঝব:** emulator ছাড়াও কীভাবে অ্যাপ চালিয়ে test করা যায়।

### 📲 আগে একটা গল্প

**Expo Go** হলো ফোনে বসানো একটা "খেলার ঘর" — QR scan করলেই তোমার অ্যাপ সরাসরি ভিতরে খুলে দেখায়, আলাদা install লাগে না। **emulator** = কম্পিউটারে বানানো নকল ফোন; সেটা না থাকলে হাতের আসল ফোনই সেরা পরীক্ষাগার।

### কেন একাধিক উপায়?

সবার কাছে emulator নেই বা মেশিন ভারী হয়। real device সবচেয়ে সত্যিকারের test দেয়; web preview দ্রুত কিন্তু native জিনিস (camera, notification) প্রমাণ করে না। তাই দরকার বুঝে উপায় বাছি।

Emulator না থাকলেও Expo app run/test করা যায়। তিনটা practical option আছে।

Option 1: Physical phone + Expo Go

```bash
npx expo start
```

তারপর:

```txt
Phone-এ Expo Go install
Computer আর phone same Wi-Fi network-এ রাখবো
Terminal/browser-এর QR code scan করবো
App phone-এ open হবে
```

যদি same Wi-Fi সমস্যা করে:

```bash
npx expo start --tunnel
```

Tunnel internet দিয়ে connection করে, তাই local network issue কম হয়। তবে speed একটু slow হতে পারে।

Option 2: Web browser preview

```bash
npx expo start --web
```

যদি web dependency missing থাকে:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

Web preview কখন use করবো:

```txt
Emulator নেই
UI/layout quick check করতে চাই
Form/API flow browser-এ দেখতে চাই
Fast refresh দিয়ে দ্রুত develop করতে চাই
```

কিন্তু মনে রাখতে হবে:

```txt
Web preview native Android/iOS behavior fully prove করে না।
Camera, push notification, biometric, native permission - এগুলো real phone/development build-এ test করা ভালো।
```

Option 3: APK install on Android phone

```txt
EAS দিয়ে APK build করবো
APK phone-এ install করবো
Expo Go লাগবে না
```

এই option final user/demo/tester-এর জন্য ভালো।

> 🧠 **মনে রাখার ট্রিক:** তিন পথ — Expo Go (ফোন), web preview, APK। same Wi-Fi সমস্যা করলে `--tunnel`।

> ✅ **নিজেকে যাচাই করো:** camera বা notification test করার সেরা জায়গা কোনটা — web preview না real phone?
> <details><summary>উত্তর দেখো</summary>
> real phone (বা development build)। web preview native behavior সম্পূর্ণ দেখায় না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-22"></a>

## 22. Web Preview vs WebView: কোনটা কোন জিনিস

> 🎯 **এই section-এ বুঝব:** নাম দুটো একরকম শোনালেও এরা সম্পূর্ণ আলাদা জিনিস — কোনটা কী।

### 🔍 আগে একটা গল্প

**Web Preview** = তোমার অ্যাপটাকেই browser-এ চালিয়ে দেখা, অনেকটা আয়নায় নিজেকে দেখার মতো। **WebView** = তোমার অ্যাপের ভিতরে অন্য একটা website বসানো, যেমন ঘরের দেয়ালে একটা টিভি ঝুলিয়ে তাতে অন্য চ্যানেল দেখানো।

### কেন গুলিয়ে ফেলা বিপজ্জনক?

দুটোকে এক ভাবলে ভুল tool বেছে ফেলবে। একটা তোমার নিজের অ্যাপ দেখায়, আরেকটা বাইরের web page দেখায় — উদ্দেশ্য পুরো আলাদা।

দুইটা term আলাদা।

```txt
Expo Web Preview = তোমার React Native app browser-এ চালানো
WebView          = mobile app-এর ভিতরে website/webpage embed করা
```

Expo Web Preview:

```bash
npx expo start --web
```

Missing dependency থাকলে:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

Use case:

```txt
Emulator নেই
Browser-এ UI test করতে চাই
React Native Web support check করতে চাই
```

WebView install:

```bash
npx expo install react-native-webview
```

WebView example:

```tsx
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function WebsiteScreen() {
  return (
    <WebView
      style={styles.webview}
      source={{ uri: "https://expo.dev" }}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
```

When to use WebView:

```txt
Existing website app-এর ভিতরে দেখাতে
Payment/third-party web page খুলতে
Terms/privacy/help page embed করতে
Admin panel-এর small web page দেখাতে
```

When not to use WebView:

```txt
পুরো mobile app WebView দিয়ে বানিয়ে ফেললে native UX খারাপ হতে পারে।
যদি app মূলত native হওয়া দরকার, React Native screen/component বানাবো।
```

> 🧠 **মনে রাখার ট্রিক:** Web Preview = "আমার অ্যাপ browser-এ"; WebView = "অন্য web page আমার অ্যাপের ভিতরে"।

> ✅ **নিজেকে যাচাই করো:** অ্যাপের ভিতরে একটা privacy policy web page দেখাতে কোনটা লাগবে?
> <details><summary>উত্তর দেখো</summary>
> WebView — কারণ এটা বাইরের একটা web page অ্যাপের ভিতরে embed করে দেখায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-23"></a>

## 23. Expo Account, EAS CLI এবং Project Configure

> 🎯 **এই section-এ বুঝব:** installable build পেতে Expo account আর EAS CLI কীভাবে সেট করি।

### 🏭 আগে একটা গল্প

**EAS** হলো Expo-র cloud কারখানা — সেখানে তোমার অ্যাপের installable binary (APK/AAB/IPA) বানানো হয়। **account** = কারখানায় ঢোকার পরিচয়পত্র; `eas build:configure` = কারখানার সাথে অ্যাপের কাগজপত্র মিলিয়ে নেওয়া।

### কেন account/login লাগে?

build তোমার মেশিনে নয়, Expo-র cloud-এ হয়। তাই কার build, কোথায় জমা — এসব বুঝতে account আর login দরকার।

APK/AAB/iOS build পেতে হলে **Expo account** দরকার, কারণ EAS Build Expo account-এর সাথে কাজ করে।

Account:

```txt
https://expo.dev/signup
```

EAS CLI install:

```bash
npm install --global eas-cli
```

Login:

```bash
eas login
```

Check:

```bash
eas whoami
```

Project configure:

```bash
eas build:configure
```

এই command সাধারণত `eas.json` create/update করে।

Development build দরকার হলে:

```bash
npx expo install expo-dev-client
```

কখন development build দরকার:

```txt
Expo Go-তে package supported না
Custom native module লাগছে
Native config/plugin দরকার
Real app-like dev environment দরকার
```

Important:

```txt
Expo Go = quick development preview
Development build = নিজের app-এর custom dev version
EAS build = installable APK/AAB/IPA binary
```

> 🧠 **মনে রাখার ট্রিক:** Expo Go = preview, development build = নিজের custom dev version, EAS build = আসল installable binary।

> ✅ **নিজেকে যাচাই করো:** কখন development build দরকার হয়?
> <details><summary>উত্তর দেখো</summary>
> যখন Expo Go-তে কোনো package বা native config supported না — তখন নিজের custom dev version (development build) লাগে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-24"></a>

## 24. Build-এর আগে Project Validate: Expo Doctor

> 🎯 **এই section-এ বুঝব:** build-এর আগে project-এ লুকানো সমস্যা আগেই ধরার উপায়।

### 🩺 আগে একটা গল্প

**Expo Doctor** হলো build-এর আগে একটা ডাক্তারি চেকআপ। লম্বা রাস্তায় রওনা দেওয়ার আগে গাড়ির চাকা-তেল-ব্রেক দেখে নেওয়ার মতো — মাঝপথে আটকে যাওয়ার চেয়ে আগে ধরে ফেলা অনেক ভালো।

### কেন আগেই চেক?

dependency বা config-এর ছোট mismatch build fail করিয়ে দেয়, আর তখন কারণ খুঁজতে সময় নষ্ট হয়। আগে চালালে obvious সমস্যা আগেই ধরা পড়ে।

Build করার আগে project health check করা ভালো। Expo-এর official tool হলো **Expo Doctor**।

Run from project root:

```bash
npx expo-doctor
```

এটা কী check করে:

```txt
package dependency compatibility
Expo SDK version compatibility
app config issue
package.json issue
native config sync issue
common project health problem
```

যদি issue পায়:

```txt
Problem description দেখাবে
Fix suggestion দেখাবে
কোন package/config সমস্যা করছে সেটা বুঝতে help করবে
```

কখন চালাবো:

```txt
new package install করার পরে
Expo SDK upgrade করার পরে
EAS build করার আগে
APK/AAB build fail করলে
weird native/runtime issue হলে
```

Suggested pre-build checklist:

```bash
npx expo-doctor
npx expo start --web
eas build:configure
eas build -p android --profile preview
```

Important:

```txt
Expo Doctor pass করা মানেই app perfect না।
কিন্তু build-এর আগে obvious config/dependency issue ধরার জন্য এটা খুব useful।
```

> 🧠 **মনে রাখার ট্রিক:** "নতুন package / SDK upgrade / build-এর আগে `expo-doctor` চালাও"।

> ✅ **নিজেকে যাচাই করো:** Expo Doctor pass করা মানেই কি অ্যাপ perfect?
> <details><summary>উত্তর দেখো</summary>
> না। এটা শুধু obvious config/dependency issue ধরে; বাকি bug logic-এ থেকে যেতে পারে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-25"></a>

## 25. APK File কীভাবে পাবো

> 🎯 **এই section-এ বুঝব:** ফোনে সরাসরি install করার মতো APK ফাইল কীভাবে বানাই আর পাই।

### 📦 আগে একটা গল্প

**APK** হলো অ্যাপের একটা installable বাক্স, যা সরাসরি ফোনে দিয়ে বসানো যায়। **AAB** হলো Play Store-এর জন্য বিশেষ মোড়ক। বন্ধুকে হাতে হাতে দিতে APK, আর দোকানে (Play Store) তুলতে AAB।

### কেন দুই রকম?

demo/test-এর সময় সরাসরি install করা APK সুবিধাজনক। কিন্তু Play Store নিজে optimize করে বিলি করার জন্য AAB চায়। কাজভেদে সঠিকটা বাছি।

Android app দুইভাবে ভাবতে হবে:

```txt
APK = directly phone/emulator-এ install করা যায়
AAB = Google Play Store upload-এর জন্য preferred
```

Direct install/test/demo-এর জন্য APK দরকার।

`eas.json` preview profile:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

APK build command:

```bash
eas build -p android --profile preview
```

Build complete হলে:

```txt
Terminal একটা build link দেখাবে
Expo dashboard-এ build দেখা যাবে
সেখান থেকে APK download/install করা যাবে
```

Build list:

```bash
eas build:list
```

Emulator থাকলে install:

```bash
eas build:run -p android
```

Physical phone-এ install:

```txt
APK download
Phone-এ send/copy
Install from unknown sources allow করতে হতে পারে
APK open করে install
```

Important:

```txt
Play Store upload-এর জন্য সাধারণত AAB build করা হয়।
Direct share/test/demo-এর জন্য APK build করা হয়।
```

> 🧠 **মনে রাখার ট্রিক:** APK = হাতে হাতে share/test; AAB = Play Store।

> ✅ **নিজেকে যাচাই করো:** কোনো tester-কে সরাসরি অ্যাপ পাঠাতে কোনটা build করবে?
> <details><summary>উত্তর দেখো</summary>
> APK — preview profile-এ `android.buildType = "apk"` দিয়ে; এটা ফোনে সরাসরি install করা যায়।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-26"></a>

## 26. Build, Preview, EAS এবং App Store Thinking

> 🎯 **এই section-এ বুঝব:** development থেকে production/App Store পর্যন্ত পুরো build-চিন্তাটা।

### 🚀 আগে একটা গল্প

development অ্যাপ = রান্নাঘরে নিজে চেখে দেখা। production অ্যাপ = অতিথিকে সুন্দর করে সাজিয়ে পরিবেশন — icon, splash screen, ঠিক production API URL, permission-এর লেখা সব ঠিকঠাক। **EAS** হলো সেই পরিবেশনের কারখানা আর ডেলিভারি ব্যবস্থা।

### কেন dev আর production আলাদা?

dev-এ পরীক্ষা চলে, production-এ আসল user। তাই config, API URL আলাদা রাখি, আর secret কখনো app bundle-এ রাখি না — কারণ bundle খুলে ফেলা যায়।

Development:

```txt
npx expo start
Expo Go / web preview / development build
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
EAS CLI    -> terminal থেকে Expo services control
EAS Build  -> Android/iOS app binary build
EAS Submit -> App Store / Play Store submit
EAS Update -> OTA JavaScript update
```

Build mindset:

```txt
Development app আর production app আলাদা config রাখবে।
Production API URL আলাদা হবে।
Secret কখনও app bundle-এ রাখবো না।
APK tester/demo-এর জন্য।
AAB Play Store-এর জন্য।
```

> 🧠 **মনে রাখার ট্রিক:** Build = binary বানানো, Submit = Store-এ পাঠানো, Update = OTA JS আপডেট। secret কখনো app bundle-এ না।

> ✅ **নিজেকে যাচাই করো:** production API URL কি dev-এর মতোই রেখে দেব?
> <details><summary>উত্তর দেখো</summary>
> না। production-এ আলাদা config আর আলাদা production API URL রাখতে হবে।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)

---

<a id="section-27"></a>

## 27. Development Rules, Checklist এবং Summary

> 🎯 **এই section-এ বুঝব:** এতক্ষণের সব শিক্ষা এক জায়গায় গুছিয়ে মাথায় গেঁথে নেওয়া।

### 🎓 আগে একটা গল্প

এই section হলো পরীক্ষার আগের রিভিশন শিট — পুরো বই এক পাতায়। বারবার চোখ বুলিয়ে নিলে ছড়ানো টুকরোগুলো জোড়া লেগে পুরো ছবিটা মাথায় বসে যায়।

### কেন একসাথে দেখা জরুরি?

এক জায়গায় সব নিয়ম দেখলে কোনটা কার সাথে যুক্ত তা স্পষ্ট হয় — যেমন অ্যাপ কেন শুধু দেখায় আর FastAPI কেন আসল যাচাই করে।

Rules:

1. React Native-এ HTML tag use করবো না; `View`, `Text`, `Image`, `Pressable` use করবো।
2. Long list হলে `FlatList` use করবো।
3. Screen route `src/app/` folder-এ রাখবো।
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
19. Emulator না থাকলে Expo Go physical phone বা `npx expo start --web` use করবো।
20. Web preview-এর জন্য দরকার হলে `react-dom react-native-web @expo/metro-runtime` install করবো।
21. App-এর ভিতরে website দেখাতে হলে `react-native-webview` install করবো।
22. APK direct install/test/demo-এর জন্য, AAB Play Store-এর জন্য।
23. EAS Build করতে Expo account, EAS CLI login, `eas build:configure` দরকার।
24. APK build করতে `eas.json`-এ preview profile দিয়ে `android.buildType = "apk"` set করবো।
25. Build করার আগে `npx expo-doctor` run করবো।

Final memory:

```txt
Expo        -> React Native app development/build সহজ করে
React Native -> native mobile UI
Expo Router -> file-based screen navigation
View/Text   -> mobile UI building blocks
Service     -> FastAPI API call
Hook        -> loading/error/submit logic
SecureStore -> token storage
Expo Go     -> phone preview without APK
Expo Web    -> browser preview
WebView     -> app-এর ভিতরে webpage
EAS Build   -> APK/AAB/IPA binary build
Expo Doctor -> build-এর আগে project health check
FastAPI     -> real backend validation/security/database
```

Official references:

- Expo create project: https://docs.expo.dev/get-started/create-a-project/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo environment variables: https://docs.expo.dev/guides/environment-variables/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo Web: https://docs.expo.dev/workflow/web/
- Expo EAS build setup: https://docs.expo.dev/build/setup/
- Expo Android APK build: https://docs.expo.dev/build-reference/apk/
- Expo development tools / Expo Doctor: https://docs.expo.dev/develop/tools/
- Expo WebView: https://docs.expo.dev/versions/latest/sdk/webview/
- React Native core components: https://reactnative.dev/docs/components-and-apis
- React Native networking: https://reactnative.dev/docs/network

এই sequence follow করলে Expo + React Native শেখা একটা book-এর মতো হবে: আগে concept, তারপর UI building blocks, তারপর routing, তারপর FastAPI API connection, তারপর auth/storage, তারপর production thinking।

> 🧠 **মনে রাখার ট্রিক:** মূল মন্ত্র — "অ্যাপ দেখায় (UI), FastAPI যাচাই করে (security); token লকারে; লম্বা লিস্ট FlatList; secret bundle-এ না"।

> ✅ **নিজেকে যাচাই করো:** অ্যাপে token থাকা সত্ত্বেও চূড়ান্ত security কে নিশ্চিত করে?
> <details><summary>উত্তর দেখো</summary>
> FastAPI backend — সে প্রতিটা request-এ token/role verify করে। অ্যাপে token থাকা মানেই নিরাপত্তা সম্পূর্ণ না।</details>

<!-- tutorial-nav:back -->
[Back to Index](#index)
