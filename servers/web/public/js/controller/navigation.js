app.controller('navigationCtrl', function ($scope, $rootScope, $http, $location) {
  $scope.signOut = function () {
    $http
      .post('/api/user/sign_out')
      .then(function (response) {
        $rootScope.signedUser = null
        $location.path('/')
      })
  }
})