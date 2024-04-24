## Server

The server part of the project is responsible for collecting and storing data. It uses AWS S3 for storing screenshots and camera captures.

### Controllers

The server has a `CollectorController` which handles the following routes:

- `saveCookies`: This route receives cookies and logs them.
- `saveKeys`: This route receives key logs and logs them.
- `saveHistory`: This route receives browsing history and logs it.
- `saveScreenshot`: This route receives a screenshot, saves it to an S3 bucket, and logs the response.
- `listScreenshots`: This route lists all screenshots stored in the S3 bucket.
- `saveCameraCapture`: This route receives a camera capture, saves it to an S3 bucket, and logs the response.
- `listCameraCaptures`: This route lists all camera captures stored in the S3 bucket.

### Environment Variables

The server uses a number of environment variables, please fill them out based on the `.env.example` file.

### AWS S3
The server uses AWS S3 for storing screenshots and camera captures. The screenshots are stored in a `screenshots/` directory in the S3 bucket, and the camera captures are stored in a `camera/` directory in the S3 bucket.

### Running the Server

To run the server, use the following command:

```bash
# Run the server
npm start

# Alternatively run the development server for hot reload
npm run dev
```

This will start the server on the port specified in the `.env` file. You can access the server at `http://localhost:${PORT}`.

### Running the Server with Docker
```bash
# Build the Docker image
docker build -t my-server .

# Run the Docker container
docker run -p 3000:$PORT --env-file .env -d my-server
```
