// --------- Standalone ---------
export { perfumesTable } from "./perfumes";
export { usersTable } from "./users";
export { companiesTable } from "./companies";
export { perfumeCompoundsTable } from "./perfumesCompounds";

// ------------------------------

// --------- Related to User ---------
export { shopsTable, shopsRelations } from "./shops";
export { addressesTable } from "./addresses";
// -----------------------------------

// --------- Related to Shop ---------
export { shopsStaffTable } from "./shopStaff";
export { alcoholsTable, alcoRelations } from "./alcohols";
export { bottlesTable } from "./bottles";
export { shopCompsTable } from "./shopCompounds";
export { ordersTable } from "./orders";

// -----------------------------------

// --------- Related to Alcohols ---------
export { alcoholLotsTable, alcoLotRelations } from "./alcoholLots";
// ---------------------------------------

// --------- Related to Bottles ---------
export { bottlesLotsTable } from "./bottlesLots";
// --------------------------------------

// --------- Related to Compounds ---------
export { shopCompLotsTable } from "./shopCompoundLots";
export { agingsTable } from "./agings";
// ----------------------------------------

// --------- Related to Inventory Entities ---------
export { amountTiersTable } from "./amountTiers";
// -------------------------------------------------

// --------- Related to Orders ---------
export { orderBottlesTable } from "./orderBottles";
export { orderBottleIngredientsTable } from "./orderBottleIngredients";
// -------------------------------------------------
