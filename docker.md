# Docker installation

## Requirements:
- Docker
- Docker-compose

## Setup:
- Clone the repository
```bash 
git clone https://github.com/nebulaServices/dispenser.git 
cd dispenser
```

- Copy the everything from the `docker` directory to the root of the project
```bash
cp -r docker/* .
```

- Edit the docker-compose.yml file and change the env vars 
  - TOKEN
  - CLIENT_ID
  - GUILD_ID
  - OWNER_ID (optional)
  - COOLDOWN_TIME 

*The other ones listed are not to be changed unless you know what you are doing*

- Build the image
```bash
docker-compose build
```

*You may have to run this as `sudo`*

- Run the image
```bash
docker-compose up -d
```

And that's it, the bot should be running now.
