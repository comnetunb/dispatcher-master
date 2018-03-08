var dashboard = angular.module('dashboard', ['gridster', 'angularjs-gauge'])

dashboard.config(() => {
  // Initialize data
})

dashboard.run(['gridsterConfig', (gridsterConfig) => {
  gridsterConfig.resizable.enabled = false;
}]);

dashboard.controller('workerCtrl', ($scope, $http, $interval) => {
  //$scope.workers = [
  //  { sizeX: 2, sizeY: 1 },
  //  { sizeX: 2, sizeY: 1 },
  //  { sizeX: 2, sizeY: 1 },
  //];

  $scope.threshold = {
    '0': { color: 'green' },
    '40.3': { color: 'orange' },
    '80': { color: 'red' }
  };

  $interval(() => {
    $http
      .get('/api/worker/getAll')
      .then(function (response) {
        for (var data in response.data) {
          response.data[data].sizeX = 4
          response.data[data].sizeY = 1
        }
        $scope.workers = response.data
        console.log(response)
      })
  }, 1500)
})