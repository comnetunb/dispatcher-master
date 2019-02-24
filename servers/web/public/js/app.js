const app = angular.module('app', [
  'ngRoute',
  'gridster',
  'angularjs-gauge',
  'angularUtils.directives.dirPagination',
  'chart.js',
  'ngAnimate',
  'ui.bootstrap'
]);

app.config(function ($routeProvider /* , $locationProvider */) {
  // Initialize data
  // $locationProvider.html5Mode(true)

  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl',
      auth: false
    })
    .when('/sign_up', {
      templateUrl: 'views/authentication/sign_up.html',
      controller: 'signUpCtrl',
      auth: false
    })
    .when('/sign_in', {
      templateUrl: 'views/authentication/sign_in.html',
      controller: 'signInCtrl',
      auth: false
    })
    .when('/forgot_password', {
      templateUrl: 'views/authentication/forgot_password.html',
      controller: 'signInCtrl',
      auth: false
    })
    .when('/workers', {
      templateUrl: 'views/dashboard/workers.html',
      controller: 'workerCtrl',
      auth: true
    })
    .when('/tasks', {
      templateUrl: 'views/dashboard/tasks.html',
      controller: 'tasksCtrl',
      auth: true
    })
    .when('/add', {
      templateUrl: 'views/dashboard/add.html',
      controller: 'addCtrl',
      auth: true
    })
    .when('/tasks/:task_set_id', {
      templateUrl: 'views/dashboard/details.html',
      controller: 'detailsCtrl',
      auth: true
    })
    .when('/log/:task_set_id', {
      templateUrl: 'views/dashboard/log.html',
      controller: 'logCtrl',
      auth: true
    })
    .when('/log', {
      templateUrl: 'views/dashboard/log.html',
      controller: 'logCtrl',
      auth: true
    })
    .when('/graph/:task_set_id', {
      templateUrl: 'views/dashboard/graph.html',
      controller: 'graphCtrl',
      auth: true
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.run(function ($rootScope, $location, $window, $http, gridsterConfig) {
  gridsterConfig.defaultSizeX = 2;
  gridsterConfig.defaultSizeY = 1;
  gridsterConfig.resizable.enabled = false;
  gridsterConfig.columns = 6;

  $rootScope.signedUser = null;

  $rootScope.$on('$routeChangeStart', function (event, next) {
    $http
      .get('/api/user/signed_in')
      .then(function (response) {
        $rootScope.signedUser = response.data;

        if (next.auth && !$rootScope.signedUser) {
          $location.path('/sign_in');
          return;
        }

        if (next.route) {
          $window.location.href = next.route;
        }
      });
  });
});
