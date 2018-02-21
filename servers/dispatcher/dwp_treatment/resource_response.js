/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const workerManager = rootRequire('servers/shared/worker_manager')

module.exports = function (pdu, workerAddress) {
  const update = { cpu: pdu.cpu, memory: pdu.memory }
  workerManager.update(workerAddress, update)
}
