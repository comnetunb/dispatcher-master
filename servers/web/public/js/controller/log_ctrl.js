app.controller('logCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  $scope.toggle = false
  $scope.logs = []
  $scope.lastDate = Date.now()

  var promise

  $scope.start = () => {
    $scope.stop();

    getAllLogs($scope, $http)

    promise = $interval(() => {
      getAllLogsFromDate($scope, $http)
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

const getAllLogs = ($scope, $http) => {
  $http
    .get('/api/log/get_all')
    .then(response => {
      updateLog($scope, response)
    })
}

const getAllLogsFromDate = ($scope, $http) => {
  $http
    .get('/api/log/get_all_from_date', {
      params: { lastDate: $scope.lastDate }
    })
    .then(response => {
      updateLog($scope, response)
    })
}

const updateLog = ($scope, response) => {
  if (!response.data.length) {
    return
  }

  $scope.logs = $scope.logs.concat(response.data)
  $scope.lastDate = $scope.logs[$scope.logs.length - 1].date
}