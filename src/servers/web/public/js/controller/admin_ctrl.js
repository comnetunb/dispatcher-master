const getPendingUsers = function ($scope, $http) {
  return $http
    .get('/api/user/pending');
};

const getAllowedUsers = function ($scope, $http) {
  return $http
    .get('/api/user/allowed');
};

const getDisallowedUsers = function ($scope, $http) {
  return $http
    .get('/api/user/disallowed');
};

const allowUser = function (userId, $scope, $http) {
  return $http
    .post(`/api/user/manage/${userId}`);
};

const disallowUser = function (userId, $scope, $http) {
  return $http
    .post(`/api/user/manage/${userId}?disallow=true`);
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
    getAllowedUsers($scope, $http)
      .then((users) => {
        $scope.allowedUsers = users.data;
      });
    getDisallowedUsers($scope, $http)
      .then((users) => {
        $scope.disallowedUsers = users.data;
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
            .then(() => $scope.start());
        },
      },
    );
  };

  $scope.disallow = function (user) {
    openConfirmation(
      $uibModal,
      {
        templateUrl: 'views/dashboard/modals/user_rejection_confirm.html',
        controller: 'approveUserModalCtrl',
        resolve: { user },
        callbackOk: () => {
          disallowUser(user._id, $scope, $http)
            .then(() => $scope.start());
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
