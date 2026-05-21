import axios from 'axios';

export const sendSlackNotification = async (message) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('Slack webhook URL not configured. Mock sending notification:', message);
    return;
  }
  
  try {
    await axios.post(webhookUrl, {
      text: message
    });
    console.log('Slack notification sent successfully.');
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
  }
};
