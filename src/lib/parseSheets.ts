export type ParsedRow = Record<string, string>;

// Simple CSV parser that handles quoted fields and commas/newlines inside quotes.
export function parseCsvToObjects(csvText: string): { headers: string[]; rows: ParsedRow[] } {
  const rows: ParsedRow[] = [];
  const lines: string[] = [];

  // Lightweight stateful CSV tokenizer to split into logical lines even when newlines are inside quotes
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    cur += ch;
    if (ch === '"') {
      // peek previous char to allow double-quote escapes
      const next = csvText[i + 1];
      if (next === '"') {
        // escaped quote, consume next as part of field
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

  // CSV row parser for one line
  function parseLine(line: string): string[] {
    const cells: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        const next = line[i + 1];
        if (quoted && next === '"') {
          // escaped quote
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

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // skip empty lines
    if (!line || line.trim() === '') continue;
    const cells = parseLine(line);
    const obj: ParsedRow = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j] || `col_${j}`;
      obj[key] = cells[j] ?? '';
    }

    // Normalize agent extraction: prefer explicit Agent column (case-insensitive), otherwise try to parse from URL
    const agentKeys = headers.filter(h => /agent/i.test(h));
    if (agentKeys.length === 0) {
      // try common URL/source header names
      const urlKey = headers.find(h => /source|url|link|page/i.test(h));
      if (urlKey) {
        const url = obj[urlKey] || '';
        try {
          const decoded = decodeURIComponent(url);
          const m = decoded.match(/[?&]agent=([^&]+)/i);
          if (m && m[1]) {
            // remove trailing exclamation mark if present and decode
            obj['Agent'] = decodeURIComponent(m[1]).replace(/%21$/,'').replace(/!$/,'');
          }
        } catch (e) {
          // ignore decode errors
        }
      }
    } else {
      // ensure we have Agent key normalized
      const key = agentKeys[0];
      if (key !== 'Agent') obj['Agent'] = obj[key];
    }

    rows.push(obj);
  }

  return { headers, rows };
}
