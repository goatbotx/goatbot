//@ts-check

import express, { Express } from 'express';

import cors from 'cors';
import Server from './server';

const server = (bootstrap: (app: Express, server: any) => void) => {
    const app = express();

    app.use(cors());
    app.use(express.static('public'));

    app.use(express.urlencoded({
        extended: true
    }));

    app.use(express.json());

    const serverInstance = new Server({app});
    const server = serverInstance.production();

    bootstrap(app, server);

    return {app, server};
}

export default server;