const db = require('../db');

class Offers {
    static async applyCouponCode(req) {
        const userId = req.user_id;
        const couponCode = req.coupon_code;
        const cart_amount = req.cart_amount;
        const currentDate = require('moment')().format('YYYY-MM-DD');
        return new Promise(async (resolve, reject) => { // Mark the Promise callback function as async
            const query = `SELECT * FROM offers WHERE CAST(end_date_time AS DATE) >= ? AND coupon_code = ? AND minimum_price <='?' AND maximum_price >= '?' AND status = 1`;
            db.query(query, [currentDate, couponCode, cart_amount,cart_amount], async (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        if (results.length > 0) {
                            const params = { user_id: userId, offer_type: results[0].offer_type, minimum_price: results[0].minimum_price, maximum_price: results[0].maximum_price, offer_amount: results[0].percentage };
                            let offerCalculation = 0; // Declare offerCalculation outside the if conditions
                    
                            const offerUseStatus = await this.isOfferUsed(req);
                    
                            if (offerUseStatus) {
                                if (results[0].offer_type == 2) { // Delivery offer
                                    offerCalculation = await this.deliveryOfferCalculate(params);
                                    if(offerCalculation){
                                        offerCalculation = params;
                                    }
                                } else if (results[0].offer_type == 3) { // Shopping offer
                                    offerCalculation = await this.offerCalculate(params);
                                }
                            }
                    
                            resolve(offerCalculation);
                        } else {
                            reject('Coupon code has expired or is invalid.');
                        }
                    } catch (error) {
                        reject(error);
                    }
                    
                }
            });
            
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
                        resolve(true);
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
