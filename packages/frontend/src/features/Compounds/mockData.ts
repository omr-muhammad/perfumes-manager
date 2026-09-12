import type { CompanySearchResult, PerfumeSearchResult } from "./types";

/**
 * TODO(react-query): this whole file is a stand-in for the real search
 * endpoints. It exists only so the picker has something to filter and
 * select while the feature is being built — no network call is made
 * anywhere in this feature. Delete once `usePerfumeSearch` /
 * `useCompanySearch` (or equivalent) are wired up.
 *
 * The relations below are the single source of truth; the perfume-shaped
 * and company-shaped views are derived from them so the two nested arrays
 * (`companies` on a perfume, `perfumes` on a company) stay consistent with
 * each other, `compoundId`-for-`compoundId`.
 */

interface CompoundRelation {
  compoundId: string;
  perfumeId: string;
  perfumeName: string;
  companyId: string;
  companyName: string;
  companyCountryCode: string;
}

const RELATIONS: CompoundRelation[] = [
  {
    compoundId: "cp-001",
    perfumeId: "p-1",
    perfumeName: "Noir Extreme",
    companyId: "c-1",
    companyName: "Firmenich",
    companyCountryCode: "ch",
  },
  {
    compoundId: "cp-002",
    perfumeId: "p-1",
    perfumeName: "Noir Extreme",
    companyId: "c-2",
    companyName: "Givaudan",
    companyCountryCode: "ch",
  },
  {
    compoundId: "cp-003",
    perfumeId: "p-2",
    perfumeName: "Rose de Mai",
    companyId: "c-3",
    companyName: "IFF",
    companyCountryCode: "us",
  },
  {
    compoundId: "cp-004",
    perfumeId: "p-3",
    perfumeName: "Oud Wood",
    companyId: "c-4",
    companyName: "Symrise",
    companyCountryCode: "de",
  },
  {
    compoundId: "cp-005",
    perfumeId: "p-3",
    perfumeName: "Oud Wood",
    companyId: "c-5",
    companyName: "Takasago",
    companyCountryCode: "jp",
  },
  {
    compoundId: "cp-006",
    perfumeId: "p-4",
    perfumeName: "Bergamote 22",
    companyId: "c-1",
    companyName: "Firmenich",
    companyCountryCode: "ch",
  },
  {
    compoundId: "cp-007",
    perfumeId: "p-5",
    perfumeName: "Santal 33",
    companyId: "c-6",
    companyName: "Robertet",
    companyCountryCode: "fr",
  },
  {
    compoundId: "cp-008",
    perfumeId: "p-6",
    perfumeName: "Baccarat Rouge 540",
    companyId: "c-2",
    companyName: "Givaudan",
    companyCountryCode: "ch",
  },
  {
    compoundId: "cp-009",
    perfumeId: "p-6",
    perfumeName: "Baccarat Rouge 540",
    companyId: "c-3",
    companyName: "IFF",
    companyCountryCode: "us",
  },
  {
    compoundId: "cp-010",
    perfumeId: "p-7",
    perfumeName: "Aventus",
    companyId: "c-5",
    companyName: "Takasago",
    companyCountryCode: "jp",
  },
];

const buildPerfumeResults = (): PerfumeSearchResult[] => {
  const byPerfume = new Map<string, PerfumeSearchResult>();
  for (const r of RELATIONS) {
    const existing = byPerfume.get(r.perfumeId);
    const company = {
      id: r.companyId,
      name: r.companyName,
      code: r.companyCountryCode,
      compoundId: r.compoundId,
    };
    if (existing) {
      existing.companies.push(company);
    } else {
      byPerfume.set(r.perfumeId, {
        perfumeId: r.perfumeId,
        perfumeName: r.perfumeName,
        companies: [company],
      });
    }
  }
  return [...byPerfume.values()];
};

const buildCompanyResults = (): CompanySearchResult[] => {
  const byCompany = new Map<string, CompanySearchResult>();
  for (const r of RELATIONS) {
    const existing = byCompany.get(r.companyId);
    const perfume = {
      id: r.perfumeId,
      name: r.perfumeName,
      compoundId: r.compoundId,
    };
    if (existing) {
      existing.perfumes.push(perfume);
    } else {
      byCompany.set(r.companyId, {
        companyId: r.companyId,
        companyName: r.companyName,
        countryCode: r.companyCountryCode,
        perfumes: [perfume],
      });
    }
  }
  return [...byCompany.values()];
};

export const MOCK_PERFUME_RESULTS: PerfumeSearchResult[] =
  buildPerfumeResults();
export const MOCK_COMPANY_RESULTS: CompanySearchResult[] =
  buildCompanyResults();

/** Simulates the server-side text filter a real search endpoint would do. */
export const searchPerfumes = (query: string): PerfumeSearchResult[] => {
  const q = query.trim().toLowerCase();
  if (q === "") return [];
  return MOCK_PERFUME_RESULTS.filter((r) =>
    r.perfumeName.toLowerCase().includes(q),
  );
};

export const searchCompanies = (query: string): CompanySearchResult[] => {
  const q = query.trim().toLowerCase();
  if (q === "") return [];
  return MOCK_COMPANY_RESULTS.filter((r) =>
    r.companyName.toLowerCase().includes(q),
  );
};
