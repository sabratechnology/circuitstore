const db = require('../db');

class AllProducts {
  static AllProductsData(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;

        // Fetching featured products and total count asynchronously
        const [allProducts, totalallProducts] = await Promise.all([
          this.getallProducts(req, page, limit),
          this.totalallProductsCount(req),
        ]);

        // Calculating total pages
        const totalPages = Math.ceil(totalallProducts / limit);

        // Validating the requested page
        if (page > totalPages || page < 1) {
          resolve({ message: 'Invalid page number or no records available for the requested page.' });
          return;
        }

        // Constructing the response object
        const response = {
          allProducts,
          totalallProducts,
          currentPage: page,
          totalPages,
        };

        // Adding a message if there are no records for the requested page
        if (allProducts.length === 0) {
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

  static async getallProducts(req, page, limit) {
    const userId = req.user_id;
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
          pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1' 
        ORDER BY 
          pr.product_id DESC 
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

  static async totalallProductsCount(req) {
    const userId = req.user_id;

    return new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM product pr
        LEFT JOIN inventory ON inventory.product_id = pr.product_id
        WHERE 
          pr.status = '1'
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






  static SearchProductsData(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;

        // Fetching featured products and total count asynchronously
        const [matchedProducts, totalMatchedCounts] = await Promise.all([
          this.getallSearchProducts(req, page, limit),
          this.totalMatchedProductsCount(req),
        ]);

        // Calculating total pages
        const totalPages = Math.ceil(totalMatchedCounts / limit);

        // Validating the requested page
        if (page > totalPages || page < 1) {
          resolve({ message: 'Invalid page number or no records available for the requested page.' });
          return;
        }

        // Constructing the response object
        const response = {
          matchedProducts,
          totalMatchedCounts,
          currentPage: page,
          totalPages,
        };

        // Adding a message if there are no records for the requested page
        if (matchedProducts.length === 0) {
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


  static async getallSearchProducts(req, page, limit) {
    const userId = req.user_id;
    const keyword = req.keyword;
    const likeTerm = `%${keyword}%`;

    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pr.product_id,
          pr.product_name,
          pr.product_name_ar,
          pr.search_unique_id,
          ct.category_name,
          ct.category_name_ar,
          sub.sub_category_name,
          sub.sub_category_name_ar,
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
        LEFT JOIN 
          category AS ct ON pr.category_id = ct.category_id
        LEFT JOIN 
          subcategory AS sub ON pr.sub_category_id = sub.sub_category_id
        LEFT JOIN 
          inventory ON inventory.product_id = pr.product_id
        LEFT JOIN 
          wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ?
        LEFT JOIN 
          cart ON cart.product_id = pr.product_id AND cart.user_id = ?
        WHERE 
          pr.status = 1
          AND (
            pr.search_unique_id LIKE ?
            OR pr.product_name LIKE ?
            OR pr.product_name_ar LIKE ?
            OR ct.category_name LIKE ?
            OR ct.category_name_ar LIKE ?
            OR sub.sub_category_name LIKE ?
          )
          AND pr.product_status = '1'
          AND inventory.used_status = '1'
          ORDER BY 
          pr.product_id DESC 
          LIMIT ?, ?;`;
          
    
      // Executing the query with parameters
      db.query(query, [userId,userId,likeTerm,likeTerm,likeTerm,likeTerm,likeTerm,likeTerm, offset, limit], (error, results) => {
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



  static async totalMatchedProductsCount(req) {
    const userId = req.user_id;
    const keyword = req.keyword;
    const likeTerm = `%${keyword}%`;
    

    return new Promise((resolve, reject) => {
      const countQuery = `
      SELECT 
        count(pr.product_id) as total_count
      FROM 
        product pr
      LEFT JOIN 
        category AS ct ON pr.category_id = ct.category_id
      LEFT JOIN 
        subcategory AS sub ON pr.sub_category_id = sub.sub_category_id
      LEFT JOIN 
        inventory ON inventory.product_id = pr.product_id
      LEFT JOIN 
        wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ?
      LEFT JOIN 
        cart ON cart.product_id = pr.product_id AND cart.user_id = ?
      WHERE 
        pr.status = 1
        AND (
          pr.search_unique_id LIKE ?
          OR pr.product_name LIKE ?
          OR pr.product_name_ar LIKE ?
          OR ct.category_name LIKE ?
          OR ct.category_name_ar LIKE ?
          OR sub.sub_category_name LIKE ?
        )
        AND pr.product_status = '1'
        AND inventory.used_status = '1';`;

      // Executing the count query
      db.query(countQuery, [userId,userId,likeTerm,likeTerm,likeTerm,likeTerm,likeTerm,likeTerm], (error, results) => {
        if (error) {
          // Rejecting with the encountered error
          reject(error);
        } else {
          // Resolving with the total count
          console.log(results[0].total_count)
          resolve(results[0].total_count);
        }
      });
    });
  }
  


}

// Exporting the Section class
module.exports = AllProducts;
