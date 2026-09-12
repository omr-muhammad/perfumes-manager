// --------- Standalone ---------
export { perfumesTable, perfumesRelations } from "./perfumes";
export { usersTable, usersRelations } from "./users";
export { companiesTable, companiesRelations } from "./companies";
export { perfumeCompoundsTable, pfCompRelations } from "./perfumesCompounds";

// ------------------------------

// --------- Related to User ---------
export { shopsTable, shopsRelations } from "./shops";
export { addressesTable, addressRelations } from "./addresses";
// -----------------------------------

// --------- Related to Shop ---------
export { shopsStaffTable, shopsStaffRelations } from "./shopStaff";
export { alcoholsTable, alcoRelations } from "./alcohols";
export { bottlesTable, bottlesRelations } from "./bottles";
export { shopCompsTable, shopCompsRelations } from "./shopCompounds";
export { ordersTable, ordersRelations } from "./orders";

// -----------------------------------

// --------- Related to Alcohols ---------
export { alcoholLotsTable, alcoLotRelations } from "./alcoholLots";
// ---------------------------------------

// --------- Related to Bottles ---------
export { bottlesLotsTable, btlLotsRelations } from "./bottlesLots";
// --------------------------------------

// --------- Related to Compounds ---------
export { shopCompLotsTable, shopCompLotRelations } from "./shopCompoundLots";
export { agingsTable, agingRelations } from "./agings";
// ----------------------------------------

// --------- Related to Inventory Entities ---------
export { amountTiersTable } from "./amountTiers";
// -------------------------------------------------

// --------- Related to Orders ---------
export { orderBottlesTable, orderBottlesRelations } from "./orderBottles";
export {
  orderBottleIngredientsTable,
  orderBottleIngredientsRelations,
} from "./orderBottleIngredients";
// -------------------------------------------------
