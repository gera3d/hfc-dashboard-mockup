const { google } = require('googleapis');

async function testAPI() {
  const credPath = './google-sheets-credentials.json';
  const spreadsheetId = '10ooffH9zMhvadCs0LlJXTWti0U2Vm38s7quYfeZGOe4';
  const sheetName = 'Reviews';
  
  console.log('Creating auth...');
  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  console.log('Creating sheets client...');
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Calling API...');
  const startTime = Date.now();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Success in ${elapsed}ms`);
    console.log(`Rows received: ${response.data.values?.length || 0}`);
    console.log(`First row: ${response.data.values?.[0]?.slice(0, 5).join(', ')}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
