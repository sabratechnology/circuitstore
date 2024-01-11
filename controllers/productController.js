const Product = require('../models/Product');

// Controller
exports.productDataById = async (req, res) => {
    try {
      const fData = await Product.productDataById(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };



  exports.productData1 = async (req, res) => {
    try {
      const fData = await Product.productData1(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

