import winston, { createLogger, format, transports, Logger, config } from 'winston';
import morgan from 'morgan'
import RequestHandler from '../server/router';

const DATADOG_CLIENT_TOKEN = process.env.DATADOG_CLIENT_TOKEN
const DATADOG_APPLICATION_NAME = process.env.DATADOG_APPLICATION_NAME
const DATADOG_SITE = process.env.DATADOG_SITE

const SENTRY_DSN = process.env.SENTRY_DSN

const { combine, timestamp, json, colorize } = format;

const customColors = {
  emerg: "red",
  alert: "red",
  crit: "red",
  error: "red",
  warning: "yellow",
  notice: "blue",
  info: "green",
  debug: "gray",
};

const useFormat = combine(
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  json(),
  colorize({ colors: customColors })
);

const httpTransportOptions = {
    host: DATADOG_SITE,
    path: `/api/v2/logs?dd-api-key=${DATADOG_CLIENT_TOKEN}&ddsource=nodejs&service=${DATADOG_APPLICATION_NAME}`,
    ssl: true
};

export const defaultLogger = console;

class LoggerImplementation {
    winston: typeof winston;

    constructor() {
        this.winston = winston;
    }

    useExpressMonganMiddleWare = (route: any) => {
        let toggleColor = (message: string) => {
            if (message.search(' 200') > 0) {
                return '✅';
            }
            if (message.search(' 500') > 0) {
                return '❗';
            }
            if (message.search(' 201') > 0) {
                return '✅';
            }
            return '🔔';
        }
        
        let middleWare = morgan(
            'tiny',
            {
                stream: {
                    write: (message) => this.winston.createLogger({
                        format: this.winston.format.combine(
                            this.winston.format.colorize(),
                            this.winston.format.label({label: `${toggleColor(message.trim())}`, message: true}),
                            this.winston.format.timestamp(),
                            this.winston.format.printf((info) => {
                                return `[${info.level}] ${(new Date(info.timestamp)).toUTCString()} ${info.message}`;
                            })
                        ),
                        transports: [new this.winston.transports.Console({level: 'http'})],}).http(message.trim()),
                },
            }
        );
        route.use(middleWare);
    }

  checkRoutes = (router: RequestHandler, errorOnMultiple: boolean = true) => {
      const colors = require("colors/safe");
      
      setTimeout(() => {
          console.log(colors.bgBrightRed('listing end points'));
          router.listEndPoint.forEach((endPoint, index) => {
              if (errorOnMultiple) {
                  const data = router.listEndPoint.filter((d) => d.endpoint === endPoint.endpoint && d.method === endPoint.method);
                  if (data.length > 1) {
                      throw Error(colors.brightMagenta.bgRed(`Multiple Endpoint ${data.length} ${endPoint.method} ${endPoint.endpoint}`))
                  }
              }
              if (endPoint.method === 'POST') {
                  console.log(colors.blue(`${endPoint.method}  ${endPoint.endpoint} ${endPoint.middleWares} `));
                  return;
              }
              if (endPoint.method === 'GET') {
                  console.log(colors.green(`${endPoint.method}  ${endPoint.endpoint} ${endPoint.middleWares}`));
                  return;
              }
              if (endPoint.method === 'PUT') {
                  console.log(colors.magenta(`${endPoint.method}  ${endPoint.endpoint} ${endPoint.middleWares}`));
                  return;
              }
              if (endPoint.method === 'DELETE') {
                  console.log(colors.red(`${endPoint.method}  ${endPoint.endpoint} ${endPoint.middleWares}`));
                  return;
              }
          })
          console.log(colors.brightMagenta.bgCyan(`you have ${colors.bold(router.listEndPoint.length)} end points`));
      }, 2000);
  }
}

export const initLogger = new LoggerImplementation();