# Use the official Node.js image as the base image
FROM node:18 as build

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app, assuming your build script outputs to dist
RUN npm run build

# Use Nginx as the web server
FROM nginx:alpine

# Copy the build output to the Nginx directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80
