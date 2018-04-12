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
    $scope.sortKey = keyname; //set the sortKey to the param passed
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
    $scope.sortKey = keyname; //set the sortKey to the param passed
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

app.controller('addCtrl', function ($scope, $rootScope, $compile, $http, $location) {
  $rootScope.sidebar = true

  $scope.clear = function () {
    var inputs = document.getElementById("inputContainer");

    while (inputs.firstChild) {
      inputs.removeChild(inputs.firstChild);
    }

    $scope.addTaskForm.inputs = []
  }

  $scope.submit = function (addTaskForm) {
    $http
      .post('/add_task_group_set', addTaskForm)
      .then(function (response) {
        $scope.errorMessage = false
        //$location.path('/active')
      })
      .catch(function (e) {
        console.log(e)
        $scope.errorMessage = e.data.reason
      })
  }

  $scope.addTaskForm = {
    taskRunnable: [],
    argumentsTemplate: '',
    inputs: []
  }

  $scope.parse = function (argumentsTemplate) {
    $scope.clear()

    const matches = argumentsTemplate.match(/(%n|%s|%f)/g)

    const table = document.createElement("table");
    table.className = "table table-bordered"

    {
      let tableRow = document.createElement("tr");

      {
        let tableHeader = document.createElement("th");
        tableHeader.innerHTML = "Precedence";
        tableHeader.width = "10%"
        tableRow.appendChild(tableHeader);
      }

      {
        let tableHeader = document.createElement("th");
        tableHeader.innerHTML = "Input";
        tableRow.appendChild(tableHeader);
      }

      table.appendChild(tableRow)
    }

    for (let match in matches) {
      let tableRow = document.createElement("tr");

      // Precedence
      {
        let tableCell = document.createElement("td");

        let defaultValue = Number(match) + 1

        const precedence = $compile('<input class="form-control form-control-success" ng-model="addTaskForm.inputs[' + match + '].precedence" type="number" min="1" ng-init="addTaskForm.inputs[' + match + '].precedence = ' + defaultValue + '; addTaskForm.inputs[' + match + '].directiveIndex = ' + match + '" ng-required="true"></input>')($scope)
        //const precedence = $compile('<precedence model="addTaskForm.inputs[' + match + '].precedence" init="addTaskForm.inputs[' + match + '].precedence = ' + defaultValue + '; addTaskForm.inputs[' + match + '].directiveIndex = ' + match + '"></precedence>')($scope)
        angular.element(tableCell).append(precedence)

        tableRow.appendChild(tableCell);
      }

      let tableCell = document.createElement("td");
      let input;

      switch (matches[match]) {
        case "%n":
          $scope.addTaskForm.inputs[match].type = "N"
          input = $compile('<interpretive-number model="addTaskForm.inputs[' + match + '].data"></interpretive-number>')($scope)
          angular.element(tableCell).append(input)
          break;

        case "%s":
          $scope.addTaskForm.inputs[match].type = "S"
          input = $compile('<interpretive-string model="addTaskForm.inputs[' + match + '].data"></interpretive-string>')($scope)
          angular.element(tableCell).append(input)
          break;

        case "%f":
          $scope.addTaskForm.inputs[match].type = "F"
          input = $compile('<interpretive-file model="addTaskForm.inputs[' + match + '].data"></interpretive-file>')($scope)
          angular.element(tableCell).append(input)
          break;
      }

      tableRow.appendChild(tableCell);
      table.appendChild(tableRow);
    }

    if (matches) {
      document.getElementById('inputContainer').append(table);
    }

    const submit = $compile('<input class="btn btn-primary btn-block" ng-click="submit(addTaskForm)" ng-disabled="addTaskGroupForm.$invalid" value="Submit">')($scope)
    angular.element(document.getElementById('inputContainer')).append(submit)
  }

  $scope.addInterpretiveDirective = function (directive) {
    $scope.clear()

    if (!$scope.addTaskForm.argumentsTemplate) {
      $scope.addTaskForm.argumentsTemplate = ''
    }

    const position = argumentsTemplate.selectionStart

    $scope.addTaskForm.argumentsTemplate = [$scope.addTaskForm.argumentsTemplate.slice(0, position), directive, $scope.addTaskForm.argumentsTemplate.slice(position)].join('')
  }

})
  .directive("fileread", function () {
    return {
      scope: {
        fileread: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          let files = Array.from(changeEvent.target.files);

          if (!files.length) {
            scope.fileread = [];
            return;
          }

          scope.fileread = [];

          files.map(function (file) {
            let reader = new FileReader();

            reader.onload = function (loadEvent) {
              scope.$apply(function () {
                let input = {
                  name: file.name,
                  data: loadEvent.target.result
                }

                console.log(input)

                scope.fileread.push(input)
              });
            }

            reader.readAsDataURL(file);
          })
        });
      }
    }
  })
  .directive('precedence', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/precedence.html',
      scope: {
        model: '=',
        init: '='
      },
      replace: true
    }
  })
  .directive('interpretiveNumber', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_number.html',
      scope: {
        model: '='
      },
      replace: true
    }
  })
  .directive('interpretiveString', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_string.html',
      scope: {
        model: '='
      },
      replace: true
    }
  })
  .directive('interpretiveFile', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_file.html',
      scope: {
        model: '='
      },
      replace: true
    }
  })