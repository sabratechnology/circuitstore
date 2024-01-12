const db = require('../db');

class Orders {
  static orderInfoByOrderId(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const [confirm_order_details] = await Promise.all([
          this.getConfirmOrderDetails(req),
        ]);
        // Constructing the response object
        const response = {confirm_order_details,};
        // Resolving with the final response
        resolve(response);
      } catch (error) {
        // Rejecting with the encountered error
        reject(error);
      }
    });
  }

  static async getConfirmOrderDetails(req) {
    const userId = req.user_id;
    const orderId = req.order_id;

    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          order_id,order_no,fk_product_id,fk_user_id,fk_lang_id,fk_address_id,quantity,unit_price,total,sub_total,tax,grand_total,payment_type,date,is_placed
        FROM 
        tbl_payment 
        WHERE 
          order_id = ? 
          AND fk_user_id = ?
          ORDER BY id DESC;`;

      // Executing the query with parameters
      console.log(orderId);
      db.query(query, [orderId,userId], (error, results) => {
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


  static async orderHistoriesByUserId(req) {
    const userId = req.user_id;

    return new Promise((resolve, reject) => {
        const query = `
        SELECT
            order_data.id,
            order_data.order_number,
            order_data.order_id,
            order_data.quantity,
            order_data.grand_total,
            product.product_name,
            product.image_name,
            product.product_name_ar,
            product.currency_in_english,
            product.currency_in_arabic,
            order_data.date,
            GROUP_CONCAT(DISTINCT tbl_order_status.status) as status,
            GROUP_CONCAT(DISTINCT tbl_order_status_master.order_status) as order_status,
            GROUP_CONCAT(DISTINCT tbl_order_status_master.order_status_ar) as order_status_ar,
            order_data.order_date_time,
            order_data.gift_code
        FROM
            order_data
        LEFT JOIN
            product ON order_data.fk_product_id = product.product_id
        LEFT JOIN
            tbl_order_status ON tbl_order_status.fk_order_id = order_data.id
        LEFT JOIN
            tbl_order_status_master ON tbl_order_status.status = tbl_order_status_master.id
        WHERE
            order_data.fk_user_id = ?
            AND tbl_order_status.used_status = '1'
        GROUP BY
            order_data.order_id
        ORDER BY
            order_data.id DESC;`;
      
      

      // Executing the query with parameters
      db.query(query, [userId], (error, results) => {
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
  


}

// Exporting the Section class
module.exports = Orders;
