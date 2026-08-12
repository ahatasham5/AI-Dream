# ৩০.০৭. Security Best Practices for Node.js APIs

এই মডিউলের ছয়টা লেসনে আমরা নির্দিষ্ট, নামযুক্ত আক্রমণের বিরুদ্ধে নির্দিষ্ট প্রতিরক্ষা শিখেছি — CORS, XSS, SQL Injection, CSRF, আর Helmet-এর মাধ্যমে security header। এই শেষ লেসনে আমরা দুটো বাকি থাকা, কিন্তু সমানভাবে গুরুত্বপূর্ণ বিষয় নিয়ে কথা বলবো — **rate limiting** আর **input validation** — আর তারপর পুরো Module 29 আর 30 জুড়ে যা শিখেছি, তার একটা সংক্ষিপ্ত চেকলিস্ট আকারে সারসংক্ষেপ করবো।

শুরু করি এমন একটা সমস্যা দিয়ে যেটা এতক্ষণ আমরা এড়িয়ে গেছি — একজন সম্পূর্ণ বৈধ, লগইন করা ইউজারও (অথবা কোনো বট) যদি প্রতি সেকেন্ডে হাজার হাজার request পাঠায়, তোমার সার্ভার তার সম্পদ (CPU, মেমোরি, ডেটাবেজ কানেকশন) নিঃশেষ করে ফেলে অন্য সবার জন্য অনুপলব্ধ হয়ে যেতে পারে। এই ধরনের আক্রমণকে বলে **Denial of Service (DoS)**, আর এর প্রতিরক্ষা হলো **rate limiting** — একটা নির্দিষ্ট সময়ের মধ্যে একজন ক্লায়েন্ট থেকে কতগুলো request গ্রহণযোগ্য, তার একটা সীমা বেঁধে দেওয়া।

Module 7-এ আমরা rate limiting-এর একটা প্রাথমিক ধারণা মিডলওয়্যার প্রজেক্টের মাধ্যমে পেয়েছিলাম। এখন সেটাকে একটা প্রোডাকশন-মানের, নির্ভরযোগ্য লাইব্রেরি দিয়ে বাস্তবায়ন করি:

```bash
npm install express-rate-limit
```

```ts
// middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 100, // প্রতি IP-তে সর্বোচ্চ ১০০ request
  standardHeaders: true, // RateLimit-* header রেসপন্সে যোগ করে
  legacyHeaders: false,
  message: { message: "অনেক বেশি request, একটু পর আবার চেষ্টা করো" },
});

// লগইনের মতো sensitive route-এ আরও কড়া সীমা
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // ব্রুট-ফোর্স পাসওয়ার্ড অনুমান ঠেকাতে
  skipSuccessfulRequests: true,
});
```

```ts
// app.ts
app.use(generalLimiter); // সব রুটে বেসলাইন সীমা
app.post("/api/login", loginLimiter, loginHandler); // লগইনে বাড়তি কড়াকড়ি
```

লক্ষ্য করো, লগইন route-এ আলাদা, আরও কড়া সীমা বসানো হয়েছে — কারণ এটা একটা বিশেষভাবে sensitive endpoint, যেখানে আক্রমণকারী বারবার ভিন্ন ভিন্ন পাসওয়ার্ড চেষ্টা করে (brute-force attack) কারো অ্যাকাউন্টে ঢুকতে চাইতে পারে। rate limiting সেই চেষ্টাকে ব্যবহারিকভাবে অসম্ভব করে তোলে।

এবার দ্বিতীয় বিষয়টায় আসি — **input validation**। এই মডিউল জুড়ে আমরা বারবার একটা কথা বলে এসেছি: "কখনো ইউজারের ইনপুটকে বিশ্বাস করো না"। SQL Injection ঠেকাতে parameterized query, XSS ঠেকাতে output encoding — এগুলো সবই এক অর্থে input-কে বিশেষ যত্নে হ্যান্ডল করার কৌশল। কিন্তু এর বাইরেও, একটা সাধারণ ভালো অভ্যাস হলো প্রতিটা route-এ ঢোকার মুখেই ইনপুটের গঠন (shape), টাইপ, আর সীমা যাচাই করে নেওয়া — এতে অনেক সমস্যা একদম শুরুতেই আটকে যায়, আক্রমণের সুযোগ পাওয়ার আগেই।

Module 6-এ আমরা ছোট আকারে ম্যানুয়াল ভ্যালিডেশন দেখেছিলাম। আধুনিক TypeScript প্রজেক্টে, আমরা **zod**-এর মতো স্কিমা-ভিত্তিক লাইব্রেরি ব্যবহার করি, যেটা রানটাইম ভ্যালিডেশনের পাশাপাশি টাইপ ইনফারেন্সও দেয়:

```bash
npm install zod
```

```ts
// validators/postValidator.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).max(5).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

```ts
// middleware/validate.ts
import { Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export function validate(schema: AnyZodObject) {
  return (req: any, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "ইনপুট ভুল",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data; // যাচাই করা, "পরিষ্কার" ডেটা
    next();
  };
}
```

```ts
router.post(
  "/posts",
  authenticate,
  requireRole("admin", "editor"),
  validate(createPostSchema),
  createPostHandler
);
```

এই middleware চেইনটা লক্ষ্য করার মতো — এখানে authentication, authorization, আর validation প্রতিটাই নিজের নির্দিষ্ট দায়িত্ব নিয়ে একের পর এক বসেছে, ঠিক Module 7-এ শেখা middleware চেইনের দর্শন মেনেই। প্রতিটা স্তর নিজের প্রশ্নের উত্তর দেয় — "তুমি কে", "তুমি কী করতে পারো", "তোমার পাঠানো ডেটা কি গঠনগতভাবে সঠিক" — আর শুধু সবগুলো প্রশ্নের উত্তর ইতিবাচক হলেই request আসল বিজনেস লজিকে পৌঁছায়।

এখন, পুরো Module 29 আর 30 জুড়ে যা শিখেছি তার একটা সংক্ষিপ্ত নিরাপত্তা-চেকলিস্ট এখানে গুছিয়ে দেওয়া যাক, যেটা তুমি ভবিষ্যতে যেকোনো Express/NestJS প্রজেক্ট শুরু করার সময় রেফারেন্স হিসেবে ব্যবহার করতে পারো:

- পাসওয়ার্ড সবসময় hash করে রাখা (bcrypt), কখনো plain text না (Module 12)
- Access token ছোট মেয়াদের, refresh token httpOnly cookie-তে (Module 29, লেসন ১)
- প্রতিটা sensitive route-এ authentication + সঠিক role/permission চেক (Module 29)
- object-level authorization ভুলে না যাওয়া — ownership যাচাই (Module 29, লেসন ৫)
- CORS whitelist দিয়ে নির্দিষ্ট origin-এ সীমাবদ্ধ, `credentials` আর `*` origin একসাথে না (লেসন ২)
- সব SQL query parameterized অথবা ORM-নির্ভর, কখনো string concatenation না (লেসন ৩)
- ইউজার-জেনারেটেড কনটেন্ট output-এর সময় encode/sanitize করা (লেসন ৪)
- state-পরিবর্তনকারী request-এ CSRF টোকেন বা `sameSite` cookie (লেসন ৫)
- Helmet.js দিয়ে বেসলাইন security header (লেসন ৬)
- rate limiting, বিশেষ করে auth-সম্পর্কিত endpoint-এ (এই লেসন)
- প্রতিটা route-এ input validation (zod/express-validator) (এই লেসন)
- এনভায়রনমেন্ট ভ্যারিয়েবলে secret রাখা, কখনো কোডে hardcode না
- error message-এ সিস্টেমের অভ্যন্তরীণ তথ্য (স্ট্যাক ট্রেস, ডেটাবেজ কাঠামো) ফাঁস না করা

এই চেকলিস্টটাই মূলত defense-in-depth-এর একটা বাস্তব রূপ — প্রতিটা আইটেম একটা আলাদা স্তরের সুরক্ষা, আর একসাথে তারা একটা এমন সিস্টেম তৈরি করে যেখানে একটা স্তর ব্যর্থ হলেও বাকিগুলো দাঁড়িয়ে থাকে।

Authentication, Authorization, আর এখন সামগ্রিক API Security — এই তিনটা মিলিয়ে আমরা একটা API-কে "সঠিক মানুষকে সঠিক অনুমতি দেওয়া" এবং "ভুল/দূষিত ইনপুট থেকে নিজেকে রক্ষা করা" — দুটো দিক থেকেই দৃঢ় করে ফেলেছি। কিন্তু একটা API নিরাপদ হলেও, সেটা দ্রুত, নির্ভরযোগ্য, আর ভারী লোডের মধ্যেও স্থিতিশীল থাকবে কিনা তা যাচাই করা এখনো বাকি। ঠিক এই প্রশ্ন থেকেই শুরু হবে পরবর্তী মডিউল — Module 31: API Testing & Performance, যেখানে আমরা শিখবো কীভাবে Postman আর JMeter-এর মতো টুল দিয়ে আমাদের এই সুরক্ষিত API-টার গতি আর সহনশীলতা পরিমাপ করা যায়।
