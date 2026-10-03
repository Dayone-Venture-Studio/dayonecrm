const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/tv-dashboards');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove border-r border-white/20 from footer divs
  content = content.replace(/border-r border-white\/20/g, '');
  content = content.replace(/border-r border-black\/20/g, '');
  
  // Fix typos in StartupHealthScreen
  if (file === 'StartupHealthScreen.tsx') {
    content = content.replace(/CASH RUNAWAY/gi, 'CASH RUNWAY');
    content = content.replace(/Per months/gi, 'Per month');
  }

  fs.writeFileSync(filePath, content);
}
console.log('Fixed footers and typos');
