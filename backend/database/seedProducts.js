/**
 * Seed Script: Inserts all 29 Ganesha product images as products into SQLite.
 * Run with: node backend/database/runSeed.js
 */

const path = require('path');
// Bootstrap the db module so DB is connected and initialized first
const { runQuery, getQuery } = require('./db');

const initialProducts = [
  {
    name: 'Eco Friendly Clay Ganesha',
    category: 'Eco Friendly Ganesha',
    price: 599.00,
    description: 'Beautiful handcrafted eco-friendly Ganesha idol made from 100% natural clay. Ideal for home pooja and environmentally safe festive immersion.',
    image: 'IMG-20260618-WA0002.jpg.jpeg',
    stock: 15,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Royal Traditional Vinayaka Idol',
    category: 'Traditional Ganesha',
    price: 1299.00,
    description: 'Authentic traditional Ganesha idol crafted with intricate ornaments and divine blessing mudra. Perfect for festival pandals and sacred home altars.',
    image: 'IMG-20260618-WA0003.jpg.jpeg',
    stock: 10,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Pure Handcrafted Clay Ganesha',
    category: 'Clay Ganesha',
    price: 799.00,
    description: 'Fine terracotta clay Ganesha idol sculpted by master artisans. Features smooth finish and elegant traditional posture.',
    image: 'IMG-20260618-WA0004.jpg.jpeg',
    stock: 12,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Vibrant Hand Painted Ganesha Idol',
    category: 'Painted Ganesha',
    price: 999.00,
    description: 'Richly hand-painted Ganesha idol using non-toxic festive colors, featuring detailed mukut and gold embroidery detailing.',
    image: 'IMG-20260618-WA0005.jpg.jpeg',
    stock: 8,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Supreme Premium Gold Finish Ganesha',
    category: 'Premium Ganesha',
    price: 2499.00,
    description: 'Exclusive luxury edition Ganesha idol highlighted with radiant gold polish. Designed for royal home decor and grand festive celebrations.',
    image: 'IMG-20260618-WA0006.jpg.jpeg',
    stock: 5,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Sacred Mini Pooja Ganesha',
    category: 'Mini Ganesha',
    price: 399.00,
    description: 'Compact and charming mini Ganesha idol suitable for car dashboards, office desks, and small home mandirs.',
    image: 'IMG-20260618-WA0007.jpg.jpeg',
    stock: 20,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Majestic Large Ganapati Idol',
    category: 'Large Ganesha',
    price: 2999.00,
    description: 'Impressionable large-sized Ganesha statue designed for prominent display in residential lobbies, halls, and community festivities.',
    image: 'IMG-20260618-WA0009.jpg.jpeg',
    stock: 6,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Ganesh Chaturthi Special Edition',
    category: 'Festival Special',
    price: 1599.00,
    description: 'Special festival limited edition idol adorned with decorative floral motifs and modak offerings for Ganesh Chaturthi celebrations.',
    image: 'IMG-20260618-WA0010.jpg.jpeg',
    stock: 10,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Durable Crafted Fiber Ganesha',
    category: 'Fiber Ganesha',
    price: 1899.00,
    description: 'High-strength lightweight fiber Ganesha statue with weather-resistant polish, perfect for both indoor and outdoor festival setups.',
    image: 'IMG-20260618-WA0011.jpg.jpeg',
    stock: 15,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Luxury White Marble Finish Ganesha',
    category: 'Marble Finish',
    price: 3499.00,
    description: 'Elegantly sculpted Ganesha idol with pristine white marble texture and subtle golden accents. A masterpiece for luxury interiors.',
    image: 'IMG-20260618-WA0012.jpg.jpeg',
    stock: 4,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Organic Seed Clay Eco Ganesha',
    category: 'Eco Friendly Ganesha',
    price: 699.00,
    description: 'Environmentally safe clay idol infused with organic seeds, allowing green plant growth after festival immersion.',
    image: 'IMG-20260618-WA0013.jpg.jpeg',
    stock: 12,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Authentic Siddhivinayak Traditional Idol',
    category: 'Traditional Ganesha',
    price: 1499.00,
    description: 'Recreation of the famed Siddhivinayak posture with right-turned trunk, symbolizing auspicious blessings and prosperity.',
    image: 'IMG-20260618-WA0014.jpg.jpeg',
    stock: 8,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Classic Natural Terracotta Clay Idol',
    category: 'Clay Ganesha',
    price: 899.00,
    description: 'Natural reddish terracotta clay finish with traditional hand-carved features for authentic pooja rituals.',
    image: 'IMG-20260618-WA0016.jpg.jpeg',
    stock: 14,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Artistic Multicolor Painted Ganesha',
    category: 'Painted Ganesha',
    price: 1199.00,
    description: 'Hand-painted with festive vibrant hues and shimmering glitter details, adding joy to every festival environment.',
    image: 'IMG-20260618-WA0017.jpg.jpeg',
    stock: 9,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Antique Brass Finish Premium Ganesha',
    category: 'Premium Ganesha',
    price: 2799.00,
    description: 'Metallic antique brass finished Ganesha idol with intricate crown and throne detailing. A collector\'s premium piece.',
    image: 'IMG-20260618-WA0018.jpg.jpeg',
    stock: 5,
    featured: 1,
    hidden: 0
  },
  {
    name: 'Compact Car Dashboard Mini Ganesha',
    category: 'Mini Ganesha',
    price: 499.00,
    description: 'Miniature blessing Ganesha statuette with non-slip base, perfect for vehicle dashboards and study tables.',
    image: 'IMG-20260620-WA0000.jpg.jpeg',
    stock: 25,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Grand Pandal Large Festival Ganapati',
    category: 'Large Ganesha',
    price: 3999.00,
    description: 'Grand centerpiece Ganesha idol crafted for prominent festive celebrations, community pandals, and residential lobbies.',
    image: 'IMG-20260620-WA0001.jpg.jpeg',
    stock: 3,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Deepavali Special Golden Vinayaka',
    category: 'Festival Special',
    price: 1799.00,
    description: 'Shimmering golden festival special idol designed for Lakshmi-Ganesh Diwali pooja and home decoration.',
    image: 'IMG-20260622-WA0002.jpg.jpeg',
    stock: 10,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Weatherproof Lightweight Fiber Ganesha',
    category: 'Fiber Ganesha',
    price: 1699.00,
    description: 'Unbreakable fiber composite Ganesha with durable metallic hand-paint finish. Suitable for indoor and outdoor use.',
    image: 'IMG-20260622-WA0008.jpg.jpeg',
    stock: 11,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Polished Marble Finish Sanctuary Idol',
    category: 'Marble Finish',
    price: 3199.00,
    description: 'Smooth polished white marble replica Ganesha idol showcasing divine serenity and meditative grace.',
    image: 'IMG-20260624-WA0002.jpg.jpeg',
    stock: 6,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Biodegradable Herbal Eco Ganesha',
    category: 'Eco Friendly Ganesha',
    price: 649.00,
    description: 'Formulated with organic earth and herbal pigments that dissolve cleanly in water for eco-conscious immersion.',
    image: 'IMG-20260624-WA0003.jpg.jpeg',
    stock: 15,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Heritage Traditional Temple Ganesha',
    category: 'Traditional Ganesha',
    price: 1399.00,
    description: 'Heritage-inspired Ganesha statue showcasing classic South Indian temple sculpting traditions and ancient craftsmanship.',
    image: 'IMG-20260624-WA0004.jpg.jpeg',
    stock: 7,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Fine Art Sculpted Clay Bappa',
    category: 'Clay Ganesha',
    price: 849.00,
    description: 'Sculpted by skilled artisan hands with refined contours, traditional ornaments, and smooth natural clay finish.',
    image: 'IMG-20260625-WA0003.jpg.jpeg',
    stock: 13,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Gold Leaf Festive Painted Idol',
    category: 'Painted Ganesha',
    price: 1099.00,
    description: 'Adorned with gold leaf foil and vibrant festal paint for a luminous and radiant altar presence.',
    image: 'IMG-20260628-WA0000.jpg.jpeg',
    stock: 10,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Divine Royal Throne Premium Ganesha',
    category: 'Premium Ganesha',
    price: 2599.00,
    description: 'Royal court style Ganesha statue seated on an ornate decorative throne with detailed parasol and lotus detailing.',
    image: 'IMG-20260628-WA0001.jpg.jpeg',
    stock: 4,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Pocket Blessings Mini Ganesha',
    category: 'Mini Ganesha',
    price: 349.00,
    description: 'Delicate miniature idol crafted with precise sculptural details, ideal for gifting and personal prayer altars.',
    image: 'IMG-20260628-WA0002.jpg.jpeg',
    stock: 30,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Grand Sanctuary Large Ganesha Statue',
    category: 'Large Ganesha',
    price: 3299.00,
    description: 'Substantial statuary featuring elaborate trunk and crown work. Designed for grand temple entrances and event stages.',
    image: 'IMG-20260714-WA0011.jpg.jpeg',
    stock: 5,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Home Puja Festival Special Ganesha',
    category: 'Festival Special',
    price: 1449.00,
    description: 'Designed specifically for home Ganpati sthapana rituals, family gatherings, and 10-day celebration ceremonies.',
    image: 'IMG-20260714-WA0012.jpg.jpeg',
    stock: 9,
    featured: 0,
    hidden: 0
  },
  {
    name: 'Premium Ivory Marble Vinayaka',
    category: 'Marble Finish',
    price: 2899.00,
    description: 'Pristine ivory marble aesthetic Ganesha idol with gold leaf highlights and protective glossy sealant finish.',
    image: 'IMG-20260714-WA0013.jpg.jpeg',
    stock: 7,
    featured: 0,
    hidden: 0
  }
];

const seedProducts = async () => {
  // Wait 1 second for the DB to initialize first (db.js initDatabase runs on require)
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Clear order items that reference products first (FK constraint)
    await runQuery(`DELETE FROM OrderItems`);
    // Clear all existing products
    await runQuery(`DELETE FROM Products`);
    // Reset the auto-increment counters
    await runQuery(`DELETE FROM sqlite_sequence WHERE name='OrderItems'`);
    await runQuery(`DELETE FROM sqlite_sequence WHERE name='Products'`);
    console.log('✓ Cleared existing product records.');

    for (const prod of initialProducts) {
      await runQuery(
        `INSERT INTO Products (name, category, price, description, image, stock, featured, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [prod.name, prod.category, prod.price, prod.description, prod.image, prod.stock, prod.featured, prod.hidden]
      );
    }

    console.log(`\n✓ Successfully seeded ${initialProducts.length} Ganesha products!`);
    console.log('\nProducts now available in:');
    console.log('  → Home Page: http://localhost:5173');
    console.log('  → Admin Dashboard: http://localhost:5173/admin');
    console.log('\nRun the backend & frontend to see all products live.\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding products:', error.message);
    process.exit(1);
  }
};

module.exports = seedProducts;

// Auto-run if called directly: node seedProducts.js
if (require.main === module) {
  seedProducts();
}
