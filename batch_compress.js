
const fs = require('fs');
const path = require('path');
const tinify = require('tinify');

const ROOT_DIR = __dirname;
const API_KEY = 'z1c3bbqj3NMyVNjG8tXS1WTryqY78szx';
const EXTENSIONS = ['.jpg', '.jpeg', '.png']; // TinyPNG supports these

tinify.key = API_KEY;

// Helper to find all image files recursively
function findImages(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== '.git' && file !== 'node_modules') {
                findImages(filePath, fileList);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (EXTENSIONS.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

async function compressImage(filePath) {
    try {
        const originalSize = fs.statSync(filePath).size;
        console.log(`Processing: ${path.relative(ROOT_DIR, filePath)} (${(originalSize / 1024).toFixed(1)} KB)`);

        const source = tinify.fromFile(filePath);
        await source.toFile(filePath);
        
        const newSize = fs.statSync(filePath).size;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        console.log(`✓ Compressed (-${reduction}%) | New size: ${(newSize / 1024).toFixed(1)} KB`);

    } catch (error) {
        if (error instanceof tinify.AccountError) {
             console.error('The error message is: ' + error.message);
             // Verify your API key and account status.
        } else if (error instanceof tinify.ClientError) {
             console.error('Check your source image and request options.');
        } else if (error instanceof tinify.ServerError) {
             console.error('Temporary issue with the TinyPNG API.');
        } else if (error instanceof tinify.ConnectionError) {
             console.error('Network connection issue.');
        } else {
             console.error(`✗ Error processing ${path.relative(ROOT_DIR, filePath)}:`, error.message);
        }
    }
}

async function runBatch() {
    console.log('Scanning for images...');
    const images = findImages(ROOT_DIR);
    console.log(`Found ${images.length} images. Starting TinyPNG compression...`);
    console.log(`Compression count this month: ${tinify.compressionCount || 'Unknown'}`);

    // Sort by size (large first? or small first? doesn't matter for API, but big ones take longer)
    // Let's do big first to get quick feedback
    images.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);

    for (const imagePath of images) {
        await compressImage(imagePath);
    }
    console.log('Batch compression complete.');
    console.log(`Final compression count: ${tinify.compressionCount}`);
}

runBatch();
