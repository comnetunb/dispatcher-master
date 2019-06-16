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

  $scope.readNotification = function ($event, notification) {
    $event.stopPropagation();
    $event.preventDefault();
    $http
      .post(`/api/notifications/${notification._id}`)
      .then(function (response) {
        const idx = $scope.notifications.indexOf(notification);

        if (idx > -1) {
          $scope.notifications.splice(idx, 1);
        }
      });
  };

  $scope.notifications = [];
  getNotifications($scope, $http);
});
