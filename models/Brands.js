const db = require('../db');

class Brands {
  static async getBrandData(req) {
    const userId = req.user_id;
    return new Promise((resolve, reject) => {
      const query = `SELECT id,brand_name,brand_name_ar,img_url FROM brands where status =1;`;

      // Executing the query with parameters
      db.query(query, (error, results) => {
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
module.exports = Brands;
