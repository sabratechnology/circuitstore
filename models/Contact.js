const db = require('../db');

class Contact {
    static async addContactData(req) {
        const userId = req.user_id;
        const name = req.name;
        const email = req.email;
        const message = req.message;
      
        return new Promise((resolve, reject) => {
          const insertQuery = "INSERT INTO `tbl_contact_us` (user_id, name, email, message) VALUES (?, ?, ?, ?)";
          db.query(insertQuery, [userId, name, email, message], (error, results) => {
            if (error) {
              reject(error);
            } else {
              // Check if any rows were affected by the insertion
              if (results.affectedRows > 0) {
                resolve({ message: 'Enquiry sent successfully. We will get back to you soon.' });
            } else {
                // No rows were affected, indicating the insertion might have failed
                reject({ message: 'Failed to send enquiry. Please try again later.' });
            }
            }
          });
        });
      }
      
}

// Exporting the Section class
module.exports = Contact;
