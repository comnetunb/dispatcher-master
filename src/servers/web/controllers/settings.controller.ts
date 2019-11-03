import Worker from '../../../database/models/worker';
import * as interfaceManager from '../../shared/interface_manager';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import Configuration, { IConfiguration } from '../../../database/models/configuration';
import { EditSettingsRequest } from '../client/src/app/api/edit-settings-request';

export async function get(req: Request, res: Response): Promise<void | Response> {
  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  try {
    let settings = await Configuration.get();
    return res.send(settings);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function set(req: Request, res: Response): Promise<void | Response> {
  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  try {
    let settings = await Configuration.get();
    let newSettings: EditSettingsRequest = req.body;
    settings.cpuLimit = newSettings.cpuLimit;
    settings.memoryLimit = newSettings.memoryLimit;
    settings.requestResourceInterval = newSettings.requestResourceInterval;
    settings.dispatchInterval = newSettings.dispatchInterval;
    settings.emailService = newSettings.emailService;
    settings.emailUser = newSettings.emailUser;
    settings.emailPassword = newSettings.emailPassword;
    await settings.save();
    return res.send(settings);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
