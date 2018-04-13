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

// ActiveTaskGroup
app.controller('activeTaskGroupCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse //if true make it false and vice versa
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

// FinishedTaskGroup
app.controller('finishedTaskGroupCtrl', function ($scope, $rootScope, $http, $interval) {
  $rootScope.sidebar = true

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse //if true make it false and vice versa
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

// Add
app.controller('addCtrl', function ($scope, $rootScope, $compile, $http, $location) {
  $rootScope.sidebar = true

  $http
    .get('/supported_executables')
    .then(function (response) {
      $scope.supportedExecutablesInfo = response.data
    })

  $scope.clear = function () {
    var inputs = document.getElementById('inputContainer')

    while (inputs.firstChild) {
      inputs.removeChild(inputs.firstChild)
    }

    $scope.addTaskForm.inputs = []
  }

  $scope.submit = function (addTaskForm) {
    if (!addTaskForm.taskRunnable.length) {
      $scope.errorMessage = 'Task runnable is undefined'
      return
    }

    if (!addTaskForm.executableInfo) {
      $scope.errorMessage = 'Executable is undefined'
      return
    }

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

    const table = document.createElement('table')
    table.className = 'table table-bordered'

    {
      let tableRow = document.createElement("tr")

      angular
        .element(tableRow)
        .append($compile('<th width="10%">Precedence</th>')($scope))
        .append($compile('<th>Input</th>')($scope))

      table.appendChild(tableRow)
    }

    for (let match in matches) {
      let tableRow = document.createElement("tr")

      // Precedence
      {
        let tableCell = document.createElement("td")

        let defaultValue = Number(match) + 1

        $scope.addTaskForm.inputs.push({
          precedence: Number(match) + 1,
          directiveIndex: match
        })

        angular
          .element(tableCell)
          .append($compile('<precedence model="addTaskForm.inputs[' + match + '].precedence"></precedence>')($scope))

        tableRow.appendChild(tableCell)
      }

      let tableCell = document.createElement("td")

      switch (matches[match]) {
        case '%n':
          $scope.addTaskForm.inputs[match].type = 'N'
          angular
            .element(tableCell)
            .append($compile('<interpretive-number model="addTaskForm.inputs[' + match + '].data"></interpretive-number>')($scope))
          break

        case '%s':
          $scope.addTaskForm.inputs[match].type = 'S'
          angular
            .element(tableCell)
            .append($compile('<interpretive-string model="addTaskForm.inputs[' + match + '].data"></interpretive-string>')($scope))
          break

        case '%f':
          $scope.addTaskForm.inputs[match].type = 'F'
          angular
            .element(tableCell)
            .append($compile('<interpretive-file model="addTaskForm.inputs[' + match + '].data"></interpretive-file>')($scope))
          break
      }

      tableRow.appendChild(tableCell)
      table.appendChild(tableRow)
    }

    if (matches) {
      document.getElementById('inputContainer').append(table)
    }

    angular
      .element(document.getElementById('inputContainer'))
      .append($compile('<input class="btn btn-primary btn-block" ng-click="submit(addTaskForm)" ng-disabled="addTaskGroupForm.$invalid" value="Submit">')($scope))
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
  .directive('fileread', function () {
    return {
      scope: {
        fileread: '='
      },
      link: function (scope, element, attributes) {
        element.bind('change', function (changeEvent) {
          let files = Array.from(changeEvent.target.files)

          if (!files.length) {
            scope.fileread = []
            return
          }

          scope.fileread = []

          files.map(function (file) {
            let reader = new FileReader()

            reader.onload = function (loadEvent) {
              scope.$apply(function () {
                let input = {
                  name: file.name,
                  data: loadEvent.target.result
                }

                scope.fileread.push(input)
              })
            }

            reader.readAsDataURL(file)
          })
        })
      }
    }
  })
  .directive('precedence', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/precedence.html',
      scope: {
        model: '='
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