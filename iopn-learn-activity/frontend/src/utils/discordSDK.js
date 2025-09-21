// frontend/src/utils/discordSDK.js
import { DiscordSDK } from '@discord/embedded-app-sdk';

let discordSdk = null;

export const initializeDiscordSDK = async () => {
  try {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    
    if (!clientId) {
      console.error('Discord Client ID not found');
      return null;
    }
    
    discordSdk = new DiscordSDK(clientId);
    await discordSdk.ready();
    
    // Authenticate with Discord
    const { user } = await discordSdk.commands.authenticate({
      scopes: ['identify', 'guilds']
    });
    
    return user;
  } catch (error) {
    console.error('Discord SDK initialization failed:', error);
    return null;
  }
};

export const getDiscordSDK = () => discordSdk;