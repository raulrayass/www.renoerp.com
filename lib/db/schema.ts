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

export type AppUser = typeof appUsers.$inferSelect
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
