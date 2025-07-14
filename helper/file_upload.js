const path = require('path');
const fs = require('fs');

const file_upload = (image, folder) => {
    const extname = path.extname(image.name).toLowerCase();
    const allowedExtensions = ['.png', '.jpeg', '.jpg'];

    // Check if the file extension is allowed
    if (!allowedExtensions.includes(extname)) {
        return { status: false, message: "Please provide a PNG or JPEG file." };
    }

    const newFilename = image.name.split(" ").join("_");
    const docsBasePath = path.join(__dirname, `../public/asset/${folder}`);
    const filePath = path.join(docsBasePath, newFilename);

    // Ensure the directory exists
    if (!fs.existsSync(docsBasePath)) {
        fs.mkdirSync(docsBasePath, { recursive: true }); // Create directory if it doesn't exist
    }

    // Move the file if it doesn't already exist
    if (!fs.existsSync(filePath)) {
        image.mv(filePath, (err) => {
            if (err) {
                console.log("Error in moving file: ", err);
                return { status: false, message: "File upload failed" };
            }
        });
    }     
    return { status: true, filename: newFilename };
};

module.exports = file_upload;
