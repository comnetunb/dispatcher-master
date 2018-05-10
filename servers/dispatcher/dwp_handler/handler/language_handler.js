const log = rootRequire('servers/shared/log')
const connectionManager = rootRequire('servers/dispatcher/connection_manager')
const languageCommand = protocolRequire('dwp/pdu/language_command')

const mapLanguageCommand = {
  python: 'python --version',
  java: 'java -version'
}

module.exports.getCommands = function (pdu, worker) {

  const languages = pdu.names;
  const languageCommands = [];
  for (let i in languages) {
    languageCommands.push({
      name: languages[i],
      command: mapLanguageCommand[languages[i]]
    });
  }

  connectionManager.send(worker.uuid, languageCommand.format({ languages: languageCommands }));

}
