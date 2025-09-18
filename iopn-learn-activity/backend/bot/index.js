// backend/bot/index.js
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}!`);
  registerCommands();
});

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('learn')
      .setDescription('Start learning about IOPn ecosystem'),
  ];

  try {
    await client.application.commands.set(commands);
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'learn') {
    const embed = new EmbedBuilder()
      .setTitle('🎓 Learn IOPn, Unlock the Future')
      .setDescription('Master the fundamentals of IOPn\'s ecosystem through interactive lessons and earn rewards!')
      .setColor(0x6105b6)
      .addFields(
        { name: '📚 What you\'ll learn', value: '• IOPn Vision & Mission\n• OPN Chain Basics\n• Transaction Processing', inline: true },
        { name: '🏆 Rewards', value: '• REP Points\n• Origin Badges\n• Exclusive Access', inline: true }
      )
      .setFooter({ text: 'Powered by Pulse\'s Social Reach' });

    const button = new ButtonBuilder()
      .setLabel('🚀 Start Learning')
      .setStyle(ButtonStyle.Link)
      .setURL('https://wallpaper-greatest-possibly-were.trycloudflare.com');

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ 
      embeds: [embed], 
      components: [row] 
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);