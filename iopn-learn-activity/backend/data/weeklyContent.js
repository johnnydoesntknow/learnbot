// backend/data/weeklyContent.js
// 📅 UPDATE THIS FILE WEEKLY WITH NEW CONTENT!

module.exports = {
  // 🗓️ WEEK CONFIGURATION
  weekNumber: 1,
  weekTheme: 'Introduction to IOPn',
  lastUpdated: '2025-01-20',
  
  // 📚 LESSONS - Generic IDs (lesson-1, lesson-2, lesson-3) NEVER change
  lessons: [
    {
      id: 'lesson-1',  // ⚠️ NEVER CHANGE THIS ID
      title: 'Welcome to IOPn',  // ✅ Change weekly
      description: 'Understanding our mission and vision',  // ✅ Change weekly
      
      // CONTENT TYPE OPTIONS:
      // - 'text' = Text content only (use 'content' field)
      // - 'video' = Single video file (use 'mediaPath' for URL)
      // - 'image' = Single image (use 'mediaPath' for URL)
      // - 'images' = Multiple images/slideshow (use 'mediaPath' as array)
      contentType: 'video',  // For now using text, change to 'video' when ready
      
      // MEDIA PATH EXAMPLES:
      // For video: '/content/week1/intro.mp4'
      // For image: '/content/week1/diagram.png'
      // For multiple images: ['/content/week1/slide1.png', '/content/week1/slide2.png']
      // For text content: null
      mediaPath: '/videos/day420250607.mp4',  
      
      // TEXT CONTENT - Used when contentType is 'text' or as fallback
      content: `IOPn is a revolutionary ecosystem designed to foster digital innovation through decentralization. 
      
      Our mission is to create an open, accessible platform where creators and users can interact directly without intermediaries.
      
      Key principles:
      • Decentralization - No single point of control
      • Accessibility - Open to everyone globally
      • Innovation - Cutting-edge blockchain technology
      • Community - Governed by token holders
      
      The OPN Chain powers our ecosystem with fast, low-cost transactions.`,
      
      // HOW TO ADD VIDEO (when ready):
      // 1. Change contentType to 'video'
      // 2. Set mediaPath to '/videos/week1/intro.mp4'
      // 3. Place video file in: frontend/public/videos/week1/intro.mp4
      // 4. Keep 'content' as backup text for loading states
      
      duration: '5 min',
      orderIndex: 1
    },
    
    {
      id: 'lesson-2',  // ⚠️ NEVER CHANGE THIS ID
      title: 'OPN Token Basics',  // ✅ Change weekly
      description: 'Learn about our native token',
      
      contentType: 'video',  // Change to 'images' when you have slides
      mediaPath: '/videos/day420250607.mp4',
      
      // When using images, change to:
      // contentType: 'images',
      // mediaPath: [
      //   '/images/week1/tokenomics-slide1.png',
      //   '/images/week1/tokenomics-slide2.png',
      //   '/images/week1/tokenomics-slide3.png'
      // ],
      
      content: `The OPN token is the native utility and governance token of the IOPn ecosystem.
      
      Token Utilities:
      • Transaction fees - Pay for network usage
      • Staking - Earn rewards and secure the network  
      • Governance - Vote on protocol upgrades
      • Access - Unlock premium features and services
      
      Token Distribution:
      • 40% - Community rewards and ecosystem growth
      • 20% - Team and advisors (4-year vesting)
      • 15% - Private sale participants
      • 15% - Treasury for development
      • 10% - Initial liquidity and market making
      
      Token holders are the backbone of our decentralized governance model.`,
      
      // HOW TO ADD IMAGE SLIDESHOW (when ready):
      // 1. Change contentType to 'images'
      // 2. Set mediaPath to array of image URLs
      // 3. Place images in: frontend/public/images/week1/
      // 4. User will click through slides before quiz unlocks
      
      duration: '8 min',
      orderIndex: 2
    },
    
    {
      id: 'lesson-3',  // ⚠️ NEVER CHANGE THIS ID
      title: 'Getting Started',
      description: 'Your first steps in IOPn',
      
      contentType: 'video',  // Change to 'image' for single infographic
      mediaPath: '/videos/day420250607.mp4',
      
      // When using single image, change to:
      // contentType: 'image',
      // mediaPath: '/images/week1/getting-started-guide.png',
      
      content: `Getting started with IOPn is easy! Follow these simple steps:
      
      Step 1: Create Your Wallet
      • Download a compatible wallet (MetaMask, Trust Wallet, etc.)
      • Secure your seed phrase - write it down offline
      • Add OPN Chain to your wallet networks
      
      Step 2: Get OPN Tokens
      • Purchase on supported exchanges
      • Bridge from other chains
      • Earn through participation rewards
      
      Step 3: Explore the Ecosystem
      • Browse dApps on our platform
      • Join staking pools for passive income
      • Participate in governance proposals
      
      Step 4: Join the Community
      • Discord - Daily discussions and support
      • Twitter - Latest updates and announcements  
      • Telegram - Real-time chat with community
      
      No special hardware or technical expertise required - just enthusiasm to learn!`,
      
      // HOW TO ADD SINGLE IMAGE (when ready):
      // 1. Change contentType to 'image'
      // 2. Set mediaPath to image URL
      // 3. Place image in: frontend/public/images/week1/guide.png
      // 4. Image will display with auto-unlock timer
      
      duration: '10 min',
      orderIndex: 3
    }
  ],
  
  // ❓ QUIZZES - Keys must match lesson IDs (lesson-1, lesson-2, lesson-3)
  quizzes: {
    'lesson-1': {
      title: 'Welcome Quiz',  // ✅ Change weekly
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'What is the primary mission of IOPn?',
          options: [
            { id: 'a', text: 'To create a decentralized ecosystem for digital innovation' },
            { id: 'b', text: 'To replace traditional banking systems' },
            { id: 'c', text: 'To mine cryptocurrency' },
            { id: 'd', text: 'To create social media platforms' }
          ],
          correct: 'a'
        },
        {
          id: 'q2',
          question: 'What blockchain powers the IOPn ecosystem?',
          options: [
            { id: 'a', text: 'Bitcoin' },
            { id: 'b', text: 'OPN Chain' },
            { id: 'c', text: 'Ethereum' },
            { id: 'd', text: 'Solana' }
          ],
          correct: 'b'
        },
        {
          id: 'q3',
          question: 'Which principle is NOT mentioned as key to IOPn?',
          options: [
            { id: 'a', text: 'Decentralization' },
            { id: 'b', text: 'Accessibility' },
            { id: 'c', text: 'Profitability' },
            { id: 'd', text: 'Innovation' }
          ],
          correct: 'c'
        }
      ]
    },
    
    'lesson-2': {
      title: 'Token Knowledge Quiz',  // ✅ Change weekly
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'What can you do with OPN tokens?',
          options: [
            { id: 'a', text: 'Only hold them' },
            { id: 'b', text: 'Governance, staking, transactions, and access features' },
            { id: 'c', text: 'Nothing' },
            { id: 'd', text: 'Only trading' }
          ],
          correct: 'b'
        },
        {
          id: 'q2',
          question: 'What percentage of tokens is allocated to community rewards?',
          options: [
            { id: 'a', text: '20%' },
            { id: 'b', text: '40%' },
            { id: 'c', text: '15%' },
            { id: 'd', text: '10%' }
          ],
          correct: 'b'
        },
        {
          id: 'q3',
          question: 'How long is the team token vesting period?',
          options: [
            { id: 'a', text: '1 year' },
            { id: 'b', text: '2 years' },
            { id: 'c', text: '4 years' },
            { id: 'd', text: 'No vesting' }
          ],
          correct: 'c'
        }
      ]
    },
    
    'lesson-3': {
      title: 'Getting Started Quiz',  // ✅ Change weekly  
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'What is the FIRST step to get started with IOPn?',
          options: [
            { id: 'a', text: 'Buy OPN tokens' },
            { id: 'b', text: 'Create a wallet' },
            { id: 'c', text: 'Join Discord' },
            { id: 'd', text: 'Start staking' }
          ],
          correct: 'b'
        },
        {
          id: 'q2',
          question: 'Where should you store your seed phrase?',
          options: [
            { id: 'a', text: 'In an email' },
            { id: 'b', text: 'On your computer' },
            { id: 'c', text: 'Written down offline' },
            { id: 'd', text: 'In a text message' }
          ],
          correct: 'c'
        },
        {
          id: 'q3',
          question: 'What special requirements are needed to join IOPn?',
          options: [
            { id: 'a', text: 'Special hardware' },
            { id: 'b', text: 'Technical expertise' },
            { id: 'c', text: 'Large investment' },
            { id: 'd', text: 'Just enthusiasm to learn' }
          ],
          correct: 'd'
        }
      ]
    }
  }
};

/* 
📁 MEDIA FILE STRUCTURE (when you add them):

frontend/
  public/
    content/
      week1/
        videos/
          intro.mp4
          advanced.mp4
        images/
          slide1.png
          slide2.png
          slide3.png
          guide.png
      week2/
        videos/
          defi-intro.mp4
        images/
          ...
          
🎥 VIDEO REQUIREMENTS:
- Format: MP4 (H.264 codec recommended)
- Resolution: 1280x720 (720p) or 1920x1080 (1080p)
- File size: Under 100MB for smooth loading
- Duration: 3-10 minutes ideal

🖼️ IMAGE REQUIREMENTS:
- Format: PNG or JPG
- Resolution: 1920x1080 max
- File size: Under 2MB per image
- Use PNG for diagrams/text, JPG for photos

💡 TIPS:
- Always provide text content as fallback
- Test media loads properly before deployment
- Consider mobile users - optimize file sizes
- Use CDN for production (Cloudflare, AWS S3, etc.)
*/