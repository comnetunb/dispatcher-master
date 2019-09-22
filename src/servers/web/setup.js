const graphAPI = webServerRequire('api/graph_api');

module.exports = (app, passport) => {
  setupAPIs(app, passport);
};

function setupAPIs(app, passport) {
  graphAPI(app);
}
