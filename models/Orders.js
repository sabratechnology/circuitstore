const { resolve } = require('path');
const db = require('../db');
const UsersModel = require('../models/Users');
const ProductModel = require('../models/Product');

const OrderByInfo = require('../models/common/CommonModel');
const { rejects } = require('assert');


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
          AND is_placed = 0
          ORDER BY id DESC;`;

      // Executing the query with parameters
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
          const logMessage = `| Order Confirmed | order_id: ${orderId} | order_source :${order_source} |user_id: ${userId} | fk_address_id : ${fk_address_id} |  product_id: ${fk_product_id[i]}  |  unit_price : ${unit_price[i]} | product_qty: ${quantity[i]} | sub_total: ${sub_total} | tax: ${tax} | grand_total: ${grand_total}\n`;
          await OrderByInfo.logToFile(logMessage);

        } catch (error) {
          reject(error);
          return;
        }
      }
  
      // Resolve after all insertions are successful
      resolve({ message: 'Orders Confirmed.',order_id:orderId });
    });
  }


  static async placeOrderRequest(req) {
    const userId = req.user_id;
    const fk_product_id = req.fk_product_id;
    const orderId = req.order_id;
    const order_number = req.order_no;
    const payment_type = req.payment_type;
    const quantity = req.quantity;
    const unit_price = req.unit_price;
    const total = req.total;
    const sub_total = req.sub_total;
    const tax = req.tax;
    const grand_total = req.grand_total;
    const order_source = req.order_source;
    const fk_address_id = req.fk_address_id;
    const fk_lang_id = 1;
    const transaction_status = req.transaction_status;
    const transaction_number = req.transaction_number;
    const mid = req.MID;
    const response_code = req.RESPCODE;
    const response_status = req.STATUS;
    const response_msg = req.RESPMSG;
    const txn_amount = req.TXNAMOUNT;
    const checksumhash = req.checksumhash;
    const has_coupon_code = 0;
    const coupon_number = 0;
    const offer_code = 0;
    const order_date_time = require('moment')().format('DD/MM/YYYY HH:mm:ss');
    const date = require('moment')().format('DD/MM/YYYY');
    const formattedDateTime = require('moment')().format('DD/MM/YYYY HH:mm:ss');

    const status = 1;
    const payment_status = '0';
  
    return new Promise(async (resolve, reject) => {

      try {
        for (let i = 0; i < fk_product_id.length; i++) {

          const productInfo = await ProductModel.getBasicProductInfo(fk_product_id[i]);
          const purchase_price = productInfo[0].product_purchase_price;
          const barcode = productInfo[0].product_barcode;

          const insertQuery = `INSERT INTO order_data (fk_user_id, fk_lang_id, order_id,order_number,
            coupon_number, offer_code, quantity, product_barcode, purchase_price, unit_price, total, sub_total, tax,
            grand_total, order_date_time, date, payment_method, payment_status, fk_address_id, fk_product_id, order_source,
            status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  
          const values = [userId, fk_lang_id, orderId,order_number[i], coupon_number, offer_code, quantity[i],
            barcode, purchase_price, unit_price[i], total[i], sub_total, tax, grand_total, order_date_time, date, payment_type,
            payment_status, fk_address_id, fk_product_id[i], order_source, status];
            
            const results = await new Promise((resolve, reject) => {
              db.query(insertQuery, values, (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  const insertedOrderId = results.insertId;
                  resolve({ insertedOrderId });
                }
              });
            });
            const insertedOrderId = results.insertedOrderId;
            const basicParams = { user_id: userId, product_id: fk_product_id[i]};
            const deleteWishList = await this.deleteProductFromWishlist(basicParams);
            const currentStockInfo = await this.getOldStockInfo(basicParams);
            const stockParams = { product_id: fk_product_id[i],current_stock : currentStockInfo,orderd_qty : quantity[i],date:date };
            const updateOldStockInfo = await this.updateOldStockInfo(stockParams);
            const addNewstockInfo = await this.addNewStockInfo(stockParams);
            const newstockParams = { product_id: fk_product_id[i],new_stock : addNewstockInfo};
            const updateNewstockQtyInProducts = await this. updateNewStockInProducts(newstockParams);
            const deleteProductFromCart = await this. deleteProductFromCart(basicParams);
            const paymentParams = { user_id : userId,order_id : orderId[i],payment_type: payment_type,transaction_status : transaction_status,transaction_number :transaction_number,MID : mid,RESPCODE : response_code, STATUS : response_status, RESPMSG : response_msg,TXNAMOUNT:txn_amount,checksumhash:checksumhash};
            const updatePaymentInfo = await this.updatePaymentInfo(paymentParams);
            const deliveryParams = {inserted_order_id : insertedOrderId,order_id : orderId[i]}
            const updateOrderStatus = await this.addOrderDeliveryStatusInfo(deliveryParams);
            
            const logMessage = ` | Orders Successfully Placed | order_id: ${orderId} | order_source : ${order_source} | payment_type : ${payment_type} | user_id: ${userId} | fk_address_id : ${fk_address_id} |  product_id: ${fk_product_id[i]}  |  unit_price : ${unit_price[i]} | product_qty: ${quantity[i]} |  sub_total: ${sub_total} | tax: ${tax} | grand_total: ${grand_total}\n`;
            await OrderByInfo.logToFile(logMessage);

          }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }



  static async addOrderDeliveryStatusInfo(req) {
    const fk_order_id = req.inserted_order_id;
    const status  = 1;
    const order_id = req.order_id;
    return new Promise((resolve, reject) => {
        const sqlForAddDeliveryStatus = "INSERT INTO `tbl_order_status` (fk_order_id,order_id,status) VALUES (?,?,?)";
        db.query(sqlForAddDeliveryStatus, [fk_order_id,order_id,status], (error, results) => {
              if (results.affectedRows > 0) {
                  resolve();
              } 
        });
    });
  }

  static async updatePaymentInfo(req) {
    const user_id = req.user_id;
    const payment_type = req.payment_type;
    const transaction_status = req.transaction_status;
    const transaction_number = req.transaction_number;
    const MID = req.MID;
    const RESPCODE = req.RESPCODE;
    const STATUS = req.STATUS;
    const RESPMSG = req.RESPMSG;
    const TXNAMOUNT = req.TXNAMOUNT;
    const checksumhash = req.checksumhash;
    const order_id = req.order_id; 
    const is_placed = 1;

    return new Promise((resolve, reject) => {
        const updateQuery = `
            UPDATE tbl_payment 
            SET 
                payment_type = ?, 
                transaction_status = ?, 
                transaction_number = ?, 
                MID = ?, 
                RESPCODE = ?, 
                STATUS = ?, 
                RESPMSG = ?, 
                TXNAMOUNT = ?, 
                checksumhash = ?,
                is_placed = ?
            WHERE 
                order_id = ? AND fk_user_id = ?;`;

        db.query(updateQuery, [payment_type, transaction_status, transaction_number, MID, RESPCODE, STATUS, RESPMSG, TXNAMOUNT, checksumhash, order_id, user_id, is_placed], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}


  static async deleteProductFromCart(req) {
    const userId = req.user_id;
    const product_id = req.product_id;
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM cart WHERE user_id = ? AND product_id = ?`;
        db.query(deleteQuery, [userId, product_id], (error, results) => {
          resolve({ status: 200});
        });
    });
  }
  static async updateNewStockInProducts(req) {
    const productId = req.product_id;
    const qty = req.new_stock;
    return new Promise((resolve, reject) => {
        const updateQuery = `UPDATE product SET qty = ? WHERE product_id = ?;`;
        db.query(updateQuery, [qty,productId], (error, results) => {
            if (error) {
                reject(error);
            } else {
              resolve(true);
            }
        });
    });
  }



  static async addNewStockInfo(req) {
    const productId = req.product_id;
    const current_stock = req.current_stock;
    const orderd_qty = req.orderd_qty;
    const date = req.date;
    const newStock = current_stock - orderd_qty;
    return new Promise((resolve, reject) => {
        const sqlForAddNewStock = "INSERT INTO `inventory` (product_id,qty,deduct_qty,used_status,date) VALUES (?,?,?,?,?)";
        db.query(sqlForAddNewStock, [productId,newStock,current_stock,1,date], (error, results) => {
              if (results.affectedRows > 0) {
                  resolve(newStock);
              } 
        });
    });
  }

  static async getOldStockInfo(req) {
    const product_id = req.product_id;
    return new Promise((resolve, reject) => {
      const query = "SELECT qty as stock_qty,supplier_id FROM `inventory` WHERE product_id = ? AND used_status =1;";
        db.query(query,[product_id], (error, results) => {
        if (error) {
          reject(error);
        } else {
          const oldStockQty = results[0].stock_qty;
          resolve(oldStockQty);
        }
      });
    });
  }

static async deleteProductFromWishlist(req) {
  const userId = req.user_id;
  const product_id = req.product_id;
  return new Promise((resolve, reject) => {
      const deleteQuery = `DELETE FROM wishlist WHERE user_id = ? AND product_id = ? AND status = 1`;
      db.query(deleteQuery, [userId, product_id], (error, results) => {
        resolve({ status: 200});
      });
  });
}


static async updateOldStockInfo(req) {
  const productId = req.product_id;
  
  return new Promise((resolve, reject) => {
      const updateQuery = `UPDATE inventory SET used_status = 0 WHERE  product_id = ?;`;
      db.query(updateQuery, [productId], (error, results) => {
          if (error) {
              reject(error);
          } else {
            resolve(true);
          }
      });
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
              resolve(orderNo);
            } else {
              generateUniqueRandomNumber();
            }
          }
        });
      };
      generateUniqueRandomNumber();
    });
  }
  


}

// Exporting the Section class
module.exports = Orders;
