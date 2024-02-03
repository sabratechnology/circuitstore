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


    static async updateUserAddressDataById(req) {
        const userId = req.user_id;
        const addressId = req.id;
        const roomno = req.roomno;
        const building = req.building;
        const street = req.street;
        const zone = req.zone;
        const latitude = req.latitude;
        const longitude = req.longitude;
    
        return new Promise((resolve, reject) => {
            const updateQuery = `
                UPDATE user_delivery_address
                SET
                    roomno = ?,
                    building = ?,
                    street = ?,
                    zone = ?,
                    latitude = ?,
                    longitude = ?
                WHERE
                    id = ? AND user_id = ? AND status = 1;`;
    
            db.query(updateQuery, [roomno, building, street, zone, latitude, longitude, addressId, userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    // Check if any rows were affected by the update
                    if (results.affectedRows > 0) {
                        resolve({ message: 'Address Updated Successfully' });
                    } else {
                        // No rows were updated, indicating the address ID or user ID might be incorrect
                        reject({ message: 'Address Update Failed. Invalid Address ID or User ID' });
                    }
                }
            });
        });
    }
    
    static async addWishlistProducts(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
    
        return new Promise((resolve, reject) => {
            // Use a subquery to check if the record already exists
            const checkIsExist = "SELECT COUNT(id) AS isExist FROM wishlist WHERE user_id = ? AND product_id = ? AND status = 1";
            db.query(checkIsExist, [userId, product_id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const isExist = results[0].isExist;
                    if (isExist > 0) {
                        // Product already exists, remove it from the wishlist
                        this.removeProductFromWishlist(req)
                            .then((removeResult) => {
                                resolve({ message_en: removeResult.message_en,message_ar: removeResult.message_ar });
                            })
                            .catch((removeError) => {
                                reject({ message_en: removeError.message_en,message_ar: removeError.message_ar });
                            });
                    } else {
                        // Product doesn't exist, add it to the wishlist
                        this.addProductInwishlist(req)
                            .then((addResult) => {
                                resolve({ message_en: addResult.message_en, message_ar: addResult.message_ar });
                            })
                            .catch((addError) => {
                                reject({ message_en: addError.message_en, message_ar: addError.message_ar });
                            });
                    }
                }
            });
        });
    }
    
    static async removeProductFromWishlist(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
    
        return new Promise((resolve, reject) => {
            const updateQuery = `
                UPDATE wishlist
                SET
                    status = 0
                WHERE
                    user_id = ? AND product_id = ? AND status = 1`;
    
            db.query(updateQuery, [userId, product_id], (error, results) => {
                if (error) {
                    reject({ message_en: 'Error removing product from wishlist.', message_ar: 'حدث خطأ أثناء إزالة المنتج من قائمة الرغبات' });
                } else {
                    // Check if any rows were affected by the update
                    if (results.affectedRows > 0) {
                        resolve({ message_en: 'Product removed from wishlist successfully.', message_ar: 'تمت إزالة المنتج من قائمة الرغبات بنجاح.' });
                    } else {
                        // No rows were updated, indicating the user ID or product ID might be incorrect
                        reject({ message_en: 'Product not found in the wishlist or already removed.', message_ar: 'المنتج غير موجود في قائمة الرغبات أو تمت إزالته بالفعل.' });
                    }
                }
            });
        });
    }
    
    static async addProductInwishlist(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
    
        return new Promise((resolve, reject) => {
            const sqlForAddWishlist = "INSERT INTO `wishlist` (user_id, product_id) VALUES (?, ?)";
            db.query(sqlForAddWishlist, [userId, product_id], (error, results) => {
                if (error) {
                    reject({ message_en: 'Failed to add product to the wishlist. Please try again later.', message_ar: 'فشل في إضافة المنتج إلى قائمة الرغبات. الرجاء معاودة المحاولة في وقت لاحق.' });
                } else {
                    if (results.affectedRows > 0) {
                        resolve({ message_en: 'Product successfully added to the wishlist.', message_ar: 'تمت إضافة المنتج بنجاح إلى قائمة الرغبات' });
                    } else {
                        reject({ message_en: 'Failed to add product to the wishlist. Please try again later.', message_ar: 'فشل في إضافة المنتج إلى قائمة الرغبات. الرجاء معاودة المحاولة في وقت لاحق.' });
                    }
                }
            });
        });
    }
    
    

    
    






    
      
}

// Exporting the Section class
module.exports = Users;
