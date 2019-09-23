import fs from 'fs';
import logger from './log';

export interface Configuration {
  cpu?: {
    threshold: number,
  },
  memory?: {
    threshold: number,
  },
  workerPerformance?: {
    threshold: number,
  },
  transporter?: {
    service: string,
    auth: {
      user: string,
      password: string,
    }
  },
  requestResourceInterval?: number,
  dispatchInterval?: number,
};

let configuration: Configuration = null;

export const getConfiguration = (): Configuration => {
  if (configuration == null) {
    reload();
  }

  return configuration;
};

export function reload(): void {
  try {
    const newConfig = JSON.parse(fs.readFileSync(`${__dirname}/../config/config.json`, 'utf8').replace(/^\uFEFF/, ''));
    configuration = newConfig;
  } catch (err) {
    logger.error(err);
  }

  treatDefaultValues();
}

function treatDefaultValues() {
  if (configuration.cpu === undefined) {
    configuration.cpu = {
      threshold: 0.5,
    };
  }

  if (configuration.memory === undefined) {
    configuration.memory = {
      threshold: 0.5,
    };
  }

  if (configuration.workerPerformance === undefined) {
    configuration.workerPerformance = {
      threshold: 0.5,
    };
  }

  if (configuration.cpu.threshold > 1) {
    configuration.cpu.threshold = 1;
  } else if (configuration.cpu.threshold < 0) {
    configuration.cpu.threshold = 0;
  }

  if (configuration.memory.threshold > 1) {
    configuration.memory.threshold = 1;
  } else if (configuration.memory.threshold < 0) {
    configuration.memory.threshold = 0;
  }

  if (configuration.workerPerformance.threshold > 1) {
    configuration.workerPerformance.threshold = 1;
  } else if (configuration.workerPerformance.threshold < 0) {
    configuration.workerPerformance.threshold = 0;
  }

  if (configuration.requestResourceInterval === undefined) {
    configuration.requestResourceInterval = 1;
  } else if (configuration.requestResourceInterval < 1) {
    configuration.requestResourceInterval = 1;
  }

  if (configuration.dispatchInterval === undefined) {
    configuration.dispatchInterval = 3;
  } else if (configuration.dispatchInterval < 3) {
    configuration.dispatchInterval = 3;
  }
}
