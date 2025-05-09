FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Debug: List contents of current directory
RUN ls -la

# Debug: Show package.json contents
RUN cat package.json

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"] 