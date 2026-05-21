import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../api';

const RESPONSES = {
  'en': {
    greeting: "Hello! I am your Compliance AI. How can I assist you with regulations today?",
    about: "ReguTrack is an enterprise-grade Regulatory Compliance Tracking System. It helps organizations manage compliance rules (like GDPR, ISO, SEBI), track audits, manage evidence, and monitor risk scores in real-time.",
    gdpr_17: "Article 17 of GDPR (Right to Erasure / 'Right to be Forgotten') requires organizations to delete personal data without undue delay under specific circumstances, such as when the data is no longer necessary for the purposes it was collected for, or when the data subject withdraws consent.",
    default: "I'm a demo AI. In a production environment, I would search the compliance database to answer this question. Try asking 'What is this website about?' or about 'Article 17 of GDPR'!"
  },
  'hi': {
    greeting: "नमस्ते! मैं आपका अनुपालन (Compliance) AI हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    about: "ReguTrack एक उद्यम-स्तर का अनुपालन ट्रैकिंग सिस्टम है। यह संगठनों को अनुपालन नियमों (जैसे GDPR, ISO, SEBI) का प्रबंधन करने, ऑडिट ट्रैक करने और वास्तविक समय में जोखिम स्कोर की निगरानी करने में मदद करता है।",
    gdpr_17: "GDPR के अनुच्छेद 17 (भूल जाने का अधिकार) के तहत संगठनों को विशिष्ट परिस्थितियों में बिना किसी अनुचित देरी के व्यक्तिगत डेटा को हटाने की आवश्यकता होती है।",
    default: "मैं एक डेमो AI हूँ। अधिक जानकारी के लिए कृपया ReguTrack या GDPR के बारे में पूछें।"
  },
  'mr': {
    greeting: "नमस्कार! मी तुमचा कंप्लायन्स AI आहे. मी तुम्हाला कशी मदत करू शकतो?",
    about: "ReguTrack ही एक एंटरप्राइझ-ग्रेड रेग्युलेटरी कंप्लायन्स ट्रॅकिंग सिस्टीम आहे. ती संस्थांना कंप्लायन्स नियम (जसे GDPR, ISO, SEBI) व्यवस्थापित करण्यास आणि ऑडिट ट्रॅक करण्यास मदत करते.",
    gdpr_17: "GDPR च्या कलम 17 (विसरले जाण्याचा अधिकार) नुसार, संस्थांनी विशिष्ट परिस्थितीत विलंब न लावता वैयक्तिक डेटा हटवणे आवश्यक आहे.",
    default: "मी एक डेमो AI आहे. अधिक माहितीसाठी कृपया ReguTrack किंवा GDPR बद्दल विचारा."
  },
  'zh': {
    greeting: "你好！我是您的合规人工智能。今天我能为您提供什么帮助？",
    about: "ReguTrack 是一款企业级合规跟踪系统。它帮助组织管理合规规则（如 GDPR、ISO、SEBI），跟踪审计，管理证据，并实时监控风险评分。",
    gdpr_17: "GDPR 第 17 条（删除权/“被遗忘权”）要求组织在特定情况下毫不无理延迟地删除个人数据。",
    default: "我是一个演示 AI。在生产环境中，我会搜索合规数据库来回答这个问题。您可以询问有关 ReguTrack 或 GDPR 的问题。"
  },
  'es': {
    greeting: "¡Hola! Soy su IA de cumplimiento. ¿Cómo puedo ayudarle con las regulaciones hoy?",
    about: "ReguTrack es un sistema de seguimiento de cumplimiento normativo de nivel empresarial. Ayuda a las organizaciones a gestionar normas (como GDPR, ISO, SEBI), realizar auditorías y supervisar riesgos en tiempo real.",
    gdpr_17: "El Artículo 17 del RGPD (Derecho de supresión / 'Derecho al olvido') requiere que las organizaciones eliminen los datos personales sin demora injustificada en circunstancias específicas.",
    default: "Soy una IA de demostración. En un entorno de producción, buscaría en la base de datos. Puede preguntar sobre ReguTrack o el 'Artículo 17 del RGPD'."
  },
  'fr': {
    greeting: "Bonjour! Je suis votre IA de conformité. Comment puis-je vous aider avec les réglementations aujourd'hui?",
    about: "ReguTrack est un système de suivi de la conformité réglementaire d'entreprise. Il aide les organisations à gérer les règles de conformité (comme le RGPD, l'ISO, le SEBI) et à suivre les audits en temps réel.",
    gdpr_17: "L'article 17 du RGPD (Droit à l'effacement / « Droit à l'oubli ») exige que les organisations suppriment les données personnelles dans les meilleurs délais dans des circonstances spécifiques.",
    default: "Je suis une IA de démonstration. Vous pouvez poser des questions sur ce site web (ReguTrack) ou sur l'Article 17 du RGPD."
  },
  'de': {
    greeting: "Hallo! Ich bin Ihre Compliance-KI. Wie kann ich Ihnen heute helfen?",
    about: "ReguTrack ist ein unternehmensweites System zur Verfolgung der Einhaltung von Vorschriften. Es hilft bei der Verwaltung von Compliance-Regeln (wie DSGVO, ISO, SEBI) und der Überwachung von Audits in Echtzeit.",
    gdpr_17: "Artikel 17 der DSGVO (Recht auf Löschung / 'Recht auf Vergessenwerden') verlangt von Organisationen, personenbezogene Daten unter bestimmten Umständen unverzüglich zu löschen.",
    default: "Ich bin eine Demo-KI. Sie können Fragen zu dieser Website (ReguTrack) oder Artikel 17 der DSGVO stellen."
  },
  'ja': {
    greeting: "こんにちは！私はあなたのコンプライアンスAIです。本日はどのようなご用件でしょうか？",
    about: "ReguTrackは、企業向けの規制コンプライアンス追跡システムです。組織がコンプライアンス規則（GDPR、ISO、SEBIなど）を管理し、監査を追跡するのを支援します。",
    gdpr_17: "GDPR第17条（消去の権利/「忘れられる権利」）は、特定の状況下で不当な遅滞なく個人データを削除することを組織に義務付けています。",
    default: "私はデモAIです。ReguTrackまたはGDPR第17条について質問してみてください。"
  },
  'pt': {
    greeting: "Olá! Sou sua IA de conformidade. Como posso ajudá-lo hoje?",
    about: "O ReguTrack é um sistema corporativo de rastreamento de conformidade regulatória. Ele ajuda as organizações a gerenciar regras de conformidade (como GDPR, ISO, SEBI) e a rastrear auditorias em tempo real.",
    gdpr_17: "O Artigo 17 do GDPR (Direito ao Apagamento / 'Direito de ser Esquecido') exige que as organizações excluam dados pessoais sem demora injustificada sob circunstâncias específicas.",
    default: "Sou uma IA de demonstração. Você pode perguntar sobre o ReguTrack ou o 'Artigo 17 do GDPR'."
  },
  'ko': {
    greeting: "안녕하세요! 규정 준수 AI입니다. 오늘 무엇을 도와드릴까요?",
    about: "ReguTrack은 엔터프라이즈급 규정 준수 추적 시스템입니다. 조직이 규정 준수 규칙(GDPR, ISO, SEBI 등)을 관리하고 감사를 추적할 수 있도록 지원합니다.",
    gdpr_17: "GDPR 17조(삭제권 / '잊힐 권리')는 특정 상황에서 부당한 지체 없이 개인 데이터를 삭제하도록 조직에 요구합니다.",
    default: "저는 데모 AI입니다. 이 웹사이트(ReguTrack) 또는 'GDPR 17조'에 대해 질문해 보세요."
  },
  'it': {
    greeting: "Ciao! Sono la tua IA per la conformità. Come posso aiutarti oggi?",
    about: "ReguTrack è un sistema aziendale per il monitoraggio della conformità normativa. Aiuta le organizzazioni a gestire le regole di conformità (come GDPR, ISO, SEBI) e a tenere traccia degli audit in tempo reale.",
    gdpr_17: "L'articolo 17 del GDPR (Diritto alla cancellazione / 'Diritto all'oblio') impone alle organizzazioni di cancellare i dati personali senza ingiustificato ritardo in circostanze specifiche.",
    default: "Sono un'IA dimostrativa. Puoi fare domande su questo sito web (ReguTrack) o sull'articolo 17 del GDPR."
  },
  'nl': {
    greeting: "Hallo! Ik ben uw compliance AI. Hoe kan ik u vandaag helpen?",
    about: "ReguTrack is een enterprise-grade Regulatory Compliance Tracking System. Het helpt organisaties bij het beheren van nalevingsregels (zoals AVG, ISO, SEBI) en het in realtime volgen van audits.",
    gdpr_17: "Artikel 17 van de AVG (Recht op gegevenswissing / 'Recht om vergeten te worden') vereist dat organisaties persoonlijke gegevens zonder onnodige vertraging in specifieke omstandigheden verwijderen.",
    default: "Ik ben een demo AI. U kunt vragen stellen over deze website (ReguTrack) of Artikel 17 van de AVG."
  },
  'sv': {
    greeting: "Hej! Jag är din AI för efterlevnad. Hur kan jag hjälpa dig idag?",
    about: "ReguTrack är ett spårningssystem för regelefterlevnad på företagsnivå. Det hjälper organisationer att hantera efterlevnadsregler (som GDPR, ISO, SEBI) och spåra revisioner i realtid.",
    gdpr_17: "Artikel 17 i GDPR (Rätt till radering / 'Rätten att bli bortglömd') kräver att organisationer raderar personuppgifter utan onödigt dröjsmål under specifika omständigheter.",
    default: "Jag är en demo-AI. Du kan fråga om denna webbplats (ReguTrack) eller Artikel 17 i GDPR."
  },
  'id': {
    greeting: "Halo! Saya AI Kepatuhan Anda. Bagaimana saya bisa membantu Anda hari ini?",
    about: "ReguTrack adalah Sistem Pelacakan Kepatuhan Regulasi tingkat perusahaan. Ini membantu organisasi mengelola aturan kepatuhan (seperti GDPR, ISO, SEBI), melacak audit, dan memantau skor risiko dalam waktu nyata.",
    gdpr_17: "Pasal 17 GDPR (Hak untuk Dihapus / 'Hak untuk Dilupakan') mengharuskan organisasi untuk menghapus data pribadi tanpa penundaan yang tidak semestinya dalam keadaan tertentu.",
    default: "Saya adalah AI demo. Anda dapat bertanya tentang situs web ini (ReguTrack) atau Pasal 17 GDPR."
  },
  'en-uk': {
    greeting: "Hello! I am your Compliance AI. How can I assist you with regulations today, mate?",
    about: "ReguTrack is an enterprise-grade Regulatory Compliance Tracking System. It helps organisations manage compliance rules (like GDPR, ISO, SEBI), track audits, manage evidence, and monitor risk scores in real-time.",
    gdpr_17: "Article 17 of GDPR (Right to Erasure / 'Right to be Forgotten') requires organisations to delete personal data without undue delay under specific circumstances.",
    default: "I'm a demo AI. In a production environment, I would search the compliance database. Try asking 'What is this website about?' or about 'Article 17 of GDPR'!"
  }
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'mr', label: '🇮🇳 Marathi' },
  { code: 'zh', label: '🇨🇳 Chinese' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'pt', label: '🇵🇹 Portuguese' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'nl', label: '🇳🇱 Dutch' },
  { code: 'sv', label: '🇸🇪 Swedish' },
  { code: 'en-uk', label: '🇬🇧 United Kingdom' },
  { code: 'id', label: '🇮🇩 Indonesian' }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([{ sender: 'ai', text: RESPONSES.en.greeting }]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    setMessages([{ sender: 'ai', text: RESPONSES[newLang].greeting }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    try {
      const { response } = await sendChatMessage({ message: userMsg, lang });
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I am having trouble connecting to the server. Please try again later." }]);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 30, right: 30, zIndex: 999,
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 30, right: 30, zIndex: 1000,
          width: 380, height: 500, borderRadius: 16,
          background: 'var(--modal-bg)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(99,102,241,0.1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeUp 0.3s ease'
        }}>
          <div style={{
            padding: '16px 20px', background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(99,102,241,0.15)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Compliance AI</div>
                <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Online
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select 
                value={lang} onChange={handleLangChange}
                style={{
                  background: 'var(--input-bg)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  padding: '4px 8px', fontSize: 12, outline: 'none', maxWidth: 120
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              
              <button onClick={() => setIsOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4
              }}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{
            flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row', gap: 10
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: m.sender === 'user' ? 'var(--input-bg)' : 'rgba(99,102,241,0.15)',
                  color: m.sender === 'user' ? 'var(--text-muted)' : 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                  background: m.sender === 'user' ? 'var(--accent)' : 'var(--glass)',
                  color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                  maxWidth: '75%'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{
            padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10
          }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a compliance question..." 
              style={{
                flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border2)',
                borderRadius: 99, padding: '10px 16px', color: 'var(--text-primary)',
                fontSize: 13.5, outline: 'none'
              }}
            />
            <button type="submit" style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
