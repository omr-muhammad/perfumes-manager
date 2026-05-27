// --------- Standalone ---------
export { perfumesTable } from "./perfumes";
export { usersTable } from "./users";
export { companiesTable } from "./companies";
// ------------------------------

// --------- Related to User ---------
export { shopsTable, shopsRelations } from "./shops";
export { addressesTable } from "./addresses";
// -----------------------------------

// --------- Related to Shop ---------
export { shopsStaffTable } from "./shopStaff";
export { alcoholsTable, alcoRelations } from "./alcohols";
export { perfumeCompoundsTable } from "./perfumesCompounds";
export { bottlesTable } from "./bottles";
// -----------------------------------

// --------- Related to Alcohols ---------
export { alcoholLotsTable, alcoLotRelations } from "./alcoholLots";
// ---------------------------------------

// --------- Related to Bottles ---------
export { bottlesLotsTable } from "./bottlesLots";
// --------------------------------------

// --------- Related to Compounds ---------
export { compoundLotsTable } from "./compoundLots";
export { agingsTable } from "./agings";
// ----------------------------------------

// --------- Related to Inventory Entities ---------
export { amountTiersTable } from "./amountTiers";
// -------------------------------------------------
