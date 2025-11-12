/**
 * One-time historical data import script
 * 
 * This script downloads historical review data from a legacy Google Sheet
 * and saves it as a separate JSON file for merging with current data.
 * 
 * Usage: node scripts/import-historical-data.js
 */

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Historical sheet configuration
const HISTORICAL_SHEET_ID = '1HyHHtJNqlldacYkMYbBOlaKKrf29yDDD9jETLt_mJ0o';
const CREDENTIALS_PATH = './google-sheets-credentials.json';
const OUTPUT_FILE = './src/data/historical-reviews.json';

// Helper function to parse CSV text into objects
function parseCsvToObjects(csvText) {
  const rows = [];
  const lines = [];

  // Simple CSV tokenizer handling quotes
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    cur += ch;
    if (ch === '"') {
      const next = csvText[i + 1];
      if (next === '"') {
        cur += next;
        i++;
        continue;
      }
      inQuotes = !inQuotes;
    }
    if (ch === '\n' && !inQuotes) {
      lines.push(cur.replace(/\r?\n$/, ''));
      cur = '';
    }
  }
  if (cur.length) lines.push(cur);

  function parseLine(line) {
    const cells = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        const next = line[i + 1];
        if (quoted && next === '"') {
          cell += '"';
          i++;
          continue;
        }
        quoted = !quoted;
        continue;
      }
      if (ch === ',' && !quoted) {
        cells.push(cell);
        cell = '';
        continue;
      }
      cell += ch;
    }
    cells.push(cell);
    return cells.map(c => c.trim());
  }

  if (lines.length === 0) return { headers: [], rows };

  const headerLine = lines[0];
  const headers = parseLine(headerLine).map(h => h || '');

  console.log(`\n📋 Detected columns (${headers.length}):`);
  headers.forEach((h, i) => {
    if (h) console.log(`   ${i + 1}. ${h}`);
  });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.trim() === '') continue;
    
    const cells = parseLine(line);
    const obj = {};
    
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j] || `col_${j}`;
      obj[key] = cells[j] ?? '';
    }

    // Normalize agent extraction
    const agentKeys = headers.filter(h => /agent/i.test(h));
    if (agentKeys.length === 0) {
      const urlKey = headers.find(h => /source|url|link|page/i.test(h));
      if (urlKey) {
        const url = obj[urlKey] || '';
        try {
          const decoded = decodeURIComponent(url);
          const m = decoded.match(/[?&]agent=([^&]+)/i);
          if (m && m[1]) {
            obj['Agent'] = decodeURIComponent(m[1]).replace(/%21$/, '').replace(/!$/, '');
          }
        } catch (e) {
          // ignore decode errors
        }
      }
    } else {
      const key = agentKeys[0];
      if (key !== 'Agent') obj['Agent'] = obj[key];
    }

    rows.push(obj);
  }

  return { headers, rows };
}

async function downloadHistoricalData() {
  try {
    console.log('🔍 Historical Data Import Script');
    console.log('=' .repeat(60));
    
    // 1. Authenticate
    console.log('\n1️⃣ Authenticating with Google Sheets API...');
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('   ✅ Authentication successful');

    // 2. Get sheet metadata
    console.log('\n2️⃣ Fetching sheet metadata...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: HISTORICAL_SHEET_ID,
    });

    console.log(`   📊 Sheet title: "${metadata.data.properties.title}"`);
    console.log(`   📑 Available tabs (${metadata.data.sheets.length}):`);
    
    metadata.data.sheets.forEach((sheet, idx) => {
      const props = sheet.properties;
      console.log(`      ${idx + 1}. "${props.title}" (${props.gridProperties.rowCount} rows × ${props.gridProperties.columnCount} cols)`);
    });

    // 3. Auto-detect the data sheet (usually first one or one with most rows)
    const dataSheet = metadata.data.sheets
      .filter(s => s.properties.gridProperties.rowCount > 1)
      .sort((a, b) => b.properties.gridProperties.rowCount - a.properties.gridProperties.rowCount)[0];
    
    const sheetName = dataSheet.properties.title;
    const rowCount = dataSheet.properties.gridProperties.rowCount;
    
    console.log(`\n   🎯 Selected sheet: "${sheetName}" (${rowCount.toLocaleString()} rows)`);

    // 4. Download data
    console.log('\n3️⃣ Downloading all data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: HISTORICAL_SHEET_ID,
      range: `${sheetName}`,
    });

    const allRows = response.data.values || [];
    console.log(`   ✅ Downloaded ${allRows.length.toLocaleString()} rows`);

    if (allRows.length === 0) {
      console.error('   ❌ No data returned from API');
      return;
    }

    // 5. Convert to CSV
    console.log('\n4️⃣ Converting to CSV format...');
    const csvText = allRows
      .map(row => row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
      .join('\n');

    console.log(`   ✅ CSV generated: ${(csvText.length / 1024 / 1024).toFixed(2)} MB`);

    // 6. Parse CSV to objects
    console.log('\n5️⃣ Parsing and normalizing data...');
    const parsed = parseCsvToObjects(csvText);
    
    console.log(`\n   ✅ Parsed ${parsed.rows.length.toLocaleString()} data rows`);
    
    // Show sample agents
    const agents = [...new Set(parsed.rows.map(r => r.Agent).filter(Boolean))];
    console.log(`   👥 Found ${agents.length} unique agents:`);
    console.log(`      ${agents.slice(0, 10).join(', ')}${agents.length > 10 ? '...' : ''}`);

    // 7. Save output
    console.log('\n6️⃣ Saving to file...');
    const outputData = {
      source: 'Historical Reviews',
      sheetId: HISTORICAL_SHEET_ID,
      sheetName: sheetName,
      downloadedAt: new Date().toISOString(),
      stats: {
        totalRows: parsed.rows.length,
        uniqueAgents: agents.length,
        sizeBytes: csvText.length,
        columns: parsed.headers.length
      },
      headers: parsed.headers,
      rows: parsed.rows,
      rawCsv: csvText
    };

    const outputPath = path.resolve(__dirname, '..', OUTPUT_FILE);
    await fs.writeFile(
      outputPath,
      JSON.stringify(outputData, null, 2),
      'utf-8'
    );

    console.log(`   ✅ Saved to: ${outputPath}`);
    console.log(`   📦 File size: ${((await fs.stat(outputPath)).size / 1024 / 1024).toFixed(2)} MB`);

    // 8. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`   📊 Total rows: ${parsed.rows.length.toLocaleString()}`);
    console.log(`   👥 Unique agents: ${agents.length}`);
    console.log(`   📁 Output: ${OUTPUT_FILE}`);
    console.log('\n💡 Next step: Use this data in your dashboard components');
    console.log('   The file contains both parsed objects and raw CSV.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ENOENT' && error.path.includes('google-sheets-credentials')) {
      console.error('\n   Make sure google-sheets-credentials.json is in the project root');
    }
    process.exit(1);
  }
}

// Run the script
downloadHistoricalData();
