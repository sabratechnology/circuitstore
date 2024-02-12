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
    this.getConfirmOrderDetails(req);
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




  static async addOrderPaymentsInfo(req) {

    const fs = require('fs');
    const path = '/var/log/payments_logs';
    const userId = req.user_id;
    const fk_product_id = req.fk_product_id;
    const quantity = req.quantity;
    const unit_price = req.unit_price;
    const total = req.total;
    const sub_total = req.sub_total;
    const tax = req.tax;
    const grand_total = req.grand_total;
    const order_source = req.order_source;
    const fk_address_id = req.fk_address_id;
    const randomNumber = Math.floor(10000 + Math.random() * 90000); 
    const orderId = "CS" + randomNumber; 
    const currentDate = new Date();
    const formattedDateTime = require('moment')().format('DD/MM/YYYY HH:mm:ss');
    const logsDateTime = require('moment')().format('YYYYMMDD HH:mm:ss');


    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < fk_product_id.length; i++) {
        try {
          const orderNo = await this.getRandomString();
  
          const insertQuery = `
            INSERT INTO tbl_payment
            (order_source, order_id, fk_product_id, fk_user_id,order_no ,fk_address_id, quantity, unit_price, total, sub_total, tax, grand_total, date, is_placed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
  
          const values = [
            order_source,
            orderId,
            fk_product_id[i],
            userId,
            orderNo,
            fk_address_id,
            quantity[i],
            unit_price[i],
            total[i],
            sub_total,
            tax,
            grand_total,
            formattedDateTime,
            0,
          ];
  
          const results = await db.query(insertQuery, values);

          // Check if any rows were affected by the insertion
          if (results.affectedRows === 0) {
            reject({ message: 'Failed to add orders. Please try again later.'});
            return;
          }
          // Log successful order addition
          const logMessage = `${formattedDateTime} | Orders Successfully Added | order_id: ${orderId} | user_id: ${userId} | fk_address_id : ${fk_address_id} |  product_id: ${fk_product_id[i]} | product_qty: ${quantity[i]} |  unit_prce : ${unit_price[i]} |  sub_total: ${sub_total} | tax: ${tax} | grand_total: ${grand_total}\n`;
          const logFilePath = `${path}/payments_logs_${logsDateTime.split(' ')[0]}.log`;

          fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
              console.error('Error writing to the log file:', err);
            }
          });

        } catch (error) {
          reject(error);
          return;
        }
      }
  
      // Resolve after all insertions are successful
      resolve({ message: 'Orders Successfully Added.',order_id:orderId });
    });
  }
  

  
  static async getRandomString() {
    return new Promise((resolve, reject) => {
      const generateUniqueRandomNumber = () => {
        const randomNumber = Math.floor(10000 + Math.random() * 90000); 
        const orderNo = randomNumber;
  
        const query = `SELECT order_no FROM \`tbl_payment\` WHERE order_no=?;`;
        db.query(query, [orderNo], (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.length === 0) {
              // If the random number is not present in the table, resolve with the orderNo
              resolve(orderNo);
            } else {
              // If the random number is already present, generate a new one recursively
              generateUniqueRandomNumber();
            }
          }
        });
      };
  
      // Start the process of generating a unique random number
      generateUniqueRandomNumber();
    });
  }
  


}

// Exporting the Section class
module.exports = Orders;
