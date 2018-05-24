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

app.controller('groupCtrl', ($scope, $http, $interval /* , $rootScope */) => {
  $scope.activeCount = 0;
  $scope.finishedCount = 0;
  $scope.canceledCount = 0;

  let promise;

  $scope.start = () => {
    $scope.stop();

    getCount($scope, $http);

    promise = $interval(() => {
      getCount($scope, $http);
    }, 1500);
  };

  $scope.stop = () => {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', () => {
    $scope.stop();
  });
});

function getCount(/* $scope, $http */) {
  // $http
  //   .get('/api/task/count_active')
  //   .then((response) => {
  //     $scope.activeCount = response.data.count;
  //     console.log(response);
  //   })

  // $http
  //   .get('/api/task/count_finished')
  //   .then((response) => {
  //     $scope.finishedCount = response.data.count;
  //     console.log(response);
  //   })

  // $http
  //   .get('/api/task/count_canceled')
  //   .then((response) => {
  //     $scope.canceledCount = response.data.count;
  //     console.log(response);
  //   });
}

// ExecutingTaskSet
app.controller('executingTaskSetCtrl', ($scope, $rootScope, $http, $interval, $uibModal) => {
  $rootScope.sidebar = true;

  $scope.sort = (keyname) => {
    $scope.sortKey = keyname; // set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; // if true make it false and vice versa
  };

  $scope.openConfirmation = (taskSetId) => {
    openConfirmation($uibModal, taskSetId, $http, $scope, getAllExecutingTaskSets);
  };

  let promise;

  $scope.start = () => {
    $scope.stop();

    getAllExecutingTaskSets($scope, $http);

    promise = $interval(() => {
      getAllExecutingTaskSets($scope, $http);
    }, 1500);
  };

  $scope.stop = () => {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', () => {
    $scope.stop();
  });
});

function getAllExecutingTaskSets($scope, $http) {
  $http
    .get('/api/task/get_executing')
    .then((response) => {
      $scope.executingTaskSets = response.data;
    });
}

// FinishedTaskSet
app.controller('finishedTaskSetCtrl', ($scope, $rootScope, $http, $interval, $uibModal) => {
  $rootScope.sidebar = true;

  $scope.sort = (keyname) => {
    $scope.sortKey = keyname; // set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; // if true make it false and vice versa
  };

  $scope.openConfirmation = (taskSetId) => {
    openConfirmation($uibModal, taskSetId, $http, $scope, getAllFinishedTaskSets);
  };

  let promise;

  $scope.start = () => {
    $scope.stop();

    getAllFinishedTaskSets($scope, $http);

    promise = $interval(() => {
      getAllFinishedTaskSets($scope, $http);
    }, 1500);
  };

  $scope.stop = () => {
    $interval.cancel(promise);
  };

  $scope.start();

  $scope.$on('$destroy', () => {
    $scope.stop();
  });
});

function getAllFinishedTaskSets($scope, $http) {
  $http
    .get('/api/task/get_finished')
    .then((response) => {
      $scope.finishedTaskSets = response.data;
    });
}

app.controller('removalModalCtrl', ($uibModalInstance, taskSetId) => {
  const $ctrl = this;
  $ctrl.taskSetId = taskSetId;

  $ctrl.ok = () => {
    $uibModalInstance.dismiss('ok');
  };

  $ctrl.cancel = () => {
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
      taskSetId: () => {
        return taskSetId;
      }
    }
  });

  modalInstance.result.then(() => {
  }, (option) => {
    console.log(option + taskSetId); // eslint-disable-line no-console
    if (option === 'ok') {
      $http
        .post('/api/task/remove_task_set', { id: taskSetId })
        .then(() => {
          $scope.errorMessage = false;
          callback($scope, $http);
        })
        .catch((e) => {
          $scope.errorMessage = e.data.reason;
        });
    }
  });
}

// Add
app.controller('addCtrl', ($scope, $rootScope, $compile, $http, $location) => {
  $rootScope.sidebar = true;

  $http
    .get('/api/task/supported_runnables')
    .then((response) => {
      $scope.supportedRunnablesInfo = response.data;
    });

  $scope.clear = () => {
    const inputs = document.getElementById('inputContainer');

    while (inputs.firstChild) {
      inputs.removeChild(inputs.firstChild);
    }

    $scope.addTaskForm.inputs = [];
  };

  $scope.submit = (addTaskForm) => {
    if (!addTaskForm.runnableInfo.runnable.length) {
      $scope.errorMessage = 'Runnable is undefined';
      return;
    }

    $http
      .post('/api/task/add_task_group_set', addTaskForm)
      .then(() => {
        $scope.errorMessage = false;
        $location.path('/executing');
      })
      .catch((e) => {
        $scope.errorMessage = e.data.reason;
      });
  };

  $scope.addTaskForm = {
    runnableInfo: {},
    argumentsTemplate: '',
    inputs: []
  };

  $scope.parse = (argumentsTemplate) => {
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

  $scope.addInterpretiveDirective = (directive) => {
    $scope.clear();

    if (!$scope.addTaskForm.argumentsTemplate) {
      $scope.addTaskForm.argumentsTemplate = '';
    }

    const position = argumentsTemplate.selectionStart;

    $scope.addTaskForm.argumentsTemplate = [$scope.addTaskForm.argumentsTemplate.slice(0, position), directive, $scope.addTaskForm.argumentsTemplate.slice(position)].join('');
  };
})
  .directive('fileread', () => {
    return {
      scope: {
        fileread: '='
      },
      link: (scope, element) => {
        element.bind('change', (changeEvent) => {
          const files = Array.from(changeEvent.target.files);

          if (!files.length) {
            scope.fileread = [];
            return;
          }

          scope.fileread = [];

          files.map((file) => {
            const reader = new FileReader();

            reader.onload = (loadEvent) => {
              scope.$apply(() => {
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
  .directive('precedence', () => {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/precedence.html',
      scope: {
        model: '='
      },
      replace: true
    };
  })
  .directive('interpretiveNumber', () => {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_number.html',
      scope: {
        model: '='
      },
      replace: true
    };
  })
  .directive('interpretiveString', () => {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_string.html',
      scope: {
        model: '='
      },
      replace: true
    };
  })
  .directive('interpretiveFile', () => {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/directives/interpretive_file.html',
      scope: {
        model: '='
      },
      replace: true
    };
  });
