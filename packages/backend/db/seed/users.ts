// seedUsers.ts

import { db } from "../config";
import { usersTable } from "../schema";

// Note: In a real application, you should hash these passwords using bcrypt/argon2
// before inserting them into the database.
const DEFAULT_PASSWORD =
  "$argon2id$v=19$m=65536,t=2,p=1$17OTdgmuBtr7+Hcu+pOTmqE25+YConb+H6kyM8F/r7M$vOtZlF8IBHNO3R1A5C0X2vodpRFPCWq+WbPmt7rSwek";

const usersData = [
  // --- 3 OWNERS ---
  {
    name: "Ahmed (Owner)",
    username: "owner_ahmed",
    email: "ahmed.owner@example.com",
    password: DEFAULT_PASSWORD,
    role: "owner" as const,
    language: "ar" as const,
    phone: "+966500000001",
    active: true,
  },
  {
    name: "Sarah (Owner)",
    username: "owner_sarah",
    email: "sarah.owner@example.com",
    password: DEFAULT_PASSWORD,
    role: "owner" as const,
    language: "en" as const,
    phone: "+966500000002",
    active: true,
  },
  {
    name: "Tariq (Owner)",
    username: "owner_tariq",
    email: "tariq.owner@example.com",
    password: DEFAULT_PASSWORD,
    role: "owner" as const,
    language: "ar" as const,
    phone: "+966500000003",
    active: true,
  },

  // --- 1 ADMIN ---
  {
    name: "Omar (Admin)",
    username: "admin_omar",
    email: "omar.admin@example.com",
    password: DEFAULT_PASSWORD,
    role: "admin" as const,
    language: "ar" as const,
    phone: "+966500000004",
    active: true,
  },

  // --- 6 CUSTOMERS ---
  {
    name: "Ali",
    username: "customer_ali",
    email: "ali@example.com",
    password: DEFAULT_PASSWORD,
    role: "customer" as const,
    language: "ar" as const,
    phone: "+966500000005",
  },
  {
    name: "Nour",
    username: "customer_nour",
    email: "nour@example.com",
    password: DEFAULT_PASSWORD,
    role: "customer" as const,
    language: "en" as const,
    phone: "+966500000006",
  },
  {
    name: "Youssef",
    username: "customer_youssef",
    email: "youssef@example.com",
    password: DEFAULT_PASSWORD,
    role: "customer" as const,
    language: "ar" as const,
    phone: "+966500000007",
  },
  {
    name: "Fatima",
    username: "customer_fatima",
    email: "fatima@example.com",
    password: DEFAULT_PASSWORD,
    role: "customer" as const,
    language: "ar" as const,
    phone: "+966500000008",
  },
  {
    name: "Khaled",
    username: "customer_khaled",
    email: "khaled@example.com",
    password: DEFAULT_PASSWORD,
    role: "customer" as const,
    language: "en" as const,
    phone: "+966500000009",
  },
  {
    name: "Layla",
    username: "customer_layla",
    email: "layla@example.com",
    password: DEFAULT_PASSWORD,
    role: "customer" as const,
    language: "ar" as const,
    phone: "+966500000010",
  },
];

export async function seedUsers() {
  console.log("⏳ Seeding users...");

  try {
    // Optional: Clear the table before seeding to prevent unique constraint errors
    // await db.delete(users);

    await db.insert(usersTable).values(usersData);

    console.log("✅ Successfully seeded 10 users!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

// Execute the seed function if this file is run directly
if (
  require.main === module ||
  import.meta.url === `file://${process.argv[1]}`
) {
  seedUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
