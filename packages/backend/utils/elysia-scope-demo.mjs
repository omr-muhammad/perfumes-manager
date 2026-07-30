import { Elysia } from "elysia";

// ============================================================
// FILE: plugins/protect.ts   (imagine this is its own file)
// ============================================================
const protect = new Elysia({ name: "protect" }).resolve(
  { as: "local" },
  ({ headers }) => {
    // pretend this is real cookie/JWT verification
    const role = headers["x-mock-role"];
    if (!role) return { authPayload: undefined };
    return { authPayload: { userId: 1, role } };
  },
);

// ============================================================
// FILE: plugins/restrictTo.ts
// ============================================================
function restrictTo(...roles) {
  return new Elysia({ name: `restrict-${roles.join("-")}` })
    .use(protect) // hop 1 from protect -> restrictTo
    .onBeforeHandle({ as: "local" }, ({ authPayload, set }) => {
      console.log("  [restrictTo hook ran] authPayload =", authPayload);
      if (!authPayload || !roles.includes(authPayload.role)) {
        set.status = 403;
        return { error: "Forbidden" };
      }
    });
}

// ============================================================
// FILE: routers/perfumes.ts        -> /perfumes          (depth 1, hop 2)
// ============================================================
const perfumesRouter = new Elysia({ prefix: "/perfumes" })
  .use(restrictTo("admin"))
  .get("", ({ authPayload }) => ({
    ok: true,
    route: "/perfumes",
    role: authPayload?.role ?? "no role",
  }));

// ============================================================
// FILE: routers/perfumeById.ts     -> /perfumes/:id      (depth 2, hop 3)
// ============================================================
const perfumeByIdRouter = new Elysia({ prefix: "/perfumes/:id" })
  .use(perfumesRouter) // NOTE: composing through the router above, not restrictTo directly
  .get("", () => ({ ok: true, route: "/perfumes/:id" }));

// ============================================================
// FILE: routers/reviews.ts         -> /perfumes/:id/reviews  (depth 3, hop 4)
// ============================================================
const reviewsRouter = new Elysia({ prefix: "/perfumes/:id/reviews" })
  .use(perfumeByIdRouter)
  .get("", () => ({ ok: true, route: "/perfumes/:id/reviews" }));

// ============================================================
// FILE: routers/reviewById.ts      -> /perfumes/:id/reviews/:revId (depth 4, hop 5)
// ============================================================
const reviewByIdRouter = new Elysia({ prefix: "/perfumes/:id/reviews/:revId" })
  .use(reviewsRouter)
  .get("", () => ({ ok: true, route: "/perfumes/:id/reviews/:revId" }));

// ============================================================
// FILE: app.ts
// ============================================================
const app = new Elysia()
  .use(perfumesRouter)
  .use(perfumeByIdRouter)
  .use(reviewsRouter)
  .use(reviewByIdRouter);

// ============================================================
// TEST HARNESS — hits every depth level, logged plainly
// ============================================================
const routes = [
  "/perfumes",
  "/perfumes/1",
  "/perfumes/1/reviews",
  "/perfumes/1/reviews/9",
];

for (const path of routes) {
  console.log(`\n=== GET ${path}  (role: user) ===`);
  const res = await app.handle(
    new Request(`http://localhost${path}`, {
      headers: { "x-mock-role": "user" },
    }),
  );
  console.log("  status:", res.status, "body:", await res.json());
}

// ============================================================
// VERIFIED RESULTS (ran under Node 18+, elysia@1.4.29)
// Toggle "local" above to "scoped" or "global" and re-run to see:
//
//   as: "local"  -> hook never fires at ANY depth (0 routes in
//                   protect/restrictTo means nothing to attach to)
//
//   as: "scoped" -> restrictTo's onBeforeHandle fires at /perfumes
//                   (hop 1 from restrictTo), but authPayload is
//                   undefined there, because protect is 2 hops away
//                   from that route (protect -> restrictTo -> route)
//                   and scoped only survives 1 hop total.
//                   Nothing fires beyond /perfumes at all.
//
//   as: "global" -> works correctly at all 4 nested depths.
//
// Rule of thumb confirmed: hop budget is cumulative from the
// plugin's OWN .use() chain, not just "1 hop from whoever calls it".
// Any wrapper-of-a-wrapper composition needs "global" to be reliable.
// ============================================================
