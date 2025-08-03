FROM python:3.11-slim as python-base

WORKDIR /python-app
COPY src/services/predictService/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM node:22.14.0

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

COPY --from=python-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-base /usr/local/bin /usr/local/bin

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${PORT_BACKEND}

CMD ["npm", "start"]