const { runQuery, getQuery, allQuery } = require('../database/db');
const fs = require('fs');
const path = require('path');

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

    sql += ` ORDER BY "createdAt" DESC`;

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

    const image = req.file ? req.file.path : 'default_product.jpg';

    const result = await runQuery(
      `INSERT INTO Products (name, category, price, description, image, stock, featured, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        name,
        category,
        parseFloat(price),
        description,
        image,
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

    let image = existingProduct.image;
    if (req.file) {
      // Cloudinary images are not deleted from local disk
      image = req.file.path;
    }

    const updatedName = name !== undefined ? name : existingProduct.name;
    const updatedCategory = category !== undefined ? category : existingProduct.category;
    const updatedPrice = price !== undefined ? parseFloat(price) : existingProduct.price;
    const updatedDescription = description !== undefined ? description : existingProduct.description;
    const updatedStock = stock !== undefined ? parseInt(stock, 10) : existingProduct.stock;
    const updatedFeatured = featured !== undefined ? (featured === 'true' || featured === '1' || featured === true ? 1 : 0) : existingProduct.featured;
    const updatedHidden = hidden !== undefined ? (hidden === 'true' || hidden === '1' || hidden === true ? 1 : 0) : existingProduct.hidden;

    await runQuery(
      `UPDATE Products 
       SET name = ?, category = ?, price = ?, description = ?, image = ?, stock = ?, featured = ?, hidden = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updatedName, updatedCategory, updatedPrice, updatedDescription, imageFilename, updatedStock, updatedFeatured, updatedHidden, id]
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

    if (product.image && !product.image.startsWith('sample_') && product.image !== 'default_product.jpg') {
      const imagePath = path.join(__dirname, '../uploads/products', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
      `UPDATE Products SET hidden = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
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
