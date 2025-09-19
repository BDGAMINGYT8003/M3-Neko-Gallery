import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Add images table
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  category: text("category").notNull(),
  apiSource: text("api_source").notNull(),
});

// Add categories table for easier filtering
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  apiSource: text("api_source").notNull(),
  isNsfw: boolean("is_nsfw").notNull().default(true),
});

// Schema for user operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema for image operations
export const insertImageSchema = createInsertSchema(images).pick({
  url: true,
  width: true,
  height: true,
  category: true,
  apiSource: true,
});

// Schema for category operations
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  apiSource: true,
  isNsfw: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Constants for API sources
export const API_SOURCES = {
  NSFW_API: 'nsfw_api',
  WAIFU_PICS: 'waifu_pics_api',
  NEKOS_MOE: 'nekos_moe_api'
} as const;