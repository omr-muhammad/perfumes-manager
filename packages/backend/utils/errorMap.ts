// Addresses Table
export const AD_SHOP_FK = "addresses_shop_id_fk";
export const AD_USER_FK = "addresses_user_id_fk";
export const AD_SHOP_OR_USER_FK = "addresses_shop_or_user_fk";

// Agings Table
export const AG_UQ = "agings_uq";
export const AG_LOT_FK = "agings_lot_fk";
export const AG_ALCOHOL_FK = "agings_alcohol_fk";
export const AG_AMOUNT_POS_CHK = "agings_amount_pos_chk";
export const AG_CONCENTRATION_RANGE_CHK = "agings_concentration_range_chk";

// Alcohols Table
export const AL_UQ = "alcohols_uq";
export const AL_SHOP_FK = "alcohols_shop_id_fk";
export const AL_CONCENTRATION_RANGE_CHK = "alcohols_concentration_range_chk";

// Alcohol Lots Table
export const ALL_UQ = "alcohol_lots_uq";
export const ALL_FK = "alcohol_lots_fk";
export const ALL_COST_LTE_BASE_CHK = "alcohol_lots_cost_lte_base_chk";
export const ALL_AMOUNTS_NNEG_CHK = "alcohol_lots_amounts_nneg_chk";
export const ALL_REMAINING_LTE_AMOUNT_CHK =
  "alcohol_lots_remaining_lte_amount_chk";
export const ALL_EXPIRY_DATE_FUTURE_CHK = "alcohol_lots_expiry_date_future_chk";

// Amount Tiers Table
export const AT_VALUE_POS_CHK = "amount_tiers_value_pos_chk";
export const AT_DISCOUNT_PERCENTAGE_RANGE_CHK =
  "amount_tiers_discount_percentage_range_chk";

// Bottles Table
export const BT_UQ = "bottles_uq";
export const BT_SHOP_FK = "bottles_shop_id_fk";
export const BT_SIZE_POS_CHK = "bottles_size_pos_chk";

// Bottle Lots Table
export const BTL_UQ = "btls_lots_uq";
export const BTL_BOTTLE_FK = "btls_lots_bottle_fk";
export const BTL_PRICE_NNEG_CHK = "btl_lots_price_nneg_chk";
export const BTL_COST_LTE_SELL_CHK = "btls_lots_cost_lte_sell_chk";
export const BTL_STOCKS_NNEG_CHK = "bottles_lots_stocks_nneg_chk";
export const BTL_REMAINING_LTE_STOCK_CHK = "btls_lots_remaining_lte_stock_chk";

// Companies Table
export const CO_UQ = "companies_uq";
export const CO_APPROVED_CHK = "companies_approved_chk";

// Perfumes Table
export const PF_UQ = "perfumes_uq";
export const PF_APPROVED_CHK = "perfumes_approved_chk";
export const PF_SEASONS_LIMIT_CHK = "perfumes_seasons_limit_chk";

// Perfumes Compounds Table
export const PC_UQ = "pc_uq";
export const PC_PERFUME_FK = "pc_perfume_fk";
export const PC_COMPANY_FK = "pc_company_fk";

// Shop Compounds Table
export const SC_UQ = "shop_comps_compound_shop_uq";
export const SC_COMPOUND_FK = "shop_comps_compound_fk";
export const SC_SHOP_FK = "shop_comps_shop_fk";

// Shop Compound Lots Table
export const CL_UQ = "comp_lots_uq";
export const CL_SHOP_COMP_FK = "comp_lots_shop_comp_id_fk";
export const CL_ALCOHOL_FK = "comp_lots_alcohol_id_fk";
export const CL_OIL_SPRAY_AMOUNT_POS_CHK = "comp_lots_oil_spray_amount_pos_chk";
export const CL_CONCENTRATION_RANGE_CHK = "comp_lots_concentration_range_chk";
export const CL_ALCOHOL_CHK = "comp_lots_alcohol_chk";
export const CL_REMAINING_LTE_AMOUNT_CHK = "comp_lots_remaining_lte_amount_chk";
export const CL_STOCK_GTE_0_CHK = "comp_lots_stock_gte_0_chk";

// Shops Table
export const SH_NAME_UQ = "shops_name_uq";
export const SH_OWNER_FK = "shops_owner_id_fk";

// Shops Staff Table
export const SS_SHOP_USER_PK = "shops_staff_shop_user_pk";
export const SS_SHOP_FK = "shops_staff_shop_id_fk";
export const SS_USER_FK = "shops_staff_user_id_fk";

// Users Table
export const US_USERNAME_UQ = "users_username_uq";
export const US_EMAIL_UQ = "users_email_uq";
export const US_PHONE_UQ = "users_phone_uq";

// Orders Table
export const OR_SHOP_FK = "orders_shop_id_fk";
export const OR_SUBTOTAL_NNEG_CHK = "orders_subtotal_nneg_chk";
export const OR_TOTAL_NNEG_CHK = "orders_total_nneg_chk";
export const OR_DISCOUNT_AMOUNT_NNEG_CHK = "orders_discount_amount_nneg_chk";
export const OR_SHIPPING_COST_NNEG_CHK = "orders_shipping_cost_nneg_chk";
export const OR_DISCOUNT_LTE_SUBTOTAL_CHK = "orders_discount_lte_subtotal_chk";
export const OR_DISCOUNT_REASON_REQ_CHK = "orders_discount_reason_req_chk";
export const OR_OCCASION_NOTE_REQ_CHK = "orders_occasion_note_req_chk";
export const OR_SHIPPING_REQ_CHK = "orders_shipping_req_chk";
export const OR_PAYMENT_REFUND_CHK = "orders_payment_refund_chk";
export const OR_STATUS_FULFILLMENT_CONS_CHK =
  "orders_order_status_fulfillment_cons_chk";

// Orders Bottles Table
export const OB_ORDER_FK = "order_bottles_order_id_fk";
export const OB_PRICE_NNEG_CHK = "order_bottles_bottle_price_nneg_chk";
export const OB_COST_NNEG_CHK = "order_bottles_bottle_cost_nneg_chk";
export const OB_TOTAL_NNEG_CHK = "order_bottles_total_nneg_chk";
export const OB_SIZE_POS_CHK = "order_bottles_bottle_size_pos_chk";
export const OB_QTY_MIN_CHK = "order_bottles_qty_min_chk";
export const OB_TYPE_ALCOHOL_CONS_CHK =
  "order_bottles_bottle_type_alcohol_cons_chk";

// Orders Bottles Ingredients Table
export const OBI_ORDER_BOTTLE_FK =
  "order_bottle_ingredients_order_bottle_id_fk";
export const OBI_DISCOUNT_NNEG_CHK =
  "order_bottle_ingredients_discount_nneg_chk";
export const OBI_OIL_UNIT_PRICE_NNEG_CHK =
  "order_bottle_ingredients_oil_unit_price_nneg_chk";
export const OBI_SUBTOTAL_NNEG_CHK =
  "order_bottle_ingredients_subtotal_nneg_chk";
export const OBI_TOTAL_NNEG_CHK = "order_bottle_ingredients_total_nneg_chk";
export const OBI_AMOUNT_POS_CHK = "order_bottle_ingredients_amount_pos_chk";
export const OBI_DISCOUNT_LTE_SUBTOTAL_CHK =
  "order_bottle_ingredients_discount_lte_subtotal_chk";

export const ErrorMap = {
  // Addresses table
  [AD_SHOP_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد متجر بهذا الرقم`,
    en: `Invalid reference: shop not found.`,
  },
  [AD_USER_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد مستخدم بهذا الرقم`,
    en: `Invalid reference: user not found.`,
  },
  [AD_SHOP_OR_USER_FK]: {
    ar: `يجب أن يرتبط العنوان بمستخدم أو متجر`,
    en: `Address must reference a user or a shop`,
  },

  // Agings Table
  [AG_UQ]: {
    ar: `هذا التعتيق موجود بالفعل، يرجى التحديث بدلاً من الإضافة.`,
    en: `Aging is already exist, update instead.`,
  },
  [AG_LOT_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد تركيب بهذا الرقم فى المتجر`,
    en: `Invalid reference: shop compound not found.`,
  },
  [AG_ALCOHOL_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد كحول بهذا الرقم`,
    en: `Invalid reference: alcohol not found.`,
  },
  [AG_AMOUNT_POS_CHK]: {
    ar: `كمية التعتيق يجب أن تكون رقمًا موجبًا.`,
    en: `Aging amount must be a postive number.`,
  },
  [AG_CONCENTRATION_RANGE_CHK]: {
    ar: `تركيز التعتيق يجب أن يكون بين 1 و 100.`,
    en: `Aging concentration must be between 1 and 100.`,
  },

  // Alcohols Table
  [AL_UQ]: {
    ar: `هذا الكحول موجود بالفعل، يرجى التحديث بدلاً من الإضافة.`,
    en: `Alcohol is already exist, update instead.`,
  },
  [AL_SHOP_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد متجر بهذا الرقم`,
    en: `Invalid reference: shop not found.`,
  },
  [AL_CONCENTRATION_RANGE_CHK]: {
    ar: `تركيز الكحول يجب أن يكون بين 1 و 100.`,
    en: `Alcohol concentration must be between 1 and 100.`,
  },

  // Alcohol Lots Table
  [ALL_UQ]: {
    ar: `هذه التشغيلة من الكحول موجودة بالفعل، يرجى التحديث بدلاً من الإضافة.`,
    en: `Alcohol Lot is already exist, update instead.`,
  },
  [ALL_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد كحول بهذا الرقم`,
    en: `Invalid reference: alcohol not found.`,
  },
  [ALL_COST_LTE_BASE_CHK]: {
    ar: `سعر تكلفة تشغيلة الكحول يجب أن يكون أقل من أو يساوى سعر البيع.`,
    en: `Alcohol Lot cost price must less than or equal sell price.`,
  },
  [ALL_AMOUNTS_NNEG_CHK]: {
    ar: `الكمية والكمية المتبقية لا يمكن أن تكون قيمًا سالبة.`,
    en: `Amount and remaining amount cannot have negative values.`,
  },
  [ALL_REMAINING_LTE_AMOUNT_CHK]: {
    ar: `الكمية المتبقية من تشغيلة الكحول يجب أن تكون أقل من أو تساوى الكمية الأصلية.`,
    en: `Alcohol Lot remaining amount must be less than or equal intial amount.`,
  },
  [ALL_EXPIRY_DATE_FUTURE_CHK]: {
    ar: `تاريخ انتهاء صلاحية تشغيلة الكحول يجب أن يكون فى المستقبل.`,
    en: `Alcohol Lot expiry date must be in the future.`,
  },

  // Amount Tiers Table
  [AT_VALUE_POS_CHK]: {
    ar: `قيمة شريحة الكمية يجب أن تكون رقمًا موجبًا.`,
    en: `Amount Tier value must be a positive number.`,
  },
  [AT_DISCOUNT_PERCENTAGE_RANGE_CHK]: {
    ar: `نسبة الخصم يجب أن تكون بين 1 و 100.`,
    en: `Discount percentage must be between 1 and 100.`,
  },

  // Bottles Table
  [BT_UQ]: {
    ar: `هذه الزجاجة موجودة بالفعل، يرجى التحديث بدلاً من الإضافة.`,
    en: `Bottle is already exist, update instead.`,
  },
  [BT_SHOP_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد متجر بهذا الرقم`,
    en: `Invalid reference: shop not found.`,
  },
  [BT_SIZE_POS_CHK]: {
    ar: `حجم الزجاجة يجب أن يكون دائمًا رقمًا موجبًا.`,
    en: `Bottle size must always be a positive number.`,
  },

  // Bottle Lots Table
  [BTL_UQ]: {
    ar: `هذه التشغيلة من الزجاجات موجودة بالفعل، يرجى التحديث بدلاً من الإضافة.`,
    en: `Bottle Lot is already exist, update instead.`,
  },
  [BTL_BOTTLE_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا توجد زجاجة بهذا الرقم`,
    en: `Invalid reference: bottle not found.`,
  },
  [BTL_PRICE_NNEG_CHK]: {
    ar: `قيم سعر تشغيلة الزجاجات لا يمكن أن تكون سالبة.`,
    en: `Bottle Lot price values cannot be negative.`,
  },
  [BTL_STOCKS_NNEG_CHK]: {
    ar: `قيم مخزون تشغيلة الزجاجات لا يمكن أن تكون سالبة.`,
    en: `Bottle Lot stock values cannot be negative.`,
  },
  [BTL_REMAINING_LTE_STOCK_CHK]: {
    ar: `المخزون المتبقى من تشغيلة الزجاجات يجب أن يكون أقل من أو يساوى المخزون الأصلى.`,
    en: `Bottle Lot remaining stock must be less than or equal initial stock`,
  },

  // Companies Table
  [CO_UQ]: {
    ar: `هذه الشركة موجودة بالفعل، يرجى التحديث بدلاً من الإضافة.`,
    en: `Company is already exist, update instead.`,
  },
  [CO_APPROVED_CHK]: {
    ar: `لا يمكن اعتماد الشركة فى حالة نقص البيانات المطلوبة.`,
    en: `Company cannot be approved while missing required data.`,
  },

  // Perfumes Table
  [PF_UQ]: {
    ar: `هذا العطر موجود بالفعل`,
    en: `Perfumes is already exist`,
  },
  [PF_APPROVED_CHK]: {
    ar: `لا يمكن اعتماد العطر فى حالة نقص البيانات المطلوبة.`,
    en: `Perfume cannot be approved while missing required data.`,
  },
  [PF_SEASONS_LIMIT_CHK]: {
    ar: `يوجد أربعة فصول فقط.`,
    en: `Only four seasons available.`,
  },

  // Perfumes Compounds Table
  [PC_UQ]: {
    ar: `تركيب هذا العطر موجود بالفعل.`,
    en: `Perfume Compound is already exist.`,
  },
  [PC_PERFUME_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد عطر بهذا الرقم`,
    en: `Invalid reference: perfume not found.`,
  },
  [PC_COMPANY_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا توجد شركة بهذا الرقم`,
    en: `Invalid reference: company not found.`,
  },

  // Shop Compounds Table
  [SC_UQ]: {
    ar: `هذا النوع موجود فى المتجر بالفعل`,
    en: `Shop compound already exist.`,
  },
  [SC_COMPOUND_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد تركيب عطر بهذا الرقم`,
    en: `Invalid reference: Perfume Compound not found.`,
  },
  [SC_SHOP_FK]: {
    ar: `خطأ فى الرقم المرجعى: هذا المتجر غير موجود.`,
    en: `Invalid reference: shop not found.`,
  },

  // Compound Lots Table
  [CL_UQ]: {
    ar: `هذه التشغيلة من التركيب موجودة بالفعل.`,
    en: `Compound Lot is already exist.`,
  },
  [CL_SHOP_COMP_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد تركيب بهذا الرقم فى المتجر، أو قد يكون تابعًا لمتجر آخر.`,
    en: `Invalid reference: shop compound not found, or may belong to another shop.`,
  },
  [CL_ALCOHOL_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد كحول بهذا الرقم`,
    en: `Invalid reference: alcohol not found.`,
  },
  [CL_OIL_SPRAY_AMOUNT_POS_CHK]: {
    ar: `لا يمكن إنشاء تركيب للمتجر إذا كانت كمية الزيت وكمية السبراى صفرًا معًا.`,
    en: `Cannot create shop compound while both oil and spray amount zero.`,
  },
  [CL_CONCENTRATION_RANGE_CHK]: {
    ar: `التركيز مطلوب عندما تكون كمية السبراى أكبر من 0، ويجب أن تكون قيمته بين 1 و 100.`,
    en: `Concentration is required while spray amount greater than 0, and its value must be between 1 and 100.`,
  },
  [CL_ALCOHOL_CHK]: {
    ar: `الكحول مطلوب عندما تكون كمية السبراى أكبر من 0`,
    en: `Alcohol is required when spray amount greater than 0`,
  },
  [CL_REMAINING_LTE_AMOUNT_CHK]: {
    ar: `الكمية المتبقية يجب أن تكون أقل من أو تساوى الكمية الأصلية.`,
    en: `Remaining amount must be less than or equal initial amount.`,
  },
  [CL_STOCK_GTE_0_CHK]: {
    ar: `مخزون التشغيلة مطلوب ولا يمكن أن يكون قيمة سالبة.`,
    en: `Lot stock is required and cannot be negative value.`,
  },

  // Shops Table
  [SH_NAME_UQ]: {
    ar: `هذا الاسم مستخدم من قبل، يرجى اختيار اسم آخر.`,
    en: `This name is taken, please pick another one.`,
  },
  [SH_OWNER_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد مستخدم بهذا الرقم`,
    en: `Invalid reference: user not found.`,
  },

  // Shops Staff Table
  [SS_SHOP_USER_PK]: {
    ar: `هذا المستخدم موظف بالفعل فى المتجر.`,
    en: `This user is already a staff in the shop.`,
  },
  [SS_SHOP_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد متجر بهذا الرقم`,
    en: `Invalid reference: shop not found.`,
  },
  [SS_USER_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد مستخدم بهذا الرقم`,
    en: `Invalid reference: user not found.`,
  },

  // Users Table
  [US_USERNAME_UQ]: {
    ar: `اسم المستخدم مستخدم من قبل، يرجى اختيار اسم آخر.`,
    en: `Username already taken, please pick another one.`,
  },
  [US_EMAIL_UQ]: {
    ar: `البريد الإلكترونى مسجل من قبل، يرجى تسجيل الدخول بدلاً من ذلك.`,
    en: `Email already exist, login instead.`,
  },
  [US_PHONE_UQ]: {
    ar: `رقم الهاتف مسجل من قبل، يرجى تسجيل الدخول بدلاً من ذلك.`,
    en: `Phone already exist, login instead.`,
  },

  // Orders Table
  [OR_SHOP_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد متجر بهذا الرقم`,
    en: `Invalid reference: shop not found.`,
  },
  [OR_SUBTOTAL_NNEG_CHK]: {
    ar: `إجمالى الطلب الفرعى لا يمكن أن يكون سالبًا.`,
    en: `Order subtotal cannot be negative.`,
  },
  [OR_TOTAL_NNEG_CHK]: {
    ar: `إجمالى الطلب لا يمكن أن يكون سالبًا.`,
    en: `Order total cannot be negative.`,
  },
  [OR_DISCOUNT_AMOUNT_NNEG_CHK]: {
    ar: `خصم الطلب لا يمكن أن يكون سالبًا.`,
    en: `Order discount cannot be negative.`,
  },
  [OR_SHIPPING_COST_NNEG_CHK]: {
    ar: `تكلفة الشحن لا يمكن أن تكون سالبة.`,
    en: `Shipping cost cannot be negative.`,
  },
  [OR_DISCOUNT_LTE_SUBTOTAL_CHK]: {
    ar: `الخصم لا يمكن أن يكون أكبر من إجمالى الطلب الفرعى.`,
    en: `Discount cannot be greater than order subtotal.`,
  },
  [OR_DISCOUNT_REASON_REQ_CHK]: {
    ar: `سبب الخصم مطلوب عندما تكون قيمة الخصم أكبر من 0.`,
    en: `Discount reason is required when discount amount greater than 0.`,
  },
  [OR_OCCASION_NOTE_REQ_CHK]: {
    ar: `ملاحظة المناسبة مطلوبة عندما تكون المناسبة مضبوطة على أخرى.`,
    en: `Occasion note is required when occasion set to others.`,
  },
  [OR_SHIPPING_REQ_CHK]: {
    ar: `الشحن مطلوب لطلبات التوصيل.`,
    en: `Shipping is required for dilevery orders.`,
  },
  [OR_PAYMENT_REFUND_CHK]: {
    ar: `لا يمكن استرداد قيمة الطلبات التى لم يتم توصيلها.`,
    en: `Cannot refuned undelivered orders.`,
  },
  [OR_STATUS_FULFILLMENT_CONS_CHK]: {
    ar: `الطلبات غير الموصلة لا يمكن أن تحمل حالة تم الشحن.`,
    en: `non-delivered orders cannot carry shipped status.`,
  },

  // Orders Bottles Table
  [OB_ORDER_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا يوجد طلب بهذا الرقم`,
    en: `Invalid reference: order not found.`,
  },
  [OB_PRICE_NNEG_CHK]: {
    ar: `سعر الزجاجة لا يمكن أن يكون سالبًا.`,
    en: `Bottle price cannot be negative.`,
  },
  [OB_COST_NNEG_CHK]: {
    ar: `تكلفة الزجاجة لا يمكن أن تكون سالبة.`,
    en: `Bottle cost cannot be negative.`,
  },
  [OB_TOTAL_NNEG_CHK]: {
    ar: `السعر الإجمالى للزجاجة لا يمكن أن يكون سالبًا.`,
    en: `Bottle total price cannot be negative.`,
  },
  [OB_SIZE_POS_CHK]: {
    ar: `حجم الزجاجة يجب أن يكون رقمًا موجبًا.`,
    en: `Bottle size must be a positive number.`,
  },
  [OB_QTY_MIN_CHK]: {
    ar: `كمية الزجاجات لا يمكن أن تكون أقل من واحد.`,
    en: `Bottle quantity cannot be less than one.`,
  },
  [OB_TYPE_ALCOHOL_CONS_CHK]: {
    ar: `زجاجات الزيت لا يمكن أن تحتوى على كمية كحول.`,
    en: `Oil bottles cannot have alcohol amount.`,
  },

  // Orders Bottles Ingredients Table
  [OBI_ORDER_BOTTLE_FK]: {
    ar: `خطأ فى الرقم المرجعى: لا توجد زجاجة طلب بهذا الرقم`,
    en: `Invalid reference: order bottle not found.`,
  },
  [OBI_DISCOUNT_NNEG_CHK]: {
    ar: `خصم المكون لا يمكن أن يكون سالبًا.`,
    en: `Ingredient discount cannot be negative.`,
  },
  [OBI_OIL_UNIT_PRICE_NNEG_CHK]: {
    ar: `سعر وحدة الزيت لا يمكن أن يكون سالبًا.`,
    en: `Oil unit price cannot be negative.`,
  },
  [OBI_SUBTOTAL_NNEG_CHK]: {
    ar: `إجمالى المكون الفرعى لا يمكن أن يكون سالبًا.`,
    en: `Ingredient subtotal cannot be negative.`,
  },
  [OBI_TOTAL_NNEG_CHK]: {
    ar: `إجمالى المكون لا يمكن أن يكون سالبًا.`,
    en: `Ingredient total cannot be negative.`,
  },
  [OBI_AMOUNT_POS_CHK]: {
    ar: `كمية المكون يجب أن تكون رقمًا موجبًا.`,
    en: `Ingredient amount must be positive number.`,
  },
  [OBI_DISCOUNT_LTE_SUBTOTAL_CHK]: {
    ar: `خصم المكون يجب أن يكون أقل من أو يساوى الإجمالى الفرعى.`,
    en: `Ingredient discount must be less than or equal subtotal.`,
  },
};
