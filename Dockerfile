ARG NODE_VERSION=12
ARG NODE_ENV=production

FROM node:${NODE_VERSION}}.0-slim
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "server.js" ]
