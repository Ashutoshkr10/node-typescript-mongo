import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { config } from './config/config';
import { Logging } from './library/Logging';

const router = express();

/** Connecting to MongoDB */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('*****************Connected to database****************');
        startServer();
    })
    .catch((error) => {
        Logging.error('ERROR in connecting to database');
        Logging.error(error);
    });

/** Only sart the server if the database connects */
const startServer = () => {
    router.use((req, res, next) => {
        /** Logging the incoming request */
        Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the Response*/
            Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Rules for the APIs*/
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        }

        next();
    });

    /** Routs */
    // TODO

    /** Healthcheck */
    router.get('/health', (req, res, next) => res.status(200).json({ message: 'OK' }));

    /** Error Handling*/
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => {
        Logging.info(`Server is Listening on port ${config.server.port}.`);
    });
};
