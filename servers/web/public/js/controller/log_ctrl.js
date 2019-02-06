const updateLog = function ($scope, response) {
  if (!response.data.length) {
    return;
  }

  $scope.logs = $scope.logs.concat(response.data);
  $scope.lastDate = $scope.logs[$scope.logs.length - 1].date;
};

const getAllLogs = function ($scope, $http) {
  const params = {};
  if ($scope.taskSetId) {
    params.taskSetId = $scope.taskSetId;
  }

  $http
    .get('/api/log/get_all', { params })
    .then(function (response) {
      updateLog($scope, response);
    });
};

const getAllLogsFromDate = function ($scope, $http) {
  const params = {
    lastDate: $scope.lastDate,
  };
  if ($scope.taskSetId) {
    params.taskSetId = $scope.taskSetId;
  }

  $http
    .get('/api/log/get_all_from_date', { params })
    .then(function (response) {
      updateLog($scope, response);
    });
};

function getTaskSet($scope, $http) {
  $http
    .get(`/api/task/${$scope.taskSetId}`)
    .then(function (response) {
      $scope.taskSet = response.data;
    });
}

app.controller('logCtrl', function ($scope, $rootScope, $http, $interval, $routeParams) {
  $scope.taskSetId = $routeParams.task_set_id;
  $rootScope.sidebar = true;

  $scope.logs = [];
  $scope.lastDate = Date.now();
  let promise;
  $scope.start = function () {
    $scope.stop();

    if ($scope.taskSetId) {
      getTaskSet($scope, $http);
    }
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
