import { db } from "../config";
import { companiesTable } from "../schema";

// Define type matching your enum to satisfy TypeScript
type CompanyType = "global" | "local";

const companiesData = [
  {
    name: "Dior",
    country: "France",
    approved: true,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=Dior",
    type: "global" as CompanyType,
  },
  {
    name: "Tom Ford",
    country: "USA",
    approved: true,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TF",
    type: "global" as CompanyType,
  },
  {
    name: "Arabian Oud",
    country: "Saudi Arabia",
    approved: true,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AO",
    type: "global" as CompanyType,
  },
  {
    name: "Abdul Samad Al Qurashi",
    country: "Saudi Arabia",
    approved: true,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=ASQ",
    type: "global" as CompanyType,
  },
  {
    name: "Amouage",
    country: "Oman",
    approved: true,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=Amouage",
    type: "global" as CompanyType,
  },
  {
    name: "Jeddah Scents",
    country: "Saudi Arabia",
    approved: false, // Pending approval
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=JS",
    type: "local" as CompanyType,
  },
  {
    name: "Desert Oasis Perfumery",
    country: "UAE",
    approved: true,
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=DO",
    type: "local" as CompanyType,
  },
];

export async function seedCompanies() {
  console.log("⏳ Seeding companies...");

  try {
    // Optional: await db.delete(companies);

    await db.insert(companiesTable).values(companiesData);

    console.log("✅ Successfully seeded 7 companies!");
  } catch (error) {
    console.error("❌ Error seeding companies:", error);
    process.exit(1);
  }
}

// Execute the seed function if this file is run directly
if (
  require.main === module ||
  import.meta.url === `file://${process.argv[1]}`
) {
  seedCompanies()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
