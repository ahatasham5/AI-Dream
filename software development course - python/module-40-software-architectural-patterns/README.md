# Module 40 — Software Architectural Patterns

কোর্সের এই মডিউল পর্যন্ত আমরা মূলত একটা সার্ভিসের ভেতরের কোড (routing, controller, middleware, design pattern) নিয়ে কাজ করেছি। এই মডিউলে আমরা ক্যামেরা জুম আউট করে পুরো সিস্টেমের বড় ছবিটা দেখবো — একটা অ্যাপ্লিকেশন সামগ্রিকভাবে কীভাবে সংগঠিত হতে পারে (Monolith বনাম Microservices বনাম Serverless), আর যখন সিস্টেম একাধিক সার্ভিসে ভাগ হয়ে যায়, তখন সেগুলোকে একসাথে নির্ভরযোগ্যভাবে চালানোর জন্য কী কী প্যাটার্ন (Gateway, Circuit Breaker, Service Discovery, Load Balancing) দরকার হয়। প্রতিটা টপিকের প্রথম পরিচিতির পর, গুরুত্বপূর্ণ কয়েকটা টপিকে আমরা আবার ফিরে এসেছি আরও গভীর, বাস্তব প্রোডাকশন-গ্রেড আলোচনা নিয়ে।

## Lessons

| # | ফাইল | টপিক |
|---|------|------|
| 1 | [01-monolithic-architecture.md](01-monolithic-architecture.md) | Monolithic Architecture — একটা মাত্র deployable unit-এ সব ফিচার |
| 2 | [02-microservices-architecture.md](02-microservices-architecture.md) | Microservices Architecture — স্বাধীন, ছোট ছোট সার্ভিসে বিভাজন |
| 3 | [03-serverless-architecture-faas.md](03-serverless-architecture-faas.md) | Serverless / FaaS — সার্ভার ব্যবস্থাপনা ছাড়াই ফাংশন চালানো |
| 4 | [04-event-driven-architecture.md](04-event-driven-architecture.md) | Event-Driven Architecture — event পাবলিশ/সাবস্ক্রাইব করে যোগাযোগ |
| 5 | [05-cqrs-architecture.md](05-cqrs-architecture.md) | CQRS — Command আর Query মডেল আলাদা করা |
| 6 | [06-layered-n-tier-architecture.md](06-layered-n-tier-architecture.md) | Layered (n-Tier) Architecture — presentation, business, data স্তর |
| 7 | [07-model-view-controller-architecture.md](07-model-view-controller-architecture.md) | MVC Architecture — Model, View, Controller বিভাজন |
| 8 | [08-api-gateway-implementation.md](08-api-gateway-implementation.md) | API Gateway — একক প্রবেশদ্বার, auth ও routing কেন্দ্রীভূত করা |
| 9 | [09-inter-service-communication.md](09-inter-service-communication.md) | Inter-Service Communication — synchronous বনাম asynchronous |
| 10 | [10-circuit-breaker-pattern.md](10-circuit-breaker-pattern.md) | Circuit Breaker Pattern — cascading failure ঠেকানো |
| 11 | [11-service-discovery-and-registry.md](11-service-discovery-and-registry.md) | Service Discovery & Registry — কোন সার্ভিস কোথায় চলছে তা খুঁজে বের করা |
| 12 | [12-load-balancing-strategies.md](12-load-balancing-strategies.md) | Load Balancing Strategies — একাধিক ইনস্ট্যান্সে রিকোয়েস্ট বিতরণ |
| 13 | [13-api-gateway-product-comparison.md](13-api-gateway-product-comparison.md) | API Gateway Deep Dive — Nginx বনাম Kong বনাম AWS API Gateway |
| 14 | [14-inter-service-communication-rest-grpc-messaging.md](14-inter-service-communication-rest-grpc-messaging.md) | Inter-Service Communication Deep Dive — REST/gRPC বনাম RabbitMQ/Kafka |
| 15 | [15-circuit-breaker-library-and-states-deep-dive.md](15-circuit-breaker-library-and-states-deep-dive.md) | Circuit Breaker Deep Dive — `pybreaker` লাইব্রেরি ও স্টেট ট্রানজিশন |
| 16 | [16-multi-tenant-architecture.md](16-multi-tenant-architecture.md) | Multi-Tenant Architecture — একাধিক গ্রাহককে নিরাপদে সার্ভ করা |
| 17 | [17-clean-architecture.md](17-clean-architecture.md) | Clean Architecture — ব্যবসায়িক নিয়মকে ফ্রেমওয়ার্ক থেকে আলাদা রাখা |
| 18 | [18-event-driven-architecture-event-sourcing.md](18-event-driven-architecture-event-sourcing.md) | Event-Driven Deep Dive — Event Sourcing দিয়ে ইতিহাস-ভিত্তিক state |
| 19 | [19-service-discovery-consul-etcd.md](19-service-discovery-consul-etcd.md) | Service Discovery Deep Dive — Consul ও etcd বাস্তবায়ন |
| 20 | [20-load-balancing-algorithms-deep-dive.md](20-load-balancing-algorithms-deep-dive.md) | Load Balancing Deep Dive — Round Robin, Least Connections, Consistent Hashing তুলনা |

## এই মডিউল শেষে তুমি যা পারবে

- Monolith, Microservices, Serverless, Event-Driven, CQRS, Layered, MVC — এই সাতটা প্রধান স্থাপত্য প্যাটার্নের মধ্যে পার্থক্য ও প্রতিটার সঠিক ব্যবহারের প্রেক্ষাপট বুঝতে পারবে
- একটা API Gateway নিজে বাস্তবায়ন করতে পারবে, এবং Nginx/Kong/AWS API Gateway-এর মধ্যে সঠিক পণ্য বেছে নিতে পারবে
- Synchronous (REST/gRPC) ও Asynchronous (RabbitMQ/Kafka) সার্ভিস যোগাযোগের মধ্যে সঠিক পছন্দ করতে পারবে
- Circuit Breaker Pattern নিজে লিখে এবং `pybreaker` লাইব্রেরি দিয়ে বাস্তবায়ন করে cascading failure ঠেকাতে পারবে
- Service Discovery-এর মূল ধারণা ও Consul/etcd-এর বাস্তব ব্যবহার বুঝতে পারবে
- Round Robin, Least Connections, Weighted Round Robin, Consistent Hashing — লোড ব্যালান্সিং অ্যালগরিদমগুলোর মধ্যে সঠিক পছন্দ করতে পারবে
- Multi-Tenant SaaS সিস্টেম নিরাপদে ডিজাইন করতে পারবে
- Clean Architecture প্রয়োগ করে ব্যবসায়িক লজিককে ডেটাবেজ/ফ্রেমওয়ার্ক পরিবর্তনের ঝুঁকি থেকে রক্ষা করতে পারবে
- Event Sourcing দিয়ে সম্পূর্ণ অডিট-ট্রেইলযুক্ত সিস্টেম মডেল করতে পারবে

পরবর্তী মডিউল: **[Module 41 — Third Party Integrations](../module-41-third-party-integrations/README.md)**
