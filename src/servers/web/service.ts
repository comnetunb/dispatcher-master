const express = require("express");
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import indexRouter from "./routers/index.router";
import { IUser } from "../../database/models/user";
import { auth } from "./middlewares/auth";
import path from "path";
import ServerConfiguration from "../../config/server_configuration";
import logger from "../shared/log";

// Extending Request to properly type our users
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
      adminMode?: boolean;
    }
    interface Response {
      user?: IUser;
      token?: string;
    }
  }
}

const app = express();

app.use(bodyParser.json({ limit: "50mb" })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());

app.use("/api", auth);
app.use("/api", indexRouter);

let p = path.join(__dirname, "..", "..", "client");
app.use("/", express.static(p));
app.use("**", express.static(p));

export = () => {
  logger.info(`Server listening on port ${ServerConfiguration.webApi.port}`);
  app.listen(ServerConfiguration.webApi.port, "0.0.0.0");
};
