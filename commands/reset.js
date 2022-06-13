const {SlashCommandBuilder} = require('@discordjs/builders')
const {Users} = require('../db')
module.exports = {
    data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset ALL USERS'),
    ownerOnly: true,
    async execute(interaction){
        try{
            Users.destroy({
                where: {}
            })    
            return interaction.reply('All users have been reset.')
        }
        catch(err){
            interaction.reply('Something went wrong. Check the log!')
            console.log(client.colors.error(err))
        }
        
    }
}