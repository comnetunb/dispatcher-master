// !
// ! Version: MIT
// !
// ! Portions created by Matheus Medeiros are Copyright (c) 2017-2018
// ! Matheus Medeiros. All Rights Reserved.
// !
// ! Permission is hereby granted, free of charge, to any person obtaining a
// ! copy of this software and associated documentation files(the "Software"),
// ! to deal in the Software without restriction, including without limitation
// ! the rights to use, copy, modify, merge, publish, distribute, sublicense,
// ! and / or sell copies of the Software, and to permit persons to whom the
// ! Software is furnished to do so, subject to the following conditions:
// !
// ! The above copyright notice and this permission notice shall be included in
// ! all copies or substantial portions of the Software.
// !
// ! THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// ! IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// ! FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// ! AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// ! LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// ! FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// ! DEALINGS IN THE SOFTWARE.
// !

app.controller('groupCtrl', function ($scope, $http, $interval /* , $rootScope */) {
  $scope.activeCount = 0;
  $scope.finishedCount = 0;
  $scope.canceledCount = 0;

  let promise;

  $scope.start = function () {
    $scope.stop();

    getCount($scope, $http);

    promise = $interval(function () {
      getCount($scope, $http);
    }, 1500);
  };

  $scope.stop = function () {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});

function getCount(/* $scope, $http */) {
  // $http
  //   .get('/api/task/count_active')
  //   .then(function (response) {
  //     $scope.activeCount = response.data.count;
  //     console.log(response);
  //   })

  // $http
  //   .get('/api/task/count_finished')
  //   .then(function (response) {
  //     $scope.finishedCount = response.data.count;
  //     console.log(response);
  //   })

  // $http
  //   .get('/api/task/count_canceled')
  //   .then(function (response) {
  //     $scope.canceledCount = response.data.count;
  //     console.log(response);
  //   });
}

// ExecutingTaskSet
app.controller('executingTaskSetCtrl', function ($scope, $location, $rootScope, $http, $interval, $uibModal) {
  $rootScope.sidebar = true;

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname; // set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; // if true make it false and vice versa
  };

  $scope.openConfirmation = function (taskSetId) {
    openConfirmation($uibModal, taskSetId, $http, $scope, getAllExecutingTaskSets);
  };

  $scope.openLogs = function (taskSetId) {
    $location.path(`log/${taskSetId}`);
  };


  let promise;

  $scope.start = function () {
    $scope.stop();

    getAllExecutingTaskSets($scope, $http);

    promise = $interval(function () {
      getAllExecutingTaskSets($scope, $http);
    }, 1500);
  };

  $scope.stop = function () {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});

function getAllExecutingTaskSets($scope, $http) {
  $http
    .get('/api/task/get_executing')
    .then(function (response) {
      $scope.executingTaskSets = response.data;
    });
}

// FinishedTaskSet
app.controller('finishedTaskSetCtrl', function ($scope, $location, $rootScope, $http, $interval, $uibModal) {
  $rootScope.sidebar = true;

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname; // set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; // if true make it false and vice versa
  };

  $scope.openConfirmation = function (taskSetId) {
    openConfirmation($uibModal, taskSetId, $http, $scope, getAllFinishedTaskSets);
  };

  $scope.openLogs = function (taskSetId) {
    $location.path(`log/${taskSetId}`);
  };

  let promise;

  $scope.start = function () {
    $scope.stop();

    getAllFinishedTaskSets($scope, $http);

    promise = $interval(function () {
      getAllFinishedTaskSets($scope, $http);
    }, 1500);
  };

  $scope.stop = function () {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});

function getAllFinishedTaskSets($scope, $http) {
  $http
    .get('/api/task/get_finished')
    .then(function (response) {
      $scope.finishedTaskSets = response.data;
    });
}

app.controller('removalModalCtrl', function ($uibModalInstance, taskSetId) { // eslint-disable-line
  const $ctrl = this;
  $ctrl.taskSetId = taskSetId;

  $ctrl.ok = function () {
    $uibModalInstance.dismiss('ok');
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

function openConfirmation($uibModal, taskSetId, $http, $scope, callback) {
  const modalInstance = $uibModal.open({
    animation: false,
    ariaLabelledBy: 'modal-title',
    ariaDescribedBy: 'modal-body',
    templateUrl: 'views/dashboard/modals/task_set_removal.html',
    controller: 'removalModalCtrl',
    controllerAs: '$ctrl',
    resolve: {
      taskSetId: function () { // eslint-disable-line
        return taskSetId;
      }
    }
  });

  modalInstance.result.then(function () {
  }, function (option) {
    console.log(option + taskSetId); // eslint-disable-line no-console
    if (option === 'ok') {
      $http
        .post('/api/task/remove_task_set', { id: taskSetId })
        .then(function () {
          $scope.errorMessage = false;
          callback($scope, $http);
        })
        .catch(function (e) {
          $scope.errorMessage = e.data.reason;
        });
    }
  });
}

app.controller('detailsCtrl', function ($scope, $http, $routeParams) {
  $scope.taskSetId = $routeParams.task_set_id;
  getTaskSet($scope, $http);
  $http
    .get(`/api/task/${$scope.taskSetId}?includeTasks=true`)
    .then(function (response) {
      $scope.taskSet = response.data;
      console.log($scope.taskSet);
    });
  
});

// Add
app.controller('addCtrl', function ($scope, $rootScope, $compile, $http, $location) {
  $rootScope.sidebar = true;

  $http
    .get('/api/task/supported_runnables')
    .then(function (response) {
      $scope.supportedRunnablesInfo = response.data;
    });

  $scope.clear = function () {
    const inputs = document.getElementById('inputContainer');

    while (inputs.firstChild) {
      inputs.removeChild(inputs.firstChild);
    }

    $scope.addTaskForm.inputs = [];
  };

  $scope.submit = function (addTaskForm) {
    if (!addTaskForm.runnableInfo.runnable.length) {
      $scope.errorMessage = 'Runnable is undefined';
      return;
    }

    $http
      .post('/api/task/add_task_group_set', addTaskForm)
      .then(function () {
        $scope.errorMessage = false;
        $location.path('/executing');
      })
      .catch(function (e) {
        $scope.errorMessage = e.data.reason;
      });
  };

  $scope.addTaskForm = {
    runnableInfo: {},
    argumentsTemplate: '',
    inputs: []
  };

  $scope.parse = function (argumentsTemplate) {
    $scope.clear();

    const matches = argumentsTemplate.match(/(%n|%s|%f)/g);

    const table = document.createElement('table');
    table.className = 'table table-bordered';

    {
      const tableRow = document.createElement('tr');

      angular
        .element(tableRow)
        .append($compile('<th width="10%">Precedence</th>')($scope))
        .append($compile('<th>Input</th>')($scope));

      table.appendChild(tableRow);
    }

    for (let match in matches) { // eslint-disable-line
      const tableRow = document.createElement('tr');

      $scope.addTaskForm.inputs.push({
        precedence: Number(match) + 1,
        directiveIndex: match
      });

      // Precedence
      {
        const tableCell = document.createElement('td');

        angular
          .element(tableCell)
          .append($compile(`<precedence model="addTaskForm.inputs[${match}].precedence"></precedence>`)($scope));

        tableRow.appendChild(tableCell);
      }

      const tableCell = document.createElement('td');

      switch (matches[match]) {
        case '%n':
          $scope.addTaskForm.inputs[match].type = 'N';
          angular
            .element(tableCell)
            .append($compile(`<interpretive-number model="addTaskForm.inputs[${match}].data"></interpretive-number>`)($scope));
          break;

        case '%s':
          $scope.addTaskForm.inputs[match].type = 'S';
          angular
            .element(tableCell)
            .append($compile(`<interpretive-string model="addTaskForm.inputs[${match}].data"></interpretive-string>`)($scope));
          break;

        case '%f':
          $scope.addTaskForm.inputs[match].type = 'F';
          angular
            .element(tableCell)
            .append($compile(`<interpretive-file model="addTaskForm.inputs[${match}].data"></interpretive-file>`)($scope));
          break;

        default:
      }

      tableRow.appendChild(tableCell);
      table.appendChild(tableRow);
    }

    if (matches) {
      document.getElementById('inputContainer').append(table);
    }

    angular
      .element(document.getElementById('inputContainer'))
      .append($compile('<input class="btn btn-primary btn-block" ng-click="submit(addTaskForm)" ng-disabled="addTaskSetForm.$invalid" value="Submit">')($scope));
  };

  $scope.addInterpretiveDirective = function (directive) {
    $scope.clear();

    if (!$scope.addTaskForm.argumentsTemplate) {
      $scope.addTaskForm.argumentsTemplate = '';
    }

    const position = argumentsTemplate.selectionStart;

    $scope.addTaskForm.argumentsTemplate = [$scope.addTaskForm.argumentsTemplate.slice(0, position), directive, $scope.addTaskForm.argumentsTemplate.slice(position)].join('');
  };
})
  .directive('fileread', function () {
    return {
      scope: {
        fileread: '='
      },
      link: function (scope, element) { // eslint-disable-line
        element.bind('change', function (changeEvent) {
          const files = Array.from(changeEvent.target.files);

          if (!files.length) {
            scope.fileread = [];
            return;
          }

          scope.fileread = [];

          files.map((file) => {
            const reader = new FileReader();

            reader.onload = function (loadEvent) {
              scope.$apply(function () {
                const input = {
                  name: file.name,
                  data: loadEvent.target.result
                };

                scope.fileread.push(input);
              });
            };

            reader.readAsDataURL(file);
            return undefined;
          });
        });
      }
    };
  })
  .directive('precedence', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/precedence.html',
      scope: {
        model: '='
      },
      replace: true
    };
  })
  .directive('interpretiveNumber', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_number.html',
      scope: {
        model: '='
      },
      replace: true
    };
  })
  .directive('interpretiveString', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_string.html',
      scope: {
        model: '='
      },
      replace: true
    };
  })
  .directive('interpretiveFile', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_file.html',
      scope: {
        model: '='
      },
      replace: true
    };
  });
