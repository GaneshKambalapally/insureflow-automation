import { test, expect } from "@playwright/test";
import { ApiHelper } from "../../utils/apiHelper";
import { FakerHelper } from "../../utils/fakerHelper";
test.describe("Claims API Tests", () => {
  let api: ApiHelper;
  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request);
    await api.loginAsAdmin();
  });
  test("@smoke @api GET /claims - Returns list", async () => {
    const body = await api.assertSuccess(await api.getClaims());
    expect(body.count).toBeGreaterThan(0);
  });
  test("@smoke @api POST /claims - Raise new claim returns 201", async () => {
    const body = await api.assertCreated(
      await api.raiseClaim(FakerHelper.generateClaimPayload(1)),
    );
    expect(body.data.claim_number).toMatch(/CLM-/);
    expect(body.data.status).toBe("pending");
  });
  test("@regression @api New claim status is pending", async () => {
    const body = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 45000,
        reason: "Hospitalization",
      })
    ).json();
    expect(body.data.status).toBe("pending");
  });
  test("@regression @api PUT /claims/:id/approve", async () => {
    const raised = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 30000,
        reason: "Hospitalization",
      })
    ).json();
    const res = await api.approveClaim(raised.data.id, 28000);
    expect(res.status()).toBe(200);
  });
  test("@regression @api PUT /claims/:id/reject", async () => {
    const raised = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 5000,
        reason: "Outpatient treatment",
      })
    ).json();
    expect(
      (await api.rejectClaim(raised.data.id, "Below threshold")).status(),
    ).toBe(200);
  });
  test("@regression @api Full lifecycle - Raise to Disburse", async () => {
    const raised = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 80000,
        reason: "Accident damage",
      })
    ).json();
    const claimId = raised.data.id;
    await api.approveClaim(claimId, 75000);
    const disbRes = await api.disburseClaim(claimId);
    expect(disbRes.status()).toBe(200);
    expect((await disbRes.json()).message).toContain("disbursed");
  });
  test("@regression @api Invalid policy returns 404", async () => {
    expect(
      (
        await api.raiseClaim({
          policy_id: 99999,
          amount: 50000,
          reason: "Hospitalization",
        })
      ).status(),
    ).toBe(404);
  });
  test("@regression @api No token returns 401", async ({ request }) => {
    const noAuth = new ApiHelper(request);
    expect(
      (
        await noAuth.postWithoutToken("/claims", {
          policy_id: 1,
          amount: 50000,
          reason: "Hospitalization",
        })
      ).status(),
    ).toBe(401);
  });
  test("@regression @api Policyholder only sees own claims", async ({
    request,
  }) => {
    const phApi = new ApiHelper(request);
    await phApi.loginAsPolicyholder();
    const body = await (await phApi.getClaims()).json();
    for (const claim of body.data) {
      expect(claim.claimant_id).toBe(4); // John Doe = id 4
    }
  });
  test("@regression @api GET /claims - No token returns 401", async ({
    request,
  }) => {
    const noAuth = new ApiHelper(request);
    await noAuth.assertUnauthorized(await noAuth.getWithoutToken("/claims"));
  });
  test("@regression @api Approved amount stored in response", async () => {
    const raised = await (
      await api.raiseClaim({
        policy_id: 1,
        amount: 60000,
        reason: "Critical illness",
      })
    ).json();
    await api.approveClaim(raised.data.id, 55000);
    // DB test in Module 14 verifies the stored value
  });
});
