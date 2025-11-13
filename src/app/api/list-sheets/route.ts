import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';

export async function GET() {
  try {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-sheets-credentials.json';
    
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet metadata to list all sheets
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetList = response.data.sheets?.map(sheet => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      index: sheet.properties?.index,
      rowCount: sheet.properties?.gridProperties?.rowCount,
      columnCount: sheet.properties?.gridProperties?.columnCount,
    })) || [];

    return NextResponse.json({
      spreadsheetTitle: response.data.properties?.title,
      spreadsheetId: SPREADSHEET_ID,
      sheets: sheetList,
      currentSheetName: process.env.GOOGLE_SHEET_NAME || 'Reviews',
    });
  } catch (error: any) {
    console.error('[List Sheets] Error:', error);
    return NextResponse.json({
      error: error.message,
      details: error.response?.data
    }, { status: 500 });
  }
}
