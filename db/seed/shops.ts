import { db } from "../config";
import { shopsTable } from "../schema";

// seedShops.ts
const shopsData = [
  // --- Owner 1: Ahmed (2 Shops) ---
  {
    name: "Ahmed's Tech Hub",
    ownerId: 1,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AT",
    active: true,
    hidden: false,
  },
  {
    name: "Ahmed's Premium Coffee",
    ownerId: 1,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AC",
    active: true,
    hidden: false, // Maybe this one is still under construction but active
  },

  // --- Owner 2: Sarah (1 Shop) ---
  {
    name: "Sarah's Fashion Boutique",
    ownerId: 2,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=SB",
    active: true,
    hidden: false,
  },

  // --- Owner 3: Tariq (1 Shop) ---
  {
    name: "Tariq's Auto Parts",
    ownerId: 3,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TA",
    active: true,
    hidden: false,
  },
];

export async function seedShops() {
  console.log("⏳ Seeding shops...");

  try {
    // Optional: await db.delete(shops); // Uncomment if you want to wipe existing shops first

    await db.insert(shopsTable).values(shopsData);

    console.log("✅ Successfully seeded 4 shops!");
  } catch (error) {
    console.error("❌ Error seeding shops:", error);
    process.exit(1);
  }
}

// Execute the seed function if this file is run directly
if (
  require.main === module ||
  import.meta.url === `file://${process.argv[1]}`
) {
  seedShops()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
