// Replaced local disk storage with Cloudinary storage
const { upload } = require('../config/cloudinary');

module.exports = upload;
