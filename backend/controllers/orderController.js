const { runQuery, getQuery, allQuery } = require('../database/db');

// Generate unique order ID: ORD-YYYYMMDD-XXXX
const generateOrderId = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `ORD-${year}${month}${day}`;

  const row = await getQuery(
    `SELECT COUNT(*) as count FROM Orders WHERE id LIKE ?`,
    [`${datePrefix}-%`]
  );

  const nextNumber = String(row.count + 1).padStart(4, '0');
  return `${datePrefix}-${nextNumber}`;
};

const createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, productId, quantity } = req.body;

    if (!customerName || !phone || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Customer Name, Phone Number, Product ID, and Quantity are required.'
      });
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.'
      });
    }

    const product = await getQuery(`SELECT * FROM Products WHERE id = ?`, [productId]);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (product.hidden === 1) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently unavailable.'
      });
    }

    const itemTotal = product.price * qty;
    const orderId = await generateOrderId();

    // Insert Order
    await runQuery(
      `INSERT INTO Orders (id, "customerName", phone, status, "totalAmount")
       VALUES (?, ?, ?, 'Pending', ?)`,
      [orderId, customerName, phone, itemTotal]
    );

    // Insert OrderItem
    await runQuery(
      `INSERT INTO OrderItems ("orderId", "productId", "productName", quantity, price, total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, product.id, product.name, qty, product.price, itemTotal]
    );

    // Get shop settings for WhatsApp number
    const settings = await getQuery(`SELECT * FROM Settings LIMIT 1`);
    const shopWhatsapp = settings && settings.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : '919148572774';

    // Format WhatsApp text message according to exact user request format
    const message = 
`Hello,

I would like to place an order.

Order ID:
${orderId}

Customer Name:
${customerName}

Phone Number:
${phone}

Product:
${product.name}

Quantity:
${qty}

Price:
₹${product.price}

Total:
₹${itemTotal}

Please confirm my order.

Thank you.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${shopWhatsapp}?text=${encodedMessage}`;

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: {
        id: orderId,
        customerName,
        phone,
        productName: product.name,
        quantity: qty,
        price: product.price,
        totalAmount: itemTotal,
        status: 'Pending',
        whatsappUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let sql = `SELECT * FROM Orders WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (id LIKE ? OR "customerName" LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY "createdAt" DESC`;

    const orders = await allQuery(sql, params);

    // Attach items for each order
    for (let order of orders) {
      order.items = await allQuery(`SELECT * FROM OrderItems WHERE "orderId" = ?`, [order.id]);
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getQuery(`SELECT * FROM Orders WHERE id = ?`, [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    order.items = await allQuery(`SELECT * FROM OrderItems WHERE "orderId" = ?`, [id]);

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await getQuery(`SELECT * FROM Orders WHERE id = ?`, [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    await runQuery(`UPDATE Orders SET status = ? WHERE id = ?`, [status, id]);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      orderId: id,
      status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
