const db = require('../db');

class Product {
  static productDataById(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const [product_data,cart_counts,wishlist_counts,related_products] = await Promise.all([
          this.getProductDetailsById(req),
          this.getuserCartCount(req),
          this.getwishlistCount(req),
          this.getRelativeProductsByProductId(req)
          
        ]);
        const cart_count =cart_counts &&cart_counts[0] &&cart_counts[0].cart_count !== null ?cart_counts[0].cart_count: 0;
        const wishlist_count = wishlist_counts && wishlist_counts[0] && wishlist_counts[0].wishlist_count !== null ? wishlist_counts[0].wishlist_count : 0;
        const response = {product_data,related_products,cart_count,wishlist_count};
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async getProductDetailsById(req) {
    const userId = req.user_id;
    const productId = req.product_id;
    return new Promise((resolve, reject) => {
          const query = `SELECT
              product.*,
              inventory.qty as quantity,
              category.category_name,
              category.category_name_ar,
              subcategory.sub_category_name,
              subcategory.sub_category_name_ar,
              childcategory.child_category_name,
              childcategory.child_category_name_ar,
              GROUP_CONCAT(product_gallery.img_url) as img_url,
              CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, 
              CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart 
          FROM
              product
          LEFT JOIN
              product_gallery ON product_gallery.product_id = ?
          LEFT JOIN 
              wishlist ON wishlist.product_id = product.product_id AND wishlist.user_id = ? 
          LEFT JOIN
              cart ON cart.product_id = product.product_id AND cart.user_id = ? 
          LEFT JOIN
              category ON product.category_id = category.category_id
          LEFT JOIN
              subcategory ON product.sub_category_id = subcategory.sub_category_id
          LEFT JOIN
              childcategory ON childcategory.child_category_id = product.child_category_id
          LEFT JOIN
              inventory ON inventory.product_id = ?
          WHERE
              product.product_id = ?
              AND product.status = 1
              AND inventory.used_status = 1
          GROUP BY
              product_gallery.product_id;`;

      // Executing the query with parameters
      db.query(query, [productId,userId,userId,productId,productId], (error, results) => {
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


  static async getuserCartCount(req) {
    const userId = req.user_id;
    return new Promise((resolve, reject) => {
      const query = "SELECT SUM(cart.qty) as cart_count FROM `cart` WHERE user_id = ?";
      db.query(query,[userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async getwishlistCount(req) {
    const userId = req.user_id;
    return new Promise((resolve, reject) => {
      const query = "SELECT count(wishlist.user_id) as wishlist_count FROM `wishlist` WHERE user_id = ?";
      db.query(query,[userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }


  static async getRelativeProductsByProductId(req) {
    const product_id = req.product_id;
    return new Promise((resolve, reject) => {
      const query = `
      SELECT
          product_relative.rel_product_id,
          product.*,
          category.category_name,
          subcategory.sub_category_name,
          childcategory.child_category_name,
          inventory.qty AS quantity
      FROM
          product
      LEFT JOIN
          product_relative ON product_relative.rel_product_id = ?
      LEFT JOIN
          category ON product.category_id = category.category_id
      LEFT JOIN
          subcategory ON product.sub_category_id = subcategory.sub_category_id
      LEFT JOIN
          childcategory ON childcategory.child_category_id = product.child_category_id
      LEFT JOIN
          inventory ON inventory.product_id = ?
      WHERE
          product_relative.product_id = ?
          AND product.status = 1
          AND product.product_status = 1
          AND inventory.used_status = 1;
    `;
    
    
      db.query(query,[product_id,product_id,product_id], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }


  static productDataBtCategId(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;
        
        // Fetching featured products and total count asynchronously
        const [categoryProductsData, totalCategoryProductsData] = await Promise.all([
          this.getCategoryProducts(req, page, limit),
          this.totalCategoryProductsCount(req),
        ]);

        //console.log(categoryProductsData);

        // Calculating total pages
        const totalPages = Math.ceil(totalCategoryProductsData / limit);

        // Validating the requested page
        if (page > totalPages || page < 1) {
          resolve({ message: 'Invalid page number or no records available for the requested page.' });
          return;
        }

        // Constructing the response object
        const response = {
          categoryProductsData,
          totalCategoryProductsData,
          currentPage: page,
          totalPages,
        };

        // Adding a message if there are no records for the requested page
        if (categoryProductsData.length === 0) {
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


  static async getCategoryProducts(req, page, limit) {
    const userId = req.user_id;
    const categoryId = req.category_id;
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
          inventory.qty AS quantity, 
          CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, 
          CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart 
        FROM 
          product pr 
          LEFT JOIN inventory ON inventory.product_id = pr.product_id 
          LEFT JOIN wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ? 
          LEFT JOIN cart ON cart.product_id = pr.product_id AND cart.user_id = ? 
        WHERE 
          pr.category_id = ?
          AND pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1' 
        ORDER BY 
          pr.product_id DESC 
        LIMIT ?, ?;`;

      // Executing the query with parameters

      db.query(query, [userId,userId,categoryId,offset, limit], (error, results) => {

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


  static async getLatestProducts(req, page, limit) {
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
          inventory.qty AS quantity, 
          CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, 
          CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart 
        FROM 
          product pr 
          LEFT JOIN inventory ON inventory.product_id = pr.product_id 
          LEFT JOIN wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ? 
          LEFT JOIN cart ON cart.product_id = pr.product_id AND cart.user_id = ? 
        WHERE 
          pr.popular = '1' 
          AND pr.status = '1' 
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

  static async totalLatestProductsCount(req) {
    const userId = req.user_id;

    return new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM product pr
        LEFT JOIN inventory ON inventory.product_id = pr.product_id
        WHERE pr.popular = '1'
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


  

  static async totalCategoryProductsCount(req) {

    const category_id = req.category_id;
    return new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM product pr
        LEFT JOIN inventory ON inventory.product_id = pr.product_id
        WHERE pr.category_id = ?
          AND pr.status = '1'
          AND pr.product_status = '1'
          AND inventory.used_status = '1';`;

      // Executing the count query
      db.query(countQuery, [category_id], (error, results) => {
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
module.exports = Product;
