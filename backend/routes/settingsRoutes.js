const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getSettings);
router.put('/', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateSettings);

module.exports = router;
