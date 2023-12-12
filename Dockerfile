FROM node:14.21.3-slim
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000
CMD [ "node", "server.js" ]