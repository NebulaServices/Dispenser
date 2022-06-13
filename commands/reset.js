const {SlashCommandBuilder} = require('@discordjs/builders')
const {Users} = require('../db')
module.exports = {
    data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset ALL USERS proxy generations.'),
    ownerOnly: true,
    async execute(interaction){
        try{
            Users.destroy({
                where: {}
            })    
            return interaction.reply('All users proxy generations have been reset.')
        }
        catch(err){
            interaction.reply('Something went wrong. Please check the log!')
            console.log(client.colors.error(err))
        }
        
    }
}
