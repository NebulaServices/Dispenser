FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN cp .env.example .env 
RUN chmod u+x ./start.sh
CMD ["./start.sh"]
