// frontend/src/utils/discord.js
import { DiscordSDK } from '@discord/embedded-app-sdk';

let discordSdk = null;
let authInfo = null;

export const initializeDiscordSDK = async () => {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  
  if (!clientId) {
    console.error('Discord Client ID not found');
    return null;
  }

  discordSdk = new DiscordSDK(clientId);

  try {
    // Wait for SDK to be ready
    await discordSdk.ready();
    console.log('Discord SDK Ready!');

    // Authenticate and get user info - NO LOGIN NEEDED!
    const { user } = await discordSdk.commands.authenticate({
      scope: ['identify', 'guilds.members.read'],
    });

    // Get guild/channel context
    const { guild } = await discordSdk.commands.getChannel();
    
    authInfo = {
      user,
      guild
    };

    // Set activity status
    await discordSdk.commands.setActivity({
      state: 'Learning IOPn',
      details: 'In Dashboard',
    });

    return authInfo;
  } catch (error) {
    console.error('Failed to initialize Discord SDK:', error);
    throw error;
  }
};

export const getDiscordSDK = () => discordSdk;
export const getAuthInfo = () => authInfo;

export const updateActivity = async (state, details) => {
  if (!discordSdk) return;
  
  try {
    await discordSdk.commands.setActivity({
      state,
      details,
    });
  } catch (error) {
    console.error('Failed to update activity:', error);
  }
};

export const closeActivity = async () => {
  if (!discordSdk) return;
  
  try {
    await discordSdk.close();
  } catch (error) {
    console.error('Failed to close activity:', error);
  }
};