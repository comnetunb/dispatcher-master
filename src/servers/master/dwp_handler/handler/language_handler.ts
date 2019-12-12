import * as connectionManager from '../../connection_manager';
import { GetLanguageCommand, LanguageCommand, ProtocolType, EncapsulatePDU } from 'dispatcher-protocol';
import { IWorker } from '../../../../database/models/worker';

const checkVersionCommand = {
  python: 'python --version',
  java: 'java -version'
};

export function getCommands(pdu: GetLanguageCommand, worker: IWorker) {
  const languages = pdu.languages;
  const response: LanguageCommand = {
    type: ProtocolType.LanguageCommand,
    languages: [],
  }
  for (let i = 0; i < languages.length; i += 1) {
    if (!Object.prototype.hasOwnProperty.call(checkVersionCommand, languages[i])) {
      continue;
    }

    response.languages.push({
      name: languages[i],
      command: checkVersionCommand[languages[i]]
    });
  }

  connectionManager.send(worker._id, EncapsulatePDU(response));
};
