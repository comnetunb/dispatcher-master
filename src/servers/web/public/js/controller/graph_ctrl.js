app.controller('graphCtrl', function ($scope, $http, $interval, $rootScope, $routeParams /* , $location */) {
  $rootScope.sidebar = true;
  $scope.graphs = [];
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
  $scope.options = {
    scales: {
      yAxes: [{
        id: 'y-axis-1',
        type: 'linear',
        display: true,
        position: 'left'
      }]
    },
    elements: {
      line: {
        tension: 0,
        fill: false,
      }
    }
  };

  const taskSetId = $routeParams.task_set_id;

  $http
    .get(`/api/graphs/${taskSetId}/info`)
    .then(function (response) {
      $scope.axes = response.data.axes;
      $scope.curves = response.data.curves;
      $scope.graphs = response.data.graphs;
      $scope.argumentTemplate = response.data.argumentTemplate;
      $scope.start();
    });

  let promise;

  $scope.start = function () {
    $scope.stop();

    plotData(taskSetId, $http, $scope);

    promise = $interval(function () {
      plotData(taskSetId, $http, $scope);
    }, 1500);
  };

  $scope.stop = function () {
    $interval.cancel(promise);
  };

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});

function plotData(taskSetId, $http, $scope) {
  $http
    .post(`/api/graphs/${taskSetId}/data`, {
      body: $scope.graphs.map(g => ({ curve: g.curve, xAxis: g.xAxis, yAxis: g.yAxis })),
    })
    .then(function (response) {
      const graphsCurves = response.data;

      for (let i = 0; i < graphsCurves.length; i += 1) {
        if (graphsCurves[i]) {
          $scope.graphs[i].curves = graphsCurves[i];
          $scope.graphs[i].labels = [];
          $scope.graphs[i].data = [];

          for (let curve in $scope.graphs[i].curves) { // eslint-disable-line
            const curveData = [];
            for (let xAxis in $scope.graphs[i].curves[curve]) { // eslint-disable-line
              if ($scope.graphs[i].labels.indexOf(xAxis) === -1) {
                // Push if doesn't exist already
                $scope.graphs[i].labels.push(xAxis);
              }

              // TODO: here, get here the
              let yAxisValue = 0;

              for (let j = 0; j < $scope.graphs[i].curves[curve][xAxis].length; j += 1) {
                yAxisValue += $scope.graphs[i].curves[curve][xAxis][j];
              }

              yAxisValue /= $scope.graphs[i].curves[curve][xAxis].length;

              curveData.push(yAxisValue);
            }

            $scope.graphs[i].data.push(curveData);
          }
        }
      }
    });
}
