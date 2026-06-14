const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '.next');
console.log('Clearing Next.js cache and .next build outputs...');
try {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('✓ Successfully cleared .next folder.');
  } else {
    console.log('.next folder does not exist, skipping.');
  }
} catch (error) {
  console.error('⚠ Failed to clear .next folder:', error.message);
}
