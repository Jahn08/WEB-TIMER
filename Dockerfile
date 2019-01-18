FROM node:8.11
WORKDIR /home/node/

COPY /WebTimer/package*.json ./WebTimer/
COPY 1.pfx ./

RUN cd ./WebTimer && npm install --only=production

COPY /WebTimer ./WebTimer

EXPOSE 4443

USER node
CMD cd ./WebTimer && npm run release
