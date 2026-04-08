ALTER TABLE "alcohols" ADD CONSTRAINT "selling_price_cannot_be_less_than_buying_price" CHECK (
        "alcohols"."lt_sell_price" >= "alcohols"."lt_buy_price"
      );