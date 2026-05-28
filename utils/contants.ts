export const ErrorMap = {
  // Addresses table
  addresses_shop_id_fk: `Invalid reference for shop id.`,
  addresses_user_id_fk: `Invalid reference for user id.`,
  addresses_shop_or_user_fk: `Address must reference a user or a shop`,

  // Agings Table
  agings_uq: `Aging is already exist, update instead.`,
  agings_lot_fk: `Invalid compound lot id.`,
  agings_alcohol_fk: `Invalid reference for alcohol id.`,
  agings_amount_pos_chk: `Aging amount must be a postive number.`,
  agings_concentration_range_chk: `Aging concentration must be between 1 and 100.`,

  // Alcohols Table
  alcohols_uq: `Alcohol is already exist, update instead.`,
  alcohols_shop_id_fk: `Invalid reference for shop id.`,
  alcohols_concentration_range_chk: `Alcohol concentration must be between 1 and 100.`,

  // Alcohol Lots Table
  alcohol_lots_uq: `Alcohol Lot is already exist, update instead.`,
  alcohol_lots_fk: `Invalid reference for alcohol id.`,
  alcohol_lots_cost_lte_base_chk: `Alcohol Lot cost price must less than or equal sell price.`,
  alcohol_lots_amounts_nneg_chk: `Amount and remaining amount cannot have negative values.`,
  alcohol_lots_remaining_lte_amount_chk: `Alcohol Lot remaining amount must be less than or equal intial amount.`,
  alcohol_lots_expiry_date_future_chk: `Alcohol Lot expiry date must be in the future.`,

  // Amount Tiers Table
  amount_tiers_value_pos_chk: `Amount Tier value must be a positive number.`,
  amount_tiers_discount_price_type_cons_chk: `Amount Tier discount type is a must when pricing type set to discount.`,
  amount_tiers_discount_percentage_range_chk: `Discount percentage must be between 1 and 100.`,

  // Bottles Table
  bottles_uq: `Bottle is already exist, update instead.`,
  bottles_shop_id_fk: `Invalid reference: shop not found.`,
  bottles_size_pos_chk: `Bottle size must always be a positive number.`,

  // Bottle Lots Table
  btls_lots_uq: `Bottle Lot is already exist, update instead.`,
  btls_lots_bottle_fk: `Invalid reference: bottle not found.`,
  btl_lots_price_nneg_chk: `Bottle Lot price values cannot be negative.`,
  btls_lots_cost_lte_sell_chk: `Bottle Lot cost price must be less than or equal sell price.`,
  bottles_lots_stocks_nneg_chk: `Bottle Lot stock values cannot be negative.`,
  btls_lots_remaining_lte_stock_chk: `Bottle Lot remaining stock must be less than or equal initial stock`,

  // Companies Table
  companies_uq: `Company is already exist, update instead.`,
  companies_approved_chk: `Company cannot be approved while missing required data.`,

  // Perfumes Table
  perfumes_uq: `Perfumes is already exist`,
  perfumes_approved_chk: `Perfume cannot be approved while missing required data.`,
  perfumes_seasons_limit_chk: `Only four seasons available.`,

  // Perfumes Compounds Table
  pc_uq: `Perfume Compound is already exist.`,
  pc_perfume_fk: `Invalid reference: perfume not found.`,
  pc_company_fk: `Invalid reference: company not found.`,
  pc_shop_fk: `Invalid reference: shop not found.`,

  // Shops Table
  shops_name_uq: `This name is taken, please pick another one.`,
  shops_owner_id_fk: `Invalid reference: user not found.`,

  // Shops Staff Table
  shops_staff_shop_user_pk: `This user is already a staff in the shop.`,
  shops_staff_shop_id_fk: `Invalid reference: shop not found.`,
  shops_staff_user_id_fk: `Invalid reference: user not found.`,

  // Users Table
  users_username_uq: `Username already taken, please pick another one.`,
  users_email_uq: `Email already exist, login instead.`,
  users_phone_uq: `Phone already exist, login instead.`,
};
