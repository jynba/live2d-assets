
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const EXPORT_DIR = path.join(ROOT_DIR, 'temp_to_compress');
const MANIFEST_FILE = path.join(EXPORT_DIR, 'manifest.json');

if (!fs.existsSync(MANIFEST_FILE)) {
    console.error('Error: manifest.json not found in temp_to_compress folder.');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
let restoreCount = 0;

console.log('Restoring images...');

Object.entries(manifest).forEach(([uniqueName, relativePath]) => {
    const sourcePath = path.join(EXPORT_DIR, uniqueName);
    const destPath = path.join(ROOT_DIR, relativePath);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✓ Restored: ${relativePath}`);
        restoreCount++;
    } else {
        console.warn(`! Missing file in temp_to_compress: ${uniqueName}`);
    }
});

console.log(`Done! Restored ${restoreCount} images.`);
