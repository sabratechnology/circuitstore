const Home = require('../models/Home');

// Controller
exports.getHomePageData = async (req, res) => {
    try {
      const fData = await Home.homePage(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

// Add more controller functions as needed
