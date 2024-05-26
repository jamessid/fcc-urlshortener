// Access .env variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns'); // Required to verify submitted URL.
const asyncHandler = require('express-async-handler');

// Basic Configuration
const port = process.env.PORT || 3000;

// Mongoose models required
const Url = require('./models/url.js');

// Mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB")
}

app.use(cors());

// Header parser
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

// GET "home"
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST api/shorturl
app.post('/api/shorturl', function(req, res, next) {

  function errorResponse(){
    res.json( {error: 'invalid url'} );
  }

  try {
    const urlInput = new URL(req.body.url);
    dns.lookup(urlInput.hostname, asyncHandler(async (err, address, family) => {
      if(err) return errorResponse();
      // Otherwise, URL is valid, so save.
      const savedUrl = await Url.create({ url: urlInput });
      console.log(savedUrl);
      res.json({
        original_url: savedUrl.url,
        short_url: savedUrl._id,
      });
    }));  
  } catch (error) {
      errorResponse();
  }

});

// Redirect to saved URL on GET
app.get('/api/shorturl/:id', asyncHandler(async (req, res, next) => {

  // try and find document by id.
  try {
    const doc = await Url.findById(req.params.id).exec();
    res.redirect(doc.url);
  // if error thrown, redirect home
  } catch (error) {
    res.redirect('/');
  }
  
}));

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});