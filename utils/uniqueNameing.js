const path = require('path');
const crypto = require('crypto');


function uniqueNameing(file) {
    if (!file || !file.originalFilename) {
        return null;     // Validate if the file and original filename exist
    }

    const ext = path.extname(file.originalFilename);  // Extract file extension
    const uniqueName = crypto.createHash('sha256') // Create SHA-256 hash using
        .update(file.originalFilename + Date.now()) // filename and timestamp
        .digest('hex') + ext; // then add extension
    return uniqueName;

}

module.exports = uniqueNameing;