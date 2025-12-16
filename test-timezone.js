// Test Timezone Conversion
const testDate = new Date();
testDate.setHours(testDate.getHours() - 4); // 4 hours ago

console.log('=== TIMEZONE TEST ===');
console.log('Current System Time:', new Date().toLocaleString());
console.log('Current UTC Time:', new Date().toISOString());
console.log('Timezone Offset:', -new Date().getTimezoneOffset()/60, 'hours');
console.log('');
console.log('Test Date (4 hours ago):');
console.log('  Local:', testDate.toLocaleString());
console.log('  UTC:', testDate.toISOString());
console.log('');

// Test relative time calculation
const now = new Date();
const diffMs = now - testDate;
const diffMins = Math.floor(diffMs / 60000);
const diffHours = Math.floor(diffMs / 3600000);

console.log('Time Difference:');
console.log('  Milliseconds:', diffMs);
console.log('  Minutes:', diffMins);
console.log('  Hours:', diffHours);
console.log('');

// Simulate backend UTC time
const utcNow = new Date();
const utcPast = new Date(utcNow.getTime() - (4 * 60 * 60 * 1000)); // 4 hours ago in UTC
console.log('Backend Simulation (UTC):');
console.log('  UTC Now:', utcNow.toISOString());
console.log('  UTC 4h ago:', utcPast.toISOString());
console.log('  When converted to local:', utcPast.toLocaleString());
console.log('');

// Real calculation that should happen
const realDiff = utcNow - utcPast;
const realHours = Math.floor(realDiff / 3600000);
console.log('Actual difference:', realHours, 'hours');
