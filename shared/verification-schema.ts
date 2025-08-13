import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const verificationTokens = pgTable('verification_tokens', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: varchar('user_id').notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// Zod schemas
export const insertVerificationTokenSchema = createInsertSchema(verificationTokens).omit({
  id: true,
  created_at: true,
})

export const selectVerificationTokenSchema = createSelectSchema(verificationTokens)

// TypeScript types
export type InsertVerificationToken = z.infer<typeof insertVerificationTokenSchema>
export type VerificationToken = z.infer<typeof selectVerificationTokenSchema>