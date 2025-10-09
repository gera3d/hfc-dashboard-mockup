// Quick test to see if we can download the CSV
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc40v9L1K1kWHKVyM_c4lip9tLvqwuImTjYLfTAVXGmSSaiHTV77rrqqHNua6vokeybcwqUZKQRVH0/pub?gid=1256929149&single=true&output=csv';

console.log('Testing CSV download from:', CSV_URL);
console.log('Starting fetch...');

const startTime = Date.now();

fetch(CSV_URL, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/csv,*/*',
  },
  redirect: 'follow',
})
  .then(response => {
    const elapsed = Date.now() - startTime;
    console.log(`\nResponse received in ${elapsed}ms`);
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));
    
    if (!response.ok) {
      console.error('ERROR: Response not OK');
      return response.text().then(text => {
        console.error('Response body:', text.substring(0, 500));
        process.exit(1);
      });
    }
    
    return response.text();
  })
  .then(text => {
    if (!text) return;
    
    const lines = text.trim().split('\n');
    console.log('\nCSV downloaded successfully!');
    console.log('Total size:', text.length, 'bytes');
    console.log('Total lines:', lines.length);
    console.log('\nFirst 3 lines:');
    lines.slice(0, 3).forEach((line, i) => {
      console.log(`Line ${i + 1}:`, line.substring(0, 150));
    });
    process.exit(0);
  })
  .catch(error => {
    const elapsed = Date.now() - startTime;
    console.error(`\nERROR after ${elapsed}ms:`, error.message);
    console.error('Full error:', error);
    process.exit(1);
  });

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\nTEST TIMEOUT after 30 seconds');
  process.exit(1);
}, 30000);
