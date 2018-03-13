app.controller("signInCtrl", function ($scope, $http, $window, $rootScope, $location) {
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

app.controller("signUpCtrl", function ($scope, $http, $window, $rootScope, $location) {
  $scope.hide_navbar = true

  $scope.sign_up = function (signUp) {
    if (signUp.password !== signUp.confirmPassword) {
      $scope.errorMessage = 'Passwords must match!'
      return
    }


    $http
      .post('/sign_up', signIn)
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