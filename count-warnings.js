import fs from 'fs';
import readline from 'readline';

async function countWarnings() {
  const fileStream = fs.createReadStream('/tmp/lint-output.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const counts = {};
  let currentFile = null;

  for await (const line of rl) {
    // Check if this is a file path line
    if (line.startsWith('/Users/') && (line.endsWith('.ts') || line.endsWith('.tsx'))) {
      currentFile = line.replace('/Users/nicholuschugg/nicholus-chugg/jala2-app/', '');
    }
    // Check if this line contains our warning
    else if (line.includes('@typescript-eslint/no-unsafe-member-access') && currentFile) {
      counts[currentFile] = (counts[currentFile] || 0) + 1;
    }
  }

  // Sort by count descending
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  sorted.forEach(([file, count]) => {
    console.log(`${count.toString().padStart(3)} ${file}`);
  });
}

countWarnings();
