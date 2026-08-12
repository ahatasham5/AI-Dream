# ২৪.১৭. Developing Store Module

গত লেসনে আমরা Store মডিউলের রিকোয়ারমেন্ট আর আন্তঃমডিউল যোগাযোগের কাঠামো ঠিক করেছি। এখন হাতে-কলমে বানানোর পালা — এন্টিটি, DTO, আর Repository, ঠিক সাবস্ক্রিপশন মডিউলের মতো ক্রম মেনে (Module 24.08 আর 24.12-এর প্যাটার্ন পুনরাবৃত্তি করে, কারণ একই স্থাপত্য নীতি সব মডিউলে সমানভাবে প্রযোজ্য)।

CLI দিয়ে কাঠামো তৈরি:

```bash
nest g module modules/store
nest g controller modules/store --flat
nest g service modules/store --flat
```

`entities/store.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

export enum StoreStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.PENDING,
  })
  status: StoreStatus;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;
}
```

এখানে `Product` এন্টিটির একটা ফরওয়ার্ড রেফারেন্স আছে, যেটা আমরা Module 24.20-এ পুরোপুরি ডিফাইন করবো — কিন্তু TypeScript/TypeORM-এ সম্পর্ক দুই দিক থেকেই ডিফাইন করা লাগে, তাই আমরা এখনই এই ফাইলে `Product`-এর `import` লিখে রাখছি, ধরে নিয়ে যে সেটা শীঘ্রই তৈরি হবে। বাস্তব প্রজেক্টেও প্রায়ই এভাবে আগে থেকে সম্পর্কের কাঠামো ঠিক করে রাখা হয়, এন্টিটি পুরোপুরি বাস্তবায়নের আগেই।

এখন DTO — `dto/create-store.dto.ts`:

```typescript
import { IsString, MaxLength, Matches } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug শুধু lowercase অক্ষর, সংখ্যা আর হাইফেন দিয়ে গঠিত হতে হবে।',
  })
  slug: string;
}
```

`@Matches()` দিয়ে regex ভ্যালিডেশন যোগ করা হয়েছে, যাতে `slug` সবসময় URL-safe থাকে — এটা Module 24.16-এর রিকোয়ারমেন্টে বলা "URL-friendly ইউনিক নাম" শর্তটার সরাসরি বাস্তবায়ন।

এখন Repository লেয়ার — `repositories/store.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';

@Injectable()
export class StoreRepository {
  constructor(
    @InjectRepository(Store)
    private readonly repo: Repository<Store>,
  ) {}

  countByOwner(ownerId: string): Promise<number> {
    return this.repo.count({ where: { ownerId } });
  }

  findBySlug(slug: string): Promise<Store | null> {
    return this.repo.findOne({ where: { slug } });
  }

  create(data: Partial<Store>): Store {
    return this.repo.create(data);
  }

  save(store: Store): Promise<Store> {
    return this.repo.save(store);
  }

  findByOwner(ownerId: string): Promise<Store[]> {
    return this.repo.find({ where: { ownerId } });
  }

  findAll(): Promise<Store[]> {
    return this.repo.find({ relations: ['owner'] });
  }
}
```

`countByOwner()` মেথডটা এখানে বিশেষভাবে গুরুত্বপূর্ণ — এটাই Service লেয়ারে গিয়ে `maxStoreLimit`-এর বিপরীতে যাচাই হবে। `findBySlug()` দরকার হবে, কারণ ইউনিক কনস্ট্রেইন্ট ডেটাবেজ লেভেলে থাকলেও, ইউজারকে একটা পরিষ্কার এরর মেসেজ দেয়ার জন্য (ডেটাবেজের কাঁচা কনস্ট্রেইন্ট এরর দেখানোর বদলে) Service লেয়ারে আগে থেকেই চেক করে নেয়া ভালো অভ্যাস।

এন্টিটি রেজিস্টার করে `store.module.ts` আপডেট করি:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoreRepository } from './repositories/store.repository';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), SubscriptionModule],
  providers: [StoreRepository],
  exports: [StoreRepository],
})
export class StoreModule {}
```

লক্ষ্য করো `imports`-এ `SubscriptionModule` যোগ করা হয়েছে — এটাই গত লেসনে পরিকল্পনা করা আন্তঃমডিউল সংযোগ। এখনো `StoreService` আর `StoreController` যোগ করিনি `providers`/`controllers`-এ, কারণ Service-এর ভেতরের লজিক (সাবস্ক্রিপশন চেক করা) এখনো লেখা হয়নি — সেটাই পরের লেসনের কাজ।

মাইগ্রেশন জেনারেট আর রান করে ফেলি:

```bash
npm run migration:generate -- src/migrations/CreateStoreTable
npm run migration:run
```

এন্টিটি, DTO, আর Repository — Store মডিউলের ভিত্তি প্রস্তুত। পরের লেসনে আমরা `StoreService` লিখবো, যেখানে গত লেসনে পরিকল্পনা করা ক্রস-মডিউল সাবস্ক্রিপশন-চেক লজিকটা বাস্তবায়িত হবে, তারপর `StoreController` দিয়ে HTTP এন্ডপয়েন্ট উন্মুক্ত করবো।
