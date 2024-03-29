const Component = require('../../Structures/Core/Component');
const db = require('../../Database/Schemas/loggings');
const { PermissionsBitField } = require('discord.js');

module.exports = new Component({
	name: 'messageDeleteBulk',
	/**
     * @param {Rolex} client
     * @param {Discord.Message} message
     */
	run: async (client, messages) => {
		db.findOne({
			Guild: messages.map(m => m.guildId).slice(0, 1),
		}).then(async (data) => {

			if (data) {
				const msg_log = client.guilds.cache.get(messages.map(m => m.guildId).slice(0, 1).join('')).channels.cache.get(data.message);
				if (!msg_log) return;

				if (!msg_log.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages) || !msg_log.permissionsFor(client.user).has(PermissionsBitField.Flags.EmbedLinks)) return;

				const log = await client.guilds.cache.get(messages.map(m => m.guildId).slice(0, 1).join('')).fetchAuditLogs({
					limit: 1,
				});

				if (log.size === 0) return;

				if (log.entries.first() === undefined) return;

				if (log.entries.first().targetType !== 'Message') return;

				if (log.entries.first().actionType !== 'Delete') return;

				if (log.entries.first().action !== 73) return;

				const html = `<!-- This transcript was generated by ${client.user?.globalName || client.user?.username}. -->

<!DOCTYPE html>
<html>
    <head>
    <meta charset="utf-8">
    <style>
        table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }

        footer {
            text-align: center;
            font-family: arial, sans-serif;
            font-weight: bold;
            color: #000000;
            text-shadow: 2px 2px 5px white;
        }

        td, th {
            border: 1px solid #000000;
            text-align: middle;
            padding: 8px;
        }
                                
        tr:nth-child(even) {
            background-color: #dddddd;
        }

        tr:nth-child(odd) {
            background-color: #ffffff;
        }

        h1 {
            font-family: arial, sans-serif;
            font-weight: bold;
            color: #000000;
            text-shadow: 2px 2px 5px red;
        }

        h2 {
            font-family: arial, sans-serif;
            font-weight: bold;
            color: black;
            text-shadow: -2px 0 coral, 0 2px coral, 2px 0 coral, 0 -2px coral;
        }

        h3 {
            font-family: arial, sans-serif;
            font-weight: bold;
            color: #000000;
        }

        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: #888;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }

        body {
            background-color: #78aef5;
        }
        </style>
        </head>
    <body>
                                    
        <h1 style="text-align: center;">Bulk Message Delete Logs</h1>
        <h2 style="text-align: center;"><img src="${client.guilds.cache.get(messages.map(m => m.guildId).slice(0, 1).join('')).iconURL()}" style="width: 30px; height: 30px; border-radius: 50%; position: absolute;"> <span style="margin-left: 35px;">${client.guilds.cache.get(messages.map(m => m.guildId).slice(0, 1).join('')).name}</span></h2>
        <h3 style="text-align: center;">Channel: <a href="https://discord.com/channels/${messages.map(m => m.guildId).slice(0, 1).join('')}/${messages.map(m => m.channelId).slice(0, 1).join('')}" target="_blank">#${client.guilds.cache.get(messages.map(m => m.guildId).slice(0, 1).join('')).channels.cache.get(messages.map(m => m.channelId).slice(0, 1).join('')).name}</a></h3>

        <table>
        <tr>
            <th style="background-color: #f1c40f; color: #000000;">Author</th>
            <th style="background-color: #f1c40f; color: #000000;">Content</th>
            <th style="background-color: #f1c40f; color: #000000;">Attachment</th>
            <th style="background-color: #f1c40f; color: #000000;">Sent On<br>(GMT +00:00)</th>
        </tr>
        ${messages.map(m =>
		`<tr>
                <td>${m.author ? `<img src="${m.author?.displayAvatarURL({ size: 2048 })}" style="width: 25px; height: 25px; border-radius: 50%; position: absolute; left: 15px;"> <span style="margin-left: 30px; color: ${m.member ? m.member?.displayHexColor : '#000000'};">${m.author?.globalName !== null ? m.author?.globalName : m.author?.username}</span>` : 'Unknown Member'}</td>
                <td>${m.content ? m.content : 'No Content'}</td>
                <td>${m.attachments.size > 0 ? m.attachments.map(a => `<a href="${a.url}" target="_blank">${a.name}</a>`).join('\n') : 'No Attachment'}</td>
                <td>${new Date(m.createdAt).toLocaleString()}</td>
            </tr>`,
	).join('')}
        </table>

        <br><br>

        <footer>
            <img src="${client.user?.displayAvatarURL({ size: 2048 })}" style="width: 25px; height: 25px; border-radius: 50%; position: absolute">
            <span style="margin-left: 30px; font-size: 20px;">Powered by ${client.user?.globalName || client.user?.username}</a></span>
        </footer>
    </body>
</html>`;

				msg_log.send({
					files: [{
						attachment: Buffer.from(html),
						name: 'messages.html',
					}],
				}).then(async (m) => {
					m.edit({
						embeds: [{
							author: {
								name: `${log.entries.first().executor?.username}`,
								icon_url: `${log.entries.first().executor?.displayAvatarURL({ size: 2048 })}`,
							},
							description: `🚮 Bulk messages deleted in <#${messages.map(e => e.channelId).slice(0, 1).join('')}> by <@${log.entries.first().executor?.id}>`,
							fields: [{
								name: 'Deleted Messages Content',
								value: `[Click Here to see deleted messages](${m.attachments.map(a => a.url).join('')})`,
							}],
							color: 15158332,
							timestamp: new Date(Date.now()).toISOString(),
							footer: {
								text: `Powered by ${client.user?.globalName || client.user?.username}`,
								icon_url: client.user?.displayAvatarURL({ size: 2048 }),
							},
						}],
					});
				});
			}
			else return;
		});
	},
});