const connectionManager = rootRequire('servers/dispatcher/connection_manager');
const languageCommand = protocolRequire('dwp/pdu/language_command');

const mapLanguageCommand = {
  python: 'python --version',
  java: 'java -version'
};

module.exports.getCommands = (pdu, worker) => {
  const languages = pdu.names;
  const languageCommands = [];
  const { length } = languages;
  for (let i = 0; i < length; i += 1) {
    languageCommands.push({
      name: languages[i],
      command: mapLanguageCommand[languages[i]]
    });
  }

  connectionManager.send(worker.uuid, languageCommand.format({ languages: languageCommands }));
};
