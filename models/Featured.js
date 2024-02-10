const db = require('../db');

class Featured {
  static featuredData(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;

        // Fetching featured products and total count asynchronously
        const [featuredProducts, totalFeaturedProducts] = await Promise.all([
          this.getFeaturedProducts(req, page, limit),
          this.getTotalFeaturedProductsCount(req),
        ]);

        // Calculating total pages
        const totalPages = Math.ceil(totalFeaturedProducts / limit);

        // Validating the requested page
        if (page > totalPages || page < 1) {
          resolve({ message: 'Invalid page number or no records available for the requested page.' });
          return;
        }

        // Constructing the response object
        const response = {
          featuredProducts,
          totalFeaturedProducts,
          currentPage: page,
          totalPages,
        };

        // Adding a message if there are no records for the requested page
        if (featuredProducts.length === 0) {
          response.message = 'No records available for the requested page.';
        }

        // Resolving with the final response
        resolve(response);
      } catch (error) {
        // Rejecting with the encountered error
        reject(error);
      }
    });
  }

  static async getFeaturedProducts(req, page, limit) {
    const userId = req.user_id;
    const sorting = req.order_by_featured;
    const offset = (page - 1) * limit;

    return new Promise((resolve, reject) => {
      const query = `
      SELECT 
          pr.product_id, 
          pr.product_name, 
          pr.product_name_ar, 
          pr.max_sell_limit, 
          pr.image_name, 
          pr.product_offer_price, 
          pr.new_arrival, 
          pr.product_offer,
          inventory.qty AS quantity, 
          CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, 
          CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart 
      FROM 
          product pr 
          LEFT JOIN inventory ON inventory.product_id = pr.product_id 
          LEFT JOIN wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ? 
          LEFT JOIN cart ON cart.product_id = pr.product_id AND cart.user_id = ? 
      WHERE 
          pr.featured = '1' 
          AND pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1' 
      GROUP BY pr.product_id
      ${sorting}
      LIMIT ?, ?;`;
  

      // Executing the query with parameters
      db.query(query, [userId, userId, offset, limit], (error, results) => {
        if (error) {
          // Rejecting with the encountered error
          reject(error);
        } else {
          // Resolving with the query results
          resolve(results);
        }
      });
    });
  }

  static async getTotalFeaturedProductsCount(req) {
    const userId = req.user_id;

    return new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM product pr
        LEFT JOIN inventory ON inventory.product_id = pr.product_id
        WHERE pr.featured = '1'
          AND pr.status = '1'
          AND pr.product_status = '1'
          AND inventory.used_status = '1';`;

      // Executing the count query
      db.query(countQuery, (error, results) => {
        if (error) {
          // Rejecting with the encountered error
          reject(error);
        } else {
          // Resolving with the total count
          resolve(results[0].total_count);
        }
      });
    });
  }
}

// Exporting the Section class
module.exports = Featured;
