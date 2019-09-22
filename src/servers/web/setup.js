// APIs
const userAPI = webServerRequire('api/user_api');
const taskAPI = webServerRequire('api/task_api');
const workerAPI = webServerRequire('api/worker_api');
const logAPI = webServerRequire('api/log_api');
const graphAPI = webServerRequire('api/graph_api');
const notificationAPI = webServerRequire('api/notification_api');

module.exports = (app, passport) => {
  setupAPIs(app, passport);
};

function setupAPIs(app, passport) {
  taskAPI(app);
  workerAPI(app);
  graphAPI(app);
  notificationAPI(app);
}
