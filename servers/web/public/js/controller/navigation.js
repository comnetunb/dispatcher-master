app.controller('navigationCtrl', ($scope, $rootScope, $http, $location) => {
  $scope.signOut = () => {
    $http
      .post('/api/user/sign_out')
      .then(() => {
        $rootScope.signedUser = null;
        $location.path('/');
      });
  };
});
