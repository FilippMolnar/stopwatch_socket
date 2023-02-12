const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render("splash.ejs", {});
});

// /* Pressing the 'PLAY' button, returns this page */
router.get('/control', function (req, res, next) {
  res.sendFile("game.html", { root: "./public" });
});


module.exports = router;
