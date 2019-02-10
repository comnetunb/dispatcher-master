const getNotifications = function ($scope, $http) {
  $http
    .get('/api/notifications')
    .then(function (response) {
      $scope.notifications = response.data;
    });
};

app.controller('navigationCtrl', function ($scope, $rootScope, $http, $location) {
  $scope.signOut = function () {
    $http
      .post('/api/user/sign_out')
      .then(function () {
        $rootScope.signedUser = null;
        $location.path('/');
      });
  };

  $scope.getResultClass = (result) => {
    if (result === 'success') {
      return 'text-success';
    } else if (result === 'neutral') {
      return 'text-info';
    } else if (result === 'warning') {
      return 'text-warning';
    } else if (result === 'error') {
      return 'text-danger';
    }

    return '';
  };

  $scope.notifications = [];
  getNotifications($scope, $http);
});
