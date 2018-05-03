app.controller("graphCtrl", function ($scope, $http, $interval, $rootScope, $routeParams) {
  $rootScope.sidebar = true

  $scope.labels = []
  $scope.data = []

  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        }
      ]
    }
  };

  const taskSetId = $routeParams.task_set_id

  $http
    .get('/api/graph/plot_info', {
      params: { taskSetId: taskSetId }
    })
    .then(response => {
      $scope.axes = response.data.axes
      $scope.curves = response.data.curves
    })

  $scope.getPlotData = (graph) => {
    var promise

    $scope.start = function () {
      $scope.stop();

      plotData(graph, taskSetId, $http, $scope)

      promise = $interval(function () {
        plotData(graph, taskSetId, $http, $scope)
      }, 1500);
    };

    $scope.stop = function () {
      $interval.cancel(promise);
    };

    $scope.start();

    $scope.$on('$destroy', function () {
      $scope.stop();
    });
  }
})

function plotData(graph, taskSetId, $http, $scope) {
  $http
    .get('/api/graph/plot_data', {
      params: {
        index: graph.curve,
        xAxis: graph.xAxis,
        yAxis: graph.yAxis,
        taskSetId: taskSetId
      }
    })
    .then(response => {
      const curves = response.data

      let labels = []
      let data = []

      for (let curve in curves) {
        let curveData = []
        for (let xAxis in curves[curve]) {
          if (labels.indexOf(xAxis) === -1) {
            // Push if doesn't exist already
            labels.push(xAxis)
          }

          // TODO: here, get here the 
          let yAxisValue = 0;

          for (let i = 0; i < curves[curve][xAxis].length; ++i) {
            yAxisValue += curves[curve][xAxis][i];
          }

          yAxisValue = yAxisValue / curves[curve][xAxis].length;

          curveData.push(yAxisValue)
        }

        data.push(curveData)
      }

      $scope.data = data
      $scope.labels = labels
    })
}
