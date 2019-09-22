app.controller('signInCtrl', function ($scope, $http, $window, $rootScope, $location) {
  $scope.sign_in = function (signIn) {
    $http
      .post('/api/users/sign_in', signIn)
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
      .post('/api/users/sign_up', signUp)
      .then(function () {
        $scope.errorMessage = false;
        $scope.successMessage = 'Successful sign up, you may now wait for the approval of your account.';
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
