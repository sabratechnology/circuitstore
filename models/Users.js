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


}

// Exporting the Section class
module.exports = Users;
