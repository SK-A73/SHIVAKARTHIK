const { runQuery, getQuery, allQuery } = require('../database/db');
const { uploadToSupabase, deleteFromSupabase } = require('../config/supabase');

const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, featured, includeHidden } = req.query;

    let sql = `SELECT * FROM Products WHERE 1=1`;
    const params = [];

    if (includeHidden !== 'true') {
      sql += ` AND hidden = 0`;
    }

    if (category && category !== 'All') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (name LIKE ? OR category LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (featured === 'true') {
      sql += ` AND featured = 1`;
    }

    sql += ` ORDER BY createdat DESC`;

    const products = await allQuery(sql, params);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getQuery(`SELECT * FROM Products WHERE id = ?`, [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, description, stock, featured, hidden } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and description are required.'
      });
    }

    // --- STEP 1: Upload image to Supabase Storage FIRST ---
    let image_url = null;
    let storage_path = null;

    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file);
        image_url = uploadResult.url;
        storage_path = uploadResult.path;
      } catch (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Image upload failed. Product was not created. Please try again.'
        });
      }
    }

    // --- STEP 2: Validate that we have a real URL before inserting ---
    if (!image_url || typeof image_url !== 'string' || image_url.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A product image is required. Please select an image and try again.'
      });
    }

    // --- STEP 3: Insert product into PostgreSQL with the Supabase Storage URL ---
    const result = await runQuery(
      `INSERT INTO Products (name, category, price, description, image_url, cloudinary_public_id, stock, featured, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        name,
        category,
        parseFloat(price),
        description,
        image_url,
        storage_path,
        parseInt(stock || 0, 10),
        featured === 'true' || featured === '1' || featured === true ? 1 : 0,
        hidden === 'true' || hidden === '1' || hidden === true ? 1 : 0
      ]
    );

    const createdProduct = await getQuery(`SELECT * FROM Products WHERE id = ?`, [result.rows[0].id]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: createdProduct
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, stock, featured, hidden } = req.body;

    const existingProduct = await getQuery(`SELECT * FROM Products WHERE id = ?`, [id]);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Keep existing image by default
    let image_url = existingProduct.image_url;
    let storage_path = existingProduct.cloudinary_public_id;

    // Only upload if a new file was provided
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file);
        const newImageUrl = uploadResult.url;
        const newStoragePath = uploadResult.path;

        // Validate new URL before proceeding
        if (!newImageUrl || typeof newImageUrl !== 'string' || newImageUrl.trim() === '') {
          return res.status(500).json({
            success: false,
            message: 'New image upload failed. Product was not updated.'
          });
        }

        // Delete old image from Supabase Storage if it was stored there
        if (existingProduct.cloudinary_public_id && existingProduct.cloudinary_public_id.startsWith('products/')) {
          await deleteFromSupabase(existingProduct.cloudinary_public_id);
        }

        image_url = newImageUrl;
        storage_path = newStoragePath;
      } catch (uploadError) {
        console.error('Supabase upload error during update:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Image upload failed. Product was not updated. Please try again.'
        });
      }
    }

    const updatedName = name !== undefined ? name : existingProduct.name;
    const updatedCategory = category !== undefined ? category : existingProduct.category;
    const updatedPrice = price !== undefined ? parseFloat(price) : existingProduct.price;
    const updatedDesc = description !== undefined ? description : existingProduct.description;
    const updatedStock = stock !== undefined ? parseInt(stock, 10) : existingProduct.stock;
    const updatedFeatured = featured !== undefined ? (featured === 'true' || featured === '1' || featured === true ? 1 : 0) : existingProduct.featured;
    const updatedHidden = hidden !== undefined ? (hidden === 'true' || hidden === '1' || hidden === true ? 1 : 0) : existingProduct.hidden;

    await runQuery(
      `UPDATE Products SET name = ?, category = ?, price = ?, description = ?, image_url = ?, cloudinary_public_id = ?, stock = ?, featured = ?, hidden = ?, updatedat = CURRENT_TIMESTAMP WHERE id = ?`,
      [updatedName, updatedCategory, updatedPrice, updatedDesc, image_url, storage_path, updatedStock, updatedFeatured, updatedHidden, id]
    );

    const updatedProduct = await getQuery(`SELECT * FROM Products WHERE id = ?`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getQuery(`SELECT * FROM Products WHERE id = ?`, [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Delete image from Supabase Storage if it was stored there
    if (product.cloudinary_public_id && product.cloudinary_public_id.startsWith('products/')) {
      await deleteFromSupabase(product.cloudinary_public_id);
    }

    await runQuery(`DELETE FROM Products WHERE id = ?`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const toggleVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getQuery(`SELECT * FROM Products WHERE id = ?`, [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const newHiddenState = product.hidden === 1 ? 0 : 1;

    await runQuery(
      `UPDATE Products SET hidden = ?, updatedat = CURRENT_TIMESTAMP WHERE id = ?`,
      [newHiddenState, id]
    );

    return res.status(200).json({
      success: true,
      message: `Product is now ${newHiddenState === 1 ? 'hidden' : 'visible'}.`,
      hidden: newHiddenState
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility
};
