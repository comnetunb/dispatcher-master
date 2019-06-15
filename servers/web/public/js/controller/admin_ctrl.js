const getPendingUsers = function ($scope, $http) {
  return $http
    .get('/api/user/pending');
};

const allowUser = function (userId, $scope, $http) {
  return $http
    .post(`/api/user/allow/${userId}`);
};

app.controller('approveUserModalCtrl', function ($uibModalInstance, $scope, user) {
  const $ctrl = this;

  $scope.user = user;

  $ctrl.ok = function () {
    $uibModalInstance.dismiss('ok');
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('adminCtrl', function ($scope, $rootScope, $http, $uibModal) {
  $rootScope.sidebar = true;
  $scope.users = [];

  $scope.start = function () {
    getPendingUsers($scope, $http)
      .then((users) => {
        $scope.users = users.data;
      });
  };

  $scope.allow = function (user) {
    openConfirmation(
      $uibModal,
      {
        templateUrl: 'views/dashboard/modals/user_approval_confirm.html',
        controller: 'approveUserModalCtrl',
        resolve: { user },
        callbackOk: () => {
          allowUser(user._id, $scope, $http)
            .then(() => {
              let userIdx = -1;
              for (let i = 0; i < $scope.users.length; i += 1) {
                if ($scope.users[i]._id == user._id) {
                  userIdx = i;
                }
              }
              if (userIdx != -1) {
                $scope.users.splice(userIdx, 1);
              }
            });
        },
      },
    );
  };

  $scope.stop = function () {
  };

  $scope.start();

  $scope.$on('$destroy', function () {
    $scope.stop();
  });
});
