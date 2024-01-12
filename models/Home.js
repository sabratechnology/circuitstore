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
      const query = 'SELECT bottom_id,img_url,relatable_products FROM top_banner WHERE status = 1 AND active_inactive = 1 ORDER BY bottom_id DESC';
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
    return new Promise((resolve, reject) => {
      const query = "SELECT pr.product_id, pr.product_name, pr.product_name_ar, pr.max_sell_limit, pr.image_name, pr.product_offer_price, pr.new_arrival, inventory.qty AS quantity, CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart FROM product pr LEFT JOIN inventory ON inventory.product_id = pr.product_id LEFT JOIN wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ? LEFT JOIN cart ON cart.product_id = pr.product_id AND cart.user_id = ? WHERE pr.featured = '1' AND pr.status = '1' AND pr.product_status = '1' AND inventory.used_status = '1' ORDER BY pr.product_id DESC LIMIT 15";
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
    return new Promise((resolve, reject) => {
      const query = "SELECT pr.product_id, pr.product_name, pr.product_name_ar, pr.max_sell_limit, pr.image_name, pr.product_offer_price, pr.new_arrival, inventory.qty AS quantity, CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart FROM product pr LEFT JOIN inventory ON inventory.product_id = pr.product_id LEFT JOIN wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ? LEFT JOIN cart ON cart.product_id = pr.product_id AND cart.user_id = ? WHERE pr.popular = '1' AND pr.status = '1' AND pr.product_status = '1' AND inventory.used_status = '1' ORDER BY pr.product_id DESC LIMIT 15"; 
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
    return new Promise((resolve, reject) => {
      const query = "SELECT pr.product_id, pr.product_name, pr.product_name_ar, pr.max_sell_limit, pr.image_name, pr.product_offer_price, pr.new_arrival, inventory.qty AS quantity, CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart FROM product pr LEFT JOIN inventory ON inventory.product_id = pr.product_id LEFT JOIN wishlist ON wishlist.product_id = pr.product_id AND wishlist.user_id = ? LEFT JOIN cart ON cart.product_id = pr.product_id AND cart.user_id = ? WHERE pr.best_selling = '1' AND pr.status = '1' AND pr.product_status = '1' AND inventory.used_status = '1' ORDER BY pr.product_id DESC LIMIT 15";
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

  

  
  


}

module.exports = Home;
