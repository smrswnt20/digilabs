import { db } from './db';

console.log('Seeding TCET Practical Lab database...');
db.seed();

const counts = db.getRoleCounts();
const total = Object.values(counts).reduce((a, b) => a + b, 0);

console.log('\n--- Database Verification ---');
console.log('SELECT role, COUNT(*) FROM users GROUP BY role;');
console.log(`STUDENT   ${counts.STUDENT || 0}`);
console.log(`FACULTY   ${counts.FACULTY || 0}`);
console.log(`ADMIN     ${counts.ADMIN || 0}`);
console.log('-----------------------------');
console.log(`Total: ${total} users`);

if (counts.STUDENT === 3 && counts.FACULTY === 1 && counts.ADMIN === 1 && total === 5) {
  console.log('✅ Seed verification PASSED: Exactly 3 STUDENT, 1 FACULTY, 1 ADMIN.');
} else {
  console.error('❌ Seed verification FAILED: Unexpected user role counts.');
  process.exit(1);
}
