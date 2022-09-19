# if you're doing anything beyond your local machine, please pin this to a specific version at https://hub.docker.com/_/node/
# FROM node:8-alpine also works here for a smaller image
FROM node:10.15.0

# default to port 3000 for node, and 9229 and 9230 (tests) for debug
#ARG PORT=3000
#ENV PORT $PORT
#EXPOSE $PORT 9229 9230

# you'll likely want the latest npm, regardless of node version, for speed and fixes
# but pin this version for the best stability
RUN npm i npm@6.4.1 -g

# install dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /opt/app
COPY exec.sh build.sh package.json package-lock.json tsconfig.json ./
COPY src /opt/app/src
RUN ./exec.sh npm i
RUN ./build.sh

# the official node image provides an unprivileged user as a security best practice
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user
#USER node

EXPOSE 8080

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# if you want to use npm start instead, then use `docker run --init in production`
# so that signals are passed properly. Note the code in index.js is needed to catch Docker signals
# using node here is still more graceful stopping then npm with --init afaik
# I still can't come up with a good production way to run with npm and graceful shutdown
CMD [ "node", "dist/app.js" ]