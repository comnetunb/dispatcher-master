
app.controller('modalCtrl', function ($uibModalInstance) { // eslint-disable-line
  const $ctrl = this;

  $ctrl.ok = function () {
    $uibModalInstance.dismiss('ok');
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

function openConfirmation($uibModal, templateUrl, callbackOk, callbackCancel) { // eslint-disable-line
  const modalInstance = $uibModal.open({
    animation: false,
    ariaLabelledBy: 'modal-title',
    ariaDescribedBy: 'modal-body',
    templateUrl,
    controller: 'modalCtrl',
    controllerAs: '$ctrl',
  });

  modalInstance.result.then(function () {
  }, function (option) {
    if (option === 'ok' && typeof callbackOk === 'function') {
      callbackOk();
    } else if (option === 'cancel' && typeof callbackCancel === 'function') {
      callbackCancel();
    }
  });
}
