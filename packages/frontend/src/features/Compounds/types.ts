/**
 * Shared types for the dual-slot compound browser.
 *
 * These mirror the shapes Elysia + Eden generate for the search endpoints.
 * We only ever consume the *types* here — no Eden client is imported or
 * called. Every real data-fetching/mutation point in this feature is a
 * `console.log` / `toast` placeholder until React Query wiring lands.
 */

export type EntityType = "perfume" | "company";

// ---- Raw API shapes (as returned by the typed-only Eden union) ----------

export interface CompanyCompound {
  id: number;
  name: string;
  countryCode: string; // country code — see normalization note in utils.ts
  compoundId: number;
}

export interface PerfumeSearchResult {
  perfumeId: number;
  perfumeName: string;
  companies: CompanyCompound[];
}

export interface PerfumeCompound {
  id: number;
  name: string;
  compoundId: number;
}

export interface CompanySearchResult {
  companyId: number;
  companyName: string;
  countryCode: string;
  perfumes: PerfumeCompound[];
}

// ---- Normalized shape — the ONLY shape List.tsx ever sees ---------------

export interface NormalizedItem {
  id: number;
  name: string;
  countryCode?: string;
  compoundId?: number;
  pairings?: NormalizedItem[];
}

// ---- Shared search state (owned by TwoSlot) ------------------------------

export interface CompoundSearch {
  type: EntityType;
  text: string;
}

// For CSS/flip concern
export type SlotSide = "left" | "right";
