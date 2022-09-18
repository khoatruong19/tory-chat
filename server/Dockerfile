FROM node

WORKDIR /usr/src/app

COPY package.json ./

COPY package-lock.json ./

RUN npm install -g npm@8.19.2

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

ENV NODE_ENV=production

USER node

CMD ["node", "dist/main.js"]

