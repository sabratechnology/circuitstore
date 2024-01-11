const Featured = require('../models/Featured');

// Controller
exports.featuredData = async (req, res) => {
    try {
      
      console.log(req.body);
      const fData = await Featured.featuredData(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

