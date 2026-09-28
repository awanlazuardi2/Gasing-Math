const fs = require('fs');
const content = fs.readFileSync('/tmp/App_cached.tsx', 'utf8');
const match = content.match(/\/\/# sourceMappingURL=data:application\/json;base64,(.*)$/);
if (match) {
  const json = Buffer.from(match[1], 'base64').toString('utf8');
  const map = JSON.parse(json);
  if (map.sourcesContent && map.sourcesContent.length > 0) {
    fs.writeFileSync('/tmp/App_restored.tsx', map.sourcesContent[0]);
    console.log('Restored to /tmp/App_restored.tsx');
  } else {
    console.log('No sourcesContent found');
  }
} else {
  console.log('No source map found');
}
