const express = require('express');
const { 
  uploadDocument, 
  getEmployeeDocuments, 
  getEmployeePersonalDocuments,
  getEmployeePayrollDocuments,
  getCompanyDocuments,
  viewDocument,
  downloadDocument,
  deleteDocument,
  getPendingDocuments,
  getDocumentStats,
  getAllDocuments
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/pending', protect, getPendingDocuments);
router.get('/stats', protect, getDocumentStats);
router.get('/', protect, getAllDocuments);
router.post('/upload', protect, upload.array('documents'), uploadDocument);
router.get('/employee/:id', protect, getEmployeeDocuments);
router.get('/employee/:id/personal', protect, getEmployeePersonalDocuments);
router.get('/employee/:id/payroll', protect, getEmployeePayrollDocuments);
router.get('/company', protect, getCompanyDocuments);
router.get('/:id/view', protect, viewDocument);
router.get('/:id/download', protect, downloadDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
