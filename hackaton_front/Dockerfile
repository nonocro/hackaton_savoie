# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite project
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose the port that the serve will run on
EXPOSE 3000

# Command to run the serve
CMD ["serve", "-s", "dist", "-l", "3000"]
