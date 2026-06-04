/**
 * InsureFlow - Database Seed Script
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDb, run, query } = require('./db');

async function seed() {
  await initDb();
  console.log('🌱 Seeding database...');

  // Clear existing data
  run('DELETE FROM refunds');
  run('DELETE FROM claims');
  run('DELETE FROM payments');
  run('DELETE FROM policies');
  run('DELETE FROM users');

  const ap = bcrypt.hashSync('Admin@123', 10);
  const ag = bcrypt.hashSync('Agent@123', 10);
  const pp = bcrypt.hashSync('Policy@123', 10);

  // Users
  const users = [
    ['Admin User', 'admin@insureflow.com', ap, 'admin', 'active'],
    ['Rajesh Kumar', 'agent@insureflow.com', ag, 'agent', 'active'],
    ['Priya Sharma', 'agent2@insureflow.com', ag, 'agent', 'active'],
    ['John Doe', 'john.doe@email.com', pp, 'policyholder', 'active'],
    ['Meena Patel', 'meena.patel@email.com', pp, 'policyholder', 'active'],
    ['Suresh Reddy', 'suresh.reddy@email.com', pp, 'policyholder', 'active'],
    ['Anita Singh', 'anita.singh@email.com', pp, 'policyholder', 'active'],
    ['Vikram Mehta', 'vikram.mehta@email.com', pp, 'policyholder', 'inactive'],
    ['Kavitha Nair', 'kavitha.nair@email.com', pp, 'policyholder', 'active'],
    ['Deepak Joshi', 'deepak.joshi@email.com', pp, 'policyholder', 'active'],
  ];
  users.forEach(u => run('INSERT INTO users (name,email,password,role,status) VALUES (?,?,?,?,?)', u));
  console.log('✅ Users seeded');

  // Policies
  const policies = [
    ['POL-2024-001', 4, 'health',    12500, 500000,  '2024-01-15','2025-01-14','2025-01-15','active',  2],
    ['POL-2024-002', 4, 'life',      25000, 2000000, '2024-02-01','2044-01-31','2025-02-01','active',  2],
    ['POL-2024-003', 5, 'motor',      8500, 300000,  '2024-03-10','2025-03-09','2025-03-10','active',  3],
    ['POL-2024-004', 5, 'health',    15000, 750000,  '2024-01-20','2025-01-19','2025-01-20','lapsed',  2],
    ['POL-2024-005', 6, 'property',  18000, 1500000, '2024-04-01','2025-03-31','2025-04-01','active',  3],
    ['POL-2024-006', 6, 'life',      30000, 3000000, '2023-06-15','2043-06-14','2025-06-15','active',  2],
    ['POL-2024-007', 7, 'health',    11000, 400000,  '2024-05-01','2025-04-30','2025-05-01','active',  3],
    ['POL-2024-008', 7, 'travel',     3500, 100000,  '2024-12-01','2025-11-30','2025-12-01','active',  2],
    ['POL-2024-009', 9, 'motor',      9500, 350000,  '2024-07-15','2025-07-14','2025-07-15','active',  3],
    ['POL-2024-010', 10,'health',    14000, 600000,  '2024-08-01','2025-07-31','2025-08-01','active',  2],
  ];
  policies.forEach(p => run('INSERT INTO policies (policy_number,holder_id,plan_type,premium_amount,sum_assured,start_date,end_date,due_date,status,agent_id) VALUES (?,?,?,?,?,?,?,?,?,?)', p));
  console.log('✅ Policies seeded');

  // Payments
  const payments = [
    ['TXN-2024-001001', 1, 12500,'NEFT',  'success','Annual premium payment',  null,          0,'2024-01-15 10:30:00'],
    ['TXN-2024-001002', 2, 25000,'NACH',  'success','Annual premium payment',  null,          0,'2024-02-01 09:15:00'],
    ['TXN-2024-001003', 3,  8500,'CARD',  'success','Motor premium payment',   null,          0,'2024-03-10 14:20:00'],
    ['TXN-2024-001004', 4, 15000,'NEFT',  'failed', 'Health premium Q1',       'Insufficient funds', 2, null],
    ['TXN-2024-001005', 4, 15000,'NEFT',  'failed', 'Health premium retry',    'Bank timeout',3, null],
    ['TXN-2024-001006', 5, 18000,'UPI',   'success','Property premium payment',null,          0,'2024-04-01 11:00:00'],
    ['TXN-2024-001007', 6, 30000,'NACH',  'success','Life premium Q1',         null,          0,'2023-06-15 09:00:00'],
    ['TXN-2024-001008', 7, 11000,'NEFT',  'success','Health premium payment',  null,          0,'2024-05-01 16:45:00'],
    ['TXN-2024-001009', 8,  3500,'CARD',  'success','Travel insurance payment',null,          0,'2024-12-01 12:30:00'],
    ['TXN-2024-001010', 9,  9500,'UPI',   'success','Motor premium payment',   null,          0,'2024-07-15 10:10:00'],
    ['TXN-2024-001011',10, 14000,'NEFT',  'success','Health premium payment',  null,          0,'2024-08-01 08:55:00'],
    ['TXN-2024-001012', 1, 12500,'CARD',  'reversed','Duplicate payment',      null,          0,'2024-01-15 10:35:00'],
    ['TXN-2024-001013', 5, 18000,'CHEQUE','pending','Cheque submitted',        null,          0, null],
    ['TXN-2024-001014', 3,  8500,'NEFT',  'failed', 'Motor premium renewal',   'Account blocked',1, null],
    ['TXN-2024-001015', 6, 30000,'NACH',  'success','Life premium Q2',         null,          0,'2023-09-15 09:00:00'],
  ];
  payments.forEach(p => run('INSERT INTO payments (transaction_ref,policy_id,amount,payment_method,status,remarks,failure_reason,retry_count,paid_at) VALUES (?,?,?,?,?,?,?,?,?)', p));
  console.log('✅ Payments seeded');

  // Claims
  const claims = [
    ['CLM-2024-001',1,4,45000,'Hospitalization','Emergency appendix surgery at Apollo Hospital','disbursed',1,42000,null,'2024-03-15 10:00:00','2024-03-25 15:00:00'],
    ['CLM-2024-002',3,5,85000,'Accident damage','Vehicle rear-ended at Jubilee Hills signal','approved',1,80000,null,'2024-06-10 14:00:00',null],
    ['CLM-2024-003',7,7,22000,'Outpatient treatment','Knee surgery at KIMS hospital','under_review',1,null,null,'2024-10-01 09:00:00',null],
    ['CLM-2024-004',5,6,150000,'Property damage','Roof damage due to cyclone','pending',null,null,null,'2024-11-20 11:00:00',null],
    ['CLM-2024-005',2,4,500000,'Critical illness','Cardiac bypass surgery','approved',1,490000,null,'2024-09-05 13:00:00',null],
    ['CLM-2024-006',1,4,8000,'Outpatient','Diagnostic tests and consultation','rejected',1,null,'Below deductible threshold','2024-04-10 10:00:00','2024-04-12 09:00:00'],
    ['CLM-2024-007',9,9,25000,'Theft','Two-wheeler stolen from parking','under_review',1,null,null,'2024-11-28 15:00:00',null],
    ['CLM-2024-008',10,10,35000,'Hospitalization','Dengue fever hospitalization 5 days','pending',null,null,null,'2024-12-01 09:00:00',null],
  ];
  claims.forEach(c => run('INSERT INTO claims (claim_number,policy_id,claimant_id,amount,reason,description,status,reviewed_by,approved_amount,rejection_reason,filed_at,settled_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', c));
  console.log('✅ Claims seeded');

  // Refunds
  const refunds = [
    ['REF-2024-001',12,12500,'Duplicate payment reversal','processed',1,'2024-01-16 10:00:00'],
    ['REF-2024-002',4,15000,'Failed payment refund','processed',1,'2024-02-10 11:00:00'],
    ['REF-2024-003',5,15000,'Failed payment retry refund','processing',null,null],
    ['REF-2024-004',14,8500,'Failed motor payment refund','initiated',null,null],
    ['REF-2024-005',6,1800,'Partial policy cancellation','initiated',null,null],
  ];
  refunds.forEach(r => run('INSERT INTO refunds (refund_ref,payment_id,amount,reason,status,processed_by,processed_at) VALUES (?,?,?,?,?,?,?)', r));
  console.log('✅ Refunds seeded');

  console.log('\n🎉 Database seed complete!');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login Credentials:');
  console.log('Admin       : admin@insureflow.com   / Admin@123');
  console.log('Agent       : agent@insureflow.com   / Agent@123');
  console.log('Policyholder: john.doe@email.com     / Policy@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
