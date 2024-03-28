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


app.use('/v2/home', homePageRoutes);
app.use('/v2/featured', featuredPageRoutes);
app.use('/v2/latest', latestPageRoutes);
app.use('/v2/best', bestSellingPageRoutes);
app.use('/v2/all_products', allProductPageRoutes);
app.use('/v2/products', productPageRoutes);
app.use('/v2/users', userPageRoutes);
app.use('/v2/orders', orderPageRoutes);
app.use('/v2/brands', brandPageRoutes);
app.use('/v2/contact', contactPageRoutes);
app.use('/v2/offers', offerPageRoutes);











const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
