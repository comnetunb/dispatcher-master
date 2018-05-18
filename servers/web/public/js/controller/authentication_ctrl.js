app.controller('signInCtrl', ($scope, $http, $window, $rootScope, $location) => {
  $scope.sign_in = (signIn) => {
    $http
      .post('/api/user/sign_in', signIn)
      .then((response) => {
        $scope.errorMessage = false;
        $rootScope.signedUser = response.data;
        $location.path('/workers');
      })
      .catch((e) => {
        console.log(e); // eslint-disable-line no-console
        $scope.errorMessage = e.data;
      });
  };
});

app.controller('signUpCtrl', ($scope, $http, $window, $rootScope, $location) => {
  $scope.sign_up = (signUp) => {
    if (signUp.password !== signUp.confirmPassword) {
      $scope.errorMessage = 'Passwords must match!';
      return;
    }

    $http
      .post('/api/user/sign_up', signUp)
      .then((response) => {
        $scope.errorMessage = false;
        $rootScope.signedUser = response.data;
        $location.path('/');
      })
      .catch((e) => {
        $scope.errorMessage = e.data.reason;
      });
  };
});
