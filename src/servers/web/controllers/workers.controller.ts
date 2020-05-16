import Worker from "../../../database/models/worker";
import logger from "../../shared/log";
import { Request, Response } from "express";
import httpStatusCodes from "../utils/httpStatusCodes";
import { WorkerCreateRequest } from "../api/worker-create-request";
import { WorkerEditRequest } from "../api/worker-edit-request";
import Configuration from "../../../database/models/configuration";

export async function getWorker(
  req: Request,
  res: Response
): Promise<void | Response> {
  try {
    let worker = await Worker.findById(req.params.workerId);
    return res.send(worker);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function editWorker(
  req: Request,
  res: Response
): Promise<void | Response> {
  try {
    let body: WorkerEditRequest = req.body;
    let worker = await Worker.findById(req.params.workerId);
    if (!worker) throw "Worker not found";

    worker.name = body.name;
    worker.description = body.description;
    worker.resourceLimit.cpu = body.cpuLimit;
    worker.resourceLimit.memory = body.memoryLimit;
    if (body.newPassword) {
      worker.password = Worker.encryptPassword(body.newPassword);
    }
    await worker.save();
    return res.send(worker);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function getOnlineWorkers(
  req: Request,
  res: Response
): Promise<void | Response> {
  try {
    let config = await Configuration.get();
    let workers = await Worker.find({ "status.online": true });
    for (let worker of workers) {
      let available = true;
      if (
        (worker.resourceLimit.cpu &&
          worker.resource.cpu > worker.resourceLimit.cpu) ||
        (!worker.resourceLimit.cpu && worker.resource.cpu > config.cpuLimit)
      ) {
        available = false;
      }
      if (
        (worker.resourceLimit.memory &&
          worker.resource.memory > worker.resourceLimit.memory) ||
        (!worker.resourceLimit.memory &&
          worker.resource.memory > config.memoryLimit)
      ) {
        available = false;
      }
      worker.available = available;
    }
    return res.send(workers);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function getAllWorkers(
  req: Request,
  res: Response
): Promise<void | Response> {
  try {
    let workers = await Worker.find();
    return res.send(workers);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function createWorker(req: Request, res: Response) {
  try {
    const request: WorkerCreateRequest = req.body;
    const workerFilter = { name: request.name };
    const existingWorker = await Worker.findOne(workerFilter);
    if (existingWorker) {
      res
        .status(httpStatusCodes.BAD_REQUEST)
        .send({ error: "There already is a worker with this name." });
      return;
    }

    const { name, description, password } = request;
    const hash = Worker.encryptPassword(password);

    const newWorker = new Worker({
      name,
      description,
      password: hash,
      resourceLimit: {
        cpu: request.cpuLimit,
        memory: request.memoryLimit,
      },
    });
    const worker = await newWorker.save();
    res.status(httpStatusCodes.CREATED).send(worker);
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
