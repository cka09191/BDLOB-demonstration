FROM node:22.14.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT_BACKEND}

CMD ["npm", "start"]