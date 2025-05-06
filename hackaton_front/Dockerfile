# Use the official Node.js image as the base image
FROM node:18

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

# Install 'serve' to serve the static site
RUN npm install -g serve

# Expose the port 'serve' will use
EXPOSE 3000

# Start the app using 'serve'
CMD ["serve", "-s", "dist", "-l", "3000"]