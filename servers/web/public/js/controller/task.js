app.controller('groupCtrl', function ($scope, $http, $interval, $rootScope) {
  $scope.activeCount = 0
  $scope.finishedCount = 0
  $scope.canceledCount = 0

  getCount($scope, $http)

  $interval(function () {
    getCount($scope, $http)
  }, 1500)

})

function getCount($scope, $http) {
  //$http
  //  .get('/api/task/count_active')
  //  .then(function (response) {
  //    $scope.activeCount = response.data.count
  //    console.log(response)
  //  })

  //$http
  //  .get('/api/task/count_finished')
  //  .then(function (response) {
  //    $scope.finishedCount = response.data.count
  //    console.log(response)
  //  })

  //$http
  //  .get('/api/task/count_canceled')
  //  .then(function (response) {
  //    $scope.canceledCount = response.data.count
  //    console.log(response)
  //  })
}

app.controller('activeTaskGroupCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname;   //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  }

  getAllActiveTaskGroups($scope, $http)

  $interval(function () {
    getAllActiveTaskGroups($scope, $http)
  }, 1500)
})

function getAllActiveTaskGroups($scope, $http) {
  $http
    .get('/api/task/get_executing')
    .then(function (response) {
      $scope.activeTasks = response.data
    })
}

app.controller('finishedTaskGroupCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname;   //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  }

  getAllFinishedTaskGroups($scope, $http)

  $interval(function () {
    getAllFinishedTaskGroups($scope, $http)
  }, 1500)
})

function getAllFinishedTaskGroups($scope, $http) {
  $http
    .get('/api/task/get_finished')
    .then(function (response) {
      $scope.finishedTasks = response.data
    })
}

app.controller('addCtrl', function ($scope, $rootScope) {
  $rootScope.sidebar = true

  $scope.simulatorInput = function (element) {
    $scope.simulator = element.files[0]
  }
})

