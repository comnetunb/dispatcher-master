var dashboard = angular.module('dashboard', ['ngRoute', 'gridster', 'angularjs-gauge', 'angularUtils.directives.dirPagination'])

dashboard.config(function ($routeProvider, $locationProvider) {
  // Initialize data
  //$locationProvider.html5Mode(true)

  $routeProvider
    .when('/workers', {
      templateUrl: 'workers.html',
      controller: 'workerCtrl'
    })
    .when('/active', {
      templateUrl: 'active.html',
      controller: 'taskCtrl'
    })
    .otherwise({
      redirectTo: '/workers'
    })
})

dashboard.run(function (gridsterConfig) {
  gridsterConfig.defaultSizeX = 1;
  gridsterConfig.defaultSizeY = 1;
  gridsterConfig.resizable.enabled = false;
  gridsterConfig.columns = 5;
});

dashboard.controller('navigationCtrl', function ($scope, $http, $rootScope, $window) {
  $scope.signOut = function () {
    $http
      .post('/sign_out')
      .then(function (response) {
        $rootScope.signedUser = null
        $window.location.href = '/'
      })
  }
})


dashboard.controller('workerCtrl', function ($scope, $http, $interval) {
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

dashboard.controller('taskCtrl', function ($scope, $http, $interval) {
  $scope.sort = function (keyname) {
    $scope.sortKey = keyname;   //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  }

  getAllActiveTasks($scope, $http)

  $interval(function () {
    getAllActiveTasks($scope, $http)
  }, 1500)
})

function getAllActiveTasks($scope, $http) {
  $http
    .get('/api/task/get_executing')
    .then(function (response) {
      $scope.tasks = response.data
      console.log($scope.tasks)
    })
}

dashboard.run(function ($rootScope, $http, $window) {
  $rootScope.signOut = function () {
    $http
      .post('/sign_out')
      .then(function (response) {
        console.log('logout')
        $rootScope.signedUser = null
        $window.location.href = '/'
      })
  }

  $http
    .get('/signed_in')
    .then(function (response) {
      $rootScope.signedUser = response.data

      if (!$rootScope.signedUser) {
        $window.location.href = '/'
      }
    })

  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    if (next.auth && !$rootScope.signedUser) {
      $location.path('/sign_in')
      return
    }

    if (next.route) {
      $window.location.href = next.route
      return
    }
  });
})

