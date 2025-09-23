// backend/data/quiz-questions.js
// This file can be easily updated weekly with new questions

const quizQuestions = {
  'intro-to-iopn': {
    title: 'Introduction to IOPn',
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
        question: 'What blockchain does IOPn operate on?',
        options: [
          { id: 'a', text: 'Ethereum' },
          { id: 'b', text: 'OPN Chain' },
          { id: 'c', text: 'Bitcoin' },
          { id: 'd', text: 'Solana' }
        ],
        correct: 'b'
      },
      {
        id: 'q3',
        question: 'What is the native token of the IOPn ecosystem?',
        options: [
          { id: 'a', text: 'IOPn' },
          { id: 'b', text: 'OPN' },
          { id: 'c', text: 'REP' },
          { id: 'd', text: 'PULSE' }
        ],
        correct: 'b'
      }
    ]
  },
  'opn-chain-basics': {
    title: 'OPN Chain Basics',
    questions: [
      {
        id: 'q1',
        question: 'What consensus mechanism does OPN Chain use?',
        options: [
          { id: 'a', text: 'Proof of Work' },
          { id: 'b', text: 'Proof of Stake' },
          { id: 'c', text: 'Proof of Authority' },
          { id: 'd', text: 'Delegated Proof of Stake' }
        ],
        correct: 'b'
      },
      {
        id: 'q2',
        question: 'What is the average transaction speed on OPN Chain?',
        options: [
          { id: 'a', text: '1-2 seconds' },
          { id: 'b', text: '3-5 seconds' },
          { id: 'c', text: '10-15 seconds' },
          { id: 'd', text: '30+ seconds' }
        ],
        correct: 'b'
      },
      {
        id: 'q3',
        question: 'What makes OPN Chain unique?',
        options: [
          { id: 'a', text: 'It uses Bitcoin\'s codebase' },
          { id: 'b', text: 'It\'s optimized for the IOPn ecosystem with high speed and low fees' },
          { id: 'c', text: 'It only supports NFTs' },
          { id: 'd', text: 'It requires special hardware to use' }
        ],
        correct: 'b'
      }
    ]
  },
  'transactions-on-opn': {
    title: 'How Transactions Work',
    questions: [
      {
        id: 'q1',
        question: 'What determines gas fees on OPN Chain?',
        options: [
          { id: 'a', text: 'Only the amount being sent' },
          { id: 'b', text: 'Network congestion and transaction complexity' },
          { id: 'c', text: 'The sender\'s account age' },
          { id: 'd', text: 'Random selection by validators' }
        ],
        correct: 'b'
      },
      {
        id: 'q2',
        question: 'How many confirmations are typically needed for finality?',
        options: [
          { id: 'a', text: '1 confirmation' },
          { id: 'b', text: '3 confirmations' },
          { id: 'c', text: '6 confirmations' },
          { id: 'd', text: '12 confirmations' }
        ],
        correct: 'c'
      },
      {
        id: 'q3',
        question: 'What happens to failed transactions on OPN Chain?',
        options: [
          { id: 'a', text: 'They are automatically retried' },
          { id: 'b', text: 'Gas fees are fully refunded' },
          { id: 'c', text: 'Transaction is reverted but gas fees are consumed' },
          { id: 'd', text: 'They remain pending indefinitely' }
        ],
        correct: 'c'
      }
    ]
  }
};

// Weekly rotation configuration
const weeklyConfig = {
  // Week of the year (1-52) determines which question set to use
  // This allows automatic weekly rotation without code changes
  currentWeek: Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
  
  // Alternative question sets for each lesson (add more for weekly rotation)
  alternativeSets: {
    'intro-to-iopn': {
      week2: [
        // Add Week 2 questions here
      ],
      week3: [
        // Add Week 3 questions here
      ],
      week4: [
        // Add Week 4 questions here
      ]
    }
  }
};

module.exports = { quizQuestions, weeklyConfig };