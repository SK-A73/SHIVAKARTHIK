const { getQuery } = require('../database/db');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalProductsRow = await getQuery(`SELECT COUNT(*) as count FROM Products`);
    const totalOrdersRow = await getQuery(`SELECT COUNT(*) as count FROM Orders`);
    const pendingOrdersRow = await getQuery(`SELECT COUNT(*) as count FROM Orders WHERE status = 'Pending'`);
    const confirmedOrdersRow = await getQuery(`SELECT COUNT(*) as count FROM Orders WHERE status = 'Confirmed'`);
    const deliveredOrdersRow = await getQuery(`SELECT COUNT(*) as count FROM Orders WHERE status = 'Delivered'`);
    const cancelledOrdersRow = await getQuery(`SELECT COUNT(*) as count FROM Orders WHERE status = 'Cancelled'`);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts: totalProductsRow.count || 0,
        totalOrders: totalOrdersRow.count || 0,
        pendingOrders: pendingOrdersRow.count || 0,
        confirmedOrders: confirmedOrdersRow.count || 0,
        deliveredOrders: deliveredOrdersRow.count || 0,
        cancelledOrders: cancelledOrdersRow.count || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
