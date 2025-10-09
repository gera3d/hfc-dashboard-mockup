import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// GET endpoint to read cached data
export async function GET() {
  try {
    const filePath = join(process.cwd(), 'src', 'data', 'cached-sheets-data.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Cached Data] Error reading cached data:', error);
    return NextResponse.json(
      { 
        csv: '', 
        lastUpdated: null,
        stats: { size: 0, lines: 0 }
      },
      { status: 200 }
    );
  }
}
