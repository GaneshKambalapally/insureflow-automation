import { test, expect } from "@playwright/test";
import { ApiHelper } from "../../utils/apiHelper";
test.describe("Auth API Tests", () => {
  let api: ApiHelper;
  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request);
    // Note: we do NOT call loginAsAdmin() here
    // Auth tests test the login endpoint itself — needs no pre-auth
  });
  test("@smoke @api POST /auth/login - Admin returns JWT", async () => {
    const response = await api.postWithoutToken("/auth/login", {
      email: "admin@insureflow.com",
      password: "Admin@123",
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.role).toBe("admin");
  });
  test("@smoke @api POST /auth/login - Policyholder returns JWT", async () => {
    const response = await api.postWithoutToken("/auth/login", {
      email: "john.doe@email.com",
      password: "Policy@123",
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.user.role).toBe("policyholder");
  });
  test("@regression @api POST /auth/login - Invalid creds returns 401", async () => {
    const response = await api.postWithoutToken("/auth/login", {
      email: "wrong@email.com",
      password: "WrongPass",
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("INVALID_CREDENTIALS");
  });
  test("@regression @api POST /auth/login - Inactive account returns 403", async () => {
    const response = await api.postWithoutToken("/auth/login", {
      email: "vikram.mehta@email.com",
      password: "Policy@123",
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.code).toBe("ACCOUNT_INACTIVE");
  });
  test("@regression @api GET /policies - Blocked without token (401)", async () => {
    const response = await api.getWithoutToken("/policies");
    await api.assertUnauthorized(response);
  });
  test("@regression @api GET /claims - Blocked without token (401)", async () => {
    const response = await api.getWithoutToken("/claims");
    await api.assertUnauthorized(response);
  });
  test("@regression @api GET /health - Returns app health", async ({
    request,
  }) => {
    const response = await request.get("http://localhost:3000/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.app).toBe("InsureFlow");
  });
  test("@regression @api Login response time under 2 seconds", async () => {
    const start = Date.now();
    await api.postWithoutToken("/auth/login", {
      email: "admin@insureflow.com",
      password: "Admin@123",
    });
    api.assertResponseTime(start, 2000);
  });
});
