// APIs
const userAPI = webServerRequire('api/user_api');
const taskAPI = webServerRequire('api/task_api');
const workerAPI = webServerRequire('api/worker_api');
const logAPI = webServerRequire('api/log_api');
const graphAPI = webServerRequire('api/graph_api');

module.exports = (app, passport) => {
  setupAPIs(app, passport);
};

function setupAPIs(app, passport) {
  userAPI(app, passport);
  taskAPI(app);
  workerAPI(app);
  logAPI(app, passport);
  graphAPI(app);
}
