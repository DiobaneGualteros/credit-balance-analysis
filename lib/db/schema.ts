import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  cedula: text('cedula').notNull(),
  nombre: text('nombre').notNull(),
  mensaje: text('mensaje').notNull().default(''),
  // Array of blob pathnames (private store)
  fotos: jsonb('fotos').notNull().default([]).$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Entry = typeof entries.$inferSelect
