# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy application source code
COPY . .

# Expose port
EXPOSE $PORT

# Command to run the application
CMD ["node", "index.js"]
