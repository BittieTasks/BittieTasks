import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  varchar,
  uuid
} from 'drizzle-orm/pg-core'

// Payments table for transparent fee tracking
export const payments = pgTable('payments', {
  id: varchar('id').primaryKey(), // Stripe payment intent ID
  taskId: uuid('task_id').references(() => tasks.id),
  userId: uuid('user_id').references(() => profiles.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
  processingFee: decimal('processing_fee', { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }).notNull(),
  taskType: varchar('task_type').notNull(), // 'solo', 'community', 'barter', 'corporate'
  status: varchar('status').notNull().default('pending'), // 'pending', 'completed', 'failed', 'requires_action'
  stripePaymentIntentId: varchar('stripe_payment_intent_id'),
  stripeChargeId: varchar('stripe_charge_id'),
  feeBreakdown: jsonb('fee_breakdown'), // Detailed fee calculation
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at')
})

// User earnings tracking for transparent reporting
export const userEarnings = pgTable('user_earnings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id).notNull(),
  taskId: uuid('task_id').references(() => tasks.id),
  paymentId: varchar('payment_id').references(() => payments.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // Net amount earned
  taskType: varchar('task_type').notNull(),
  earnedAt: timestamp('earned_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
})

// Platform fee tracking for business analytics
export const platformFees = pgTable('platform_fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: varchar('payment_id').references(() => payments.id).notNull(),
  taskType: varchar('task_type').notNull(),
  feeAmount: decimal('fee_amount', { precision: 10, scale: 2 }).notNull(),
  feePercentage: decimal('fee_percentage', { precision: 5, scale: 2 }).notNull(),
  collectedAt: timestamp('collected_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
})

// Add Stripe customer ID to profiles
export const profilesWithStripe = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: varchar('email'),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  stripeCustomerId: varchar('stripe_customer_id'), // New field for Stripe integration
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Assuming these exist from your main schema
declare const tasks: any
declare const profiles: any

// Export types for TypeScript
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
export type UserEarning = typeof userEarnings.$inferSelect
export type NewUserEarning = typeof userEarnings.$inferInsert
export type PlatformFee = typeof platformFees.$inferSelect
export type NewPlatformFee = typeof platformFees.$inferInsert