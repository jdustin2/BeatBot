const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");
const Discord = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("loads songs from youtube from keywords")
    .addStringOption((option) =>
      option
        .setName("searchterms")
        .setDescription("the search keywords")
        .setRequired(true)
    ),
  run: async ({ client, interaction }) => {
    if (!interaction.member.voice.channel)
      return interaction.editReply(
        "You need to be in a VC to use this command"
      );

    const queue = await client.player.createQueue(interaction.guild);
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let embed = new EmbedBuilder();
    let url = interaction.options.getString("searchterms");
    const result = await client.player.search(url, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });

    if (result.tracks.length === 0) return interaction.editReply("No results");

    const song = result.tracks[0];
    await queue.addTrack(song);
    await queue.addTrack(song);
    embed
      .setDescription(
        `**[${song.title}](${song.url})** has been added to the Queue`
      )
      .setThumbnail(song.thumbnail)
      .setFooter({ text: `Duration: ${song.duration}` });
    if (!queue.playing) await queue.play();
    queue.playing = true;
    await interaction.editReply({
      embeds: [embed],
    });
  },
};
