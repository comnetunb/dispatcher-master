app.controller("SignInCtrl", function ($scope, $http, $window, $rootScope, $location) {
  $scope.hide_navbar = true

  $scope.sign_in = function (signIn) {
    $http
      .post('/sign_in', signIn)
      .then(function (response) {
        $scope.errorMessage = false
        $rootScope.signedUser = response.data
        $location.path('/workers')
      })
      .catch(function (e) {
        $scope.errorMessage = e.data
      })
  }
})