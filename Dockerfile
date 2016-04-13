# Dockerfile for concierge docker image creation
# Create image:
#   docker build -t concierge:latest .
# Run options
#   1. Run docker (latest)
#     docker run -it --rm --name concierge -p 8090:8090 -e "PORT=8090" -e "NODE_ENV=development" concierge:latest
#
# To remove untaged images run this command
#   docker rmi $(docker images | grep "^<none>" | awk "{print $3}")

FROM node:4.4.2

RUN set -x \
  && apt-get update && apt-get install -y apt-utils curl build-essential wget git supervisor --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g node-gyp

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Time to work with parts that change
ENV CONCIERGE_VERSION 0.2

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app/plugins/conciergeDesk
RUN cd /usr/src/app/plugins/conciergeDesk && ls -al
RUN npm install
RUN cd /usr/src/app/plugins/conciergeDesk && ls -al

# Expose debug, default app ports
# TODO: add auto port expose
EXPOSE 8090

WORKDIR /usr/src/app
RUN cd /usr/src/app && ls -al

CMD [ "npm", "start" ]
