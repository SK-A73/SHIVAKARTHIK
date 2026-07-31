const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery } = require('../database/db');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const admin = await getQuery(`SELECT * FROM Admins WHERE username = ?`, [username]);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'super_secret_jwt_key_shop_2026_production',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const admin = await getQuery(`SELECT id, username, createdAt FROM Admins WHERE id = ?`, [req.admin.id]);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};
