const dispatcherProtocol = require('dispatcher-protocol');

const connectionManager = dispatcherRequire('connection_manager');
const { languageCommand } = dispatcherProtocol.pdu;

const mapLanguageCommand = {
  python: 'python --version',
  java: 'java -version'
};

module.exports.getCommands = (pdu, slave) => {
  const languages = pdu.names;
  const languageCommands = [];
  const { length } = languages;
  for (let i = 0; i < length; i += 1) {
    languageCommands.push({
      name: languages[i],
      command: mapLanguageCommand[languages[i]]
    });
  }

  connectionManager.send(slave.uuid, languageCommand.format({ languages: languageCommands }));
};
