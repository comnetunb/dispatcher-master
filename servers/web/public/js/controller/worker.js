app.controller('workerCtrl', ($scope, $rootScope, $http, $interval) => {
  $rootScope.sidebar = true;

  $scope.threshold = {
    0: { color: 'green' },
    50: { color: 'orange' },
    80: { color: 'red' }
  };

  let promise;

  $scope.start = () => {
    $scope.stop();

    getAllWorkers($scope, $rootScope, $http, $interval);

    promise = $interval(() => {
      getAllWorkers($scope, $rootScope, $http, $interval);
    }, 1500);
  };

  $scope.stop = () => {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', () => {
    $scope.stop();
  });
});

function getAllWorkers($scope, $rootScope, $http) {
  $http
    .get('/api/worker/get_all')
    .then((response) => {
      $scope.workers = response.data;
    });
}
