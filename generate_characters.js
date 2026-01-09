const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const BASE_URL = 'https://fastly.jsdelivr.net/gh/jynba/live2d-assets/';

function findFiles(dir, filter, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== '.git') {
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

const models = findFiles(ROOT_DIR, /\.model3\.json$/);
const characters = [];

models.forEach((modelPath, index) => {
  // Get relative path and ensure forward slashes
  const relativePath = path.relative(ROOT_DIR, modelPath).replace(/\\/g, '/');
  
  const dir = path.dirname(modelPath);
  // Name defaults to directory name
  const modelName = path.basename(dir);
  
  // Find preview image
  // Priority: preview -> icon -> any other image
  const filesInDir = fs.readdirSync(dir);
  const imageFiles = filesInDir.filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
  
  let previewFile = imageFiles.find(f => f.toLowerCase().startsWith('preview'));
  if (!previewFile) previewFile = imageFiles.find(f => f.toLowerCase().startsWith('icon'));
  // If still not found, try to find one that shares the model name
  if (!previewFile) previewFile = imageFiles.find(f => f.toLowerCase().includes(modelName.toLowerCase()));
  // Fallback to first image
  if (!previewFile && imageFiles.length > 0) previewFile = imageFiles[0];
  
  let previewUrl = '';
  if (previewFile) {
     const previewRelativePath = path.relative(ROOT_DIR, path.join(dir, previewFile)).replace(/\\/g, '/');
     // Use encodeURI to handle spaces and special chars in path
     previewUrl = BASE_URL + encodeURI(previewRelativePath);
  }

  const modelUrl = BASE_URL + encodeURI(relativePath);

  characters.push({
    id: index + 1,
    name: modelName,
    cost: 3000,
    modelUrl: modelUrl,
    preview: previewUrl
  });
});

console.log(`Found ${characters.length} characters.`);
fs.writeFileSync(path.join(ROOT_DIR, 'characters.json'), JSON.stringify(characters, null, 2));
console.log('Generated characters.json successfully.');
