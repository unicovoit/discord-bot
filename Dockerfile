# Dockerfile
FROM node:16-alpine

# create destination directory
RUN mkdir -p /usr/src/unicovoit-bot
WORKDIR /usr/src/unicovoit-bot

RUN npm install -g pnpm clean-modules

# copy the app, note .dockerignore
COPY package.json /usr/src/univovoit-bot
COPY . /usr/src/unicovoit-bot
RUN pnpm install

RUN apk --no-cache add dumb-init

# change timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

USER node

CMD ["dumb-init", "node", "--max-old-space-size=2048", "src/index.js"]
