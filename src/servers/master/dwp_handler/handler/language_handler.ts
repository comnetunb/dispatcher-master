import * as connectionManager from "../../connection_manager";
import {
  GetLanguageCommand,
  LanguageCommand,
  ProtocolType,
} from "dispatcher-protocol";
import { IWorker } from "../../../../database/models/worker";

const checkVersionCommand = {
  python: "python --version",
  java: "java -version",
};

export async function getCommands(
  pdu: GetLanguageCommand,
  worker: IWorker
): Promise<void> {
  const languages = pdu.languages;
  const response: LanguageCommand = {
    type: ProtocolType.LanguageCommand,
    languages: [],
  };
  for (let i = 0; i < languages.length; i += 1) {
    if (
      !Object.prototype.hasOwnProperty.call(checkVersionCommand, languages[i])
    ) {
      continue;
    }

    response.languages.push({
      name: languages[i],
      command: checkVersionCommand[languages[i]],
    });
  }

  await connectionManager.send(worker, response);
}
