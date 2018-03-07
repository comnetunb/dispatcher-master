var dashboard = angular.module('dashboard', ['gridster', 'angularjs-gauge'])

dashboard.config(() => {
  // Initialize data
})

dashboard.run(['gridsterConfig', (gridsterConfig) => {
  gridsterConfig.resizable.enabled = false;
}]);

dashboard.controller('workerCtrl', ($scope) => {
  $scope.standardItems = [
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 },
    { sizeX: 2, sizeY: 1 }
  ];
})