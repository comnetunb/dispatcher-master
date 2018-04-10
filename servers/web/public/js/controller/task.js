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
    $scope.sortKey = keyname;   //set the sortKey to the param passed
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
    $scope.sortKey = keyname;   //set the sortKey to the param passed
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

app.controller('addCtrl', function ($scope, $rootScope, $compile) {
  $rootScope.sidebar = true

  $scope.clear = function () {
    var inputs = document.getElementById("inputContainer");

    while (inputs.firstChild) {
      inputs.removeChild(inputs.firstChild);
    }
  }

  $scope.addTaskForm = {
    commandLine: ''
  }

  $scope.parse = function (commandLine) {
    $scope.clear()

    if (!commandLine) {
      commandLine = ''
    }

    const matches = commandLine.match(/(%tf|%ef|%n|%s)/g)

    if (!matches) {
      return
    }

    const table = document.createElement("table");
    table.className = "table table-sm"

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
        tableHeader.innerHTML = "Value";
        tableRow.appendChild(tableHeader);
      }

      table.appendChild(tableRow)
    }

    for (var match in matches) {
      let tableRow = document.createElement("tr");

      // Precedence
      {
        let tableCell = document.createElement("td");
        let precedence = document.createElement("input");

        precedence.className = "form-control form-control-success"
        precedence.type = "number";
        precedence.min = 1;
        precedence.value = 1;

        tableCell.appendChild(precedence)
        tableRow.appendChild(tableCell);
      }


      if (matches[match] === '%tf') {
        const input = $compile('<textfile id="' + match + '" ng-required="true"></textfile>')($scope)
        angular.element(document.getElementById('inputContainer')).append(input)
      }

      if (matches[match] === '%ef') {
        let tableCell = document.createElement("td");

        const input = $compile('<executablefile id="' + match + '" ng-required="true"></executablefile>')($scope)
        angular.element(tableCell).append(input)

        tableRow.appendChild(tableCell);
      }

      if (matches[match] === '%n') {
        let tableCell = document.createElement("td");

        const input = $compile('<numberform id="' + match + '"></numberform>')($scope)
        angular.element(tableCell).append(input)

        tableRow.appendChild(tableCell);
      }

      if (matches[match] === '%s') {
        const input = $compile('<stringform id="' + match + '" ng-required="true"></stringform>')($scope)
        angular.element(document.getElementById('inputContainer')).append(input)
      }

      table.appendChild(tableRow);
    }

    document.getElementById('inputContainer').append(table);

    const submit = $compile('<submit></submit>')($scope)
    angular.element(document.getElementById('inputContainer')).append(submit)
  }

  $scope.addDirective = function (directive) {
    $scope.clear()

    if (!$scope.addTaskForm.commandLine) {
      $scope.addTaskForm.commandLine = ''
    }

    const position = commandLine.selectionStart

    $scope.addTaskForm.commandLine = [$scope.addTaskForm.commandLine.slice(0, position), directive, $scope.addTaskForm.commandLine.slice(position)].join('')
  }

})
  .directive('numberform', function () {
    return {
      restrict: 'E',
      scope: { 'id': '@' },
      templateUrl: 'views/dashboard/forms/number_form.html'
    }
  })
  .directive('executablefile', function () {
    return {
      restrict: 'E',
      scope: { 'id': '@' },
      templateUrl: 'views/dashboard/forms/executable_file_form.html'
    }
  })
  .directive('textfile', function () {
    return {
      restrict: 'E',
      scope: { 'id': '@' },
      templateUrl: 'views/dashboard/forms/text_file_form.html'
    }
  })
  .directive('submit', function () {
    return {
      restrict: 'E',
      scope: { 'id': '@' },
      templateUrl: 'views/dashboard/forms/submit.html'
    }
  })