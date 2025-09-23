// backend/bot/index.js
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}!`);
  console.log(`📝 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
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
    // Get user data
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const avatar = interaction.user.avatar;
    
    console.log(`👤 User data - ID: ${userId}, Username: ${username}, Avatar: ${avatar}`); // Debug log
    
    // Generate token with consistent naming (userId, not user_id)
    const token = jwt.sign(
      { 
        userId,  // Keep this as userId (no underscore)
        username,
        avatar
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Get tunnel URL from env or use placeholder
    const tunnelUrl = process.env.TUNNEL_URL || 'https://your-tunnel.trycloudflare.com';
    
    // Build URL with token only (let frontend decode it properly)
// In the bot's /learn command handler
const fullUrl = `${tunnelUrl}?token=${token}&user_id=${userId}&username=${encodeURIComponent(username)}&avatar=${avatar || ''}`;    
    const embed = new EmbedBuilder()
      .setTitle('🎓 Learn IOPn, Unlock the Future')
      .setDescription('Master the fundamentals of IOPn\'s ecosystem through interactive lessons and earn rewards!')
      .setColor(0x6105b6)
      .addFields(
        { name: '📚 What you\'ll learn', value: '• IOPn Vision & Mission\n• OPN Chain Basics\n• Transaction Processing', inline: true },
        { name: '🏆 Rewards', value: '• REP Points\n• Origin Badges\n• Exclusive Access', inline: true }
      )
      

    const button = new ButtonBuilder()
      .setLabel('🚀 Start Learning')
      .setStyle(ButtonStyle.Link)
      .setURL(fullUrl);

    const row = new ActionRowBuilder().addComponents(button);

    console.log(`🔗 Generated secure link for ${username}`);
    console.log(`   Avatar hash: ${avatar || 'No custom avatar'}`);

    await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);