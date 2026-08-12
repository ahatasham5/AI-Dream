# ২৪.১৩. Service And Controller

গত লেসনে আমরা DTO দিয়ে ইনপুট ভ্যালিডেশন আর কাস্টম Repository দিয়ে ডেটাবেজ অ্যাক্সেস স্তর তৈরি করেছি। এখন এই দুইটাকে সংযুক্ত করে বিজনেস লজিক লেখার পালা — `SubscriptionService`, আর তারপর সেটাকে HTTP-এর সাথে যুক্ত করার জন্য `SubscriptionController`।

`subscription.service.ts`:

```typescript
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  StoreSubscription,
  SubscriptionStatus,
} from './entities/store-subscription.entity';
import { StoreSubscriptionRepository } from './repositories/store-subscription.repository';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    private readonly storeSubscriptionRepo: StoreSubscriptionRepository,
  ) {}

  createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepo.create(dto);
    return this.planRepo.save(plan);
  }

  findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepo.find();
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('এই আইডিতে কোনো প্ল্যান পাওয়া যায়নি।');
    }
    return plan;
  }

  async subscribe(
    userId: string,
    dto: SubscribeDto,
  ): Promise<StoreSubscription> {
    const existingActive =
      await this.storeSubscriptionRepo.findActiveByUser(userId);
    if (existingActive) {
      throw new ConflictException(
        'তোমার ইতিমধ্যে একটা সক্রিয় সাবস্ক্রিপশন আছে।',
      );
    }

    const plan = await this.findPlanById(dto.planId);

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + plan.durationInDays);

    const subscription = this.storeSubscriptionRepo.createSubscription({
      userId,
      planId: plan.id,
      startDate,
      expiryDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.storeSubscriptionRepo.save(subscription);
  }

  getMySubscription(userId: string): Promise<StoreSubscription[]> {
    return this.storeSubscriptionRepo.findByUser(userId);
  }
}
```

এই সার্ভিসটা মনোযোগ দিয়ে পড়লে দেখবে, Module 24.08-এর PRD-তে লেখা প্রতিটা বিজনেস রুলের একটা সরাসরি প্রতিনিধিত্ব এখানে আছে — "একজনের একটাই ACTIVE সাবস্ক্রিপশন থাকতে পারবে" রুলটা `ConflictException` ছোঁড়ার মাধ্যমে প্রয়োগ হয়েছে, আর "মেয়াদ = আজ + durationInDays" রুলটা `expiryDate` হিসাবের মধ্যে বাস্তবায়িত হয়েছে। এটাই দেখায় কেন রিকোয়ারমেন্ট অ্যানালাইসিস (Module 24.01-24.02) আগে করে রাখা জরুরি ছিল — প্রতিটা লাইন কোডের পেছনে একটা নির্দিষ্ট, আগে থেকে ভাবা সিদ্ধান্ত আছে, নতুন করে ভাবতে হচ্ছে না।

এখন `subscription.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionService.createPlan(dto);
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAllPlans();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findPlanById(id);
  }
}

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  subscribe(@Req() req, @Body() dto: SubscribeDto) {
    return this.subscriptionService.subscribe(req.user.id, dto);
  }

  @Get('my-subscription')
  @UseGuards(AuthGuard('jwt'))
  mySubscription(@Req() req) {
    return this.subscriptionService.getMySubscription(req.user.id);
  }
}
```

লক্ষ্য করো, আমরা দুইটা আলাদা Controller ব্যবহার করেছি — `SubscriptionPlanController` (`/subscription-plans` রুটের জন্য) আর `SubscriptionController` (`/subscriptions` রুটের জন্য), কিন্তু দুটোই একই `SubscriptionService` শেয়ার করছে। এটা Module 24.09-এর API প্ল্যানিং টেবিলে দুই ধরনের রিসোর্স (plans বনাম subscriptions) আলাদা থাকার সরাসরি প্রতিফলন — REST কনভেনশনে একটা Controller সাধারণত একটা রিসোর্সকে প্রতিনিধিত্ব করে, তাই দুই রিসোর্স হলে দুই Controller স্বাভাবিক।

`@UseGuards(AuthGuard('jwt'), RolesGuard)` লাইনটাতে দুইটা গার্ড একসাথে চলছে — প্রথমে `AuthGuard('jwt')` যাচাই করে টোকেন বৈধ কিনা (এবং `req.user` পপুলেট করে), তারপর Module 24.07-এ বানানো `RolesGuard` যাচাই করে সেই ইউজারের রোল যথেষ্ট কিনা। NestJS গার্ডগুলো তালিকার ক্রম অনুযায়ী চালায়, প্রতিটা সিকোয়েনশিয়ালি — এটা একটা **pipeline প্যাটার্ন**, যেখানে রিকোয়েস্ট একধাপ একধাপ করে ফিল্টার হয়ে যায়।

`subscription.module.ts`-এ দুইটা Controller-ই রেজিস্টার করে দিতে হবে:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, StoreSubscription])],
  controllers: [SubscriptionPlanController, SubscriptionController],
  providers: [SubscriptionService, StoreSubscriptionRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
```

এখন এন্ড-টু-এন্ড ফ্লো সম্পূর্ণ — DTO ভ্যালিডেশন থেকে শুরু করে Controller, Service, Repository, ডেটাবেজ পর্যন্ত। কোডটা কম্পাইল হয়, `npm run start:dev` চালালে এরর ছাড়াই সার্ভার উঠবে। কিন্তু "কম্পাইল হওয়া" আর "সঠিকভাবে কাজ করা" এক জিনিস না — পরের লেসনে আমরা এই এন্ডপয়েন্টগুলো বাস্তবে কল করে দেখবো, ম্যানুয়াল টেস্টিং দিয়ে যাচাই করবো প্রতিটা বিজনেস রুল ঠিকভাবে কাজ করছে কিনা।
