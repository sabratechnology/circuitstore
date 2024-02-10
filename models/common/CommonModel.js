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

}

// Exporting the Section class
module.exports = CommonModel;
