const updateLog = function ($scope, response) {
  if (!response.data.length) {
    return;
  }

  $scope.logs = $scope.logs.concat(response.data);
  $scope.lastDate = $scope.logs[$scope.logs.length - 1].date;
};

const getAllLogs = function ($scope, $http) {
  $http
    .get('/api/log/get_all')
    .then(function (response) {
      updateLog($scope, response);
    });
};

const getAllLogsFromDate = function ($scope, $http) {
  $http
    .get('/api/log/get_all_from_date', {
      params: { lastDate: $scope.lastDate }
    })
    .then(function (response) {
      updateLog($scope, response);
    });
};

app.controller('logCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true;

  $scope.logs = [];
  $scope.lastDate = Date.now();

  let promise;

  $scope.start = function () {
    $scope.stop();

    getAllLogs($scope, $http);

    promise = $interval(function () {
      getAllLogsFromDate($scope, $http);
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
