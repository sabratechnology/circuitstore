const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data

app.use(morgan('dev'));

const homePageRoutes = require('./routes/homeRoutes');
const featuredPageRoutes = require('./routes/featuredRoutes');
const latestPageRoutes = require('./routes/latestRoutes');
const bestSellingPageRoutes = require('./routes/bestSellingRoutes');
const allProductPageRoutes = require('./routes/allProductsRoutes');
const productPageRoutes = require('./routes/productsRoutes');
const userPageRoutes = require('./routes/usersRoutes');
const orderPageRoutes = require('./routes/ordersRoutes');
const brandPageRoutes = require('./routes/brandRoutes');
const contactPageRoutes = require('./routes/contactRoutes');
const offerPageRoutes = require('./routes/offersRoutes');


app.use('/api/home', homePageRoutes);
app.use('/api/featured', featuredPageRoutes);
app.use('/api/latest', latestPageRoutes);
app.use('/api/best', bestSellingPageRoutes);
app.use('/api/all_products', allProductPageRoutes);
app.use('/api/products', productPageRoutes);
app.use('/api/users', userPageRoutes);
app.use('/api/orders', orderPageRoutes);
app.use('/api/brands', brandPageRoutes);
app.use('/api/contact', contactPageRoutes);
app.use('/api/offers', offerPageRoutes);











const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
