const BestSelling = require('../models/BestSelling');

// Controller
exports.BestSellingData = async (req, res) => {
    try {
      
      const fData = await BestSelling.BestSellingData(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

