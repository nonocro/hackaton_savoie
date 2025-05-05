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

# Build the React app
RUN npm run build

# Use a lightweight Node.js image to serve the built React app
FROM node:18-alpine

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the build output from the build stage
COPY --from=build /usr/src/app/build ./build

# Install serve globally
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Serve the built React app
CMD ["serve", "-s", "build", "-l", "3000"]
