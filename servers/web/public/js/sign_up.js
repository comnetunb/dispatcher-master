main.controller("SignUpCtrl", function ($scope, $http, $window, $rootScope) {
  $scope.sign_in = function (signUp) {
    $http
      .post('/sign_up', signUp)
      .then(function (response) {
        $rootScope.user = response.data
        $window.location.href = '/views/dashboard/dashboard.html'
      })
      .catch(function (e) {
        console.log(e)
      })
  }
})