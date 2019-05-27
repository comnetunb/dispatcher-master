app.controller('adminCtrl', function ($scope, $rootScope, $http, $interval, $routeParams) {
  $scope.start = function () {
  };

  $scope.stop = function () {
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});
