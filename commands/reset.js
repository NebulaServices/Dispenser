const {SlashCommandBuilder} = require('@discordjs/builders')
const {Users} = require('../db')
module.exports = {
    data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset a user\'s monthly count')
    .addUserOption(option => option.setName('user').setDescription('The user to reset').setRequired(true)),
    ownerOnly: true,
    async execute(interaction){
        const user = interaction.options.getMember('user')
        try {
            Users.destroy({
                where: {id:user.id}
            })
            return interaction.reply(`Reset user ${user.user.tag}`)
        }
        catch(err){
            interaction.reply('User either does not exist or an unknown error occurred.')
            console.log(client.colors.error(err))
        }
    }
}