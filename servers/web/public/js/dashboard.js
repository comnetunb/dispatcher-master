const dashboard = angular.module('dashboard', ['ngRoute', 'gridster', 'angularjs-gauge', 'angularUtils.directives.dirPagination']);

dashboard.config(($routeProvider /* , $locationProvider */) => {
  // Initialize data
  // $locationProvider.html5Mode(true)

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
    });
});

dashboard.run((gridsterConfig) => {
  gridsterConfig.defaultSizeX = 1;
  gridsterConfig.defaultSizeY = 1;
  gridsterConfig.resizable.enabled = false;
  gridsterConfig.columns = 5;
});

dashboard.controller('navigationCtrl', ($scope, $http, $rootScope, $window) => {
  $scope.signOut = () => {
    $http
      .post('/api/user/sign_out')
      .then(() => {
        $rootScope.signedUser = null;
        $window.location.href = '/';
      });
  };
});

dashboard.controller('workerCtrl', ($scope, $http, $interval) => {
  $scope.threshold = {
    0: { color: 'green' },
    50: { color: 'orange' },
    80: { color: 'red' }
  };

  getAllWorkers($scope, $http);

  $interval(() => {
    getAllWorkers($scope, $http);
  }, 1500);
});

function getAllWorkers($scope, $http) {
  $http
    .get('/api/worker/getAll')
    .then((response) => {
      $scope.workers = response.data;
    });
}

dashboard.controller('taskCtrl', ($scope, $http, $interval) => {
  $scope.sort = (keyname) => {
    $scope.sortKey = keyname; // set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; // if true make it false and vice versa
  };

  getAllActiveTasks($scope, $http);

  $interval(() => {
    getAllActiveTasks($scope, $http);
  }, 1500);
});

function getAllActiveTasks($scope, $http) {
  $http
    .get('/api/task/get_executing')
    .then((response) => {
      $scope.tasks = response.data;
    });
}

dashboard.run(($rootScope, $http, $window) => {
  $rootScope.signOut = () => {
    $http
      .post('/api/user/sign_out')
      .then(() => {
        $rootScope.signedUser = null;
        $window.location.href = '/';
      });
  };

  $http
    .get('/api/user/signed_in')
    .then((response) => {
      $rootScope.signedUser = response.data;

      if (!$rootScope.signedUser) {
        $window.location.href = '/';
      }
    });

  $rootScope.$on('$routeChangeStart', (event, next) => {
    if (next.auth && !$rootScope.signedUser) {
      $location.path('/sign_in');
      return;
    }

    if (next.route) {
      $window.location.href = next.route;
    }
  });
});
