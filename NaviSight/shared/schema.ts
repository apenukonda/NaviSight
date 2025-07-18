import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table to store user information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Settings table to store user preferences
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  speechRate: integer("speech_rate").default(10),
  voiceType: text("voice_type").default("default"),
  cameraType: text("camera_type").default("back"),
  flashEnabled: boolean("flash_enabled").default(false),
  highContrastMode: boolean("high_contrast_mode").default(false),
  vibrationEnabled: boolean("vibration_enabled").default(true),
  vibrationIntensity: integer("vibration_intensity").default(60),
});

// History table to store previous image analysis results
export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  timestamp: integer("timestamp").notNull(),
  imageUrl: text("image_url").notNull(),
  analysisResult: jsonb("analysis_result").notNull(),
});

// Define the schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  speechRate: true,
  voiceType: true,
  cameraType: true,
  flashEnabled: true,
  highContrastMode: true,
  vibrationEnabled: true,
  vibrationIntensity: true,
});

export const insertHistorySchema = createInsertSchema(history).pick({
  userId: true,
  timestamp: true,
  imageUrl: true,
  analysisResult: true,
});

// Define the types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof history.$inferSelect;

// Define the AnalysisResult type which will be stored as JSON
export type AnalysisResult = {
  sceneDescription: string;
  detectedObjects: {
    name: string;
    distance: string;
  }[];
  warningMessage?: string;
};
