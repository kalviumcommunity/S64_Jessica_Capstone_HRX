const express = require('express');
const {
  getProfileSettings,
  getSecuritySettings,
  getNotificationPreferences,
  getAppPreferences,
  updateProfileSettings,
  updateSecuritySettings,
  updateNotificationPreferences,
  updateAppPreferences,
  uploadAvatar,
  updatePassword
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Profile settings
router.route('/:id/profile')
  .get(protect, getProfileSettings)
  .put(protect, updateProfileSettings);

// Security settings
router.route('/:id/security')
  .get(protect, getSecuritySettings)
  .put(protect, updateSecuritySettings);

// Notification preferences
router.route('/:id/notifications')
  .get(protect, getNotificationPreferences)
  .put(protect, updateNotificationPreferences);

// App preferences
router.route('/:id/preferences')
  .get(protect, getAppPreferences)
  .put(protect, updateAppPreferences);

// Avatar upload
router.route('/:id/avatar')
  .post(protect, upload.single('avatar'), uploadAvatar);

// Password update
router.route('/:id/password')
  .put(protect, updatePassword);

module.exports = router;