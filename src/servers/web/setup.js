const workerAPI = webServerRequire('api/worker_api');
const graphAPI = webServerRequire('api/graph_api');
const notificationAPI = webServerRequire('api/notification_api');

module.exports = (app, passport) => {
  setupAPIs(app, passport);
};

function setupAPIs(app, passport) {
  workerAPI(app);
  graphAPI(app);
  notificationAPI(app);
}
