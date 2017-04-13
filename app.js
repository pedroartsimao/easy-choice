var path = require('path');
var cron = require('node-cron');
var express = require('express');
var bodyParser = require('body-parser');
var index = require('./route/index');
var restaurant = require('./route/restaurant');
var app = express();

// serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// look for view html in the views directory
app.set('views', path.join(__dirname, 'view'));

// use ejs to render 
app.set('view engine', 'ejs');

// For application/json and application/x-www-form-urlencoded parsing 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setup routes
app.use('/', index);
app.use('/restaurant', restaurant);

module.exports = app;

// set port listener
var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Listening on ' + port);
});

// setup cron for email sending every day at 11:50:00
cron.schedule('0 50 11 * * *', function(){
  restaurant.updateWeeklyResult();
  
  console.log("Send email with the most voted restaurat");

  restaurant.clearDailyVotes();
});

// setup cron for reset week data every sunday at 00:00:00
cron.schedule('0 0 0 * * Sunday', function(){
  restaurant.clearWeeklyResult();
});