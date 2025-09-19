const { chatWithGoogleAIStream, chatWithGoogleLifeCoachStream } = require('./dist/utils/aiClient');

async function testStreaming() {
    console.log('Testing Google AI Streaming...');
    
    try {
        const message = "Merhaba, nasılsın?";
        const conversationHistory = [];
        
        console.log('Sending message:', message);
        console.log('Streaming response:');
        
        for await (const chunk of chatWithGoogleAIStream({
            message,
            conversationHistory
        })) {
            process.stdout.write(chunk);
        }
        
        console.log('\n\nStreaming test completed successfully!');
    } catch (error) {
        console.error('Streaming test failed:', error);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testStreaming();
}

module.exports = { testStreaming };
