import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "../../db/config";
import {
  alcoholLotsTable,
  bottlesLotsTable,
  bottlesTable,
  companiesTable,
  orderBottleIngredientsTable,
  orderBottlesTable,
  ordersTable,
  perfumeCompoundsTable,
  perfumesTable,
  shopCompLotsTable,
  shopCompsTable,
} from "../../db/schema";
import { assertOwnership } from "../../utils/assertOwnership";
import type { IDs, Order, OrderBottles } from "./schema";
import { AppError } from "../../utils/AppError";
import type { DbTx } from "../../utils/globalSchema";

type AlcoIds = Map<number, number>;
type AlcoLot = {
  alcoId: number;
  remainingAmount: string;
  mlPrice: string;
  mlCost: number;
};
type IngRow = {
  perfumeCompoundName: string;
  shopCompoundCode: string;
  discountAmount: string;
  amount: string;
  amountType: "spray" | "oil";
  unitPrice: string;
  unitCost: string;
  subtotal: string;
  total: string;
};

async function queryInvForOrder(
  btlsIds: number[],
  alcoAmountById: Map<number, number>,
  shopCompsIds: number[],
) {
  return await Promise.all([
    db
      .select({
        bottleId: bottlesTable.id,
        cost: bottlesLotsTable.costPrice,
        price: bottlesLotsTable.sellPrice,
        remainingStock: bottlesLotsTable.remainingStock,
        catg: bottlesTable.category,
        size: bottlesTable.size,
        type: bottlesTable.type,
      })
      .from(bottlesTable)
      .leftJoin(
        bottlesLotsTable,
        eq(bottlesTable.id, bottlesLotsTable.bottleId),
      )
      .where(
        and(
          inArray(bottlesLotsTable.bottleId, btlsIds),
          inArray(bottlesLotsTable.status, ["inuse", "ready"]),
        ),
      )
      .orderBy(
        bottlesLotsTable.bottleId,
        sql`CASE status WHEN 'inuse' THEN 0 WHEN 'ready' THEN 1 END`,
        bottlesLotsTable.receivedAt, // Ascending order makes old come first
      ),
    alcoAmountById.size > 0
      ? db
          .select({
            alcoId: alcoholLotsTable.alcoholId,
            remainingAmount: alcoholLotsTable.remainingAmount,
            mlPrice: alcoholLotsTable.mlPrice,
            mlCost: sql`${alcoholLotsTable.literCost} / 1000`.mapWith(Number),
          })
          .from(alcoholLotsTable)
          .where(
            and(
              inArray(
                alcoholLotsTable.alcoholId,
                Array.from(alcoAmountById.keys()),
              ),
              inArray(alcoholLotsTable.status, ["inuse", "ready"]),
              gt(alcoholLotsTable.expiryDate, new Date()),
            ),
          )
          .orderBy(
            alcoholLotsTable.alcoholId,
            sql`CASE status WHEN 'inuse' THEN 0 WHEN 'ready' THEN 1 END`,
            alcoholLotsTable.receivedAt,
          )
      : [],
    db
      .select({
        shopCompId: shopCompLotsTable.shopCompoundId,
        perfumeName: perfumesTable.name,
        perfumeCompany: companiesTable.name,
        code: shopCompsTable.code,
        rmSpray: shopCompLotsTable.remainingSprayAmount,
        rmOil: shopCompLotsTable.remainingOilAmount,
        mlCost: shopCompLotsTable.mlCost,
        mlPrice: shopCompLotsTable.mlPrice,
        gmCost: shopCompLotsTable.gmCost,
        gmPrice: shopCompLotsTable.gmPrice,
        density: shopCompLotsTable.densitySnapshot,
      })
      .from(shopCompLotsTable)
      .leftJoin(
        shopCompsTable,
        eq(shopCompLotsTable.shopCompoundId, shopCompsTable.id),
      )
      .leftJoin(
        perfumeCompoundsTable,
        eq(shopCompsTable.compoundId, perfumeCompoundsTable.id),
      )
      .leftJoin(
        perfumesTable,
        eq(perfumeCompoundsTable.perfumeId, perfumesTable.id),
      )
      .leftJoin(
        companiesTable,
        eq(perfumeCompoundsTable.companyId, companiesTable.id),
      )
      .where(
        and(
          inArray(shopCompLotsTable.shopCompoundId, shopCompsIds),
          inArray(shopCompLotsTable.status, ["inuse", "ready"]),
        ),
      )
      .orderBy(
        shopCompLotsTable.shopCompoundId,
        sql`CASE status WHEN 'inuse' THEN 0 WHEN 'ready' THEN 1 END`,
        shopCompLotsTable.receivedAt,
      ),
  ]);
}

function getAlcoCalculatedPrice(alcoAmountById: AlcoIds, alcoLots: AlcoLot[]) {
  if (alcoAmountById.size > 0 && alcoLots.length === 0)
    throw new AppError(
      404,
      `Alcohols used in order bottles are not part of the alcohols inventory or expired.`,
    );

  const alcoAvgPriceById = new Map<
    number,
    { avgMlCost: string; avgMlPrice: string }
  >();

  // Group by id for O(1) lockup
  const groupedALots = Object.groupBy(alcoLots, (alco) => alco.alcoId);

  if (Object.keys(groupedALots).length < alcoAmountById.size)
    throw new AppError(
      404,
      `Some of alcohols used in order bottles are not part of the alcohols inventory or expired.`,
    );

  for (const [alcoId, totalAmount] of alcoAmountById) {
    let totalPrice = 0;
    let totalCost = 0;

    // Safe to use `!` since we passed if check
    const alcoLots = groupedALots[alcoId]!;

    if (alcoLots.length === 0)
      throw new AppError(
        404,
        `No available lots for alcohol with id: ${alcoId}.`,
      );

    let remaining = totalAmount;
    for (const aLot of alcoLots) {
      const deduct = Math.min(remaining, Number(aLot.remainingAmount));
      totalPrice += deduct * Number(aLot.mlPrice);
      totalCost += deduct * aLot.mlCost;
      remaining -= deduct;

      if (remaining === 0) break;
    }

    if (remaining > 0)
      throw new AppError(
        400,
        `Insufficient amount: short by ${remaining}ml, for alcohol with id: ${alcoId}.`,
      );

    const avgMlPrice = (totalPrice / totalAmount).toFixed(3);
    const avgMlCost = (totalCost / totalAmount).toFixed(3);
    alcoAvgPriceById.set(alcoId, { avgMlPrice, avgMlCost });
  }

  return alcoAvgPriceById;
}

// Calcuate order bottle price and return matching schema objects
async function getOrderRows(bottles: OrderBottles[]) {
  const btlsIds = bottles.map((b) => b.bottleId);
  const alcoAmountById = new Map<number, number>();
  const shopCompsIds = [
    ...new Set(
      bottles.flatMap((b) => b.ingredients.map((ing) => ing.shopCompId)),
    ),
  ];

  for (const bottle of bottles) {
    if (bottle.alcoholId && bottle.alcoholAmount) {
      let storedAmount = alcoAmountById.get(bottle.alcoholId) ?? 0;
      alcoAmountById.set(
        bottle.alcoholId,
        storedAmount + bottle.alcoholAmount * bottle.qty,
      );
    }
  }

  const [bottleLots, alcoLots, shopComps] = await queryInvForOrder(
    btlsIds,
    alcoAmountById,
    shopCompsIds,
  );

  const alcoAvgPriceById = getAlcoCalculatedPrice(alcoAmountById, alcoLots);

  const groupedBLots = Object.groupBy(bottleLots, (bl) => bl.bottleId);
  const bottlesById = new Map<number, OrderBottles[]>();
  for (let i = 0; i < bottles.length; ++i) {
    const bottle = bottles[i]!;

    const entries = bottlesById.get(bottle.bottleId) ?? [];
    entries.push(bottle);

    bottlesById.set(bottle.bottleId, entries);
  }

  /* 
    Separate tracking pointer 
    REASON: lot one could reach 0 for remaining spray amount while having remaining oil,
    moving the index when one amount reaches 0 will make the remaining for other amount lost,
    and will also lose correct price tracking if price changed from lot to other. 
  */
  const groupCLots = Object.groupBy(shopComps, (c) => c.shopCompId);
  const cSprayAmounts = new Map<number, { lotIdx: number; rm: number }>();
  const cOilAmounts = new Map<number, { lotIdx: number; rm: number }>();
  for (const compId of shopCompsIds) {
    const lots = groupCLots[compId];

    if (!lots)
      throw new AppError(404, `Shop Compound with id: ${compId} not found.`);
    if (lots.length === 0)
      throw new AppError(
        404,
        `No available lots for shop compound with id: ${compId}.`,
      );

    // Initiat with ZERO
    cOilAmounts.set(compId, {
      lotIdx: 0,
      rm: Number(lots[0]!.rmOil),
    });

    cSprayAmounts.set(compId, {
      lotIdx: 0,
      rm: Number(lots[0]!.rmSpray),
    });
  }

  let orderSubtoal = 0;
  const bottleRows = [];
  // ingRows[0] = IngRow[] for => bottleRows[0]
  const ingRows: IngRow[][] = [];

  // Don't Open The Hell 😅
  for (const [bottleId, entries] of bottlesById) {
    // get bottle lots
    const bottleLots = groupedBLots[bottleId] ?? [];

    if (bottleLots.length === 0)
      throw new AppError(
        404,
        `No available lots for bottle with id: ${bottleId}.`,
      );

    let lotsIdx = 0;
    let btlIdx = 0;
    let remainingLotStock = Number(bottleLots[lotsIdx]?.remainingStock ?? 0);
    let remainingQty = entries[btlIdx]?.qty ?? 0;

    while (btlIdx < entries.length) {
      if (lotsIdx >= bottleLots.length)
        throw new AppError(
          400,
          `Insufficient stock for bottle with id: ${bottleId}.`,
        );

      const deduct = Math.min(remainingLotStock, remainingQty);

      const currentLot = bottleLots[lotsIdx]!;
      const orderBtl = entries[btlIdx]!;

      if (
        orderBtl.alcoholId &&
        alcoAvgPriceById.get(orderBtl.alcoholId) === undefined
      )
        throw new AppError(
          404,
          `Alcohol with id: ${orderBtl.alcoholId} not found.`,
        );

      const splitIngs = [];
      let totalIngPerBtl = 0;

      // Calculate shop compound price
      for (const ing of orderBtl.ingredients) {
        const cLots = groupCLots[ing.shopCompId]!;
        const pointer =
          ing.amountType === "spray"
            ? cSprayAmounts.get(ing.shopCompId)!
            : cOilAmounts.get(ing.shopCompId)!;

        // get total amount to deduct multiplied by current bottle deduction.
        const isOilMl = ing.amountType === "oil" && ing.amountUnit === "ml";
        const totalNeed = ing.amount * deduct;

        let remaining = totalNeed;
        while (remaining > 0) {
          if (pointer.lotIdx >= cLots.length)
            throw new AppError(
              400,
              `Insufficient stock for shop compound with id: ${ing.shopCompId}.`,
            );

          const curLot = cLots[pointer.lotIdx]!;
          const density = Number(curLot.density);
          // if oil in ml => convert to gm according to current lot density
          remaining = isOilMl ? remaining * density : remaining;

          let unitDeducted = Math.min(remaining, pointer.rm);

          let storedAmount: number = unitDeducted;
          let unitPrice: number;
          let unitCost: number;
          let subtotal: number;

          if (ing.amountType === "spray") {
            unitCost = Number(curLot.mlCost);
            unitPrice = Number(curLot.mlPrice);
          } else if (ing.amountUnit === "gm") {
            unitCost = Number(curLot.gmCost);
            unitPrice = Number(curLot.gmPrice);
          } else {
            // oil ml
            storedAmount /= density;
            unitCost = density * Number(curLot.gmCost); // get 1_ml price
            unitPrice = density * Number(curLot.gmPrice);
          }

          const discount = 0; // discount comes from shop compound
          subtotal = unitPrice * unitDeducted;
          const ingTotal = subtotal - discount;

          totalIngPerBtl += ingTotal;

          splitIngs.push({
            perfumeCompoundName: `${curLot.perfumeName} - ${curLot.perfumeCompany}`,
            shopCompoundCode: curLot.code!,
            discountAmount: discount.toFixed(3),
            amount: storedAmount.toFixed(3),
            amountType: ing.amountType,
            unitPrice: unitPrice.toFixed(3),
            unitCost: unitCost.toFixed(3),
            subtotal: subtotal.toFixed(3),
            total: ingTotal.toFixed(3),
          });

          remaining -= unitDeducted;
          pointer.rm -= unitDeducted;

          // return remaining to ml with current lot density incase next lot has different density
          remaining = isOilMl ? remaining / density : remaining;

          if (pointer.rm === 0) {
            pointer.lotIdx++;

            if (pointer.lotIdx < cLots.length) {
              pointer.rm =
                (ing.amountType === "spray"
                  ? Number(cLots[pointer.lotIdx]!.rmSpray)
                  : Number(cLots[pointer.lotIdx]!.rmOil)) || 0;
            }
          }
        }
      }

      ingRows.push(splitIngs);

      const totalPerBtl = deduct * Number(currentLot.price) + totalIngPerBtl;
      bottleRows.push({
        ...(orderBtl.alcoholId
          ? {
              alcoholAmount: orderBtl.alcoholAmount?.toFixed(3),
              mlPriceAtPurchase:
                alcoAvgPriceById.get(orderBtl.alcoholId)?.avgMlPrice ?? "0",

              mlCostAtPurchase:
                alcoAvgPriceById.get(orderBtl.alcoholId)?.avgMlCost ?? "0",
            }
          : {}),
        bottleType: currentLot.type,
        bottleCatg: currentLot.catg,
        bottleSize: currentLot.size,
        bottlePriceAtPurchase: currentLot.price!,
        bottleCostAtPurchase: currentLot.cost!,
        qty: deduct,
        total: totalPerBtl.toFixed(3),
      });

      remainingLotStock -= deduct;
      remainingQty -= deduct;

      orderSubtoal += totalPerBtl;

      if (remainingLotStock === 0) {
        ++lotsIdx;
        remainingLotStock = Number(bottleLots[lotsIdx]?.remainingStock ?? 0);
      }

      if (remainingQty === 0) {
        ++btlIdx;

        if (btlIdx < entries.length) remainingQty = entries[btlIdx]!.qty;
      }
    }
  }

  return { bottleRows, ingRows, orderSubtoal };
}

function prepareStockDeduction(bottles: OrderBottles[]) {
  const alcoAmountsById = new Map<number, number>();
  const bottlesQtysById = new Map<number, number>();
  const shopCompsAmountsById = new Map<
    number,
    { sprayAmount: number; gmOilAmount: number; mlOilAmount: number }
  >();

  for (const bottle of bottles) {
    const { bottleId, qty, alcoholId, alcoholAmount, ingredients } = bottle;

    // Alcohols
    if (alcoholId && alcoholAmount) {
      let storedAmount = alcoAmountsById.get(alcoholId) ?? 0;
      alcoAmountsById.set(alcoholId, storedAmount + alcoholAmount * bottle.qty);
    }

    // Bottles
    const oldQty = bottlesQtysById.get(bottleId) ?? 0;
    bottlesQtysById.set(bottleId, oldQty + qty);

    // Shop Compounds
    for (const ing of ingredients) {
      const { shopCompId, amount, amountType, amountUnit } = ing;

      const compAmounts = shopCompsAmountsById.get(shopCompId) ?? {
        sprayAmount: 0,
        gmOilAmount: 0,
        mlOilAmount: 0,
      };
      if (amountType === "spray") compAmounts.sprayAmount += amount;
      else if (amountUnit === "gm") compAmounts.gmOilAmount += amount;
      else compAmounts.mlOilAmount += amount;

      shopCompsAmountsById.set(shopCompId, compAmounts);
    }
  }

  // Alcohol decrement table
  const alcoDecList = [];
  for (const [alcoId, amount] of alcoAmountsById)
    alcoDecList.push(sql`(${alcoId}, ${Math.abs(amount)})`);

  const alcoDecsTable = sql.join(alcoDecList, sql`, `);

  // Bottles decrement table
  const btlDecList = [];
  for (const [btlId, qty] of bottlesQtysById)
    btlDecList.push(sql`(${btlId}, ${Math.abs(qty)})`);

  const btlDecsTable = sql.join(btlDecList, sql`, `);

  // Shop Compounds decrement table
  const compDecList = [];
  for (const [
    shopCompId,
    { sprayAmount, gmOilAmount, mlOilAmount },
  ] of shopCompsAmountsById)
    compDecList.push(
      sql`(${shopCompId}, ${Math.abs(gmOilAmount)}, ${Math.abs(mlOilAmount)}, ${Math.abs(sprayAmount)})`,
    );

  const compDecsTable = sql.join(compDecList, sql`, `);

  return { alcoDecsTable, btlDecsTable, compDecsTable };
}

async function decreaseStock(bottles: OrderBottles[], tx: DbTx) {
  const { alcoDecsTable, btlDecsTable, compDecsTable } =
    prepareStockDeduction(bottles);

  await Promise.all([
    // Alcohol
    tx.execute(sql`
      SELECT 
        _deduct_alcohol_lots(
          decs.id::INTEGER,
          decs.amount::NUMERIC
        )
      FROM (VALUES ${alcoDecsTable}) AS decs(id, amount)
    `),

    // Bottles
    tx.execute(sql`
      SELECT 
        _deduct_bottles_lots(
          decs.id::INTEGER,
          decs.qty::NUMERIC
        )
      FROM (VALUES ${btlDecsTable}) AS decs(id, qty)
    `),

    // Shop Compounds
    tx.execute(sql`
      SELECT 
        _deduct_shop_compound_lots(
           decs.id::INT,
          decs.gm_oil::NUMERIC,
          decs.ml_oil::NUMERIC,
          decs.spray::NUMERIC
        )
      FROM (VALUES ${compDecsTable}) AS decs(id, gm_oil, ml_oil, spray)
    `),
  ]);
}

export async function create(ids: IDs["base"], newOrder: Order) {
  const { ownerId, shopId } = ids;
  // 1) Check ownership
  await assertOwnership(shopId, ownerId);

  const { bottles, discount, customer, shipping, payment, ...rest } = newOrder;

  // 2) Calculate price
  const { bottleRows, ingRows, orderSubtoal } = await getOrderRows(bottles);

  let discountAmount = 0;
  if (discount) {
    discountAmount =
      discount.type === "percentage"
        ? (orderSubtoal * discount.value) / 100
        : discount.value;

    if (discount.maxValue)
      discountAmount = Math.min(discountAmount, discount.maxValue);
  }

  // 3) Create Order
  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(ordersTable)
      .values({
        ...rest,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        ...(newOrder.fulfillmentMethod === "delivery" && {
          shippingCountry: shipping!.country,
          shippingCity: shipping!.city,
          shippingStreet: shipping!.street,
          shippingCost: shipping!.cost,
        }),
        customerName: customer.name,
        customerPhone: customer.phone,
        discountAmount: discountAmount.toFixed(2),
        subtotal: orderSubtoal.toFixed(3),
        total: (orderSubtoal - discountAmount).toFixed(3),
        shopId,
      })
      .returning();

    if (!order) throw new AppError(400, `Failed to create new order.`);

    const orderBottles = bottleRows.map((b) => ({ ...b, orderId: order.id }));

    const insertedBtls = await tx
      .insert(orderBottlesTable)
      .values(orderBottles)
      .returning();

    if (insertedBtls.length < orderBottles.length)
      throw new AppError(400, `Failed to add order bottles issue.`);

    let ingsLen = 0;
    const orderBtlsIngs = ingRows.flatMap((ingArr, i) =>
      ingArr.map((ing) => {
        ++ingsLen;
        return { ...ing, orderBottleId: insertedBtls[i]!.id };
      }),
    );

    const insertedBtlIngs = await tx
      .insert(orderBottleIngredientsTable)
      .values(orderBtlsIngs)
      .returning();

    if (insertedBtlIngs.length < ingsLen)
      throw new AppError(400, `Failed to add order ingredients issue.`);

    await decreaseStock(bottles, tx);

    return {
      ...order,
      bottles: insertedBtls.map((b) => ({
        ...b,
        ingredients: insertedBtlIngs.filter(
          (ing) => ing.orderBottleId === b.id,
        ),
      })),
    };
  });

  return result;
}
