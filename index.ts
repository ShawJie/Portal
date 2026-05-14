import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './src/App';
import logger from './src/Logger';
import routeHandlerMapper from './src/router/RouteHandlerMapper';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDistPath = path.join(__dirname, 'web', 'dist');

app.run()
    .then((appInstance) => {
        appInstance.use("/", routeHandlerMapper.initial());
        appInstance.use(express.static(webDistPath));
        appInstance.get('/admin*', (_req, res) => {
            res.sendFile(path.join(webDistPath, 'index.html'));
        });
    })
    .catch(err => logger.error(err));
