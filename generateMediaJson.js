const fs = require("fs");
const path = require("path");

const folders = {
    lifestyle: "Lifestyle Media",
    trainingVideos: "Training Videos",
    trainingPictures: "Training Pictures"
};

const result = {};

Object.entries(folders).forEach(([key, folder]) => {
    const dirPath = path.join(__dirname, folder);
    if (!fs.existsSync(dirPath)) {
        console.warn(`⚠️ Folder not found: ${dirPath}`);
        result[key] = [];
        return;
    }

    const files = fs.readdirSync(dirPath);
    result[key] = files.map(file => ({
        name: file,
        path: `/${folder}/${file}`
    }));
});

// Write media.json
fs.writeFileSync(
    path.join(__dirname, "media.json"),
    JSON.stringify(result, null, 2)
);

console.log("✅ media.json generated!");
