FROM node:12.10.0-alpine

# Setup permissions for non-root node user
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Set the working directory
WORKDIR /home/node/app

# Use the existing image layer if package.json is unchanged
COPY package*.json ./

# Switch to non-root node user
USER node

# Install dependencies
RUN npm install

# Copy application code to the container with appropriate permissions
COPY --chown=node:node . .

# Expose PORT 3000
EXPOSE 3000

# Start the server
CMD [ "node", "server.js" ]