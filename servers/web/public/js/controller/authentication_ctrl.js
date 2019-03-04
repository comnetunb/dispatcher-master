app.controller('signInCtrl', function ($scope, $http, $window, $rootScope, $location) {
  $scope.sign_in = function (signIn) {
    $http
      .post('/api/user/sign_in', signIn)
      .then(function (response) {
        $scope.errorMessage = false;
        $rootScope.signedUser = response.data;
        $location.path('/workers');
      })
      .catch(function (e) {
        if (e.data && e.data.reason) {
          $scope.errorMessage = e.data.reason;
        } else {
          $scope.errorMessage = e;
        }
      });
  };
});

app.controller('signUpCtrl', function ($scope, $http) {
  $scope.sign_up = function (signUp) {
    if (signUp.password !== signUp.confirmPassword) {
      $scope.errorMessage = 'Passwords must match!';
      return;
    }

    $http
      .post('/api/user/sign_up', signUp)
      .then(function () {
        $scope.errorMessage = false;
        $scope.successMessage = 'Successful sign up, you can now log in';
      })
      .catch(function (e) {
        if (e.data && e.data.reason) {
          $scope.errorMessage = e.data.reason;
        } else {
          $scope.errorMessage = e;
        }
      });
  };
});
