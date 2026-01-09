/*
 * @Author: xujiayu xujiayu@motern.com
 * @Date: 2026-01-09 11:17:05
 * @LastEditors: xujiayu xujiayu@motern.com
 * @LastEditTime: 2026-01-09 17:38:36
 * @FilePath: \working-afk-simulatorc:\Users\PC\Desktop\AFK_Simulator\live2D\generate_characters.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const BASE_URL = 'https://fastly.jsdelivr.net/gh/jynba/live2d-assets/';
const OUTPUT_FILE = path.join(ROOT_DIR, 'characters.json');

function findFiles(dir, filter, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (file !== '.git' && file !== 'node_modules' && file !== 'temp_to_compress') {
          findFiles(filePath, filter, fileList);
        }
      } else {
        if (filter.test(file)) {
          fileList.push(filePath);
        }
      }
    });
  } catch (err) {
    console.error("Error reading dir " + dir, err);
  }
  return fileList;
}

// 1. Load existing characters
let characters = [];
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
    characters = JSON.parse(content);
    if (!Array.isArray(characters)) characters = [];
  } catch (e) {
    console.warn("Failed to parse existing characters.json, starting fresh.");
    characters = [];
  }
}

const existingUrls = new Set(characters.map(c => c.modelUrl));
let nextId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;

// 2. Scan for all models
const models = findFiles(ROOT_DIR, /\.model3\.json$/);
const newCharacters = [];

models.forEach((modelPath) => {
  const relativePath = path.relative(ROOT_DIR, modelPath).replace(/\\/g, '/');
  const modelUrl = BASE_URL + encodeURI(relativePath);

  // Check if already exists
  if (existingUrls.has(modelUrl)) {
    return;
  }

  const dir = path.dirname(modelPath);
  const modelName = path.basename(dir);

  // Find preview image
  const filesInDir = fs.readdirSync(dir);
  const imageFiles = filesInDir.filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));

  let previewFile = imageFiles.find(f => f.toLowerCase().startsWith('preview'));
  if (!previewFile) previewFile = imageFiles.find(f => f.toLowerCase().startsWith('icon'));
  if (!previewFile) previewFile = imageFiles.find(f => f.toLowerCase().includes(modelName.toLowerCase()));
  if (!previewFile && imageFiles.length > 0) previewFile = imageFiles[0];

  let previewUrl = '';
  if (previewFile) {
    const previewRelativePath = path.relative(ROOT_DIR, path.join(dir, previewFile)).replace(/\\/g, '/');
    previewUrl = BASE_URL + encodeURI(previewRelativePath);
  }

  newCharacters.push({
    id: nextId++,
    name: modelName,
    cost: 3000,
    modelUrl: modelUrl,
    preview: previewUrl
  });
});

if (newCharacters.length > 0) {
  const updatedCharacters = characters.concat(newCharacters);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedCharacters, null, 2));
  console.log(`Added ${newCharacters.length} new characters.`);
  console.log(`Total characters: ${updatedCharacters.length}.`);
} else {
  console.log('No new characters found.');
}
