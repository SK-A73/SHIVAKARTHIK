const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility
} = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', authMiddleware, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.patch('/:id/visibility', authMiddleware, toggleVisibility);

module.exports = router;
