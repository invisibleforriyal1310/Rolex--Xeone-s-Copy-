const App = require('../../../../Structures/Core/App');
const Owners = require('../../../../Database/Schemas/owners');
const { PermissionsBitField } = require('discord.js');

module.exports = new App({
	name: 'gcancel',
	description: 'Deletes a giveaway!',
	aliases: ['gdelete'],

	/**
     * @param {Rolex} ctx
     */

	run: async (ctx) => {
		const owner_data = await Owners.findOne({
			Guild: ctx.message.guild.id,
		});

		const giveawayRole = ctx.message.guild.roles.cache.find(r => r.name.toLowerCase() === 'giveaways');

		if (!ctx.message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild) && !(owner_data && owner_data.additional_owners.includes(ctx.message.member?.id)) && !ctx.message.member?.roles.cache.has(giveawayRole?.id)) {
			return ctx.message.reply({
				content: `${process.env.FAILURE_EMOJI} | You need the \`Manage Server\` permissions or Giveaways role to cancel a giveaway!`,
			}).then(message => {
				setTimeout(() => {
					message.delete();
				}, 15000);
			});
		}

		let messageID = ctx.message.content.split(' ').slice(1).shift();

		if (!messageID) {
			const lastGiveaway = ctx.client.giveawaysManager.giveaways.filter((g) => g.channelId === ctx.message.channel?.id);
			if (!lastGiveaway) {
				return ctx.message.reply({
					content: `${process.env.FAILURE_EMOJI} | Unable to find a giveaway!`,
				}).then(message => {
					setTimeout(() => {
						message.delete();
					}, 15000);
				});
			}
			messageID = lastGiveaway[lastGiveaway.length - 1].messageId;
		}

		const giveaway = ctx.client.giveawaysManager.giveaways.find((g) => g.messageId === messageID && g.guildId === ctx.message.guild.id);

		if (!giveaway) {
			return ctx.message.reply({
				content: `${process.env.FAILURE_EMOJI} | Unable to find a giveaway for \`${messageID}\``,
			}).then(message => {
				setTimeout(() => {
					message.delete();
				}, 15000);
			});
		}

		ctx.client.giveawaysManager
			.delete(messageID, true)
			.then(() => {
				ctx.message.react(ctx.client.emojis.cache.get('968773535914922014'));
			}).catch(() => {
				ctx.message.reply({
					content: `${process.env.FAILURE_EMOJI} | No giveaway found for \`${messageID}\`!`,
				}).then(message => {
					setTimeout(() => {
						message.delete();
					}, 15000);
				});
			});
	},
});