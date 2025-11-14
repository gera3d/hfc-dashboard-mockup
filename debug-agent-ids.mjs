/**
 * Debug script to see what agent IDs look like in the actual data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'temp-sheet-download.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Split into lines
const lines = csvContent.split('\n');

// Get header
const header = lines[0].split(',');
const agentIndex = header.findIndex(h => h === 'Agent');

// Get unique agent names
const agentNames = new Set();
for (let i = 1; i < Math.min(100, lines.length); i++) {
  const parts = lines[i].split(',');
  if (parts[agentIndex]) {
    agentNames.add(parts[agentIndex]);
  }
}

console.log('Sample agent names from CSV:');
Array.from(agentNames).slice(0, 20).forEach(name => {
  // Simulate the ID conversion logic from googleSheetsService.ts
  const agentId = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/!$/, '');
  console.log(`  "${name}" -> "${agentId}"`);
});
