FROM node:18-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy all local files into the image
COPY . .

RUN pnpm install
RUN pnpm build

# Delete source code files that were used to build the app that are no longer needed
RUN rm -rf src/ static/ docker-compose.yml

# The USER instruction sets the user name to use as the default user for the remainder of the current stage
USER node:node

# This is the command that will be run inside the image when you tell Docker to start the container
CMD ["node","build/index.js"]
