# Use the official Node.js image as the base image
FROM node:18

# Create a new user and switch to it
RUN useradd -ms /bin/bash nodeuser
USER nodeuser

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY --chown=nodeuser:nodeuser package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=nodeuser:nodeuser . .

# Build the React app, assuming your build script outputs to dist
RUN npm run build

# Install 'serve' locally
RUN npm install serve

# Expose the port 'serve' will use
EXPOSE 3000

# Start the app using 'serve'
CMD ["node_modules/.bin/serve", "-s", "dist", "-l", "3000"]
