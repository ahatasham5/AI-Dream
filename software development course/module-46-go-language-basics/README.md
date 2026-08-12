# Module 46 — Go Language Basics

এতদিন আমরা Node.js/JavaScript আর TypeScript ইকোসিস্টেমে ব্যাকএন্ড ডেভেলপমেন্ট শিখেছি। এই মডিউলে আমরা একটা সম্পূর্ণ নতুন ভাষায় প্রবেশ করি — **Go (Golang)**, যেটা তার সরলতা, পারফরম্যান্স, আর built-in concurrency-এর জন্য আধুনিক ব্যাকএন্ড সিস্টেম, মাইক্রোসার্ভিস, আর ক্লাউড ইনফ্রাস্ট্রাকচারে ব্যাপকভাবে ব্যবহৃত হয়। সিনট্যাক্স থেকে শুরু করে concurrency, নেটওয়ার্কিং, ডাটাবেজ, সিকিউরিটি, আর পারফরম্যান্স অপটিমাইজেশন পর্যন্ত — ৪৫টা ফোকাসড লেসনে একটা সম্পূর্ণ Go ফাউন্ডেশন তৈরি হয়।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-introduction-to-go-language.md](01-introduction-to-go-language.md) | Go ভাষার পরিচিতি |
| 2 | [02-setting-up-go-development-environment.md](02-setting-up-go-development-environment.md) | Go ডেভেলপমেন্ট এনভায়রনমেন্ট সেটআপ |
| 3 | [03-understanding-go-syntax-and-data-types.md](03-understanding-go-syntax-and-data-types.md) | Go সিনট্যাক্স ও ডেটা টাইপ |
| 4 | [04-control-structures.md](04-control-structures.md) | কন্ট্রোল স্ট্রাকচার (লুপ, কন্ডিশনাল) |
| 5 | [05-functions-and-error-handling.md](05-functions-and-error-handling.md) | ফাংশন ও এরর হ্যান্ডলিং |
| 6 | [06-working-with-structs-and-interfaces.md](06-working-with-structs-and-interfaces.md) | Struct ও Interface |
| 7 | [07-concurrency-in-go-goroutines-and-channels.md](07-concurrency-in-go-goroutines-and-channels.md) | Concurrency: Goroutine ও Channel |
| 8 | [08-working-with-go-modules.md](08-working-with-go-modules.md) | Go Modules |
| 9 | [09-handling-json-and-file-io.md](09-handling-json-and-file-io.md) | JSON ও ফাইল I/O |
| 10 | [10-understanding-pointers-in-go.md](10-understanding-pointers-in-go.md) | পয়েন্টার |
| 11 | [11-slices-and-arrays-in-go.md](11-slices-and-arrays-in-go.md) | Slice ও Array |
| 12 | [12-maps-and-ranges-in-go.md](12-maps-and-ranges-in-go.md) | Map ও Range |
| 13 | [13-defer-panic-and-recover-in-go.md](13-defer-panic-and-recover-in-go.md) | Defer, Panic, Recover |
| 14 | [14-working-with-time-and-date-in-go.md](14-working-with-time-and-date-in-go.md) | Time ও Date |
| 15 | [15-unit-testing-in-go-with-testing-package.md](15-unit-testing-in-go-with-testing-package.md) | Unit Testing |
| 16 | [16-writing-benchmark-tests-in-go.md](16-writing-benchmark-tests-in-go.md) | Benchmark Testing |
| 17 | [17-logging-in-go-using-log-and-zap.md](17-logging-in-go-using-log-and-zap.md) | Logging (log ও zap) |
| 18 | [18-error-handling-best-practices.md](18-error-handling-best-practices.md) | Error Handling সেরা অনুশীলন |
| 19 | [19-working-with-regular-expressions-in-go.md](19-working-with-regular-expressions-in-go.md) | Regular Expression |
| 20 | [20-mutex-and-rwmutex-in-go.md](20-mutex-and-rwmutex-in-go.md) | Mutex ও RWMutex |
| 21 | [21-waitgroups-and-sync-package-in-go.md](21-waitgroups-and-sync-package-in-go.md) | WaitGroup ও Sync Package |
| 22 | [22-worker-pools-for-concurrent-processing.md](22-worker-pools-for-concurrent-processing.md) | Worker Pool |
| 23 | [23-select-statement-and-timeouts-in-channels.md](23-select-statement-and-timeouts-in-channels.md) | Select Statement ও Timeout |
| 24 | [24-context-package-for-managing-goroutines.md](24-context-package-for-managing-goroutines.md) | Context Package |
| 25 | [25-building-an-event-driven-pipeline-with-go.md](25-building-an-event-driven-pipeline-with-go.md) | Event-Driven Pipeline |
| 26 | [26-building-a-simple-http-server-in-go.md](26-building-a-simple-http-server-in-go.md) | সাধারণ HTTP সার্ভার |
| 27 | [27-handling-http-requests-and-responses-in-go.md](27-handling-http-requests-and-responses-in-go.md) | HTTP Request ও Response |
| 28 | [28-parsing-and-validating-json-apis.md](28-parsing-and-validating-json-apis.md) | JSON API পার্স ও ভ্যালিডেশন |
| 29 | [29-working-with-websockets-in-go.md](29-working-with-websockets-in-go.md) | WebSocket |
| 30 | [30-graphql-apis-with-go.md](30-graphql-apis-with-go.md) | GraphQL API |
| 31 | [31-grpc-and-protocol-buffers-in-go.md](31-grpc-and-protocol-buffers-in-go.md) | gRPC ও Protocol Buffers |
| 32 | [32-database-connectivity-with-sqlx-and-database-sql.md](32-database-connectivity-with-sqlx-and-database-sql.md) | sqlx ও database/sql |
| 33 | [33-using-nosql-databases-mongodb-in-go.md](33-using-nosql-databases-mongodb-in-go.md) | MongoDB (NoSQL) |
| 34 | [34-orms-in-go-gorm-vs-ent.md](34-orms-in-go-gorm-vs-ent.md) | ORM: GORM vs Ent |
| 35 | [35-streaming-large-data-with-go.md](35-streaming-large-data-with-go.md) | বড় ডেটা স্ট্রিমিং |
| 36 | [36-data-serialization-json-xml-yaml-csv.md](36-data-serialization-json-xml-yaml-csv.md) | ডেটা সিরিয়ালাইজেশন (JSON, XML, YAML, CSV) |
| 37 | [37-building-secure-apis-with-jwt-authentication.md](37-building-secure-apis-with-jwt-authentication.md) | JWT দিয়ে সুরক্ষিত API |
| 38 | [38-oauth2-and-api-key-authentication-in-go.md](38-oauth2-and-api-key-authentication-in-go.md) | OAuth2 ও API Key |
| 39 | [39-hashing-and-encryption-techniques-bcrypt-aes-rsa.md](39-hashing-and-encryption-techniques-bcrypt-aes-rsa.md) | Hashing ও Encryption (bcrypt, AES, RSA) |
| 40 | [40-secure-coding-practices-in-go.md](40-secure-coding-practices-in-go.md) | নিরাপদ কোডিং অনুশীলন |
| 41 | [41-tls-and-https-in-go.md](41-tls-and-https-in-go.md) | TLS ও HTTPS |
| 42 | [42-dependency-injection-in-go.md](42-dependency-injection-in-go.md) | Dependency Injection |
| 43 | [43-reflection-in-go.md](43-reflection-in-go.md) | Reflection |
| 44 | [44-code-generation-in-go-using-go-generate.md](44-code-generation-in-go-using-go-generate.md) | Code Generation (go generate) |
| 45 | [45-performance-optimization-and-profiling-in-go.md](45-performance-optimization-and-profiling-in-go.md) | পারফরম্যান্স অপটিমাইজেশন ও প্রোফাইলিং |

## এই মডিউল শেষে তুমি যা পারবে

- Go-এর সিনট্যাক্স, ডেটা টাইপ, স্ট্রাক্ট, ইন্টারফেস দিয়ে টাইপ-সেফ কোড লিখতে পারবে
- Goroutine, Channel, Mutex, WaitGroup, Worker Pool দিয়ে concurrent প্রোগ্রাম বানাতে পারবে
- net/http দিয়ে HTTP সার্ভার, WebSocket, gRPC, GraphQL API বানাতে পারবে
- sqlx, GORM, MongoDB driver দিয়ে ডাটাবেজ কানেক্টিভিটি বাস্তবায়ন করতে পারবে
- JWT, OAuth2, bcrypt, AES, RSA, TLS দিয়ে নিরাপদ API ডিজাইন করতে পারবে
- Dependency Injection, Reflection, Code Generation-এর মতো উন্নত প্যাটার্ন প্রয়োগ করতে পারবে
- pprof দিয়ে প্রোফাইলিং করে পারফরম্যান্স সমস্যা চিহ্নিত ও সমাধান করতে পারবে

পরবর্তী মডিউল: **Module 47 — Web Development With Gin Framework**
