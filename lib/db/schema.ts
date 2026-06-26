import { pgTable, text, timestamp, serial, numeric, date, integer } from 'drizzle-orm/pg-core'

// Simple user table - identified only by email
export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey(), // nanoid
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'income' | 'expense' | 'both'
  color: text('color').notNull().default('#6366f1'),
  icon: text('icon').notNull().default('tag'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  categoryId: integer('categoryId').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const attendees = pgTable('attendees', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  church: text('church'),
  emergencyContactName: text('emergencyContactName'),
  emergencyContactPhone: text('emergencyContactPhone'),
  totalAmount: numeric('totalAmount', { precision: 12, scale: 2 }).notNull().default('0'),
  amountPaid: numeric('amountPaid', { precision: 12, scale: 2 }).notNull().default('0'),
  status: text('status').notNull().default('pending'), // 'pending' | 'partial' | 'paid'
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const attendeePayments = pgTable('attendee_payments', {
  id: serial('id').primaryKey(),
  attendeeId: integer('attendeeId').notNull(),
  userId: text('userId').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: date('paymentDate').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const churches = pgTable('churches', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type AppUser = typeof appUsers.$inferSelect
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Attendee = typeof attendees.$inferSelect
export type NewAttendee = typeof attendees.$inferInsert
export type AttendeePayment = typeof attendeePayments.$inferSelect
export type NewAttendeePayment = typeof attendeePayments.$inferInsert
export type Church = typeof churches.$inferSelect
export type NewChurch = typeof churches.$inferInsert
