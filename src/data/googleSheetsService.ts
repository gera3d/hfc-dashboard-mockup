import { Review, Agent, Department } from './dataService';

// Google Sheets API configuration
const SPREADSHEET_ID = '10ooffH9zMhvadCs0LlJXTWti0U2Vm38s7quYfeZGOe4';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY; // You'll need to set this

interface GoogleSheetsRow {
  [key: string]: string;
}

// Helper function to convert Google Sheets data to our format
function parseGoogleSheetsData(data: GoogleSheetsRow[]): {
  reviews: Review[];
  agents: Agent[];
  departments: Department[];
} {
  const reviews: Review[] = [];
  const agentsMap = new Map<string, Agent>();
  const departmentsMap = new Map<string, Department>();

  data.forEach((row, index) => {
    // Skip header row
    if (index === 0) return;

    try {
      // Parse department
      if (row.department_id && row.department_name) {
        departmentsMap.set(row.department_id, {
          id: row.department_id,
          name: row.department_name
        });
      }

      // Parse agent
      if (row.agent_id && row.agent_name) {
        agentsMap.set(row.agent_id, {
          id: row.agent_id,
          agent_key: row.agent_key || row.agent_id,
          display_name: row.agent_name,
          department_id: row.department_id || 'unknown'
        });
      }

      // Parse review
      if (row.review_id && row.rating) {
        reviews.push({
          id: row.review_id,
          ext_review_id: row.ext_review_id || row.review_id,
          agent_id: row.agent_id,
          department_id: row.department_id,
          rating: parseInt(row.rating),
          comment: row.comment || '',
          review_ts: row.review_date || new Date().toISOString(),
          source: row.source || 'unknown'
        });
      }
    } catch (error) {
      console.warn(`Error parsing row ${index}:`, error);
    }
  });

  return {
    reviews,
    agents: Array.from(agentsMap.values()),
    departments: Array.from(departmentsMap.values())
  };
}

// Fetch data from Google Sheets
export async function fetchGoogleSheetsData(sheetName: string = 'Sheet1') {
  if (!API_KEY) {
    console.warn('Google Sheets API key not found. Using sample data.');
    return null;
  }

  try {
    const range = `${sheetName}!A:Z`; // Adjust range as needed
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.values || data.values.length === 0) {
      throw new Error('No data found in the spreadsheet');
    }

    // Convert 2D array to objects
    const headers = data.values[0];
    const rows = data.values.slice(1).map((row: string[]) => {
      const obj: GoogleSheetsRow = {};
      headers.forEach((header: string, index: number) => {
        obj[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
      });
      return obj;
    });

    return parseGoogleSheetsData([{ ...headers.reduce((obj: any, header: string, index: number) => {
      obj[header.toLowerCase().replace(/\s+/g, '_')] = header;
      return obj;
    }, {}) }, ...rows]);

  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return null;
  }
}

// Cache management
let cachedData: any = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedGoogleSheetsData(sheetName?: string) {
  const now = Date.now();
  
  if (cachedData && now < cacheExpiry) {
    return cachedData;
  }

  const freshData = await fetchGoogleSheetsData(sheetName);
  
  if (freshData) {
    cachedData = freshData;
    cacheExpiry = now + CACHE_DURATION;
  }

  return freshData;
}