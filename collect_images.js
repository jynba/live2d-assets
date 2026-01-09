/*
 * @Author: xujiayu xujiayu@motern.com
 * @Date: 2026-01-09 15:13:26
 * @LastEditors: xujiayu xujiayu@motern.com
 * @LastEditTime: 2026-01-09 15:14:31
 * @FilePath: \working-afk-simulatorc:\Users\PC\Desktop\AFK_Simulator\live2D\collect_images.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const EXPORT_DIR = path.join(ROOT_DIR, 'temp_to_compress');
const MANIFEST_FILE = path.join(EXPORT_DIR, 'manifest.json');
const EXTENSIONS = ['.jpg', '.jpeg', '.png'];

if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR);
}

const manifest = {};
let fileCount = 0;

function collectImages(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== '.git' && file !== 'node_modules' && file !== 'temp_to_compress') {
                collectImages(filePath);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (EXTENSIONS.includes(ext)) {
                fileCount++;
                const relativePath = path.relative(ROOT_DIR, filePath);
                // Create a unique name to avoid collisions
                // Format: index_originalName
                const uniqueName = `${fileCount}_${file}`;
                const destPath = path.join(EXPORT_DIR, uniqueName);
                
                fs.copyFileSync(filePath, destPath);
                manifest[uniqueName] = relativePath;
            }
        }
    });
}

console.log('Collecting images...');
collectImages(ROOT_DIR);
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
console.log(`Done! Collected ${fileCount} images into 'temp_to_compress' folder.`);
console.log('Please compress the images in that folder and DO NOT change their names.');
