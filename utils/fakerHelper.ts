/**
 * FakerHelper - Dynamic test data generation using @faker-js/faker
 * Generates realistic BFSI domain test data for every test run
 */
import { faker } from '@faker-js/faker';

export class FakerHelper {

  // ── User Data ─────────────────────────────────────────

  static generateEmail(): string {
    return faker.internet.email().toLowerCase();
  }

  static generateName(): string {
    return faker.person.fullName();
  }

  static generatePassword(): string {
    return `Test@${faker.number.int({ min: 1000, max: 9999 })}`;
  }

  // ── Policy Data ───────────────────────────────────────

  static generatePolicyNumber(): string {
    return `POL-${faker.date.recent().getFullYear()}-${faker.number.int({ min: 100, max: 999 })}`;
  }

  static generatePremiumAmount(): number {
    return faker.number.int({ min: 5000, max: 50000 });
    
  }

  static generateSumAssured(): number {
    return faker.number.int({ min: 100000, max: 5000000 });
  }

  static generatePlanType(): string {
    return faker.helpers.arrayElement(['health', 'life', 'motor', 'property', 'travel']);
  }

  // ── Payment Data ──────────────────────────────────────

  static generatePaymentAmount(min = 1000, max = 50000): string {
    return faker.number.int({ min, max }).toString();
  }

  static generatePaymentMethod(): string {
    return faker.helpers.arrayElement(['NEFT', 'NACH', 'CARD', 'UPI', 'CHEQUE']);
  }

  static generateTransactionRef(): string {
    return `TXN-${Date.now()}-${faker.string.alphanumeric(5).toUpperCase()}`;
  }

  static generatePaymentRemarks(): string {
    return faker.helpers.arrayElement([
      'Annual premium payment',
      'Quarterly premium payment',
      'Premium renewal',
      'Policy payment - ' + faker.date.month(),
      'Automated test payment'
    ]);
  }

  // ── Claim Data ────────────────────────────────────────

  static generateClaimAmount(min = 10000, max = 500000): string {
    return faker.number.int({ min, max }).toString();
  }

  static generateClaimReason(): string {
    return faker.helpers.arrayElement([
      'Hospitalization',
      'Accident damage',
      'Critical illness',
      'Outpatient treatment',
      'Property damage',
      'Theft',
      'Natural disaster'
    ]);
  }

  static generateClaimDescription(): string {
    return faker.helpers.arrayElement([
      `Emergency treatment at ${faker.company.name()} Hospital`,
      `Vehicle accident near ${faker.location.street()}`,
      `Property damage due to ${faker.helpers.arrayElement(['cyclone', 'flood', 'fire'])}`,
      `Outpatient surgery - ${faker.helpers.arrayElement(['knee', 'shoulder', 'appendix'])}`,
      `Critical illness diagnosed on ${faker.date.recent().toDateString()}`
    ]);
  }

  // ── Refund Data ───────────────────────────────────────

  static generateRefundReason(): string {
    return faker.helpers.arrayElement([
      'Duplicate payment',
      'Policy cancellation',
      'Overpayment',
      'Failed payment refund',
      'Customer request'
    ]);
  }

  // ── Date Helpers ──────────────────────────────────────

  static generatePastDate(daysAgo = 30): string {
    const date = faker.date.recent({ days: daysAgo });
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  static generateFutureDate(daysAhead = 30): string {
    const date = faker.date.soon({ days: daysAhead });
    return date.toISOString().split('T')[0];
  }

  // ── Full Object Generators ────────────────────────────

  static generatePaymentPayload(policyId = 1) {
    return {
      policy_id: policyId,
      amount: this.generatePremiumAmount(),
      payment_method: this.generatePaymentMethod(),
      remarks: this.generatePaymentRemarks()
    };
  }

  static generateClaimPayload(policyId = 1) {
    return {
      policy_id: policyId,
      amount: parseInt(this.generateClaimAmount()),
      reason: this.generateClaimReason(),
      description: this.generateClaimDescription()
    };
  }
}
