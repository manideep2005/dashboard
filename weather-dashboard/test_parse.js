const fs = require('fs');
const path = require('path');
const fileContent = fs.readFileSync('public/ExcelExport_2026_02_26.csv', 'utf-8');
const lines = fileContent.split("\n").filter(line => line.trim());
let count = 0;
for (let i = 3; i < Math.min(lines.length, 10); i++) {
  const cols = lines[i].split("\t").map(c => c.replace(/"/g, "").trim());
  console.log(`Line ${i} cols length:`, cols.length);
  console.log(`Energy: ${cols[1]}, Current: ${cols[2]}`);
}
