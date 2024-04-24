# Attacker portal

This directory contains the code for the attacker portal web application part of the project. It is built using JavaScript and React.

## Structure

The web application is divided into several main parts:

- `components`: This directory contains all the React components used in the application.
- `services`: This directory contains services for handling API calls and other business logic.
- `styles`: This directory contains all the CSS styles for the application.

### Environment Variables

The app uses a number of environment variables, please fill them out based on the `.env.example` file.

## Building the Web Application

To build the web application, use the following command:

```bash
npm run build
```

This will create a build directory with the compiled web application.

## Running the Web Application
To run the web application, use the following command:

```bash
npm start
```

his will start the web application on the port defined in `.env` . You can access the web application at `http://localhost:${PORT}`.
