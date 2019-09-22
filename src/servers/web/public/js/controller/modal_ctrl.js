
app.controller('modalCtrl', function ($uibModalInstance) { // eslint-disable-line
  const $ctrl = this;

  $ctrl.ok = function () {
    $uibModalInstance.dismiss('ok');
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

function openConfirmation($uibModal, options = {}) { // eslint-disable-line
  const modalInstance = $uibModal.open({
    animation: false,
    ariaLabelledBy: 'modal-title',
    ariaDescribedBy: 'modal-body',
    templateUrl: options.templateUrl,
    controller: options.controller ? options.controller : 'modalCtrl',
    resolve: options.resolve,
    controllerAs: '$ctrl',
  });

  modalInstance.result.then(function () {
  }, function (button) {
    if (button === 'ok'
      && options
      && options.callbackOk
      && typeof options.callbackOk === 'function') {
      options.callbackOk();
    } else if (button === 'cancel'
      && options
      && options.callbackOk
      && typeof options.callbackCancel === 'function') {
      options.callbackCancel();
    }
  });
}
