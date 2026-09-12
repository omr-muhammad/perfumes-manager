import type {
  SearchedByCompany,
  SearchedByPerfume,
  UnionSearchedCompounds,
} from "../../api/compoundsAPI";
import type { NormalizedItem } from "./types";

export function normalizeCompounds(
  searchBy: "perfume" | "company",
  result: UnionSearchedCompounds,
) {
  if (searchBy === "perfume")
    return normalizePerfumeResults(result as SearchedByPerfume);
  else if (searchBy === "company")
    return normalizeCompanyResults(result as SearchedByCompany);
}

function normalizePerfumeResults(rows: SearchedByPerfume): NormalizedItem[] {
  return rows.map((r) => ({ id: r.perfumeId, name: r.perfumeName }));
}

export const normalizeCompaniesFromPerfume = (
  rows: SearchedByPerfume[number]["companies"],
): NormalizedItem[] =>
  rows.map((c) => ({
    id: c.id,
    name: c.name,
    countryCode: c.countryCode,
    compoundId: c.compoundId,
  }));

export const normalizeCompanyResults = (
  rows: SearchedByCompany,
): NormalizedItem[] =>
  rows.map((r) => ({
    id: r.companyId,
    name: r.companyName,
    countryCode: r.countryCode,
  }));

export const normalizePerfumesFromCompany = (
  rows: SearchedByCompany[number]["perfumes"],
): NormalizedItem[] =>
  rows.map((p) => ({ id: p.id, name: p.name, compoundId: p.compoundId }));
