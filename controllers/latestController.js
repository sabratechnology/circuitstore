const Latest = require('../models/Latest');

// Controller
exports.latestData = async (req, res) => {
    try {
      
      console.log(req.body);
      const fData = await Latest.latestData(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

