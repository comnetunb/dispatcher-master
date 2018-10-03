app.controller('slaveCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true;

  $scope.threshold = {
    0: { color: 'green' },
    50: { color: 'orange' },
    80: { color: 'red' }
  };

  let promise;

  $scope.start = function () {
    $scope.stop();

    getAllSlaves($scope, $rootScope, $http, $interval);

    promise = $interval(function () {
      getAllSlaves($scope, $rootScope, $http, $interval);
    }, 1500);
  };

  $scope.stop = function () {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});

function getAllSlaves($scope, $rootScope, $http) {
  $http
    .get('/api/slave/get_all')
    .then((response) => {
      $scope.slaves = response.data;
    });
}
