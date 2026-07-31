const { getQuery, runQuery } = require('../database/db');

const getSettings = async (req, res, next) => {
  try {
    const settings = await getQuery(`SELECT * FROM Settings LIMIT 1`);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Shop settings not configured.'
      });
    }

    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { shopName, whatsappNumber, address, instagram, facebook } = req.body;

    let logoFilename = undefined;
    let bannerFilename = undefined;

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        logoFilename = req.files.logo[0].filename;
      }
      if (req.files.banner && req.files.banner[0]) {
        bannerFilename = req.files.banner[0].filename;
      }
    }

    const currentSettings = await getQuery(`SELECT * FROM Settings LIMIT 1`);

    if (!currentSettings) {
      await runQuery(
        `INSERT INTO Settings (shopName, whatsappNumber, address, instagram, facebook, logo, banner)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          shopName || 'Shop',
          whatsappNumber || '919876543210',
          address || '',
          instagram || '',
          facebook || '',
          logoFilename || '',
          bannerFilename || ''
        ]
      );
    } else {
      const updatedShopName = shopName !== undefined ? shopName : currentSettings.shopName;
      const updatedWhatsapp = whatsappNumber !== undefined ? whatsappNumber : currentSettings.whatsappNumber;
      const updatedAddress = address !== undefined ? address : currentSettings.address;
      const updatedInstagram = instagram !== undefined ? instagram : currentSettings.instagram;
      const updatedFacebook = facebook !== undefined ? facebook : currentSettings.facebook;
      const updatedLogo = logoFilename !== undefined ? logoFilename : currentSettings.logo;
      const updatedBanner = bannerFilename !== undefined ? bannerFilename : currentSettings.banner;

      await runQuery(
        `UPDATE Settings 
         SET shopName = ?, whatsappNumber = ?, address = ?, instagram = ?, facebook = ?, logo = ?, banner = ?
         WHERE id = ?`,
        [updatedShopName, updatedWhatsapp, updatedAddress, updatedInstagram, updatedFacebook, updatedLogo, updatedBanner, currentSettings.id]
      );
    }

    const newSettings = await getQuery(`SELECT * FROM Settings LIMIT 1`);

    return res.status(200).json({
      success: true,
      message: 'Shop settings updated successfully.',
      settings: newSettings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
