import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp(),
  updatedAt: timestamp(),
};
