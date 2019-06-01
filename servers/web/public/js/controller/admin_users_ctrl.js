app.controller('adminUsersCtrl', function ($scope, $rootScope, $http, $interval, $routeParams) {
  $rootScope.sidebar = true;
  $scope.start = function () {
  };

  $scope.stop = function () {
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});
