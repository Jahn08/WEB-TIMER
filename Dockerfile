FROM node:13.13-alpine
WORKDIR /home/node/

COPY /WebTimer/package*.json WebTimer/
COPY 1.pfx ./

ENV NODE_ENV=production
RUN cd WebTimer && npm install --only=production

COPY /WebTimer WebTimer

RUN chown -R node: WebTimer/client/views
RUN chmod -R u+rw WebTimer/client/views

EXPOSE 4443

USER node
CMD cd WebTimer && npm run release