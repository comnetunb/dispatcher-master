const updateLog = ($scope, response) => {
  if (!response.data.length) {
    return;
  }

  $scope.logs = $scope.logs.concat(response.data);
  $scope.lastDate = $scope.logs[$scope.logs.length - 1].date;
};

const getAllLogs = ($scope, $http) => {
  $http
    .get('/api/log/get_all')
    .then((response) => {
      updateLog($scope, response);
    });
};

const getAllLogsFromDate = ($scope, $http) => {
  $http
    .get('/api/log/get_all_from_date', {
      params: { lastDate: $scope.lastDate }
    })
    .then((response) => {
      updateLog($scope, response);
    });
};

app.controller('logCtrl', ($scope, $rootScope, $http, $interval) => {
  $rootScope.sidebar = true;

  $scope.logs = [];
  $scope.lastDate = Date.now();

  let promise;

  $scope.start = () => {
    $scope.stop();

    getAllLogs($scope, $http);

    promise = $interval(() => {
      getAllLogsFromDate($scope, $http);
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
