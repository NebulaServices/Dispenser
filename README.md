# Dispenser

## Features

- Easy administration
- Domain reporting
- Easy configuration
- Fast

## Coming soon
- Prevent user from getting the same domain twice
- pagination for viewing user db
- and more!

## Commands 
Command  | Description | Usage
------------- | ------------- | ------------
`/add`  | Add a link to the Database  | `/add example.com` <-- do not include `https://`
`/remove`  | Remove a link from the Database  | `/remove example.com`
`/panel`  | Creates a panel of buttons to click for the links!  | `/panel`
`/list`  | Lists all domains stored in the Database  | `/list`
`/reset`  | Resets **all users** in the database  | `/reset`

## Installation

Clone the repository and install dependencies
```bash
git clone https://github.com/NebulaServices/Dispenser.git
cd Dispenser
npm i
mv config-example.json config.json
```
Fill out the newly created `config.json` to your needs.

Starting the bot
```bash
npm start
```

## License

[AGPL V3](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Credits

Written by [Phene](https://github.com/joebobbio) and [illusions](https://github.com/illusionTBA) for Nebula Services

Dispenser is a product of Nebula Services | Copyright Nebula Services 2022
<br>
Copyright Questions ----> accounts-management@nebula.bio
<br>
Need Help? Open a ticket -> https://discord.nebula.bio
