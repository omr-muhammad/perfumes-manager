// seedPerfumes.ts

import { db } from "../config";
import { perfumesTable } from "../schema";

type Season = "spring" | "summer" | "fall" | "winter";
type Sex = "male" | "female" | "unisex";

const perfumesData = [
  {
    name: "Midnight Oud",
    seasons: ["fall", "winter"] as Season[],
    sex: "unisex" as Sex,
    description:
      "A deep, rich woody fragrance with intense notes of agarwood and smoke.",
    approved: true,
  },
  {
    name: "Ocean Breeze",
    seasons: ["spring", "summer"] as Season[],
    sex: "male" as Sex,
    description: "Fresh aquatic notes blended with citrus and a hint of mint.",
    approved: true,
  },
  {
    name: "Floral Spring",
    seasons: ["spring"] as Season[],
    sex: "female" as Sex,
    description: "A blooming bouquet of jasmine, rose, and lily of the valley.",
    approved: true,
  },
  {
    name: "Spicy Amber",
    seasons: ["fall", "winter"] as Season[],
    sex: "male" as Sex,
    description:
      "Warm amber infused with cardamom, cinnamon, and black pepper.",
    approved: false,
  },
  {
    name: "Citrus Splash",
    seasons: ["summer"] as Season[],
    sex: "unisex" as Sex,
    description: "An energizing burst of lemon, bergamot, and sweet orange.",
    approved: true,
  },
  {
    name: "Vanilla Dream",
    seasons: ["winter"] as Season[],
    sex: "female" as Sex,
    description: "Sweet Madagascar vanilla layered with caramel and musk.",
    approved: false,
  },
  {
    name: "Desert Rose",
    seasons: ["spring", "summer"] as Season[],
    sex: "female" as Sex,
    description:
      "A dry, exotic floral scent with hints of saffron and sandalwood.",
    approved: true,
  },
  {
    name: "Woodland Oak",
    seasons: ["fall", "winter"] as Season[],
    sex: "male" as Sex,
    description: "Earthy cedarwood, pine needles, and fresh moss.",
    approved: true,
  },
  {
    name: "White Musk Pure",
    seasons: ["spring", "summer", "fall", "winter"] as Season[],
    sex: "unisex" as Sex,
    description:
      "A clean, powdery, and delicate white musk scent suitable for everyday wear.",
    approved: true,
  },
  {
    name: "Golden Patchouli",
    seasons: ["fall"] as Season[],
    sex: "unisex" as Sex,
    description: "Earthy patchouli mellowed out with golden honey and resins.",
    approved: false,
  },
];

export async function seedPerfumes() {
  console.log("⏳ Seeding perfumes...");

  try {
    // Optional: await db.delete(perfumes);

    await db.insert(perfumesTable).values(perfumesData);

    console.log("✅ Successfully seeded 10 perfumes!");
  } catch (error) {
    console.error("❌ Error seeding perfumes:", error);
    process.exit(1);
  }
}

// Execute the seed function if this file is run directly
if (
  require.main === module ||
  import.meta.url === `file://${process.argv[1]}`
) {
  seedPerfumes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
