import * as fs   from 'fs';
import * as path from 'path';

// ── Direct absolute paths using forward slashes ──
const APP_PATH = path.resolve(__dirname, '../app');
const DB_PATH = `${APP_PATH}/database/insureflow.db`;

async function getDb() {
  const initSqlJs = require(`${APP_PATH}/node_modules/sql.js`);
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_PATH);
  return new SQL.Database(fileBuffer);
}
export class DbHelper {
  // ── Users ───────────────────────────────────────────

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<any> {
    const db = await getDb();
    const result = db.exec(
      `SELECT id,name,email,role,status FROM users WHERE email='${email}'`,
    );
    if (!result.length || !result[0].values.length) return null;
    const [id, name, emailVal, role, status] = result[0].values[0];
    return { id, name, email: emailVal, role, status };
  }

  /**
   * Get all users count
   */
  async getUsersCount(): Promise<number> {
    const db = await getDb();
    const result = db.exec("SELECT COUNT(*) FROM users");
    return result[0].values[0][0] as number;
  }

  // ── Policies ─────────────────────────────────────────

  /**
   * Get policy by policy number
   */
  async getPolicyByNumber(policyNumber: string): Promise<any> {
    const db = await getDb();
    const result = db.exec(
      `SELECT * FROM policies WHERE policy_number='${policyNumber}'`,
    );
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get all active policies count
   */
  async getActivePoliciesCount(): Promise<number> {
    const db = await getDb();
    const result = db.exec(
      "SELECT COUNT(*) FROM policies WHERE status='active'",
    );
    return result[0].values[0][0] as number;
  }

  // ── Payments ─────────────────────────────────────────

  /**
   * Get payment by transaction reference
   */
  async getPaymentByTxnRef(txnRef: string): Promise<any> {
    const db = await getDb();
    const result = db.exec(
      `SELECT * FROM payments WHERE transaction_ref='${txnRef}'`,
    );
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get latest payment
   */
  async getLatestPayment(): Promise<any> {
    const db = await getDb();
    const result = db.exec("SELECT * FROM payments ORDER BY id DESC LIMIT 1");
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get payments count by status
   */
  async getPaymentsCountByStatus(status: string): Promise<number> {
    const db = await getDb();
    const result = db.exec(
      `SELECT COUNT(*) FROM payments WHERE status='${status}'`,
    );
    return result[0].values[0][0] as number;
  }

  /**
   * Get all payments count
   */
  async getTotalPaymentsCount(): Promise<number> {
    const db = await getDb();
    const result = db.exec("SELECT COUNT(*) FROM payments");
    return result[0].values[0][0] as number;
  }

  // ── Claims ────────────────────────────────────────────

  /**
   * Get claim by claim number
   */
  async getClaimByNumber(claimNumber: string): Promise<any> {
    const db = await getDb();
    const result = db.exec(
      `SELECT * FROM claims WHERE claim_number='${claimNumber}'`,
    );
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get latest claim
   */
  async getLatestClaim(): Promise<any> {
    const db = await getDb();
    const result = db.exec("SELECT * FROM claims ORDER BY id DESC LIMIT 1");
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get claims count by status
   */
  async getClaimsCountByStatus(status: string): Promise<number> {
    const db = await getDb();
    const result = db.exec(
      `SELECT COUNT(*) FROM claims WHERE status='${status}'`,
    );
    return result[0].values[0][0] as number;
  }

  // ── Refunds ───────────────────────────────────────────

  /**
   * Get refund by ref
   */
  async getRefundByRef(refundRef: string): Promise<any> {
    const db = await getDb();
    const result = db.exec(
      `SELECT * FROM refunds WHERE refund_ref='${refundRef}'`,
    );
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get latest refund
   */
  async getLatestRefund(): Promise<any> {
    const db = await getDb();
    const result = db.exec("SELECT * FROM refunds ORDER BY id DESC LIMIT 1");
    if (!result.length || !result[0].values.length) return null;
    const cols = result[0].columns;
    const vals = result[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  /**
   * Get refunds count
   */
  async getTotalRefundsCount(): Promise<number> {
    const db = await getDb();
    const result = db.exec("SELECT COUNT(*) FROM refunds");
    return result[0].values[0][0] as number;
  }
}
