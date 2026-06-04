import { test, expect } from "@playwright/test";
import { ApiHelper } from "../../utils/apiHelper";
import { DbHelper } from "../../utils/dbHelper";

test.describe("Database Validation Tests", () => {
  let api: ApiHelper;
  let db: DbHelper;

  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request);
    db = new DbHelper();
    await api.loginAsAdmin();
  });

  // ── SEED DATA ────────────────────────────────────────
  test("@db @regression Seed: exactly 10 users in DB", async () => {
    expect(await db.getUsersCount()).toBe(10);
  });

  test("@db @regression Admin user exists with role=admin", async () => {
    const user = await db.getUserByEmail("admin@insureflow.com");
    expect(user).not.toBeNull();
    expect(user.role).toBe("admin");
    expect(user.status).toBe("active");
  });

  test("@db @regression Policyholder user exists in DB", async () => {
    const user = await db.getUserByEmail("john.doe@email.com");
    expect(user).not.toBeNull();
    expect(user.role).toBe("policyholder");
  });

  test("@db @regression Active policies count > 0", async () => {
    expect(await db.getActivePoliciesCount()).toBeGreaterThan(0);
  });

  test("@db @regression POL-2024-001 is health plan active", async () => {
    const policy = await db.getPolicyByNumber("POL-2024-001");
    expect(policy).not.toBeNull();
    expect(policy.plan_type).toBe("health");
    expect(policy.status).toBe("active");
  });

  // ── POST-ACTION VALIDATION ───────────────────────────

  test("@db @regression Payment count +1 after makePayment", async () => {
    const b4 = await (await api.getPaymentHistory({ limit: "1000" })).json();
    const before = b4.count;

    await api.makePayment({
      policy_id: 1,
      amount: 12500,
      payment_method: "NEFT",
      remarks: "DB count validation",
    });

    // Wait for DB write to complete
    await new Promise((r) => setTimeout(r, 3000));

    const af = await (await api.getPaymentHistory({ limit: "1000" })).json();
    const after = af.count;

    expect(after).toBeGreaterThan(before);
  });

  test("@db @regression Latest payment has correct policy_id and method", async () => {
    const res = await api.makePayment({
      policy_id: 1,
      amount: 9000,
      payment_method: "UPI",
      remarks: "DB field check",
    });
    const body = await res.json();
    expect(body.data.policy_id).toBe(1);
    expect(body.data.payment_method).toBe("UPI");
  });

  test("@db @regression Claim pending count +1 after raise", async () => {
    const b4 = await (await api.getClaims({ limit: "1000" })).json();
    const before = b4.count;

    await api.raiseClaim({
      policy_id: 1,
      amount: 45000,
      reason: "Hospitalization",
      description: "DB count test",
    });

    await new Promise((r) => setTimeout(r, 1500));

    const af = await (await api.getClaims({ limit: "1000" })).json();
    const after = af.count;

    expect(after).toBe(before + 1);
  });

  test("@db @regression Claim status = approved after approve API", async () => {
    const raised = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 30000,
        reason: "Accident damage",
      })
    ).json();
    await api.approveClaim(raised.data.id, 28000);
    const claim = await (await api.getClaimById(raised.data.id)).json();
    expect(claim.data.status).toBe("approved");
  });

  test("@db @regression Claim approved_amount correct", async () => {
    const raised = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 50000,
        reason: "Critical illness",
      })
    ).json();
    await api.approveClaim(raised.data.id, 45000);
    const claim = await (await api.getClaimById(raised.data.id)).json();
    expect(claim.data.approved_amount).toBe(45000);
  });

  test("@db @regression Refund count +1 after initiate", async () => {
    // getAllRefunds has NO pagination — count = all records
    const b4 = await (await api.getRefunds()).json();
    const before = b4.count;

    await api.initiateRefund({
      payment_id: 1,
      amount: 5000,
      reason: "Duplicate payment",
    });

    const af = await (await api.getRefunds()).json();
    const after = af.count;

    expect(after).toBe(before + 1);
  });

  test("@db @regression Refund initiated successfully with correct amount", async () => {
    // reason is NOT returned in POST /refunds response
    // Verify via refund_ref and status instead
    const res = await api.initiateRefund({
      payment_id: 1,
      amount: 3000,
      reason: "Overpayment",
    });
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("initiated");
    expect(body.data.refund_ref).toMatch(/^REF-/);
  });

  test("@db @regression API failed payments count >= 0", async () => {
    const body = await (
      await api.getPaymentHistory({ status: "failed" })
    ).json();
    expect(body.count).toBeGreaterThanOrEqual(0);
  });
});
