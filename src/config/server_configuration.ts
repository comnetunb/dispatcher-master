interface IDatabaseConfiguration {
  host: string;
  port: number;
  data: string;
}

interface IAPIConfiguration {
  port: number;
  proxyHost: string;
  proxyPort: number;
  authSecretKey: string;
}

interface IServerConfiguration {
  database: IDatabaseConfiguration;
  api: IAPIConfiguration;
}

const defaultConfiguration: IServerConfiguration = {
  database: {
    host: "localhost",
    port: 27017,
    data: "ons",
  },
  api: {
    port: 8080,
    proxyHost: "localhost",
    proxyPort: 4200,
    authSecretKey: "abcde",
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
  api: {
    proxyHost: process.env.PROXY_HOST || defaultConfiguration.api.proxyHost,
    proxyPort: process.env.PROXY_PORT
      ? +process.env.PROXY_PORT
      : defaultConfiguration.api.proxyPort,
    port: process.env.PORT ? +process.env.PORT : defaultConfiguration.api.port,
    authSecretKey:
      process.env.AUTH_SECRET_KEY || defaultConfiguration.api.authSecretKey,
  },
};

export default ServerConfiguration;
