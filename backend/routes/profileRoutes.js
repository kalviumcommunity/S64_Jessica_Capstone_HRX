const express = require('express');
const {
  getProfile,
  updatePersonalInfo,
  updateProfessionalInfo,
  updateBankInfo,
  uploadAvatar
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/:id').get(protect, getProfile);
router.route('/:id/personal').put(protect, updatePersonalInfo);
router.route('/:id/professional').put(protect, updateProfessionalInfo);
router.route('/:id/bank').put(protect, updateBankInfo);
router.route('/:id/avatar').post(protect, upload.single('avatar'), uploadAvatar);

module.exports = router;