# ২৯.০২. Role-based Access Control (RBAC) Architecture

আগের লেসনের শেষে আমরা একটা টোকেনের ভেতরে `role` নামের একটা তথ্য বহন করছিলাম, কিন্তু সেটা দিয়ে বাস্তবে কিছু করিনি। এই লেসনে আমরা ঠিক সেই ফাঁকটা পূরণ করবো — "কে লগইন করেছে" (authentication) থেকে "সে কী করার অনুমতি রাখে" (authorization) এই ধাপে যাবো। এই দুটো শব্দ প্রায়ই গুলিয়ে ফেলা হয়, তাই শুরুতেই পার্থক্যটা স্পষ্ট করে নেওয়া ভালো — authentication উত্তর দেয় "তুমি কে", আর authorization উত্তর দেয় "তুমি কী করতে পারো"। আগের লেসনের JWT verify middleware আমাদের authentication দিয়েছে; এই লেসনে আমরা authorization-এর একটা সুশৃঙ্খল মডেল বানাবো, যার নাম **Role-Based Access Control**, সংক্ষেপে RBAC।

এই ধারণাটা আসলে আমাদের কাছে একেবারে নতুন না। Module 21-এ, ডেটাবেজ নিয়ে আলোচনার সময় আমরা দেখেছিলাম কীভাবে ডেটাবেজ ইঞ্জিনের নিজস্ব RBAC থাকে — `GRANT` আর `REVOKE` কমান্ড দিয়ে ঠিক করা হয় কোন ডেটাবেজ ইউজার কোন টেবিলে READ করতে পারবে, কোনটায় WRITE করতে পারবে। আমরা এখন যেটা বানাবো সেটা একই দর্শনের, কিন্তু ডেটাবেজ ইঞ্জিন লেভেলে না, বরং আমাদের নিজেদের Express অ্যাপ্লিকেশনের লেভেলে — কোন API endpoint কোন role-এর ইউজার কল করতে পারবে সেটা নিয়ন্ত্রণ করা।

RBAC-এর মূল ধারণাটা তিনটা সত্তার সম্পর্ক দিয়ে গঠিত: **User**, **Role**, আর **Permission**। একজন ইউজারকে সরাসরি অনুমতি না দিয়ে, তাকে একটা role দেওয়া হয় (যেমন "admin", "editor", "viewer"), আর প্রতিটা role-এর সাথে বাঁধা থাকে একগুচ্ছ permission (যেমন "post:create", "post:delete")। এই পরোক্ষ (indirect) সম্পর্কটাই RBAC-কে শক্তিশালী করে — কারণ নতুন ইউজার এলে তাকে শুধু একটা role অ্যাসাইন করলেই চলে, প্রতিটা আলাদা permission ম্যানুয়ালি বসাতে হয় না।

```mermaid
flowchart TB
    subgraph Roles["Role Hierarchy"]
        Admin[Admin] --> Editor[Editor]
        Editor --> Viewer[Viewer]
    end
    Admin -.সব permission.-> P1[post:create]
    Admin -.-> P2[post:delete]
    Admin -.-> P3[user:manage]
    Editor -.-> P1
    Editor -.-> P4[post:update]
    Viewer -.-> P5[post:read]
```

এখানে একটা গুরুত্বপূর্ণ স্থাপত্যগত সিদ্ধান্ত হলো role-গুলোকে "hierarchy" বা স্তরবিন্যাস আকারে সাজানো — Admin, Editor-এর সব ক্ষমতা পায় প্লাস কিছু বাড়তি ক্ষমতা, আর Editor, Viewer-এর সব ক্ষমতা পায় প্লাস বাড়তি কিছু। এই ধরনের hierarchy ছোট থেকে মাঝারি সিস্টেমের জন্য যথেষ্ট, কিন্তু বড়, জটিল প্রতিষ্ঠানে (যেখানে হয়তো "Editor-but-cannot-delete" এর মতো সূক্ষ্ম কম্বিনেশন দরকার হয়) মানুষ প্রায়ই **Permission-based** মডেলে চলে যায়, যেখানে role গুলো শুধু কিছু permission-এর named group মাত্র, hierarchy নয়। আমরা এই মডিউলে দুটোরই সমন্বয় দেখবো — role দিয়ে দ্রুত broad-level নিয়ন্ত্রণ, আর permission দিয়ে সূক্ষ্ম নিয়ন্ত্রণ, যেটা আমরা লেসন ৪-এ বিস্তারিত দেখবো।

এখন এই মডেলটাকে টাইপস্ক্রিপ্টে প্রকাশ করি। প্রথমে role আর permission-এর টাইপ আর তাদের সম্পর্কের একটা static ম্যাপ বানাই — বাস্তব প্রজেক্টে এটা ডেটাবেজেও থাকতে পারে (Module 21-এর মতো একটা `roles` আর `permissions` টেবিল বানিয়ে), কিন্তু ছোট সিস্টেমে একটা in-memory ম্যাপও যথেষ্ট:

```ts
// auth/rbac.ts
export type Role = "admin" | "editor" | "viewer";

export type Permission =
  | "post:create"
  | "post:update"
  | "post:delete"
  | "post:read"
  | "user:manage";

// প্রতিটা role কোন কোন permission পায়, তার ম্যাপ
export const rolePermissions: Record<Role, Permission[]> = {
  admin: ["post:create", "post:update", "post:delete", "post:read", "user:manage"],
  editor: ["post:create", "post:update", "post:read"],
  viewer: ["post:read"],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
```

এই ফাংশনটাই RBAC-এর "ব্রেইন" — যেকোনো জায়গা থেকে জিজ্ঞেস করা যায় "এই role-এর কি এই permission আছে?" আর একটা true/false উত্তর পাওয়া যায়। পরের লেসনে আমরা এই ব্রেইনটাকে একটা Express middleware-এর ভেতরে বসাবো, যাতে এটা সত্যিকারের route protection-এ রূপ নেয়।

একটা বাস্তব প্রশ্ন আসা স্বাভাবিক — role-এর তথ্যটা কোথায় রাখা উচিত, JWT-এর ভেতরে নাকি ডেটাবেজে প্রতিবার লুকআপ করে? আগের লেসনে আমরা দেখেছি role টোকেনের payload-এই রাখা হয়েছিল, যাতে প্রতিটা রিকোয়েস্টে আলাদা ডেটাবেজ কল ছাড়াই role জানা যায় — এটা performance-এর জন্য ভালো। কিন্তু এর একটা মূল্য আছে — যদি কোনো admin-এর role ডেটাবেজে বদলে "viewer" করে দেওয়া হয়, পুরনো টোকেনটা তার মেয়াদ শেষ না হওয়া পর্যন্ত এখনও পুরনো role বহন করবে। এই কারণেই আগের লেসনে access token-এর মেয়াদ ছোট (১৫ মিনিট) রাখা হয়েছিল — এটা শুধু token চুরি হওয়ার ঝুঁকি কমায় না, role পরিবর্তনও দ্রুত কার্যকর করে।

NestJS জগতে, Module 25-এ আমরা যে RBAC দেখেছিলাম সেটা একই স্থাপত্যিক ভিত্তির উপর দাঁড়িয়ে, শুধু এটা প্রকাশ পায় `@Roles('admin')` ডেকোরেটর আর একটা `RolesGuard` ক্লাসের মাধ্যমে, যেখানে Guard-টা `Reflector` দিয়ে metadata পড়ে ঠিক আমাদের `roleHasPermission` ফাংশনের মতো একটা যাচাই চালায়। অর্থাৎ Express আর NestJS-এ ধারণাটা অভিন্ন — শুধু "কোথায় এই চেক বসানো হয়" তার সিনট্যাক্স আলাদা।

এখন আমাদের হাতে আছে role আর permission-এর একটা সুস্পষ্ট মডেল। পরের লেসনে আমরা এই মডেলটাকে বাস্তব middleware হিসেবে বাস্তবায়ন করবো, যাতে এটা সত্যিকারের route-কে সুরক্ষা দিতে পারে।
