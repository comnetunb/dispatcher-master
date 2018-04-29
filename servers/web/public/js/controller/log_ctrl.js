app.controller('logCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  var promise

  $scope.start = () => {
    $scope.stop();

    getLogs($scope, $http)

    promise = $interval(() => {
      getLogs($scope, $http)
    }, 1500);
  };

  $scope.stop = () => {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', () => {
    $scope.stop();
  });
})

const getLogs = ($scope, $http) => {
  $http
    .get('/api/log/get_all')
    .then(response => {
      $scope.logs = response.data
    })
}
