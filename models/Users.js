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



      static async deliveryChargesByAddressId(req) {
        const userId = req.user_id;
        const address_id = req.address_id;
    
        return new Promise(async (resolve, reject) => {
            const query = 'SELECT latitude, longitude FROM `user_delivery_address` WHERE user_id = ? AND id = ? AND status = 1;';
            db.query(query, [userId, address_id], async (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    let rate;
            
                    if (results && results.length > 0) {
                        rate = await this.calculateDistance(results[0]);
                    } else {
                        rate = 50;
                    }
                    const cartData = await this.userCartDataByUserId({ user_id: userId });
                    const without_tax = cartData.sub_total;
                    const total = without_tax + rate;
                    const finalData = { without_tax, rate, total };
                    resolve(finalData);
                }
            });
            
        });
    }
    
    static calculateDistance(req) {
        const client_lat = 25.2730664;
        const client_long = 51.4838876;
        const user_lat = req.latitude;
        const user_long = req.longitude;
        const unit = 'kilometers';
        const theta = client_long - user_long;
        const deg2rad = (deg) => deg * (Math.PI / 180);
        const rad2deg = (rad) => rad * (180 / Math.PI);
        let distance = Math.sin(deg2rad(client_lat)) * Math.sin(deg2rad(user_lat)) +
          Math.cos(deg2rad(client_lat)) * Math.cos(deg2rad(user_lat)) * Math.cos(deg2rad(theta));
        distance = rad2deg(Math.acos(distance));
        distance = distance * 60 * 1.1515;
        distance *= 1.609344;
        const finalDistance = Math.round(distance);
      
        return new Promise((resolve, reject) => {
          if (finalDistance < 50) {
            const query = "SELECT rate FROM `tbl_delivery_rate` WHERE from_km <= ? AND ? <= to_km;";
            db.query(query, [finalDistance, finalDistance], (error, results) => {
              if (error) {
                reject(error);
              } else {
                resolve(results[0].rate);
              }
            });
          } else {
            resolve(50);
          }
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


    static async addUserAddressData(req) {
        const userId = req.user_id;
        const roomno = req.roomno;
        const building = req.building;
        const street = req.street;
        const zone = req.zone;
        const latitude = req.latitude;
        const longitude = req.longitude;
    
        return new Promise((resolve, reject) => {
            const insertQuery = `
                INSERT INTO user_delivery_address (user_id, roomno, building, street, zone, latitude, longitude, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1);
            `;
    
            db.query(insertQuery, [userId, roomno, building, street, zone, latitude, longitude], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    // Check if any rows were affected by the insert
                    if (results.affectedRows > 0) {
                        const successMessage = {
                            message_en: 'Address Added Successfully',
                            message_ar: 'تم إدراج العنوان بنجاح',
                            addressId: results.insertId
                        };
                        resolve(successMessage);
                    } else {
                        const failureMessage = {
                            message_en: 'Unable To Add Address Details',
                            message_ar: 'فشل إدراج العنوان'
                        };
                        reject(failureMessage);
                    }
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



    static async deleteUserAddressDataById(req) {
        const addressId = req.id;
    
        return new Promise((resolve, reject) => {
            const updateQuery = `UPDATE user_delivery_address SET status = 0  WHERE id = ? AND status = 1;`;
    
            db.query(updateQuery, [addressId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    // Check if any rows were affected by the update
                    if (results.affectedRows > 0) {
                        const successMessage = {
                            message_en: 'Address Deleted Successfully',
                            message_ar: 'تم حذف العنوان بنجاح'
                        };
                        resolve(successMessage);
                    } else {
                        // No rows were updated, indicating the address ID might be incorrect
                        const failureMessage = {
                            message_en: 'Unable to delete address details. Invalid Address ID',
                            message_ar: 'تعذر حذف تفاصيل العنوان. معرف العنوان غير صالح'
                        };
                        reject(failureMessage);
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
            const deleteQuery = `
                DELETE FROM wishlist
                WHERE
                    user_id = ? AND product_id = ? AND status = 1`;
    
            db.query(deleteQuery, [userId, product_id], (error, results) => {
                if (error) {
                    reject({ message_en: 'Error removing product from wishlist.', message_ar: 'حدث خطأ أثناء إزالة المنتج من قائمة الرغبات' });
                } else {
                    if (results.affectedRows > 0) {
                        resolve({ message_en: 'Product removed from wishlist successfully.', message_ar: 'تمت إزالة المنتج من قائمة الرغبات بنجاح.' });
                    } else {
                        reject({ message_en: 'Product not found in the wishlist or already removed.', message_ar: 'المنتج غير موجود في قائمة الرغبات أو تمت إزالته بالفعل.' });
                    }
                }
            });
        });
    }





    static async removeCartProducts(req) {
        const userId = req.user_id;
        const cartId = req.cart_id;
    
        return new Promise((resolve, reject) => {
            const deleteQuery = `
                DELETE FROM cart
                WHERE
                    user_id = ? AND cart_id = ? AND status = 1`;
    
            db.query(deleteQuery, [userId, cartId], (error, results) => {
                if (error) {
                    reject({ message_en: 'Error removing product from Cart.', message_ar: 'خطأ أثناء إزالة المنتجات من سلة التسوق' });
                } else {
                    if (results.affectedRows > 0) {
                        resolve({ message_en: 'Successfully Removed From Cart.', message_ar:'تمت إزالة المنتج من قائمة الرغبات بنجاح' });
                    } else {
                        reject({ message_en: 'Product not found in the cart or already removed.', message_ar: 'لم يتم العثور على المنتج في سلات التسوق أو تمت إزالته بالفعل' });
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


    static async addCartProducts(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
    
        try {
            const checkIsExists = `
                SELECT 
                    cart.cart_id,
                    cart.user_id,
                    cart.product_id,
                    cart.qty as cartQty,
                    inventory.qty as inventory_qty 
                FROM 
                    cart
                LEFT JOIN 
                    inventory ON cart.product_id = inventory.product_id
                WHERE 
                    inventory.used_status = 1 
                    AND cart.product_id = ?
                    AND cart.status = 1 
                    AND cart.user_id = ?
            `;
    
            const results = await new Promise((resolve, reject) => {
                db.query(checkIsExists, [product_id, userId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
    
            if (results && results.length > 0 && results[0].cartQty > 0) {
                req.cartQty = results[0].cartQty;
                req.cart_id = results[0].cart_id;
                req.inventoryQty = results[0].inventory_qty;
    
                const updateResult = await this.updateCartQty(req);
                return { message_en: updateResult.message_en, message_ar: updateResult.message_ar,cart_id: req.cart_id };
            } else {
                const addtoCart = await this.addProductInCart(req);
                return { message_en: addtoCart.message_en, message_ar: addtoCart.message_ar,cart_id:addtoCart.cart_id };
            }
        } catch (error) {
            // Handle errors consistently
            throw { error};
        }
    }
    

    static async updateCartQty(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
        const cart_id = req.cart_id;
        const cart_qty = req.cartQty;
        const inventory_qty = req.inventoryQty;
    
        if (inventory_qty > cart_qty) {
            const updatedCartQty = cart_qty + 1;
    
            return new Promise((resolve, reject) => {
                const cartUpdateQuery = `
                    UPDATE cart
                    SET
                        qty = ?
                    WHERE
                        user_id = ? AND product_id = ? AND cart_id = ? AND status = 1
                `;
    
                db.query(cartUpdateQuery, [updatedCartQty, userId, product_id, cart_id], (error, results) => {
                    if (error) {
                        reject({ message_en: 'Error updating cart quantity.', message_ar: 'حدث خطأ أثناء تحديث كمية سلة التسوق.' });
                    } else {
                        // Check if any rows were affected by the update
                        if (results.affectedRows > 0) {
                            resolve({ message_en: 'Product Qty updated to cart successfully.', message_ar: 'تمت إضافة المنتج إلى سلة التسوق بنجاح.' });
                        } else {
                            // No rows were updated, indicating the user ID or product ID might be incorrect
                            reject({ message_en: 'Product not found in the cart or already removed.', message_ar: 'المنتج غير موجود في سلة التسوق أو تمت إزالته بالفعل.' });
                        }
                    }
                });
            });
        } else {
            // Reject with an appropriate message when inventory is not sufficient
            return Promise.reject({ message_en: 'Product is out of stock.', message_ar: 'المنتج غير متوفر في المخزون.' });
        }
    }
    
    


    static async addProductInCart(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
        const qty = 1;
    
        return new Promise((resolve, reject) => {
            const sqlForAddCart = "INSERT INTO `cart` (user_id, product_id, qty) VALUES (?, ?, ?)";
            db.query(sqlForAddCart, [userId, product_id, qty], (error, results) => {
                if (error) {
                    reject({ message_en: 'Failed to add product to the cart. Please try again later.', message_ar: 'فشل في إضافة المنتج إلى سلة التسوق. يرجى المحاولة مرة أخرى لاحقًا.', error });
                } else {
                    if (results.affectedRows > 0) {
                        const insertedId = results.insertId;
                        resolve({ 
                            message_en: 'Product successfully added to the cart.',
                            message_ar: 'تمت إضافة المنتج بنجاح إلى سلة التسوق.',
                            cart_id : insertedId
                        });
                    } else {
                        reject({ message_en: 'Failed to add product to the cart. Please try again later.', message_ar: 'فشل في إضافة المنتج إلى سلة التسوق. يرجى المحاولة مرة أخرى لاحقًا.' });
                    }
                }
            });
        });
    }
    
    static async updateCartProducts(req) {
        const userId = req.user_id;
        const product_id = req.product_id;
        const cart_id = req.cart_id;
        const quantity = req.quantity;
    
        try {
            const checkIsExists = `
                SELECT 
                    cart.cart_id,
                    cart.user_id,
                    cart.product_id,
                    cart.qty as cartQty,
                    inventory.qty as inventory_qty 
                FROM 
                    cart
                LEFT JOIN 
                    inventory ON cart.product_id = inventory.product_id
                WHERE 
                    inventory.used_status = 1 
                    AND cart.product_id = ?
                    AND cart.status = 1 
                    AND cart.cart_id = ?
                    AND cart.user_id = ?
            `;
    
            const results = await new Promise((resolve, reject) => {
                db.query(checkIsExists, [product_id, cart_id, userId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            if (results && results.length > 0 && results[0].cartQty > 0 && quantity > 0) {
                const { cartQty, inventory_qty } = results[0];

                if (quantity > inventory_qty) {
                    return Promise.reject({ message_en: 'Product is out of stock.', message_ar: 'المنتج غير متوفر في المخزون.' });
                } else {

                    const cartUpdateQuery = `UPDATE cart SET qty = ? WHERE user_id = ? AND product_id = ? AND cart_id = ? AND status = 1`;
                    const updateResults = await new Promise((resolve, reject) => {
                        db.query(cartUpdateQuery, [quantity, userId, product_id, cart_id], (error, results) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(results);
                            }
                        });
                    });
                    if (updateResults.affectedRows > 0) {
                        return { message_en: 'Cart quantity updated successfully.', message_ar: 'تم تحديث كمية السلة بنجاح.', cart_id: cart_id };
                    } else {
                        return Promise.reject({ message_en: 'Error updating cart quantity.', message_ar: 'حدث خطأ أثناء تحديث كمية سلة التسوق.' });
                    }
                }
            } else {
                return Promise.reject({ message_en: 'Cart not found or quantity is not positive.', message_ar: 'السلة غير موجودة أو الكمية غير صحيحة.' });
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            throw { message_en: 'Error updating cart quantity.', message_ar: 'حدث خطأ أثناء تحديث كمية سلة التسوق.', error };
        }
    }
    

}

// Exporting the Section class
module.exports = Users;
