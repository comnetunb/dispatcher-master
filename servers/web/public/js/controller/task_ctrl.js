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

const taskSetState = {
  EXECUTING: 0,
  FINISHED: 1,
  CANCELED: 2
};

// ExecutingTaskSet
app.controller('tasksCtrl', function ($scope, $location, $rootScope, $http, $interval) {
  $rootScope.sidebar = true;

  $scope.sort = function (keyname) {
    $scope.sortKey = keyname; // set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; // if true make it false and vice versa
  };

  let promise;

  $scope.start = function () {
    $scope.stop();

    getAllTaskSets($scope, $http);

    promise = $interval(function () {
      getAllTaskSets($scope, $http);
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

function getAllTaskSets($scope, $http) {
  $http
    .get('/api/tasks')
    .then(function (response) {
      $scope.executingTaskSets = response.data.filter(taskSet => taskSet.state === taskSetState.EXECUTING); // eslint-disable-line
      $scope.finishedTaskSets = response.data.filter(taskSet => taskSet.state === taskSetState.FINISHED); // eslint-disable-line
      $scope.canceledTaskSets = response.data.filter(taskSet => taskSet.state === taskSetState.CANCELED); // eslint-disable-line
      $scope.totalCount = response.data.length;
    });
}

app.controller('modalCtrl', function ($uibModalInstance, taskSetId) { // eslint-disable-line
  const $ctrl = this;
  $ctrl.taskSetId = taskSetId;

  $ctrl.ok = function () {
    $uibModalInstance.dismiss('ok');
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

function openConfirmation(taskSetId, templateUrl, apiUri, $uibModal, $http, $scope, callback) { // eslint-disable-line
  const modalInstance = $uibModal.open({
    animation: false,
    ariaLabelledBy: 'modal-title',
    ariaDescribedBy: 'modal-body',
    templateUrl,
    controller: 'modalCtrl',
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
        .post(apiUri, { id: taskSetId })
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

function getTaskSetAndTasks($scope, $http) {
  $http
    .get(`/api/task/${$scope.taskSetId}?includeTasks=true`)
    .then(function (response) {
      $scope.taskSet = response.data;
      $scope.taskSet.tasks.sort((a, b) => {
        // orders by state and then by precedence
        if (a.errorCount !== b.errorCount) {
          return a.errorCount - b.errorCount;
        }
        if (a.state !== b.state) {
          return b.state - a.state;
        }
        return b.precedence - a.precedence;
      });
    });
}

app.controller('detailsCtrl', function ($scope, $location, $uibModal, $interval, $rootScope, $http, $routeParams) {
  let promise;

  $rootScope.sidebar = true;
  $scope.taskSetId = $routeParams.task_set_id;
  $scope.logs = [];
  $scope.lastDate = Date.now();

  $scope.start = () => {
    getTaskSetAndTasks($scope, $http);
    getAllLogs($scope, $http);
  };

  $scope.openCancel = function (taskSetId) {
    openConfirmation(
      taskSetId,
      'views/dashboard/modals/task_set_cancel.html',
      '/api/task/cancel_task_set',
      $uibModal,
      $http,
      $scope,
      () => $location.path('tasks')
    );
  };

  $scope.openRemove = function (taskSetId) {
    openConfirmation(
      taskSetId,
      'views/dashboard/modals/task_set_removal.html',
      '/api/task/remove_task_set',
      $uibModal,
      $http,
      $scope,
      () => $location.path('tasks')
    );
  };

  $scope.openGraphs = function (taskSetId) {
    $location.path(`graph/${taskSetId}`);
  };

  $scope.stop = () => {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });

  promise = $interval(function () {
    getTaskSetAndTasks($scope, $http);
    getAllLogsFromDate($scope, $http);
  }, 1500);

  $scope.formatTaskSetState = (state) => {
    if (state === taskSetState.EXECUTING) {
      return 'Executing';
    } else if (state === taskSetState.FINISHED) {
      return 'Finished';
    } else if (state === taskSetState.CANCELED) {
      return 'Canceled';
    }
    return 'Undefined';
  };

  $scope.formatTaskState = (state) => {
    if (state === 0) {
      return 'Pending';
    } else if (state === 1) {
      return 'Executing';
    } else if (state === 2) {
      return 'Finished';
    } else if (state === 3) {
      return 'Canceled';
    } else if (state === 4) {
      return 'Sent';
    }
    return 'Undefined';
  };

  $scope.formatPriority = (priority) => {
    if (priority === 0) {
      return 'Minimum';
    } else if (priority === 1) {
      return 'Low';
    } else if (priority === 2) {
      return 'Normal';
    } else if (priority === 3) {
      return 'High';
    }
    return 'Urgent';
  };

  $scope.getDurationString = (task) => {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);

    if (task.state !== 2) {
      return 'Unfinished';
    }
    if (!task.startTime || !task.endTime) {
      return 'Unavailable';
    }

    let diff = end - start;
    let hourS = '';
    let minuteS = '';
    let secondS = '';

    if (diff >= (1000 * 60 * 60)) {
      hourS = `${Math.floor(diff / (1000 * 60 * 60))}h `;
      diff %= (1000 * 60 * 60);
    }
    if (diff >= (1000 * 60)) {
      minuteS = `${Math.floor(diff / (1000 * 60))}h `;
      diff %= (1000 * 60);
    }
    secondS = `${Math.floor(diff / 1000)}s`;

    return `${hourS}${minuteS}${secondS}`;
  };
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
        $location.path('/tasks');
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
