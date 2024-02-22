const db = require('../db');

class Offers {
   

    static async applyCouponCode(req) {
        return new Promise(async (resolve, reject) => {
            try {
                const userId = req.user_id;
                const couponCode = req.coupon_code;
                const cart_amount = req.cart_amount;
                const currentDate = require('moment')().format('YYYY-MM-DD');
    
                const query = `SELECT * FROM offers 
                               WHERE CAST(end_date_time AS DATE) >= ? 
                               AND coupon_code = ? 
                               AND minimum_price <= ? 
                               AND status = 1`;
    
                db.query(query, [currentDate, couponCode, cart_amount], async (error, results) => {
                    if (error) {
                        reject(new Error(`Error executing database query: ${error.message}`));
                    } else {
                        try {
                            if (results.length > 0) {
                                const offerDetails = {
                                    user_id: userId,
                                    offer_type: results[0].offer_type,
                                    minimum_price: results[0].minimum_price,
                                    maximum_price: results[0].maximum_price,
                                    offer_amount: results[0].percentage
                                };
    
                                const isOfferUsed = await this.isOfferUsed(req);
                                if (!isOfferUsed) {
                                   
                                    let offer_amounts;
                                    if (offerDetails.offer_type == 2 && offerDetails.minimum_price == 0) {
                                        offer_amounts = 0;
                                    } else {
                                        offer_amounts = offerDetails.offer_amount || 0;
                                        if (offer_amounts !== 0) {
                                            offer_amounts = Math.round(cart_amount * (offer_amounts / 100));
                                        }
                                    }
                                    const bindParam = {
                                        user_id: userId,
                                        offer_type: offerDetails.offer_type,
                                        offer_amount: offer_amounts
                                    };
                                    const offerCalculation = await this.deliveryOfferCalculate(bindParam);
                                    if (offerCalculation) {
                                        resolve(bindParam);
                                    } else {
                                        reject(new Error('Error in offer calculation.'));
                                    }
                                } else {
                                    reject('Coupon code has already been used.');
                                }
                            } else {
                                reject('No results found for the given coupon code.');
                            }
                        } catch (error) {
                            reject(new Error(`Error during offer processing: ${error.message}`));
                        }
                    }
                });
            } catch (error) {
                reject(new Error(`Unexpected error: ${error.message}`));
            }
        });
    }
    
    
    
    




    static async isOfferUsed(req) {
        var userId = req.user_id;
        var couponCode = req.coupon_code;
        return new Promise((resolve, reject) => {
          const query = "SELECT * FROM order_data WHERE fk_user_id = ? AND has_coupon_code = 1 AND coupon_number = ? AND status =1;";
          db.query(query,[userId,couponCode], (error, results) => {
            if (error) {
              reject(error);
            } else {
                try {
                    if (results.length > 0) {
                        reject('Coupon code Already Used.');
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    reject(error);
                }
            }
          });
        });
      }
      static async deliveryOfferCalculate(req){
        var userId = req.user_id;
        var couponCode = req.coupon_code;
        return new Promise((resolve, reject) => {
          const query = "SELECT * FROM order_data WHERE fk_user_id = ? AND has_coupon_code = 1 AND coupon_number = ? AND status =1;";
          db.query(query,[userId,couponCode], (error, results) => {
            if (error) {
              reject(error);
            } else {
                try {
                    if (results.length > 0) {
                        reject('Coupon code Already Used.');
                    } else {
                        resolve(true);
                    }
                } catch (error) {
                    reject(error);
                }
            }
          });
        });
      }


      



      

}

// Exporting the Section class
module.exports = Offers;
