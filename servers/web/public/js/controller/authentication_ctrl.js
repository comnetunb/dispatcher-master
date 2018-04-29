app.controller("signInCtrl", function ($scope, $http, $window, $rootScope, $location) {

  $scope.sign_in = function (signIn) {
    $http
      .post('/api/user/sign_in', signIn)
      .then(function (response) {
        $scope.errorMessage = false
        $rootScope.signedUser = response.data
        $location.path('/workers')
      })
      .catch(function (e) {
        console.log(e)
        $scope.errorMessage = e.data
      })
  }
})

app.controller("signUpCtrl", function ($scope, $http, $window, $rootScope, $location) {

  $scope.sign_up = function (signUp) {
    if (signUp.password !== signUp.confirmPassword) {
      $scope.errorMessage = 'Passwords must match!'
      return
    }

    $http
      .post('/api/user/sign_up', signUp)
      .then(function (response) {
        $scope.errorMessage = false
        $rootScope.signedUser = response.data
        $location.path('/')
      })
      .catch(function (e) {
        $scope.errorMessage = e.data.reason
      })
  }
})