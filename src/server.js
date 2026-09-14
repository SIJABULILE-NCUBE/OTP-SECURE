// this file will  actually start everything up
// running "npm start" points here

require('dotenv').config();
const express = require('express');
const path = require('path');
const otpRoutes = require('./otpRoutes');

const app = express();

// this lets express read json from the request body
// without this part, req.body would just be undefined
app.use(express.json());

// this serves our two html screens and their js/css files
// so visiting the site in a browser actually shows something
app.use(express.static(path.join(__dirname, '..', 'public')));

// visiting the site root has nowhere to land since we do not have an index.html
// so this just sends people straight to the send otp screen, which is the natural starting point
app.get('/', (req, res) => {
  res.redirect('/send.html');
});

// every otp related endpoint lives under /api/otp
app.use('/api/otp', otpRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
