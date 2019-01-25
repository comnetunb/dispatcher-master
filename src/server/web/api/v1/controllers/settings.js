const Settings = databaseRequire('models/settings');
const EventEmitter = require('events');

const assign = (src, dest) => {
  Object.keys(src).forEach((key) => {
    if (typeof src[key] === 'object' && src[key] !== null) {
      assign(src[key], dest[key]);
    } else {
      dest[key] = src[key];
    }
  });
};

const event = new EventEmitter();

function masterSettings(req, res) {
  Settings
    .findOne({})
    .then((settings) => {
      if (!settings) {
        throw Object('Settings not found!');
      }

      res.status(200).send(settings.master);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
}

function slaveSettings(req, res) {
  Settings
    .findOne({})
    .then((settings) => {
      if (!settings) {
        throw Object('Settings not found!');
      }

      res.status(200).send(settings.slave);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
}

function updateSettings(req, res) {
  const property = req.body;

  Settings
    .findOne({})
    .then((settings) => {
      if (!settings) {
        throw Object('Settings not found.');
      }

      assign(property, settings);

      settings.save((e) => {
        if (e) {
          throw Object(`An internal error occurred. ${e}`);
        }

        event.emit('settingsUpdated');

        res.status(200).send({});
      });
    })
    .catch((e) => {
      res.status(500).send(e);
    });
}

module.exports = {
  masterSettings,
  slaveSettings,
  updateSettings,
};
