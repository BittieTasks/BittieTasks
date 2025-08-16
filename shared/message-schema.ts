import { z } from 'zod'
import { pgTable, varchar, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'

// Task Messages Table for Real-Time Communication
export const taskMessages = pgTable('task_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: varchar('task_id').notNull(),
  senderId: varchar('sender_id').notNull(),
  messageType: varchar('message_type', { enum: ['text', 'image', 'file'] }).default('text'),
  content: text('content').notNull(),
  fileUrl: varchar('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  isSystemMessage: boolean('is_system_message').default(false),
})

// User Presence Table for Online Status
export const userPresence = pgTable('user_presence', {
  userId: varchar('user_id').primaryKey(),
  isOnline: boolean('is_online').default(false),
  lastSeen: timestamp('last_seen').defaultNow(),
  currentTaskId: varchar('current_task_id'),
})

// TypeScript Types
export type TaskMessage = typeof taskMessages.$inferSelect
export type InsertTaskMessage = typeof taskMessages.$inferInsert
export type UserPresence = typeof userPresence.$inferSelect
export type InsertUserPresence = typeof userPresence.$inferInsert

// Zod Schemas for Validation
export const insertMessageSchema = createInsertSchema(taskMessages).omit({
  id: true,
  createdAt: true,
})

export const insertPresenceSchema = createInsertSchema(userPresence).omit({
  lastSeen: true,
})

// WebSocket Event Types
export interface WebSocketMessage {
  type: 'join_task_room' | 'leave_task_room' | 'send_message' | 'message_received' | 'typing_indicator' | 'task_update' | 'user_presence'
  payload: any
  taskId?: string
  userId?: string
  timestamp: string
}

export interface SendMessagePayload {
  taskId: string
  content: string
  messageType: 'text' | 'image' | 'file'
  fileUrl?: string
}

export interface TypingIndicatorPayload {
  taskId: string
  userId: string
  isTyping: boolean
  userName: string
}

export interface UserPresencePayload {
  userId: string
  isOnline: boolean
  currentTaskId?: string
}