import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CsvPreviewProps {
  content: string;
}

// Simple CSV parser that handles quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

// Detect data type for syntax highlighting
const detectType = (value: string): 'number' | 'boolean' | 'null' | 'date' | 'string' => {
  if (value === '' || value.toLowerCase() === 'null' || value.toLowerCase() === 'n/a') {
    return 'null';
  }
  if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
    return 'boolean';
  }
  if (!isNaN(Number(value)) && value !== '') {
    return 'number';
  }
  // Simple date detection (YYYY-MM-DD or similar patterns)
  if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    return 'date';
  }
  return 'string';
};

export const CsvPreview = ({ content }: CsvPreviewProps) => {
  const { headers, rows } = useMemo(() => {
    const lines = content.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    return { headers, rows };
  }, [content]);

  if (headers.length === 0) {
    return <div className="text-muted-foreground text-sm">No data to display</div>;
  }

  const getCellClassName = (value: string): string => {
    const type = detectType(value);
    const baseClass = "px-3 py-2.5 whitespace-nowrap border-b border-border/30";

    switch (type) {
      case 'number':
        return cn(baseClass, "text-amber-400/80 font-mono");
      case 'boolean':
        return cn(baseClass, "text-violet-400/80 font-medium");
      case 'null':
        return cn(baseClass, "text-slate-500 italic");
      case 'date':
        return cn(baseClass, "text-sky-400/80 font-mono");
      default:
        return cn(baseClass, "text-foreground/90");
    }
  };

  return (
    <div className="overflow-auto rounded-lg border border-border/50 bg-[#0d1117]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-3 text-left font-semibold text-slate-300 whitespace-nowrap border-b-2 border-slate-600/50"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "hover:bg-slate-800/30 transition-colors",
                rowIndex % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"
              )}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={getCellClassName(cell)}
                >
                  {cell || <span className="text-slate-600">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2.5 text-xs bg-gradient-to-r from-slate-800/40 to-slate-700/40 border-t border-border/50 sticky bottom-0">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">
            {rows.length.toLocaleString()} rows × {headers.length} columns
          </span>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
              <span className="text-muted-foreground">Numbers</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-400/80"></span>
              <span className="text-muted-foreground">Booleans</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400/80"></span>
              <span className="text-muted-foreground">Dates</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
