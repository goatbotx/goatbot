import dotEnv from 'dotenv'
import cors from 'cors'
import server from './data/repository/server';
import DBConnection from './data/repository/database/connect';
import { useTelegramBot } from './features/telegram/telegram.routes';
import AuthorizationRepo from './data/repository/encryption';
import RequestHandler from './data/repository/server/router';
import integrationUserRoutes from './features/web/integration/integration.routes';
import { initLogger } from './data/repository/logger.ts';
import { continueMarketCheck } from "./data/repository/wallet/limitSellBuy";
import otherUserRoutes from './features/web/other/other.routes';

dotEnv.config();
const dBConnection = new DBConnection();
dBConnection.connect();

export default server((app, _server) => {
    cors();
    useTelegramBot();
    continueMarketCheck();

    const authenticationRepo = new AuthorizationRepo();
    const router = new RequestHandler({ router: app,  authenticationRepo, host: '/api' });

    router.extend('/integrations', integrationUserRoutes);
    router.extend('/other', otherUserRoutes);

    // initLogger.useExpressMonganMiddleWare(app);
    initLogger.checkRoutes(router);
});


