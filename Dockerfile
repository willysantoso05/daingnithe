FROM ubuntu:20.04

RUN apt update
RUN DEBIAN_FRONTEND=noninteractive apt install build-essential mongodb curl -y
RUN curl https://deb.nodesource.com/setup_12.x -o node-and-npm
RUN chmod +x node-and-npm
RUN ./node-and-npm
RUN apt-get install -y nodejs
RUN service mongodb start

WORKDIR /app
COPY . /app
RUN chmod +x /app/script.sh
WORKDIR /app/api
RUN npm install
WORKDIR /app/client
RUN npm install

CMD "/app/script.sh"