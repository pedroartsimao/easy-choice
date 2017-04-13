angular.module('HomeController', [])
    .controller('HomeController', function ($scope, $http, $timeout) {

        /**
         * init controller and set defaults
         */
        function init() {
            $scope.formData = {
                "email": "",
                "restaurant": ""
            };
            getRestaurants();
            getDailyResult();
            getWeeklyResult();
        }

        /**
         * requests and processes restaurant data
         */
        function getRestaurants() {
            $http.get("/restaurant/restaurants_list").success(function (data) {
                $scope.restaurants = data.restaurants;
            });
        }

        /**
         * requests and processes daily result data
         */
        function getDailyResult() {
            $http.get("/restaurant/daily_result").success(function (data) {
                $scope.dailyResult = data.dailyResult;
            });
        }

        /**
         * requests and processes weekly result data
         */
        function getWeeklyResult() {
            $http.get("/restaurant/weekly_result").success(function (data) {
                $scope.weeklyResult = data.weeklyResult;
            });
        }

        /**
         * post vote data
         * @param {*Array} formData 
         */
        function postVote(formData) {
            $http.post("/restaurant/post_vote", formData).success(function (data) {
                if (data.status) {
                    $scope.email = "";
                    $scope.restaurant = "";
                    getDailyResult();
                } else {
                    alert(data.msg);
                }
            });
        }

        /**
         * Validate vote form data and call success/error callback.
         * @param {Array} formData 
         * @param {function(formData)} success 
         * @param {function(errorMessage)} error 
         */
        function validateVoteFormData(formData, success, error) {
            var status = true;
            var errorFields = [];
            if (formData.email == undefined || formData.email == "") {
                errorFields.push("email cannot be empty");
                status = false;
            }
            if (formData.restaurant == undefined || formData.restaurant == "" || formData.restaurant == "?") {
                errorFields.push("select a valid restaurant");
                status = false;
            }
            if (status) {
                success(formData);
            } else {
                error(errorFields.join(", "));
            }
        }

        /**
         * binded to @user input form
         */
        $scope.postVote = function () {
            validateVoteFormData(
                $scope.formData,
                function (formData) {
                    postVote(formData);
                },
                function (errorMessage) {
                    alert(errorMessage);
                }
            );
        }

        init();
    });