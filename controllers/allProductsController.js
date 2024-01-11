const AllProducts = require('../models/AllProducts');

// Controller
exports.AllProductsData = async (req, res) => {
    try {
      
      const fData = await AllProducts.AllProductsData(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

