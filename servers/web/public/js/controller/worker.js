app.controller('workerCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  $scope.threshold = {
    '0': { color: 'green' },
    '50': { color: 'orange' },
    '80': { color: 'red' }
  };

  getAllWorkers($scope, $http)

  $interval(function () {
    getAllWorkers($scope, $http)
  }, 1500)
})

function getAllWorkers($scope, $http) {
  $http
    .get('/api/worker/getAll')
    .then(function (response) {
      $scope.workers = response.data
    })
}