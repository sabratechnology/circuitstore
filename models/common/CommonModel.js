const db = require('../../db');


class CommonModel {

  static async getOrderByASC(section_types) {
    let orderByClause;
    const section_type = section_types;
    return new Promise((resolve, reject) => {
      const query = `SELECT CASE WHEN fifo = 'true' THEN 'ORDER BY pr.product_id' ELSE 'ORDER BY pr.product_id DESC' END AS order_column FROM interface_setting
      WHERE sections = ?`;
      db.query(query, [section_type], (error, results) => {
        if (error) {
          reject(error);
        } else {

          if (results[0].order_column) {
            orderByClause = `${results[0].order_column}`;
        } else {
            orderByClause = 'ORDER BY pr.product_id';
        }
        //console.log(orderByClause)
          resolve(orderByClause);
        }
      });
    });
  }


  static async getCartCountByUserId(req) {
    const userId = req;
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(cart_id) as total_cart_count FROM `cart` WHERE user_id = ? AND status =1;";
      db.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
        } else {

          resolve(results[0].total_cart_count);
        }
      });
    });
  }




  static async logToFile(message) {
    const fs = require('fs').promises;
    const path = '/var/log/payments_logs';
    const logsDateTime = require('moment')().format('YYYY-MM-DD HH:mm:ss');
    const logFilePath = `${path}/payments_logs_${logsDateTime.split(' ')[0]}.log`;
    const Logsmessage = logsDateTime + message;
    await fs.appendFile(logFilePath, Logsmessage + '\n');

  }



}

// Exporting the Section class
module.exports = CommonModel;
