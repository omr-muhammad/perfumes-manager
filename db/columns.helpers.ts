import { customType } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const int4range = customType<{ data: string }>({
  dataType() {
    return "int4range";
  },
});
