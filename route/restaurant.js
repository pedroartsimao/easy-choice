var express = require('express');
var fs = require('fs');
var router = express.Router();

var RESTAURANTS_LIST = fs.readFileSync('./mock/restaurants.json', 'utf8');

var dailyVotes = [];
var weeklyResult = [];

/**
 * GET filtered restaurants json.
 */
router.get('/restaurants_list', function (req, res) {
    var json = JSON.parse(RESTAURANTS_LIST);
    var filteredRestaurants = json.restaurants.filter(function (item) {
        weeklyResult.forEach(function (weeklyItem) {
            if (weeklyItem.restaurant == item.name) {
                return false;
            }
        });
        return true;
    });
    json.restaurants = filteredRestaurants;
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json));
});

/**
 * GET dailyVotes compiled in votes sum.
 */
router.get('/daily_result', function (req, res) {
    var json = getDailyVotesByRestaurant();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
});

/**
 * GET dailyVotes compiled in votes sum.
 */
router.get('/weekly_result', function (req, res) {
    var result = { "weeklyResult": weeklyResult };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
});

/**
 * POST vote.
 */
router.post('/post_vote', function (req, res) {
    var email = req.body.email;
    var restaurant = req.body.restaurant;
    var response = { "status": false, "data": null, "msg": null };

    if (emailAlreadyVoted(email)) {
        response.msg = email + " already voted";
    } else {
        dailyVotes.push({ "email": email, "restaurant": restaurant });
        response.status = true;
        response.msg = "Success!";
    }
    res.json(response);
});

/**
 * Update weekly result with the most voted restaurant fo the day.
 */
router.updateWeeklyResult = function () {
    var votesByRestaurant = getDailyVotesByRestaurant();
    votesByRestaurant.dailyResult.sort(function (a, b) {
        return b.votesCount - a.votesCount;
    });
    if (weeklyResult.length == 0) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var currentDate = new Date;
        var firstDay = currentDate.getDate() - currentDate.getDay();
        for (var i = 0; i <= 6; i++) {
            var targetDate = new Date(currentDate.setDate(firstDay + i));
            var key = targetDate.getFullYear().toString() + targetDate.getMonth().toString() + targetDate.getDate().toString();
            weeklyResult[key] = {
                "weekDay": days[targetDate.getDay()],
                "date": targetDate.getMonth() + "/" + targetDate.getDate(),
                "restaurant": "N/A"
            };
        }
    }
    console.log(JSON.stringify(weeklyResult));
    var today = new Date;
    var key = today.getFullYear().toString() + today.getMonth().toString() + today.getDate().toString();
    weeklyResult[key]["restaurant"] = votesByRestaurant.dailyResult[0]["restaurant"];
}

/**
 * Reset weekly result array
 */
router.clearDailyVotes = function () {
    dailyVotes = [];
}

/**
 * Reset daily votes array 
 */
router.clearWeeklyResult = function () {
    weeklyResult = [];
}

/**
 * Checks if daily votes array contains email
 * @param {*String} email 
 */
function emailAlreadyVoted(email) {
    return dailyVotes.filter(function (vote) { return vote.email == email }).length > 0;
}

/**
 * Compile daily votes.
 */
function getDailyVotesByRestaurant() {
    var votesSum = [];
    for (var i = 0; i < dailyVotes.length; i++) {
        var vote = dailyVotes[i];
        if (votesSum[vote.restaurant.name] != null) {
            votesSum[vote.restaurant.name]++;
        } else {
            votesSum[vote.restaurant.name] = 1;
        }
    }
    var json = { "dailyResult": [] };
    for (var key in votesSum) {
        json.dailyResult.push({
            "restaurant": key,
            "votesCount": votesSum[key]
        });
    }
    return json;
}

module.exports = router;