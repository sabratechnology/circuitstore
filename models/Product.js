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
              CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart,
              CASE WHEN cart.qty IS NOT NULL THEN true ELSE false END AS in_cart,
              COALESCE(cart.qty, 0) AS cart_qty
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


  static productDataByCategId(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;
        
        // Fetching featured products and total count asynchronously
        const [categoryProductsData,subCatData,totalCategoryProductsData] = await Promise.all([
          this.getCategoryProducts(req, page, limit),
          this.subCatDataByCategId(req),
          this.totalCategoryProductsCount(req),
        ]);

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
          subCatData,
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





  static productDataBySubCategId(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;
        
        // Fetching featured products and total count asynchronously
        const [subcategoryProductsData, totalSubCategoryProductsData] = await Promise.all([
          this.getSubCategoryProducts(req, page, limit),
          this.totalSubCategoryProductsCount(req),
        ]);

        // Calculating total pages
        const totalPages = Math.ceil(totalSubCategoryProductsData / limit);

        // Validating the requested page
        if (page > totalPages || page < 1) {
          resolve({ message: 'Invalid page number or no records available for the requested page.' });
          return;
        }

        // Constructing the response object
        const response = {
          subcategoryProductsData,
          totalSubCategoryProductsData,
          currentPage: page,
          totalPages,
        };

        // Adding a message if there are no records for the requested page
        if (subcategoryProductsData.length === 0) {
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
    const sorting = req.order_by_cat;

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
          pr.category_id = ?
          AND pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1' 
          ${sorting}
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


  static async subCatDataByCategId(req) {
    var catId = req.category_id;
    const sorting = req.order_by_subcat;
    return new Promise((resolve, reject) => {
      const query = `SELECT sub_category_id, category_id, sub_category_name, sub_category_name_ar FROM subcategory WHERE status = 1 AND category_id = ? ${sorting}`;
      db.query(query,[catId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }




  static async getSubCategoryProducts(req, page, limit) {
    const userId = req.user_id;
    const categoryId = req.category_id;
    const subCategoryId = req.sub_category_id;
    const sorting = req.order_by_subcat;

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
          pr.category_id = ?
          AND pr.sub_category_id = ?
          AND pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1' 
          ${sorting}
        LIMIT ?, ?;`;

      // Executing the query with parameters

      db.query(query, [userId,userId,categoryId,subCategoryId,offset, limit], (error, results) => {

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



  static async getProductsByBrandId(req, page, limit) {
    const userId = req.user_id;
    const brandId = req.brand_id;
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
          pr.brand_id = ?
          AND pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1' 
        ORDER BY 
          pr.product_id DESC 
        LIMIT ?, ?;`;

      // Executing the query with parameters

      db.query(query, [userId,userId,brandId,offset, limit], (error, results) => {

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



  static async searchBarData(req) {
    return new Promise((resolve, reject) => {

      const search_keyword = req.search_keyword ?? '';
      console.log(search_keyword)
      const searchQuery = `
            SELECT
                product.product_id,
                product.product_name,
                product.product_offer_price,
                product.image_name,
                product.product_name_ar,
                product.search_unique_id,
                ct.category_name,
                ct.category_name_ar,
                sub.sub_category_name,
                sub.sub_category_name_ar
            FROM
                product
            LEFT JOIN category as ct on product.category_id = ct.category_id
            LEFT JOIN subcategory as sub on product.sub_category_id = sub.sub_category_id
            WHERE
                (product.product_name LIKE ? OR product.product_name_ar LIKE ?)
                OR product.search_unique_id LIKE ?
                AND product.status = 1
                AND product.product_status = 1
            ORDER BY
                product.product_id DESC;
        `;

        // Pattern: %keyword%
        const keywordWithWildcards = `%${search_keyword}%`;

        // Executing the search query with parameters
        db.query(searchQuery, [keywordWithWildcards, keywordWithWildcards,keywordWithWildcards], (error, results) => {
            if (error) {
                // Rejecting with the encountered error
                reject(error);
            } else {
                // Resolving with the search results
                resolve(results);
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


   static async totalSubCategoryProductsCount(req) {

    const category_id = req.category_id;
    const sub_category_id = req.sub_category_id;
    return new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM product pr
        LEFT JOIN inventory ON inventory.product_id = pr.product_id
        WHERE pr.category_id = ?
          AND pr.sub_category_id = ?
          AND pr.status = '1'
          AND pr.product_status = '1'
          AND inventory.used_status = '1';`;

      // Executing the count query
      db.query(countQuery, [category_id,sub_category_id], (error, results) => {
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


  static async totalBrandProductsCount(req) {

    const brandId = req.brand_id;
    return new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM product pr
        LEFT JOIN inventory ON inventory.product_id = pr.product_id
        WHERE pr.brand_id = ?
          AND pr.status = '1'
          AND pr.product_status = '1'
          AND inventory.used_status = '1';`;

      // Executing the count query
      db.query(countQuery, [brandId], (error, results) => {
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

  static productInfoByBrandId(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Extracting page and limit from the request or using defaults
        const page = req.page || 1;
        const limit = 15;
        
        // Fetching brand products and total count asynchronously
        const [brandProductsData, totalBrandProductsData] = await Promise.all([
          this.getProductsByBrandId(req, page, limit),
          this.totalBrandProductsCount(req),
        ]);


        // Calculating total pages
        const totalPages = Math.ceil(totalBrandProductsData / limit);

        // Validating the requested page
        if (page > totalPages || page < 1) {
          resolve({ message: 'Invalid page number or no records available for the requested page.' });
          return;
        }

        // Constructing the response object
        const response = {
          brandProductsData,
          totalBrandProductsData,
          currentPage: page,
          totalPages,
        };

        // Adding a message if there are no records for the requested page
        if (brandProductsData.length === 0) {
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



  static productInfoByBottomId(req) {
    return new Promise(async (resolve, reject) => {
        try {
          const banner = await this.getproductInfoByBottomId(req);
          const resultResult = banner ? 1 : [];
          const product_details = banner && banner[0].relatable_products ? await this.getAllRelatedProductsByProductId(banner, req) : [];
          const response = { banner, product_details };
            resolve(response);
        } catch (error) {
            reject(error);
        }
    });
}

  static async getproductInfoByBottomId(req) {
    const bottomId = req.bottom_id;
    const userId = req.user_id;
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                bottom_id,
                relatable_products
            FROM
                top_banner
            WHERE
                bottom_id = ?
                AND status = 1
                AND active_inactive = 1;
        `;

        db.query(sql, [bottomId], (error, results) => {
            if (error) {
                reject(error);
            } else {
              resolve(results);
            }

        });
    });
}


static async getAllRelatedProductsByProductId(relatedPorductsId,req) {
  const productId = relatedPorductsId[0].relatable_products;
  const userId = req.user_id;
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
        pr.product_id IN (${productId})
        AND pr.status = '1' 
        AND pr.product_status = '1' 
        AND inventory.used_status = '1' 
      ORDER BY 
        pr.product_id DESC;`;

    // Executing the query with parameters
    db.query(query, [userId,userId,productId], (error, results) => {

      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

  

}

module.exports = Product;
