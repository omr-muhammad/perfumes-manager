import { db } from "../config"; // placeholder - replace with your actual db instance
import {
  companiesTable,
  perfumesTable,
  perfumeCompoundsTable,
} from "../schema"; // adjust import path as needed

// Constraints
const COMPANY_PERFUME_MIN = 3; // a company produces at least this many perfumes
const COMPANY_PERFUME_MAX = 5; // a company produces at most this many perfumes
const PERFUME_COMPANY_MIN = 1; // a perfume is provided by at least this many companies
const PERFUME_COMPANY_MAX = 3; // a perfume is provided by at most this many companies

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

async function seed() {
  console.log("Clearing perfumesCompounds table...");
  await db.delete(perfumeCompoundsTable);

  console.log("Fetching company and perfume IDs...");
  const allCompanies = await db
    .select({ id: companiesTable.id })
    .from(companiesTable);
  const allPerfumes = await db
    .select({ id: perfumesTable.id })
    .from(perfumesTable);

  const companyIds = allCompanies.map((c) => c.id);
  const perfumeIds = allPerfumes.map((p) => p.id);

  // Tracks how many companies are already linked to each perfume
  const perfumeCompanyCount = new Map<number, number>(
    perfumeIds.map((id) => [id, 0]),
  );

  const pairs = new Set<string>(); // `${companyId}-${perfumeId}` guards uniqueness
  const rows: { companyId: number; perfumeId: number }[] = [];

  const addPair = (companyId: number, perfumeId: number) => {
    const key = `${companyId}-${perfumeId}`;
    if (pairs.has(key)) return false;
    pairs.add(key);
    rows.push({ companyId, perfumeId });
    perfumeCompanyCount.set(
      perfumeId,
      (perfumeCompanyCount.get(perfumeId) ?? 0) + 1,
    );
    return true;
  };

  // Each company gets 3-5 perfumes, preferring perfumes that haven't hit
  // their cap of 3 companies yet. The two ranges can conflict (e.g. every
  // company wanting perfumes that are already "full"), so there's a
  // fallback below to still satisfy the company's minimum when that happens.
  for (const companyId of companyIds) {
    const target = randomInt(COMPANY_PERFUME_MIN, COMPANY_PERFUME_MAX);
    const preferred = shuffle(perfumeIds).filter(
      (perfumeId) =>
        (perfumeCompanyCount.get(perfumeId) ?? 0) < PERFUME_COMPANY_MAX,
    );

    let assigned = 0;
    for (const perfumeId of preferred) {
      if (assigned >= target) break;
      if (addPair(companyId, perfumeId)) assigned++;
    }

    // Fallback: if too few perfumes were under their cap, relax the perfume
    // max just enough to keep this company's minimum guarantee.
    if (assigned < COMPANY_PERFUME_MIN) {
      const fallback = shuffle(perfumeIds).filter(
        (perfumeId) => !pairs.has(`${companyId}-${perfumeId}`),
      );
      for (const perfumeId of fallback) {
        if (assigned >= COMPANY_PERFUME_MIN) break;
        if (addPair(companyId, perfumeId)) assigned++;
      }
    }
  }

  // Safety net: make sure every perfume ends up with at least one company
  // (possible edge case if a perfume never got picked above).
  for (const perfumeId of perfumeIds) {
    if ((perfumeCompanyCount.get(perfumeId) ?? 0) >= PERFUME_COMPANY_MIN)
      continue;
    const companyId = companyIds[randomInt(0, companyIds.length - 1)];
    addPair(companyId!, perfumeId);
  }

  console.log(
    `Inserting ${rows.length} randomized company-perfume combinations...`,
  );
  await db.insert(perfumeCompoundsTable).values(rows);

  console.log("Done seeding perfumesCompounds.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
