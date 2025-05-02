const express = require('express');
const { 
  uploadDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/upload', protect, upload.array('documents'), uploadDocument);

module.exports = router;
