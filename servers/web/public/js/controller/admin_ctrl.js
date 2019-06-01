const getPendingUsers = function ($scope, $http) {
  return $http
    .get('/api/user/pending');
};

const allowUser = function (userId, $scope, $http) {
  return $http
    .post(`/api/user/allow/${userId}`);
};

app.controller('adminCtrl', function ($scope, $rootScope, $http, $interval, $routeParams) {
  $rootScope.sidebar = true;
  $scope.users = [];

  $scope.start = function () {
    getPendingUsers($scope, $http)
      .then((users) => {
        $scope.users = users.data;
      });
  };

  $scope.allow = function (userId) {
    allowUser(userId, $scope, $http)
      .then(() => {
        let user = -1;
        for (let i = 0; i < $scope.users.length; i += 1) {
          if ($scope.users[i]._id == userId) {
            user = i;
          }
        }
        if (user != -1) {
          $scope.users.splice(user, 1);
        }
      });
  };

  $scope.stop = function () {
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});
