FROM node:22.14.0

# Install Python and development tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic link for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy Python requirements and install Python dependencies
COPY src/services/predictService/requirements.txt ./src/services/predictService/
RUN pip3 install --break-system-packages -r src/services/predictService/requirements.txt

COPY . .

EXPOSE ${PORT_BACKEND}

CMD ["npm", "start"]