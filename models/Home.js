const db = require('../db');

class Home {
  static homePage(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const sliderData = await this.getSliders();
        const categoryData = await this.getCategories();
        const feturedProducts = await this.getfeturedProducts(req);
        const popularProducts = await this.getpopularProducts(req);
        const bestsellingProducts = await this.getbestsellingProducts(req);
        const cartCounts = await this.getuserCartCount(req);
        const cart_count = cartCounts && cartCounts[0] && cartCounts[0].cart_count !== null ? cartCounts[0].cart_count: 0;
        const wishlistCounts = await this.getwishlistCount(req);
        const wishlist_count = wishlistCounts && wishlistCounts[0] && wishlistCounts[0].wishlist_count !== null ? wishlistCounts[0].wishlist_count : 0;

        const combinedData = {sliderData,categoryData,feturedProducts,popularProducts,bestsellingProducts,cart_count,wishlist_count};
        resolve(combinedData);
      } catch (error) {
        reject(error);
      }
    });
  }



  static userAddressDataById(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const addressData = await this.getUserAddress(req);
        const combinedData = {addressData};
        resolve(combinedData);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async getSliders() {
    return new Promise((resolve, reject) => {
      // Perform the database query for brands

      const query = `
    SELECT
        bottom_id,
        img_url,
        redirection_url,
        CASE WHEN in_app IS NULL OR in_app = '0' THEN 'true' ELSE 'false' END as in_app,
        CASE WHEN redirection_url = '' OR redirection_url IS NULL THEN 'false' ELSE 'true' END AS redirection,
        CASE WHEN relatable_products = '' OR relatable_products IS NULL THEN 'false' ELSE 'true' END AS relatable_products
    FROM
        top_banner
    WHERE
        status = 1 AND active_inactive = 1
    ORDER BY
        bottom_id DESC
`;


      db.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async getCategories() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT category_id,category_name,category_name_ar,image_path FROM category WHERE status=1 AND active_inactive=1';
      db.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }


  static async getfeturedProducts(req) {
    const userId = req.user_id;
    const sorting = req.order_by_featured;

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
          AND inventory.qty > '0'
          AND pr.qty > '0' 
      GROUP BY pr.product_id
      ${sorting}
      LIMIT 15;`;
      
      db.query(query,[userId,userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async getpopularProducts(req) {
    const userId = req.user_id;
    const sorting = req.order_by_latest;
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
          AND inventory.qty > '0'
          AND pr.qty > '0'  
      GROUP BY pr.product_id
      ${sorting}
      LIMIT 15;`;
        db.query(query,[userId,userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async getbestsellingProducts(req) {
    const userId = req.user_id;
    const sorting = req.order_by_best;

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
          pr.best_selling = '1' 
          AND pr.status = '1' 
          AND pr.product_status = '1' 
          AND inventory.used_status = '1'
          AND inventory.qty > '0'
          AND pr.qty > '0' 
      GROUP BY pr.product_id
      ${sorting}
      LIMIT 15;`;
      
      db.query(query,[userId,userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
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
      const query = "SELECT count(wishlist.user_id) as wishlist_count FROM `wishlist` WHERE user_id = ? AND status=1";
      db.query(query,[userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async navBarData(req) {
    const userId = req.user_id;
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                category.category_id,
                category.category_name,
                category.category_name_ar,
                GROUP_CONCAT(subcategory.sub_category_name) AS sub_category_name,
                GROUP_CONCAT(subcategory.sub_category_name_ar) AS sub_category_name_ar,
                GROUP_CONCAT(subcategory.sub_category_id) AS sub_category_id
            FROM
                category
            LEFT JOIN
                subcategory ON subcategory.category_id = category.category_id
            WHERE
                category.status = 1
                AND category.active_inactive = 1
                AND category.category_type != 'Gift Card'
            GROUP BY
                category.category_id;
        `;
        db.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
              
              results.forEach((row) => {
                let sub_cat_names = row.sub_category_name;
                let sub_cat_id = row.sub_category_id;
                let sub_cat_names_ar = row.sub_category_name_ar;

                let subCatNameArray;
                let subCatIdArray;
                let subCatNameArabicArray;
            
                if (sub_cat_names && sub_cat_names.trim() !== "") {
                    subCatNameArray = sub_cat_names.split(',');
                    subCatIdArray = sub_cat_id.split(',');
                    subCatNameArabicArray = sub_cat_names_ar.split(',');

                } else {
                    subCatNameArray = [];
                    subCatIdArray=[];
                    subCatNameArabicArray=[];
                    
                }
            
                row.sub_category_name = subCatNameArray;
                row.sub_category_name_ar = subCatNameArabicArray;
                row.sub_category_id = subCatIdArray;
            });
            
                resolve(results);
            }
        });
    });
}



static async saveSearchBarData(req) {

  const userId = req.user_id;
  const lang_id = req.fk_lang_id;
  const keyword = req.keywords;
  const device_type = req.device_type;

  return new Promise((resolve, reject) => {
    const insertQuery = "INSERT INTO `search_keywords` (fk_lang_id, user_id,device_type,keyword) VALUES (?, ?, ?, ?)";
    db.query(insertQuery, [lang_id, userId, device_type, keyword], (error, results) => {
        if (error) {
            reject(error);
        } else {
            resolve(results);
        }
    });
});

 
}

}

module.exports = Home;
