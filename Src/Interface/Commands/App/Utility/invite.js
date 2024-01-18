const App = require('../../../../Structures/Core/App');

module.exports = new App({
	name: 'invite',
	description: 'Invite the bot to your server now!',
	usage: 'invite',
	aliases: ['inv'],

	/**
     * @param {Rolex} ctx
     */
	run: async (ctx) => {
		await ctx.interaction.reply({
			embeds: [{
				author: {
					name: ctx.client.user?.globalName || ctx.client.user?.username,
					icon_url: ctx.client.user?.displayAvatarURL({ size: 2048 }),
				},
				description: `>>> • [Click here to invite ${ctx.client.user?.globalName || ctx.client.user?.username}](${process.env.BOT_INVITE})\n• [Click here to join my support server](${process.env.SUPPORT_SERVER})\n• [Click here to vote me on top.gg](${process.env.TOP_GG_URL})`,
				color: 16705372,
				footer: {
					text: `Desired by ${ctx.interaction.user?.username}`,
					icon_url: ctx.interaction.user?.displayAvatarURL({ size: 2048 }),
				},
			}],
		});
	},
});