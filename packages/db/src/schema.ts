import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["local"] }).notNull(),
  nickname: text("nickname").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  locale: text("locale", { enum: ["en", "ru"] })
    .notNull()
    .default("ru"),
  theme: text("theme", { enum: ["dark", "light"] })
    .notNull()
    .default("dark"),
  steamPath: text("steam_path"),
  cs2Path: text("cs2_path"),
  gsiHost: text("gsi_host").notNull().default("127.0.0.1"),
  gsiPort: integer("gsi_port").notNull().default(3000),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});
