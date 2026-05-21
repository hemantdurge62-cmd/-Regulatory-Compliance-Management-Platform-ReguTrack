import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple fallback keyword-based logic if no API key is provided
const MOCK_RESPONSES = {
  about: "ReguTrack is an enterprise-grade Regulatory Compliance Tracking System. It helps organizations manage compliance rules (like GDPR, ISO, SEBI), track audits, manage evidence, and monitor risk scores in real-time.",
  gdpr: "GDPR (General Data Protection Regulation) is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area.",
  gdpr_17: "Article 17 of GDPR (Right to Erasure / 'Right to be Forgotten') requires organizations to delete personal data without undue delay under specific circumstances, such as when the data is no longer necessary.",
  audit: "Audits are regular checks to ensure compliance with standards. In ReguTrack, you can schedule and manage audits via the Audits module.",
  evidence: "Evidence is documentation or proof that compliance rules are being met. You can upload evidence in the Evidence Library.",
  task: "Tasks are action items assigned to users to ensure compliance requirements or audit findings are addressed.",
  compliance: "Compliance means conforming to a rule, such as a specification, policy, standard or law. The system tracks your overall compliance score.",
  default: "As a demo AI without a configured API key, I can only provide limited responses. I understand concepts like ReguTrack, GDPR, Audits, Evidence, Tasks, and Compliance. Please configure a GEMINI_API_KEY in the backend for full AI functionality."
};

const getFallbackResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('article 17') || lowerMsg.includes('gdpr 17')) return MOCK_RESPONSES.gdpr_17;
  if (lowerMsg.includes('gdpr')) return MOCK_RESPONSES.gdpr;
  if (lowerMsg.includes('about') || lowerMsg.includes('regutrack') || lowerMsg.includes('website') || lowerMsg.includes('app')) return MOCK_RESPONSES.about;
  if (lowerMsg.includes('audit')) return MOCK_RESPONSES.audit;
  if (lowerMsg.includes('evidence')) return MOCK_RESPONSES.evidence;
  if (lowerMsg.includes('task')) return MOCK_RESPONSES.task;
  if (lowerMsg.includes('compliance')) return MOCK_RESPONSES.compliance;
  
  // A slightly smarter default that echoes the user's intent if it recognizes something
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) return "Hello! I am your Compliance AI. How can I assist you today?";
  
  return MOCK_RESPONSES.default;
};

export const chat = async (req, res) => {
  try {
    const { message, lang = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Use fallback
      return res.status(200).json({
        success: true,
        response: getFallbackResponse(message)
      });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are a helpful, professional compliance AI assistant for the ReguTrack platform. 
    ReguTrack is an enterprise-grade Regulatory Compliance Tracking System.
    Please reply in the language with code '${lang}'. 
    Keep your answers concise and informative.`;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nUser Question: ' + message }] }
      ]
    });
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      response: responseText
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate response' });
  }
};
