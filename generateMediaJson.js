const fs = require("fs");
const path = require("path");

// Define the folders we care about
const folders = {
    lifestyle: "Lifestyle Media",
    trainingVideos: "Training Videos",
    trainingPictures: "Training Pictures"
};

// Optional descriptive name mapping (can be left empty)
const nameMapping = {
    lifestyle: {
        // "example.jpg": "Hanging Out at the Park"
    },
    trainingVideos: {
        // "drill1.mp4": "Dribbling Drill"
    },
    trainingPictures: {
        // "pic1.jpg": "Team Huddle"
    }
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

    result[key] = files.map(file => {
        // Use descriptive name if it exists, otherwise default to the file name
        const descriptiveName = nameMapping[key]?.[file] || file;

        return {
            originalName: file,
            name: descriptiveName,
            path: `/${folder}/${encodeURIComponent(file)}`
        };
    });
});

// Write out media.json
fs.writeFileSync(
    path.join(__dirname, "media.json"),
    JSON.stringify(result, null, 2)
);

console.log("✅ media.json generated successfully!");
