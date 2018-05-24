main.controller('SignUpCtrl', ($scope, $http, $window, $rootScope) => {
  $scope.sign_in = (signUp) => {
    $http
      .post('/api/user/sign_up', signUp)
      .then((response) => {
        $rootScope.user = response.data;
        $window.location.href = '/views/dashboard/dashboard.html';
      })
      .catch((e) => {
        console.log(e); // eslint-disable-line no-console
      });
  };
});
