/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

// Dispatcher Related
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const communication = rootRequire('servers/dispatcher/communication')
const worker_discovery = rootRequire('servers/dispatcher/worker_discovery')

// Shared Related
const log = rootRequire('servers/shared/log')
const config = rootRequire('servers/shared/configuration').getConfiguration()
const interfaceManagerEvent = rootRequire('servers/shared/interface_manager').event

// Database Related
const Task = databaseRequire('models/task')
const TaskSet = databaseRequire('models/task_set')
const SimulationInstance = rootRequire('database/models/simulation_instance')
const Worker = rootRequire('database/models/worker')

// Protocol Related
const Flags = protocolRequire('dwp/common').Flags
const getReport = protocolRequire('dwp/pdu/get_report')
const performTask = protocolRequire('dwp/pdu/perform_task')
const performCommand = protocolRequire('dwp/pdu/perform_command')

module.exports = function () {
  try {
    cleanUp()
      .then(() => {
        // After cleanUp, start all services
        communication.execute()
        worker_discovery.execute()

        // Routines
        requestResourceRoutine()
        batchDispatchRoutine()
      })
  }
  catch (e) {
    log.fatal(e)
  }
}

function requestResourceRoutine() {
  requestResource()
  setInterval(function () {
    requestResource()
  }, config.requestResourceInterval * 1000)
}

function requestResource() {
  connectionManager.getAll().forEach(function (connection) {
    connectionManager.send(connection.id, getReport.format({ flags: Flags.RESOURCE }))
  })
}

function batchDispatchRoutine() {
  batchDispatch()
  setInterval(function () {
    batchDispatch()
  }, config.dispatchInterval * 1000)
}

/**
 * Retrieve number of workers that fit in cpu and memory threshold. With this
 * number (n) in hands, make a top 'n' select of pending tasks and dispatch it
 * to all those workers
 */

function batchDispatch() {
  Worker
    .getAvailables(config.cpu.threshold, config.memory.threshold)
    .then(function (availableWorkers) {
      if (!availableWorkers || !availableWorkers.length) {
        return
      }

      const taskFilter = {
        state: Task.State.PENDING
      }

      const taskPopulate = {
        path: '_taskSet',
        select: '_runnable name _files',
        populate: { path: '_runnable _files' },
        options: { sort: { '_taskSet.priority': -1 } }
      }

      Task
        .find(taskFilter)
        .populate(taskPopulate)
        .sort({ precedence: 1 })
        .limit(availableWorkers.length)
        .then(function (tasks) {
          if (!tasks) {
            // No tasks are pending
            return
          }

          tasks
            .forEach(function (task, index) {
              task.state = Task.State.SENT
              task.worker = availableWorkers[index].uuid

              return task
                .save()
                .then(function () {

                  let files = task._taskSet._files
                  files.push(task._taskSet._runnable)

                  const pdu = performTask.format({
                    task: { id: task._id },
                    commandLine: task.commandLine,
                    files: files
                  })

                  connectionManager.send(availableWorkers[index].uuid, pdu)

                  const taskSetName = task._taskSet.name

                  log.info('Dispatched task with precedence '
                    + task.precedence
                    + ' from set '
                    + log.italic(taskSetName)
                    + ' to '
                    + availableWorkers[index].address)

                  // If after X seconds it is still 'Sent', return it to its default state
                  setTimeout(function () {
                    return Task
                      .findById(task._id)
                      .then(function (taskRefreshed) {
                        if (!taskRefreshed) {
                          throw 'Task not found!'
                        }

                        if (taskRefreshed.isSent()) {
                          log.warn('Timeout from worker ' + availableWorkers[index].address + ':' + availableWorkers[index].port)
                          return Task.updateToDefaultState(taskRefreshed._id)
                        }
                      })
                  }, 10000)
                })
            })
        })
        .catch(function (err) {
          log.error(err)
        })
    })
}

function cleanUp() {
  // Clean all tasks
  const taskFilter = {
    $or: [{ state: Task.State.SENT },
    { state: Task.State.EXECUTING }]
  }

  const taskUpdate = {
    state: Task.State.PENDING,
    $unset: { worker: 1, startTime: 1 }
  }

  var promises = []

  promises
    .push(Task
      .update(taskFilter, taskUpdate, { multi: true }))

  // Remove all workers since it is the dispatcher startup
  promises.push(Worker.remove({}))

  return Promise.all(promises)
}

// TODO: use uuid instead of address
interfaceManagerEvent.on('worker_command', function (address, command) {
  const workerFilter = { address: address }

  Worker
    .findOne(workerFilter)
    .then(function (worker) {
      if (!worker) {
        throw 'Worker not found'
      }

      connectionManager.send(worker.uuid, performCommand.format({ command: command }))

      const flags = Flags.STATE | Flags.TASKS

      connectionManager.send(worker.uuid, getReport.format({ flags: flags }))
    })
    .catch(function (e) {
      log.fatal(e)
    })
})