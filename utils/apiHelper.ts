import { APIRequestContext,APIResponse, expect } from "@playwright/test";
export class ApiHelper {
  private request: APIRequestContext;
  private baseUrl: string;
  private token: string = "";

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseUrl = process.env.API_URL || "http://localhost:3000/api";
  }

  // ── Auth ──────────────────────────────────────────────

  /**
   * Login and store JWT token
   * @param email - User email
   * @param password - User password
   * @returns JWT token
   */
  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${this.baseUrl}/auth/login`, {
      data: { email, password },
    });
    const body = await response.json();
    if (response.ok()) {
      this.token = body.data.token;
    }
    return this.token;
  }

  /**
   * Login as admin and return token
   */
  async loginAsAdmin(): Promise<string> {
    return this.login(
      process.env.ADMIN_EMAIL || "admin@insureflow.com",
      process.env.ADMIN_PASSWORD || "Admin@123",
    );
  }

  /**
   * Login as policyholder and return token
   */
  async loginAsPolicyholder(): Promise<string> {
    return this.login(
      process.env.POLICYHOLDER_EMAIL || "john.doe@email.com",
      process.env.POLICYHOLDER_PASSWORD || "Policy@123",
    );
  }

  /**
   * Get auth headers
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  // ── Policies ──────────────────────────────────────────

  async getPolicies() {
    return this.request.get(`${this.baseUrl}/policies`, {
      headers: this.getHeaders(),
    });
  }

  async getPolicyById(id: number) {
    return this.request.get(`${this.baseUrl}/policies/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // ── Payments ──────────────────────────────────────────

  async makePayment(data: {
    policy_id: number;
    amount: number;
    payment_method: string;
    remarks?: string;
  }) {
    return this.request.post(`${this.baseUrl}/payments`, {
      headers: this.getHeaders(),
      data,
    });
  }

  async getPaymentHistory(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request.get(`${this.baseUrl}/payments/history${query}`, {
      headers: this.getHeaders(),
    });
  }

  async getPaymentById(id: number) {
    return this.request.get(`${this.baseUrl}/payments/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async retryPayment(id: number) {
    return this.request.put(`${this.baseUrl}/payments/${id}/retry`, {
      headers: this.getHeaders(),
    });
  }

  // ── Claims ────────────────────────────────────────────

  async getClaims(params?: Record<string, string>) {
  const query = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return this.request.get(`${this.baseUrl}/claims${query}`, {
    headers: this.getHeaders(),
  });
}

  async raiseClaim(data: {
    policy_id: number;
    amount: number;
    reason: string;
    description?: string;
  }) {
    return this.request.post(`${this.baseUrl}/claims`, {
      headers: this.getHeaders(),
      data,
    });
  }

  async approveClaim(id: number, approved_amount?: number) {
    return this.request.put(`${this.baseUrl}/claims/${id}/approve`, {
      headers: this.getHeaders(),
      data: { approved_amount },
    });
  }

  async rejectClaim(id: number, rejection_reason: string) {
    return this.request.put(`${this.baseUrl}/claims/${id}/reject`, {
      headers: this.getHeaders(),
      data: { rejection_reason },
    });
  }

  async disburseClaim(id: number) {
    return this.request.put(`${this.baseUrl}/claims/${id}/disburse`, {
      headers: this.getHeaders(),
    });
  }

  // ── Refunds ───────────────────────────────────────────

  async getRefunds() {
    return this.request.get(`${this.baseUrl}/refunds`, {
      headers: this.getHeaders(),
    });
  }

  async initiateRefund(data: {
    payment_id: number;
    amount: number;
    reason: string;
  }) {
    return this.request.post(`${this.baseUrl}/refunds`, {
      headers: this.getHeaders(),
      data,
    });
  }

  async processRefund(id: number) {
    return this.request.put(`${this.baseUrl}/refunds/${id}/process`, {
      headers: this.getHeaders(),
    });
  }

  // ── Unauthorized helpers ──────────────────────────────

  async getWithoutToken(endpoint: string) {
    return this.request.get(`${this.baseUrl}${endpoint}`);
  }

  async postWithoutToken(endpoint: string, data: object) {
    return this.request.post(`${this.baseUrl}${endpoint}`, { data });
  }

  // ── Response Assertion Helpers ────────────────────────

  /**
   * Assert response is 200 OK with success:true
   */
  async assertSuccess(response: any): Promise<any> {
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    return body;
  }

  /**
   * Assert response is 201 Created
   */
  async assertCreated(response: any): Promise<any> {
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    return body;
  }

  /**
   * Assert response is 401 Unauthorized
   */
  async assertUnauthorized(response: any): Promise<void> {
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  }
async getClaimById(id: number): Promise<APIResponse> {
  return await this.request.get(
    `${this.baseUrl}/claims/${id}`,
    { headers: this.getHeaders() }
  );
}
  /**
   * Assert response is 403 Forbidden
   */
  async assertForbidden(response: any): Promise<void> {
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
  }

  /**
   * Assert response time is within threshold
   */
  assertResponseTime(startTime: number, maxMs: number = 2000): void {
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(maxMs);
  }
}
