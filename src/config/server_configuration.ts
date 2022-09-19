interface IDatabaseConfiguration {
  host: string;
  port: number;
  data: string;
}

interface IWebAPIConfiguration {
  port: number;
  authSecretKey: string;
}

interface IWorkerAPIConfiguration {
  port: number;
}

export interface IServerConfiguration {
  database: IDatabaseConfiguration;
  webApi: IWebAPIConfiguration;
  workerApi: IWorkerAPIConfiguration;
}

const defaultConfiguration: IServerConfiguration = {
  database: {
    host: "localhost",
    port: 27017,
    data: "ons",
  },
  webApi: {
    port: 8080,
    authSecretKey: "abcde",
  },
  workerApi: {
    port: 16180,
  },
};

const ServerConfiguration: IServerConfiguration = {
  database: {
    host: process.env.DB_HOST || defaultConfiguration.database.host,
    data: process.env.DB_DATA || defaultConfiguration.database.data,
    port: process.env.DB_PORT
      ? +process.env.DB_PORT
      : defaultConfiguration.database.port,
  },
  webApi: {
    port: process.env.WEB_API_PORT
      ? +process.env.WEB_API_PORT
      : defaultConfiguration.webApi.port,
    authSecretKey:
      process.env.AUTH_SECRET_KEY || defaultConfiguration.webApi.authSecretKey,
  },
  workerApi: {
    port: process.env.WORKER_API_PORT
      ? +process.env.WORKER_API_PORT
      : defaultConfiguration.workerApi.port,
  },
};

export default ServerConfiguration;
