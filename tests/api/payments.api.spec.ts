import { test, expect } from "@playwright/test";
import { ApiHelper } from "../../utils/apiHelper";
import { FakerHelper } from "../../utils/fakerHelper";
test.describe("Payments API Tests", () => {
  let api: ApiHelper;
  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request);
    await api.loginAsAdmin();
    // Each test gets fresh admin token via loginAsAdmin()
  });
  test("@smoke @api GET /payments/history - Returns list", async () => {
    const response = await api.getPaymentHistory();
    const body = await api.assertSuccess(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThan(0);
  });
  test("@smoke @api POST /payments - NEFT payment returns 201", async () => {
    const response = await api.makePayment({
      policy_id: 1,
      amount: 12500,
      payment_method: "NEFT",
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.transaction_ref).toMatch(/TXN-/);
    expect(["success", "failed"]).toContain(body.data.status);
  });
  test("@regression @api POST /payments - Dynamic Faker payment", async () => {
    const response = await api.makePayment(
      FakerHelper.generatePaymentPayload(1),
    );
    expect(response.status()).toBe(201);
  });
  test("@regression @api GET /payments/history?status=success", async () => {
    const response = await api.getPaymentHistory({ status: "success" });
    const body = await api.assertSuccess(response);
    for (const p of body.data) {
      expect(p.status).toBe("success");
    }
  });
  test("@regression @api GET /payments/history?status=failed", async () => {
    const response = await api.getPaymentHistory({ status: "failed" });
    const body = await api.assertSuccess(response);
    for (const p of body.data) {
      expect(p.status).toBe("failed");
    }
  });
  test("@regression @api GET /payments/history?payment_method=NEFT", async () => {
    const response = await api.getPaymentHistory({ payment_method: "NEFT" });
    const body = await api.assertSuccess(response);
    for (const p of body.data) {
      expect(p.payment_method).toBe("NEFT");
    }
  });
  test("@regression @api GET /payments/:id - Get by valid ID", async () => {
    const response = await api.getPaymentById(1);
    const body = await api.assertSuccess(response);
    expect(body.data.id).toBe(1);
    expect(body.data.transaction_ref).toBeTruthy();
  });
  test("@regression @api GET /payments/:id - Invalid ID returns 404", async () => {
    const response = await api.getPaymentById(99999);
    expect(response.status()).toBe(404);
  });
  test("@regression @api PUT /payments/:id/retry - Retry failed payment", async () => {
    const histRes = await api.getPaymentHistory({ status: "failed" });
    const body = await histRes.json();
    if (body.data.length > 0) {
      const retryRes = await api.retryPayment(body.data[0].id);
      expect([200, 400]).toContain(retryRes.status());
    }
  });
  test("@regression @api POST /payments - Invalid policy returns 404", async () => {
    expect(
      (
        await api.makePayment({
          policy_id: 99999,
          amount: 5000,
          payment_method: "NEFT",
        })
      ).status(),
    ).toBe(404);
  });
  test("@regression @api POST /payments - No token returns 401", async ({
    request,
  }) => {
    const noAuth = new ApiHelper(request);
    expect(
      (
        await noAuth.postWithoutToken("/payments", {
          policy_id: 1,
          amount: 5000,
          payment_method: "NEFT",
        })
      ).status(),
    ).toBe(401);
  });
  test("@regression @api Payments list response under 2s", async () => {
    const start = Date.now();
    await api.getPaymentHistory();
    api.assertResponseTime(start, 2000);
  });
});
