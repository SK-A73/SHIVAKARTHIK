const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'vgscz1yw',
  api_key: '782634122712854',
  api_secret: 'VXEeLeKZXjTOnCD34Cmz_7sBpQ8'
});

const pool = new Pool({
  connectionString: 'postgresql://postgres.dosrreuhogluiguyxwze:shivakumar@17@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});

const migrateImages = async () => {
  try {
    const res = await pool.query("SELECT id, image FROM Products WHERE image NOT LIKE 'http%' AND image NOT LIKE 'sample_%'");
    const products = res.rows;
    console.log(`Found ${products.length} products needing image migration to Cloudinary.`);

    for (const product of products) {
      const localPath = path.join(__dirname, 'uploads/products', product.image);
      if (fs.existsSync(localPath)) {
        console.log(`Uploading ${product.image}...`);
        const uploadRes = await cloudinary.uploader.upload(localPath, { folder: 'shop_products' });
        
        await pool.query('UPDATE Products SET image = $1 WHERE id = $2', [uploadRes.secure_url, product.id]);
        console.log(`✅ Product ID ${product.id} updated with Cloudinary URL.`);
      } else {
        console.log(`❌ File not found locally: ${localPath}`);
      }
    }
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrateImages();
