const db = require('../db');

class Users {
    static userCartDataByUserId(req) {
        return new Promise(async (resolve, reject) => {
            try {
                const [cart_data,sub_totals] = await Promise.all([
                    this.getuserCartData(req),
                    this.getuserCartTotalAmount(req),
                ]);

                const sub_total = sub_totals[0].total_cart_price;
                const response = { cart_data,sub_total};
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getuserCartData(req) {
        const userId = req.user_id;
        return new Promise((resolve, reject) => {
            const query = `
                SELECT
                    cart.cart_id,cart.user_id,cart.product_id,cart.qty AS cart_qty,product.product_offer_price*cart.qty as cartPrice,product.product_id,product.category_id,product.sub_category_id,
                    product.product_name,product.product_name_ar,product.image_name,product.product_offer_price,product.currency_in_english,
                    product.currency_in_arabic, inventory.qty AS inventory_quantity
                FROM
                    cart
                LEFT JOIN
                    product ON cart.product_id = product.product_id
                LEFT JOIN
                    inventory ON inventory.product_id = product.product_id
                WHERE
                    cart.user_id = ?
                    AND inventory.used_status = 1
                    AND cart.status = 1;`;
            db.query(query, [userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }


    static async getuserCartTotalAmount(req) {
        const userId = req.user_id;
        return new Promise((resolve, reject) => {
            const query = `
                SELECT
                    SUM(product.product_offer_price*cart.qty) as total_cart_price
                FROM
                    cart
                LEFT JOIN
                    product ON cart.product_id = product.product_id
                LEFT JOIN
                    inventory ON inventory.product_id = product.product_id
                WHERE
                    cart.user_id = ?
                    AND inventory.used_status = 1
                    AND cart.status = 1;`;
            db.query(query, [userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
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
    
      static async getUserAddress(req) {
        const userId = req.user_id;
        return new Promise((resolve, reject) => {
          const query = 'SELECT * FROM `user_delivery_address` WHERE user_id = ? AND status =1;';
            db.query(query,[userId], (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      }

      static async userProfileDataById(req) {
        const userId = req.user_id;
        return new Promise((resolve, reject) => {
          const query = "SELECT op_user_id,user_name,email,contact_no,fk_address_id,profile_photo,added_on,status,notifn_topic,login_time_date,active_inactive FROM `op_user` WHERE op_user_id = ? AND status ='1';";
            db.query(query,[userId], (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      }

      static async userWishListDataById(req) {
        const userId = req.user_id;
        return new Promise((resolve, reject) => {
            const wishlistQuery = `
                SELECT
                    wishlist.user_id,
                    wishlist.id,
                    pr.product_id,pr.product_name,pr.product_name_ar,pr.max_sell_limit,pr.image_name,pr.product_offer_price,
                    inventory.qty as quantity,
                    CASE WHEN wishlist.product_id IS NOT NULL THEN true ELSE false END AS in_wishlist, 
                    CASE WHEN cart.product_id IS NOT NULL THEN true ELSE false END AS in_cart
                FROM
                    wishlist
                LEFT JOIN
                    product pr ON pr.product_id = wishlist.product_id
                LEFT JOIN
                    inventory ON inventory.product_id = pr.product_id
                LEFT JOIN
                    cart ON cart.product_id = pr.product_id AND cart.user_id = ? 
                WHERE
                    wishlist.user_id =?
                    AND wishlist.status = 1
                    AND pr.status = 1
                    AND pr.product_status = 1
                    AND inventory.used_status = 1;`;
    
            db.query(wishlistQuery, [userId,userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
      
}

// Exporting the Section class
module.exports = Users;
