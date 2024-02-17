# Use the official Node.js 16 image from Docker Hub
FROM node:16

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Expose the port
EXPOSE 8080

# Run the app
CMD  npm run start