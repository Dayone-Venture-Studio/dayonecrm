const fs = require('fs');
const path = require('path');

const dir = '/Users/sourav/dayonecrm/src/components/tv-dashboards';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace startups import with getMockData
  content = content.replace(/import \{ startups,\s*/, 'import { getMockData, ');
  content = content.replace(/import \{ startups \} from '@\/lib\/tv-dashboards\/mockData';/, '');

  // Add import for telemetry
  if (!content.includes('@/lib/tv/telemetry')) {
    content = content.replace(
      /(import .*?;?\n)/,
      "$1import { getAllTvStartups } from '@/lib/tv/telemetry';\n"
    );
  }

  // Handle StartupHealthScreen specifically
  if (file === 'StartupHealthScreen.tsx') {
    content = content.replace(/export function (\w+)\(\) \{/, 'export async function $1() {\n  const startups = await getAllTvStartups();\n');
    
    // Replace mapping to map over startups instead of startupHealthData
    content = content.replace(/startupHealthData\.map\(\(data, idx\)/, 'startups.map((startup, idx)');
    
    content = content.replace(/data\.id/g, 'startup.id');
    content = content.replace(/data\.company/g, 'startup.name');
    
    // Insert getMockData call inside map
    content = content.replace(
      /<div key=\{startup\.id\} className="flex w-full items-center px-10 py-5 border-b border-white\/20">/,
      `const mockData = getMockData(startupHealthData, startup.id, idx);\n            return (\n              <div key={startup.id} className="flex w-full items-center px-10 py-5 border-b border-white/20">`
    );
    
    // Use mockData properties
    content = content.replace(/\{data\.cash\}/g, '{mockData.cash}');
    content = content.replace(/\{data\.burn\}/g, '{mockData.burn}');
    content = content.replace(/\{data\.cac\}/g, '{mockData.cac}');
    
    // Fix ID column
    content = content.replace(/\{startup\.id\}/, '{String(idx + 1).padStart(2, "0")}');
  } else if (file === 'FoundersScreen.tsx') {
    content = content.replace(/export function (\w+)\(\) \{/, 'export async function $1() {\n  const startups = await getAllTvStartups();\n');
  } else {
    // Other files
    content = content.replace(/export function (\w+)\(\) \{/, 'export async function $1() {\n  const startups = await getAllTvStartups();\n');
    content = content.replace(
      /const (.*?) = (.*?)Data\[startup\.id.*?\](;)?( \|\| \[\])?( || \{\})?/g,
      'const $1 = getMockData($2Data, startup.id, index)$3'
    );
  }

  fs.writeFileSync(p, content);
}
console.log('Done refactoring');
