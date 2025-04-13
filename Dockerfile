FROM node:18-alpine

# Install SQLite and dependencies
RUN apk add --no-cache sqlite sqlite-dev python3 make g++ 

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Create a directory for the SQLite database
RUN mkdir -p /data
VOLUME /data

# Copy application source and public directory
COPY . .

# Ensure public directory has proper permissions
RUN chmod -R 755 ./public

# Expose the port
EXPOSE 3000

# Set environment variable (just DB_PATH for now)
ENV DB_PATH=/data/deployments.db

# Start the application
CMD ["npm", "start"]

## all comments helped/created by AI assistant
# The Dockerfile is designed to create a lightweight container for a Node.js application that uses SQLite as its database.
# It uses the Alpine version of the Node.js image to keep the image size small.
# The SQLite and its development libraries are installed to allow the application to interact with the SQLite database.
# The application source code is copied into the container, and the public directory is given proper permissions.
# The container exposes port 3000 for the application to be accessible from outside the container.
# Finally, the application is started using npm start.
# The Dockerfile is designed to be used in a development environment, where the SQLite database is stored in a volume for easy access and persistence.
# The volume is mounted to the /data directory in the container, allowing for easy access to the database files from the host machine.
# The environment variable DB_PATH is set to point to the SQLite database file in the mounted volume.
# This allows the application to know where to find the database file when it starts up.
