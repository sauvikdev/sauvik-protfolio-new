import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  User, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  RotateCcw, 
  Languages, 
  Volume2, 
  Paperclip, 
  Sparkles, 
  MessageSquare, 
  ArrowLeft, 
  ArrowRight,
  Sun,
  Moon,
  Code2,
  FileText,
  Calculator,
  Compass,
  Lightbulb,
  CheckCircle2,
  History,
  FileUp,
  XSquare,
  VolumeX,
  Download
} from 'lucide-react';
import { useLanguage } from '../App';
import { useToast } from './Toast';
import { jsPDF } from 'jspdf';

// --- Types & Interfaces ---
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  detectedLang?: 'en' | 'bn';
  hasCode?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  titleBn: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

interface SauvikAIProps {
  isDark: boolean;
  toggleTheme: () => void;
}

// System filters to censor ChatGPT / Gemini / Claude references and rewrite them to SauvikAI
const filterBrandNames = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/gemini/gi, 'SauvikAI')
    .replace(/openai/gi, 'SauvikAI')
    .replace(/chatgpt/gi, 'SauvikAI')
    .replace(/claude/gi, 'SauvikAI')
    .replace(/google/gi, 'Sauvik')
    .replace(/microsoft/gi, 'SauvikAI');
};

// Auto detect language: Bengali (script or Romanized Banglish) vs English
const detectLanguage = (text: string): 'en' | 'bn' => {
  if (!text) return 'en';
  
  // 1. Detect actual Bengali script range
  const bengaliRegex = /[\u0980-\u09FF]/;
  if (bengaliRegex.test(text)) {
    return 'bn';
  }

  // 2. Detect Banglish (Romanized Bengali) by checking for common Banglish keywords
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalized.split(/\s+/);
  
  const banglishWords = new Set([
    'ami', 'tumi', 'apni', 'kemon', 'acho', 'asen', 'bhalo', 'valobashi', 'amar', 'apnar',
    'bca', 'pori', 'pore', 'kori', 'kore', 'korbo', 'banate', 'banabo', 'koto', 'khoroch', 
    'jonno', 'korte', 'parbo', 'parben', 'shathe', 'sathe', 'ki', 'bhai', 'bro', 'vai',
    'hoy', 'hobe', 'hoise', 'koris', 'khabar', 'khabo', 'cha', 'khai', 'kothay', 'kew',
    'shob', 'sob', 'shundor', 'sundor', 'khub', 'darun', 'goolo', 'gulo', 'gula', 'baje',
    'khuji', 'khujtesi', 'ashbo', 'ashun', 'ashis', 'jai', 'jabo', 'jaben', 'thako', 'thaken',
    'pora', 'khoj', 'ekta', 'duyto', 'tinto', 'kaj', 'kaaj', 'dhaka', 'bengali', 'bangla',
    'bhalobasi', 'korchen', 'koren', 'kar', 'karo', 'chai', 'idea', 'dao', 'kemon'
  ]);

  const matchCount = words.filter(word => banglishWords.has(word)).length;
  // If there's at least one match of a classic Banglish word, treat it as Bengali
  if (matchCount > 0) {
    return 'bn';
  }

  return 'en';
};

// Comprehensive custom markdown & code block renderer
const MessageContentRenderer: React.FC<{ text: string; isUser?: boolean; isDark?: boolean }> = ({ text, isUser = false, isDark = true }) => {
  const { showToast } = useToast();
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(blockId);
    showToast('Code copied successfully!', 'success');
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Safe censor filter
  const cleanedText = filterBrandNames(text);

  // Divide the text into code blocks and normal paragraphs
  const tokens = cleanedText.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-sm antialiased break-words max-w-full">
      {tokens.map((token, index) => {
        if (token.startsWith('```') && token.endsWith('```')) {
          // It is a code block
          const lines = token.slice(3, -3).trim().split('\n');
          let language = 'code';
          let codeContent = lines.join('\n');

          if (lines.length > 0 && lines[0].length < 15 && !lines[0].includes(' ')) {
            language = lines[0];
            codeContent = lines.slice(1).join('\n');
          }

          const blockId = `block-${index}`;

          return (
            <div key={index} className="my-4 rounded-xl border border-glass-border overflow-hidden bg-[#0d0d14] text-left font-mono text-xs max-w-full shadow-lg">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-white/5 to-white/0 border-b border-white/10">
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{language}</span>
                <button
                  onClick={() => handleCopyCode(codeContent, blockId)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold text-neutral-300 transition-all cursor-pointer border border-white/5 hover:border-brand-blue/30"
                >
                  {copiedCodeId === blockId ? (
                    <>
                      <Check size={11} className="text-brand-blue" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="text-neutral-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto select-text scrollbar-thin text-neutral-200 leading-normal max-w-full block">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Inline formatting markdown approximation (bold, list items, headers)
        const formatParagraph = (paragraphText: string) => {
          // Replace headers `# Heading` -> Title
          if (paragraphText.startsWith('#')) {
            const level = (paragraphText.match(/^#+/) || ['#'])[0].length;
            const headingContent = paragraphText.replace(/^#+\s*/, '');
            const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base'];
            const size = sizes[Math.min(level - 1, 3)];

            // Adaptive heading color
            let headingsClass = 'text-slate-900';
            if (isUser) {
              headingsClass = 'text-neutral-50';
            } else if (isDark) {
              headingsClass = 'text-neutral-100';
            }

            return <h4 className={`${size} font-bold my-3 mb-2 tracking-tight ${headingsClass}`}>{headingContent}</h4>;
          }

          // Format custom bold tokens `**bold**` -> tags
          const boldTokens = paragraphText.split(/(\*\*.*?\*\*)/g);

          // Adaptive paragraph & bold style
          let pClass = isDark ? 'text-neutral-200 font-light' : 'text-slate-800 font-normal';
          let boldClass = isDark ? 'text-neutral-50 font-bold' : 'text-slate-950 font-bold';

          if (isUser) {
            pClass = 'text-neutral-100 font-light';
            boldClass = 'text-neutral-50 font-extrabold';
          }

          return (
            <p className={`whitespace-pre-line leading-relaxed text-sm ${pClass}`}>
              {boldTokens.map((btoken, bIdx) => {
                if (btoken.startsWith('**') && btoken.endsWith('**')) {
                  return <strong key={bIdx} className={boldClass}>{btoken.slice(2, -2)}</strong>;
                }
                // Handle inline code `code` -> tags
                const inlineCodeTokens = btoken.split(/(`.*?`)/g);
                return inlineCodeTokens.map((icToken, icIdx) => {
                  if (icToken.startsWith('`') && icToken.endsWith('`')) {
                    // Safe styling for inline code
                    let codeBgBorderText = '';
                    if (isUser) {
                      codeBgBorderText = 'bg-black/30 border-white/10 text-neutral-100';
                    } else if (isDark) {
                      codeBgBorderText = 'bg-white/10 border-white/5 text-brand-blue';
                    } else {
                      codeBgBorderText = 'bg-slate-100 border-slate-200/50 text-indigo-700';
                    }

                    return <code key={icIdx} className={`px-1.5 py-0.5 rounded text-[11px] font-mono border ${codeBgBorderText}`}>{icToken.slice(1, -1)}</code>;
                  }
                  return icToken;
                });
              })}
            </p>
          );
        };

        const listLines = token.split('\n');
        return (
          <div key={index} className="space-y-2">
            {listLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex gap-2.5 items-start pl-2 text-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2 shrink-0" />
                    <div className="flex-1">{formatParagraph(trimmed.slice(2))}</div>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s(.*)/);
                const num = match ? match[1] : '';
                const content = match ? match[2] : trimmed;
                return (
                  <div key={lIdx} className="flex gap-2 items-start pl-2 text-left">
                    <span className="text-brand-purple font-mono text-[11px] font-bold shrink-0 mt-0.5">{num}.</span>
                    <div className="flex-1">{formatParagraph(content)}</div>
                  </div>
                );
              }
              return (
                <div key={lIdx}>
                  {formatParagraph(line)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// --- MAIN SAUVIKAI SECTION CONTAINER ---
export const SauvikAISection = ({ isDark, toggleTheme }: SauvikAIProps) => {
  const { lang, setLang } = useLanguage();
  const { showToast } = useToast();

  // Fullscreen view toggle
  const [showWorkspace, setShowWorkspace] = useState(false);
  // Sidebar expand collapsible (Mobile specific)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Chat cabinet floating sidebar toggle
  const [showFloatingCabinet, setShowFloatingCabinet] = useState(false);

  // Manual language setting: 'auto' | 'en' | 'bn'
  const [selectedLangMode, setSelectedLangMode] = useState<'auto' | 'en' | 'bn'>('auto');

  // Multi-chat core storage
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  
  // Single inputs & loading states
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');

  // Audio / voice feedback simulations
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [pulseWaveform, setPulseWaveform] = useState<number[]>([]);

  // Local File attachment state
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; content: string } | null>(null);

  // UI elements controllers
  const chatEndWsRef = useRef<HTMLDivElement>(null);
  const chatEndFloatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputFloatRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Localization strings dictionaries
  const localizations = {
    en: {
      section_title: 'SauvikAI WORKSPACE',
      section_subtitle: 'A fully functional premium AI SaaS portal. General reasoning, code synthesis, math explanations, copywriting, and instant language compilation right at your fingertips.',
      floating_title: 'SauvikAI Companion',
      launch_btn: 'Launch AI Workspace',
      choose_lang: 'Language Strategy',
      lang_auto: 'Auto Detect',
      lang_en: 'English (US)',
      lang_bn: 'বাংলা (Bengali)',
      new_chat: 'New Chat',
      search: 'Search chat threads...',
      recent: 'Recent Chats',
      empty_title: 'Welcome to SauvikAI Workspace',
      placeholder: 'Type your prompt here...',
      welcome: "Hello, I'm SauvikAI. How can I help you today?",
      capability_title: 'Select a Core Capability',
      cap_web: 'Web Development',
      cap_web_desc: 'Receive pixel-perfect solutions in React, Tailwind, & Vite.',
      cap_code: 'Code Assistant',
      cap_code_desc: 'HTML, JS, Python, C++, Java, PHP debugging with ease.',
      cap_copy: 'SaaS Copywriter',
      cap_copy_desc: 'Synthesize blogs, resumes, emails and career outlines.',
      cap_math: 'Math & Sciences',
      cap_math_desc: 'Submit complex equations and logical algorithms.',
      prompt_1: 'Create a website',
      prompt_2: 'Write code',
      prompt_3: 'Solve a math problem',
      prompt_4: 'Generate content',
      prompt_5: 'Explain a topic',
      voice_active: 'Listening to speech...',
      voice_end: 'Simulating speech parsing...',
      voice_unsupported: 'Microphone permission restricted or speech API limits in this preview.',
      file_read_success: 'File successfully parsed! Content attached to buffer.',
      back_port: 'Back to page',
      sidebar_hide: 'Hide sidebar',
      sidebar_show: 'Show history',
      regenerate: 'Regenerate',
      copy: 'Copy Response',
      drag_n_drop: 'Click to upload files (.txt, .js, .py, .html)',
      clear_history: 'Clear History',
      active_thread: 'Active Thread',
      copy_success: 'Copied!',
      file_uploaded: 'File attached: ',
      download_conversation: 'Download PDF',
      download_success: 'PDF downloaded successfully!'
    },
    bn: {
      section_title: 'SauvikAI ওয়ার্কস্পেস',
      section_subtitle: 'সম্পূর্ণ প্রফেশনাল এআই সাশ (SaaS) পোর্টাল। যেকোনো জটিল কোডিং সমস্যা সমাধান, গণিত সমাধান, অনুবাদ এবং কনটেন্ট তৈরির সুবিধা এখন এক ক্লিকে।',
      floating_title: 'SauvikAI কম্প্যানিয়ন',
      launch_btn: 'এআই ওয়ার্কস্পেস চালু করুন',
      choose_lang: 'ভাষা নির্বাচন',
      lang_auto: 'অটো ডিটেক্ট',
      lang_en: 'ইংরেজি (English)',
      lang_bn: 'বাংলা (Bengali)',
      new_chat: 'নতুন চ্যাট শুরু',
      search: 'চ্যাট হিস্টোরি খুঁজুন...',
      recent: 'সাম্প্রতিক চ্যাটসমূহ',
      empty_title: 'SauvikAI ওয়ার্কস্পেসে স্বাগতম',
      placeholder: 'আপনার প্রশ্নটি এখানে লিখুন...',
      welcome: 'হ্যালো, আমি SauvikAI। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      capability_title: 'একটি ক্যাটাগরি বেছে নিন',
      cap_web: 'ওয়েব ডেভেলপমেন্ট',
      cap_web_desc: 'রিঅ্যাক্ট, টেলউইন্ড সিএসএস এবং ভাইটের নিখুঁত প্রফেশনাল সমাধান।',
      cap_code: 'কোডিং অ্যাসিস্ট্যান্ট',
      cap_code_desc: 'HTML, JS, Python, C++, Java, PHP কোড ডিবাগ এবং রাইটিং।',
      cap_copy: 'কপিরাইটিং উইজার্ড',
      cap_copy_desc: 'চমৎকার ব্লগ পোস্ট, চমৎকার রিজিউম, ইমেল এবং ক্যারিয়ার পরামর্শ।',
      cap_math: 'গণিত ও বিজ্ঞান',
      cap_math_desc: 'কঠিন গাণিতিক সূত্রাবলী ও অ্যালগরিদম ব্যাখ্যা ও বিশ্লেষণ।',
      prompt_1: 'একটি ওয়েবসাইট তৈরি করুন',
      prompt_2: 'কোড লিখে দিন',
      prompt_3: 'একটি গণিত সমস্যা সমাধান করুন',
      prompt_4: 'কনটেন্ট তৈরি করুন',
      prompt_5: 'একটি বিষয় ব্যাখ্যা করুন',
      voice_active: 'ভয়েস শুনছি...',
      voice_end: 'ভয়েস বিশ্লেষণ করা হচ্ছে...',
      voice_unsupported: 'আইফ্রেম বা প্রিভিউতে মাইক্রোফোন ব্যবহারে সীমাবদ্ধতা রয়েছে।',
      file_read_success: 'ফাইলটি সফলভাবে বিশ্লেষণ করা হয়েছে এবং যুক্ত করা হয়েছে!',
      back_port: 'মূল পেজে ফিরুন',
      sidebar_hide: 'ইতিহাস লুকান',
      sidebar_show: 'হিস্টোরি দেখান',
      regenerate: 'আবার তৈরি করুন',
      copy: 'কপি করুন',
      drag_n_drop: 'ফাইল সংযুক্ত করতে ক্লিক করুন (.txt, .js, .py, .html)',
      clear_history: 'হিস্টোরি পরিষ্কার করুন',
      active_thread: 'সক্রিয় চ্যাট',
      copy_success: 'কপি করা হয়েছে!',
      file_uploaded: 'ফাইল সংযুক্ত করা হয়েছে: ',
      download_conversation: 'পিডিএফ ডাউনলোড করুন',
      download_success: 'পিডিএফ সফলভাবে ডাউনলোড করা হয়েছে!'
    }
  };

  // Safe localized text extractor
  const getLoc = (key: keyof typeof localizations['en']): string => {
    const currentActiveLang: 'en' | 'bn' = selectedLangMode === 'auto'
      ? (lang === 'bn' ? 'bn' : 'en')
      : (selectedLangMode === 'bn' ? 'bn' : 'en');
    return localizations[currentActiveLang][key] || localizations['en'][key];
  };

  // --- Initialize Storage ---
  useEffect(() => {
    const storedThreads = localStorage.getItem('sauvik_ai_threads');
    if (storedThreads) {
      try {
        const parsed = JSON.parse(storedThreads);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      } catch (err) {
        console.error('Error parsing stored threads:', err);
      }
    }

    // Default thread initializer
    const defaultThreadId = `thread-${Date.now()}`;
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'bot',
      text: lang === 'bn' 
        ? "হ্যালো, আমি SauvikAI। আমি আপনার সব প্রশ্নের নিখুঁত উত্তর দিতে পারি। আজ আপনাকে কী সাহায্য করব? আপনি চাইলে গণিত সমাধান, কোড ডিবাগিং বা ক্রিয়েটিভ রাইটিং করাতে পারেন।"
        : "Hello! I'm SauvikAI, your dedicated intelligence workspace. I specialize in coding, dynamic math explanations, automated service recommendations, and custom copywriting. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const defaultThread: ChatThread = {
      id: defaultThreadId,
      title: 'First Chat Workspace',
      titleBn: 'প্রথম চ্যাট স্পেস',
      messages: [initialMsg],
      lastUpdated: new Date().toLocaleDateString()
    };

    setThreads([defaultThread]);
    setActiveThreadId(defaultThreadId);
  }, []);

  // Save changes to localStorage
  const saveThreadsToLocalStorage = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    localStorage.setItem('sauvik_ai_threads', JSON.stringify(updatedThreads));
  };

  // --- Auto Scroll Helpers ---
  useEffect(() => {
    if (showWorkspace) {
      chatEndWsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threads, isGenerating, showWorkspace, activeThreadId]);

  useEffect(() => {
    if (showFloatingCabinet) {
      chatEndFloatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threads, isGenerating, showFloatingCabinet, activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  // --- Create/Join Threads ---
  const handleCreateNewChat = () => {
    const freshId = `thread-${Date.now()}`;
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'bot',
      text: selectedLangMode === 'bn' || (selectedLangMode === 'auto' && lang === 'bn')
        ? "হ্যালো, আমি SauvikAI। একটি নতুন চ্যাট স্পেস শুরু হয়েছে। আমাকে যেকোনো কঠিন প্রশ্ন জিজ্ঞেস করুন!"
        : "Hello, I'm SauvikAI. A brand-new workspace has been started. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newThread: ChatThread = {
      id: freshId,
      title: `Workspace ${threads.length + 1}`,
      titleBn: `চ্যাট স্পেস ${threads.length + 1}`,
      messages: [initialMsg],
      lastUpdated: new Date().toLocaleDateString()
    };

    const updated = [newThread, ...threads];
    saveThreadsToLocalStorage(updated);
    setActiveThreadId(freshId);
    showToast(lang === 'bn' ? 'নতুন চ্যাট শুরু হয়েছে!' : 'Created new chat thread!', 'success');
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const filtered = threads.filter(t => t.id !== threadId);
    
    if (filtered.length === 0) {
      // If deleting the last thread, recreate a clean starter thread
      const defaultThreadId = `thread-${Date.now()}`;
      const initialMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: lang === 'bn' 
          ? "হ্যালো, আমি SauvikAI। আমি আপনার সব প্রশ্নের নিখুঁত উত্তর দিতে পারি। আজ আপনাকে কী সাহায্য করব? আপনি চাইলে গণিত সমাধান, কোড ডিবাগিং বা ক্রিয়েটিভ রাইটিং করাতে পারেন।"
          : "Hello! I'm SauvikAI, your dedicated intelligence workspace. I specialize in coding, dynamic math explanations, automated service recommendations, and custom copywriting. Ask me anything!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const defaultThread: ChatThread = {
        id: defaultThreadId,
        title: 'First Chat Workspace',
        titleBn: 'প্রথম চ্যাট স্পেস',
        messages: [initialMsg],
        lastUpdated: new Date().toLocaleDateString()
      };

      saveThreadsToLocalStorage([defaultThread]);
      setActiveThreadId(defaultThreadId);
      showToast(lang === 'bn' ? 'সকল চ্যাট ডিটেইলস মুছে একটি নতুন স্পেস শুরু করা হয়েছে!' : 'Workspace cleared and reset to fresh chat!', 'success');
      return;
    }

    saveThreadsToLocalStorage(filtered);
    if (activeThreadId === threadId) {
      setActiveThreadId(filtered[0].id);
    }
    showToast(lang === 'bn' ? 'সফলভাবে চ্যাটটি মোছা হয়েছে' : 'Thread deleted successfully!', 'success');
  };

  // --- Send Message Processing ---
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || currentInput).trim();
    if (!promptToSend && !attachedFile) return;

    // Clear buffer inputs
    setCurrentInput('');

    // Append file if present
    let finalPrompt = promptToSend;
    let userMessageTextToShow = promptToSend;

    if (attachedFile) {
      finalPrompt += `\n\n[Parsed Attached File: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\``;
      userMessageTextToShow = promptToSend 
        ? `${promptToSend}\n📎 [Attached: ${attachedFile.name}]` 
        : `📎 Attached file: ${attachedFile.name}`;
      setAttachedFile(null); // Reset attachment state
    }

    // Determine Language preference
    const detected = detectLanguage(promptToSend);
    let langInstruction = '';

    if (selectedLangMode === 'en') {
      langInstruction = "\n\n(STRICT LANGUAGE RULE - ENFORCE ENGLISH: Respond entirely in fluent, professional English. Do not include Bengali letters or script under any circumstances.)";
    } else if (selectedLangMode === 'bn') {
      langInstruction = "\n\n(STRICT LANGUAGE RULE - ENFORCE BENGALI: Respond entirely in proper, natural, and fluent Bengali script (বাংলা লিপি). If the user input is in Banglish (Romanized Bengali using Latin alphabet), map it internally to proper Bengali meaning, and output the reply in gorgeous Bengali script. NEVER reply in Banglish letters. NEVER use broken Bengali.)";
    } else {
      // Auto detect
      if (detected === 'bn') {
        langInstruction = "\n\n(STRICT LANGUAGE RULE - AUTO-DETECTED BENGALI/BANGLISH: You have detected Bengali script or Banglish (Romanized Bengali, e.g., 'ami website banate chai'). Map/convert the meaning internally to correct Bengali, and always reply entirely in proper, natural, fluent Bengali script (বাংলা লিপি). NEVER reply in Banglish letters. Do not mix English and Bengali unnecessarily. NEVER use broken Bengali.)";
      } else {
        langInstruction = "\n\n(STRICT LANGUAGE RULE - AUTO-DETECTED ENGLISH: You have detected English. Respond entirely in professional English. Do not switch languages or use Bengali script unless explicitly requested.)";
      }
    }

    // Appending strict instructions regarding the assistant's name "SauvikAI"
    const strictNameInstruction = "\n\n(Strict constraints:\n1. Your name is SauvikAI. Never refer to yourself as Gemini, Claude, ChatGPT, OpenAI, or Google. You were beautifully crafted by Sauvik Das.\n2. NO PHONE NUMBERS: You must NEVER output any phone numbers, telephone numbers, contact numbers, or WhatsApp numbers under any circumstances. If requested or needed, provide strictly Sauvik's business email: 'sauvikd68@gmail.com' or his social coordinate: Instagram '@sauvikdev.in'. Absolutely no digits resembling a phone number are permitted.)";

    const apiPrompt = finalPrompt + langInstruction + strictNameInstruction;

    // Generate fresh message ID
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userMessageTextToShow,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detectedLang: detected
    };

    // Keep state updated immediately
    const updatedMessages = [...(activeThread?.messages || []), userMsg];
    
    // Auto rename thread title if it's default
    let newTitle = activeThread?.title || 'Workspace';
    let newTitleBn = activeThread?.titleBn || 'চ্যাট স্পেস';

    if (activeThread?.messages.length <= 1) {
      newTitle = promptToSend.substring(0, 24) + (promptToSend.length > 24 ? '...' : '');
      newTitleBn = promptToSend.substring(0, 24) + (promptToSend.length > 24 ? '...' : '');
    }

    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: newTitle,
          titleBn: newTitleBn,
          messages: updatedMessages,
          lastUpdated: new Date().toLocaleDateString()
        };
      }
      return t;
    });

    saveThreadsToLocalStorage(updatedThreads);
    setIsGenerating(true);

    // Call /api/ai/chatbot route with client-side retry loop and intelligent error recovery
    let responseText = '';
    let apiSuccess = false;
    const clientMaxRetries = 3;

    for (let clientAttempt = 1; clientAttempt <= clientMaxRetries; clientAttempt++) {
      try {
        console.log(`[Client Chatbot] Dispatching request - Attempt ${clientAttempt}/${clientMaxRetries}`);
        const chatHistoryForAPI = updatedMessages.map(m => ({
          sender: m.sender,
          text: m.text
        }));

        const res = await fetch('/api/ai/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: apiPrompt,
            history: chatHistoryForAPI
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.success && data.text) {
          responseText = data.text;
          apiSuccess = true;
          break; // Exit retry loop on success!
        } else {
          throw new Error(data.error || 'Server responded with success: false');
        }
      } catch (err: any) {
        console.error(`[Client Chatbot] Request attempt ${clientAttempt} failed:`, err);
        if (clientAttempt < clientMaxRetries) {
          const delay = 1000 * clientAttempt;
          console.log(`[Client Chatbot] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`[Client Chatbot] All ${clientMaxRetries} client-side retry attempts failed.`);
        }
      }
    }

    try {
      if (apiSuccess && responseText) {
        const censoredResponse = filterBrandNames(responseText);
        
        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: censoredResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasCode: censoredResponse.includes('```')
        };

        const postBotThreads = updatedThreads.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...updatedMessages, botMsg]
            };
          }
          return t;
        });
        saveThreadsToLocalStorage(postBotThreads);
      } else {
        // Fallback response mock for demo/offline setups ONLY after all retry attempts fail
        const offlineIsBengali = selectedLangMode === 'bn' || (selectedLangMode === 'auto' && detected === 'bn');
        const fallbackText = offlineIsBengali
          ? `আমি অত্যন্ত দুঃখিত, এই মুহূর্তে ব্যাকএন্ড সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। কিন্তু আমি আপনাকে সাহায্য করার জন্য সবসময় প্রস্তুত। আপনি অনুগ্রহ করে মেইল করতে পারেন sauvikd68@gmail.com ঠিকানায়!`
          : `I apologize, but my backend cloud gateway is temporarily experiencing high volumes. Please copy your query or reach out to Sauvik directly at sauvikd68@gmail.com. I'm always at your service!`;

        const botMsg: ChatMessage = {
          id: `msg-bot-err-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const postBotThreads = updatedThreads.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...updatedMessages, botMsg]
            };
          }
          return t;
        });
        saveThreadsToLocalStorage(postBotThreads);
      }
    } catch (innerErr) {
      console.error('Failure saving state:', innerErr);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Regenerate Last Agent Reply ---
  const handleRegenerateResponse = () => {
    if (!activeThread || activeThread.messages.length < 2 || isGenerating) return;

    // Remove last model message
    const msgs = [...activeThread.messages];
    const lastMsg = msgs[msgs.length - 1];
    
    if (lastMsg.sender === 'bot') {
      msgs.pop(); // Remove bot message
    }

    const lastUserMsg = msgs[msgs.length - 1];
    if (lastUserMsg && lastUserMsg.sender === 'user') {
      const restThreads = threads.map(t => {
        if (t.id === activeThreadId) {
          return { ...t, messages: msgs };
        }
        return t;
      });
      // Set the threads and re-send utilizing user prompt
      setThreads(restThreads);
      handleSendMessage(lastUserMsg.text);
    }
  };

  // --- Toggle language, persist preference in localStorage and update general app language context ---
  const handleLangToggle = (newLang: 'en' | 'bn') => {
    setLang(newLang);
    setSelectedLangMode(newLang);
    localStorage.setItem('portfolio_lang', newLang);
    showToast(
      newLang === 'bn'
        ? 'বাংলা ভাষা নির্বাচন করা হয়েছে'
        : 'English language selected',
      'success'
    );
  };

  // --- Download Current Conversation History ---
  const handleDownloadConversation = () => {
    if (!activeThread || !activeThread.messages || activeThread.messages.length === 0) {
      showToast(lang === 'bn' ? 'ডাউনলোড করার মত কোনো মেসেজ নেই!' : 'No messages to download!', 'warning');
      return;
    }

    const currentActiveLang: 'en' | 'bn' = selectedLangMode === 'auto'
      ? (lang === 'bn' ? 'bn' : 'en')
      : (selectedLangMode === 'bn' ? 'bn' : 'en');

    const threadTitle = currentActiveLang === 'bn' ? activeThread.titleBn : activeThread.title;

    // Check if there is any Bengali script in the messages or title.
    // Standard PDF-14 fonts like Helvetica do not support Bengali Unicode glyphs natively.
    // If Bengali is found, we fall back to a beautifully formatted Markdown download to prevent text corruption.
    let hasBengali = /[\u0980-\u09FF]/.test(threadTitle);
    if (!hasBengali) {
      for (const m of activeThread.messages) {
        if (/[\u0980-\u09FF]/.test(m.text || '')) {
          hasBengali = true;
          break;
        }
      }
    }

    if (hasBengali) {
      // Elegant Markdown fallback for Bengali to support direct Unicode rendering perfectly.
      let markdown = `# SauvikAI Conversation: ${threadTitle}\n`;
      markdown += `*Date: ${activeThread.lastUpdated || new Date().toLocaleString()}*\n`;
      markdown += `*Language: Bengali/Multi-language*\n\n`;
      markdown += `---\n\n`;

      activeThread.messages.forEach((m) => {
        const senderName = m.sender === 'user' ? (currentActiveLang === 'bn' ? 'ব্যবহারকারী' : 'User') : 'SauvikAI';
        markdown += `### 👤 **${senderName}** *(${m.timestamp})*\n\n`;
        markdown += `${m.text}\n\n`;
        markdown += `---\n\n`;
      });

      markdown += `*Downloaded from Sauvik Das's Portfolio (sauvikdev.in)*\n`;

      try {
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const safeTitle = threadTitle
          .toLowerCase()
          .replace(/[^\w\u0980-\u09FF\s-]/g, '')
          .replace(/\s+/g, '-');
        
        link.setAttribute('download', `sauvikai-chat-${safeTitle || 'conversation'}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(
          lang === 'bn' 
            ? 'বাংলা অক্ষরের নির্ভুল উপস্থাপনের জন্য ডকুমেণ্টটি মার্কডাউন (.md) ফাইল হিসেবে ডাউনলোড হয়েছে।' 
            : 'Saved as Markdown to preserve Bengali text formatting correctly.', 
          'success'
        );
      } catch (err) {
        console.error('Error downloading conversation as md:', err);
        showToast(lang === 'bn' ? 'ডাউনলোড করতে সমস্যা হয়েছে!' : 'Failed to download conversation.', 'error');
      }
      return;
    }

    // PDF generation for standard English conversations
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      let yPos = 20;

      // Function to check and add new page
      const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.2);
          doc.line(margin, margin - 4, pageWidth - margin, margin - 4);
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`SauvikAI Chat Log - Topic: ${threadTitle}`, margin, margin - 6);
        }
      };

      // Title header banner
      doc.setFillColor(15, 23, 42); // deep slate/black bg
      doc.rect(margin, yPos, contentWidth, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('SauvikAI Conversation Transcript', margin + 8, yPos + 10);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(156, 163, 175);
      const dateStr = activeThread.lastUpdated || new Date().toLocaleString();
      doc.text(`Date: ${dateStr}  |  Language: English  |  Platform: sauvikdev.in`, margin + 8, yPos + 18);

      yPos += 36;

      // Topic header section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      const titleLines = doc.splitTextToSize(`Topic: ${threadTitle}`, contentWidth);
      titleLines.forEach((line: string) => {
        checkPageBreak(8);
        doc.text(line, margin, yPos);
        yPos += 6;
      });

      yPos += 4;

      // Thread messages
      activeThread.messages.forEach((m) => {
        const isUser = m.sender === 'user';
        const senderLabel = isUser ? 'USER' : 'SAUVIKAI';

        // Pre-split text to calculate exact block height
        const splitText = doc.splitTextToSize(m.text || '', contentWidth - 14);
        const textHeight = splitText.length * 5;
        const blockHeight = textHeight + 14;

        checkPageBreak(blockHeight);

        // draw background box for each chat message
        if (isUser) {
          doc.setFillColor(248, 250, 252); // soft cool grey/blue
          doc.setDrawColor(226, 232, 240);
        } else {
          doc.setFillColor(244, 244, 249); // clear tint violet
          doc.setDrawColor(224, 224, 235);
        }

        doc.rect(margin, yPos, contentWidth, blockHeight, 'FD');

        // Draw Sender Indicator & Timestamp
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        if (isUser) {
          doc.setTextColor(37, 99, 235); // Blue Accent
        } else {
          doc.setTextColor(124, 58, 237); // Purple Accent
        }
        doc.text(senderLabel, margin + 6, yPos + 6);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(156, 163, 175);
        const nameWidth = doc.getTextWidth(senderLabel);
        doc.text(`(${m.timestamp})`, margin + 9 + nameWidth, yPos + 6);

        // Print message text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);

        let lineY = yPos + 11.5;
        splitText.forEach((line: string) => {
          doc.text(line, margin + 6, lineY);
          lineY += 5;
        });

        // Add padding space below msg block
        yPos += blockHeight + 6;
      });

      // Signature/Footer area
      checkPageBreak(15);
      yPos += 2;
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      yPos += 6;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text('This document was dynamically compiled and exported from Sauvik Das\'s interactive AI companion at sauvikdev.in', margin, yPos);

      // Save PDF file
      const safeTitle = threadTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      doc.save(`sauvikai-chat-${safeTitle || 'conversation'}.pdf`);
      showToast(getLoc('download_success'), 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast(lang === 'bn' ? 'পিডিএফ তৈরি করতে অক্ষম!' : 'Failed to compile PDF document.', 'error');
    }
  };

  // --- Local File Attachment Handler ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['txt', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'html', 'css', 'json', 'md'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(fileExt)) {
      showToast(lang === 'bn' ? 'শুধুমাত্র টেক্সট বা কোডিং ফাইল সাপোর্ট করে!' : 'Please upload only supported developer files.', 'warning');
      return;
    }

    if (file.size > 250 * 1024) { // 250KB limit
      showToast(lang === 'bn' ? 'ফাইলের সাইজ ২৫০কেবির চেয়ে কম হতে হবে।' : 'File is too large! Maximum limit is 250KB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        size: file.size,
        content: content
      });
      showToast(getLoc('file_read_success'), 'success');
    };
    reader.onerror = () => {
      showToast('Error reading selected file!', 'error');
    };
    reader.readAsText(file);
  };

  // --- Voice Input Web Speech API & Simulation Fallback ---
  const handleSimulateVoiceInput = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
      setIsVoiceListening(false);
      setPulseWaveform([]);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(lang === 'bn' ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না! ডেমো ভয়েস ইনপুট চালু করা হচ্ছে।' : 'Web Speech API is not supported in this browser. Running workspace simulation...', 'warning');
      runVoiceSimulation();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Detect language preference or selection
      if (selectedLangMode === 'bn') {
        rec.lang = 'bn-BD';
      } else if (selectedLangMode === 'en') {
        rec.lang = 'en-US';
      } else {
        // Auto detect: default to the current active locale selected on the app interface
        rec.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      }

      recognitionRef.current = rec;
      setIsVoiceListening(true);
      showToast(getLoc('voice_active'), 'success');

      // Trigger waveform visualization updates
      const timer = setInterval(() => {
        setPulseWaveform(Array.from({ length: 12 }, () => Math.random() * 28 + 10));
      }, 100);

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setCurrentInput(resultText);
          showToast(lang === 'bn' ? 'ভয়েস সফলভাবে সনাক্ত হয়েছে!' : 'Voice processed successfully!', 'success');
        }
      };

      rec.onend = () => {
        clearInterval(timer);
        setIsVoiceListening(false);
        setPulseWaveform([]);
        recognitionRef.current = null;
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        clearInterval(timer);
        setIsVoiceListening(false);
        setPulseWaveform([]);
        recognitionRef.current = null;

        if (event.error === 'not-allowed') {
          showToast(getLoc('voice_unsupported'), 'error');
        } else {
          showToast(lang === 'bn' ? 'ভয়েস ক্যাপচারে ত্রুটি! কোডিং সিমুলেশন চালু করা হচ্ছে...' : 'Speech recognition error. Reverting to voice simulation...', 'warning');
          runVoiceSimulation();
        }
      };

      rec.start();

    } catch (e) {
      console.error('Speech recognition failed to initialize:', e);
      runVoiceSimulation();
    }
  };

  const runVoiceSimulation = () => {
    setIsVoiceListening(true);
    showToast(getLoc('voice_active'), 'success');

    // Trigger waveform visualization updates
    const timer = setInterval(() => {
      setPulseWaveform(Array.from({ length: 12 }, () => Math.random() * 28 + 10));
    }, 120);

    // After 3.5 seconds simulate voice matched output
    setTimeout(() => {
      clearInterval(timer);
      setIsVoiceListening(false);
      setPulseWaveform([]);

      const voiceSamplesEn = [
        "Create a fully customized personal contact form using React and Tailwind CSS",
        "Solve this math problem: What is the derivative of x^2 * sin(x)?",
        "Can you suggest a cinematic editing concept for a premium travel vlog show?",
        "Translate the following phrase to Bengali: Technology has revolutionized digital creation.",
        "How do I optimize a Vite application for maximum SEO speeds?"
      ];

      const voiceSamplesBn = [
        "একটি অত্যাধুনিক গ্লাস মরফিজম কার্ড ডিজাইন কোড লিখে দাও",
        "ইউটিউব ভিডিও-র জন্য কন্টেন্ট রাইটিং লিখে দাও ক্যাটাগরি ট্রাভেল গাইড",
        "ওয়েবসাইট তৈরিতে Sauvik Das কেন পারফেক্ট চয়েস?",
        "একটি সুন্দর ক্যারিয়ার রোডম্যাপ এঁকে দিন"
      ];

      const selectedList = lang === 'bn' ? voiceSamplesBn : voiceSamplesEn;
      const parsedVoicePhrase = selectedList[Math.floor(Math.random() * selectedList.length)];
      
      setCurrentInput(parsedVoicePhrase);
      showToast(lang === 'bn' ? 'ভয়েস সফলভাবে সনাক্ত হয়েছে!' : 'Voice processed successfully!', 'success');
    }, 3800);
  };

  // Filter threads display based on search
  const filteredThreadsBySearch = threads.filter(t => {
    const term = searchHistoryQuery.toLowerCase();
    return t.title.toLowerCase().includes(term) || t.titleBn.toLowerCase().includes(term);
  });

  return (
    <>
      {/* 1. PORTFOLIO SHOWCASE SECTION */}
      <section id="sauvikai" className="py-24 bg-app-bg relative overflow-hidden text-[var(--text-primary)]">
        {/* Futuristic Grid & Circle Glow backgrounds */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-brand-purple/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-14"
          >
            <span className="text-brand-blue font-bold text-xs tracking-[0.3em] uppercase mb-4 block flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-brand-blue animate-pulse" />
              SAUVIK DIGITAL INTELLIGENCE
            </span>
            <h2 className={`text-4xl md:text-5xl font-thin mb-4 uppercase ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {getLoc('section_title')}{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                HUB
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-text-secondary text-sm font-light leading-relaxed">
              {getLoc('section_subtitle')}
            </p>
          </motion.div>

          {/* Core Feature Pillars cards matrix */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-left">
            {[
              {
                icon: <Code2 className="text-brand-blue" size={24} />,
                title: getLoc('cap_web'),
                desc: getLoc('cap_web_desc'),
                color: 'group-hover:border-brand-blue/40'
              },
              {
                icon: <FileText className="text-brand-purple" size={24} />,
                title: getLoc('cap_code'),
                desc: getLoc('cap_code_desc'),
                color: 'group-hover:border-brand-purple/40'
              },
              {
                icon: <Compass className="text-brand-blue" size={24} />,
                title: getLoc('cap_copy'),
                desc: getLoc('cap_copy_desc'),
                color: 'group-hover:border-brand-blue/40'
              },
              {
                icon: <Calculator className="text-brand-purple" size={24} />,
                title: getLoc('cap_math'),
                desc: getLoc('cap_math_desc'),
                color: 'group-hover:border-brand-purple/40'
              }
            ].map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`group p-8 rounded-2xl bg-glass-bg border border-glass-border/70 hover:scale-[1.02] transition-all duration-300 ${p.color}`}
              >
                <div className="p-3 w-fit rounded-xl bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {p.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{p.title}</h4>
                <p className="text-xs text-text-secondary font-light leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Centered Launch CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex flex-col items-center gap-4"
          >
            <button
              onClick={() => setShowWorkspace(true)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand-blue/20 hover:shadow-brand-purple/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-3 border border-white/10"
            >
              <Sparkles size={16} className="text-white animate-spin" />
              {getLoc('launch_btn')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. FLOATING ASSISTANT COMPANION BUTTON & MINI-CHAT DRAWER */}
      <div className="fixed bottom-24 right-8 z-[140]">
        <AnimatePresence>
          {!showFloatingCabinet && !showWorkspace && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => {
                setShowWorkspace(true);
                showToast(lang === 'bn' ? 'SauvikAI ওয়ার্কস্পেস সক্রিয় করা হয়েছে!' : 'Successfully launched SauvikAI Workspace!', 'success');
              }}
              className="p-4 rounded-full bg-gradient-to-r from-brand-blue/95 via-brand-purple/95 to-brand-blue/95 text-white shadow-2xl shadow-brand-blue/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 backdrop-blur-md cursor-pointer flex items-center justify-center group"
              aria-label="SauvikAI Assistant Chat"
            >
              <div className="relative">
                <Bot size={22} className="animate-bounce" />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white/10 animate-ping" />
              </div>
              <span className="max-w-0 overflow-hidden group-hover:max-w-32 transition-all duration-500 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest pl-0 group-hover:pl-2.5">
                SauvikAI
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* FLOAT BAR CABINET PANEL */}
      <AnimatePresence>
        {showFloatingCabinet && !showWorkspace && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[360px] max-w-[90vw] h-[520px] rounded-3xl bg-[#0e0e15]/95 border border-glass-border shadow-2xl backdrop-blur-xl z-[150] flex flex-col overflow-hidden text-white font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-white/5 to-white/0 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-1.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
                    SauvikAI
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </h3>
                  <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">Digital Clone</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Maximize to full SaaS workspace */}
                <button
                  onClick={() => {
                    setShowFloatingCabinet(false);
                    setShowWorkspace(true);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Fullscreen workspace"
                >
                  <Maximize2 size={13} />
                </button>
                {/* Close Cabinet Button */}
                <button
                  onClick={() => setShowFloatingCabinet(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer border border-white/15"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Quick config language override */}
            <div className="px-4 py-2.5 bg-black/40 border-b border-glass-border flex items-center justify-between text-[10px]">
              <span className="text-text-secondary font-medium uppercase font-mono tracking-tighter text-[9px] flex items-center gap-1">
                <Languages size={11} className="text-brand-blue" />
                {getLoc('choose_lang')}
              </span>
              <div className="flex gap-1.5">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'bn', label: 'বাংলা' }
                ].map((item) => {
                  const isActive = (selectedLangMode === 'bn' || (selectedLangMode === 'auto' && lang === 'bn')) 
                    ? item.code === 'bn' 
                    : item.code === 'en';
                  return (
                    <button
                      key={item.code}
                      onClick={() => handleLangToggle(item.code as 'en' | 'bn')}
                      className={`px-2 py-0.5 rounded-md font-bold tracking-tight text-[9px] transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md' 
                          : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cabinet Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin text-left bg-gradient-to-b from-transparent to-black/30">
              <AnimatePresence initial={false}>
                {(activeThread?.messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 h-fit ${
                      m.sender === 'user' 
                        ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30' 
                        : isDark 
                          ? 'bg-white/5 text-brand-purple border border-white/10' 
                          : 'bg-indigo-50 text-brand-purple border border-indigo-100'
                    }`}>
                      {m.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
                    </div>
                    <div className="space-y-1">
                      <div className={`px-4 py-2.5 rounded-2xl border ${
                        m.sender === 'user' 
                          ? isDark 
                            ? 'bg-brand-blue text-white rounded-tr-none border-brand-blue/35 text-left' 
                            : 'bg-indigo-600 text-white rounded-tr-none border-indigo-500 text-left'
                          : isDark 
                            ? 'bg-white/5 border-glass-border font-light rounded-tl-none font-mono text-xs' 
                            : 'bg-slate-100 border-slate-200 text-slate-800 rounded-tl-none font-mono text-xs'
                      }`}>
                        <MessageContentRenderer text={m.text} isUser={m.sender === 'user'} isDark={isDark} />
                      </div>
                      <span className="text-[9px] opacity-40 font-mono tracking-widest uppercase block">{m.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-3 max-w-[80%] mr-auto text-left">
                    <div className="p-2 rounded-xl bg-white/5 text-brand-purple border border-white/10 h-fit">
                      <Bot size={13} className="animate-spin" />
                    </div>
                    <div className="px-4 py-2.5 bg-white/5 border border-glass-border rounded-2xl rounded-tl-none text-xs text-brand-purple italic tracking-wider">
                      {getLoc('voice_end')}
                      <span className="inline-flex gap-1 pl-1">
                        <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}
              </AnimatePresence>
              <div ref={chatEndFloatRef} />
            </div>

            {/* Cabinet input */}
            <div className="p-3 bg-[#0d0d12] border-t border-glass-border/70 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder={getLoc('placeholder')}
                  className="flex-1 bg-white/5 border border-glass-border focus:border-brand-blue rounded-xl px-3 py-2 text-xs focus:outline-none placeholder-white/30 text-white/90"
                />
                
                {/* Send */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isGenerating || (!currentInput.trim())}
                  className="p-2 ml-1 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:scale-105 active:scale-95 text-white disabled:opacity-40 transition-all cursor-pointer border border-white/5 shadow-md shadow-brand-blue/10 shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>

              {/* Quick Prompt anchors list */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-[8px] font-bold uppercase tracking-wider text-white/50">
                <button
                  onClick={() => setCurrentInput(getLoc('prompt_1'))}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white shrink-0 border border-white/5"
                >
                  Create App
                </button>
                <button
                  onClick={() => setCurrentInput(getLoc('prompt_2'))}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white shrink-0 border border-white/5"
                >
                  Write Code
                </button>
                <button
                  onClick={() => setCurrentInput(getLoc('prompt_3'))}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white shrink-0 border border-white/5"
                >
                  Solve Math
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. PART 3: FULLSCREEN PORTALWORKSPACE APPLICATION VIEW */}
      <AnimatePresence>
        {showWorkspace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[250] flex flex-col font-sans ${isDark ? 'bg-[#06060a] text-white' : 'light bg-slate-50 text-slate-900'}`}
          >
            {/* Topbar Navigation Control Header */}
            <header className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-[#0b0b12] border-glass-border' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                {/* Back button */}
                <button
                  onClick={() => setShowWorkspace(false)}
                  className={`p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-white/5 hover:bg-white/10 border border-glass-border text-white/80' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">{getLoc('back_port')}</span>
                </button>



                {/* Vertical Divider */}
                <span className={`h-6 w-[1px] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                {/* Workspace Title */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-brand-blue/30 to-brand-purple/30 text-brand-blue border border-brand-blue/20">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h1 className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                      SauvikAI
                    </h1>
                  </div>
                </div>
              </div>

              {/* Center Active Chat Indicator (Widescreen) */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-text-secondary font-semibold font-mono uppercase bg-white/5 px-4 py-1.5 rounded-full border border-glass-border">
                <Sparkles size={12} className="text-brand-purple animate-pulse" />
                {getLoc('active_thread')}: {lang === 'bn' ? activeThread?.titleBn : activeThread?.title}
              </div>

              {/* Controls Matrix */}
              <div className="flex items-center gap-3">
                {/* Toggle History Side Drawer (Mobile) */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`lg:hidden p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-glass-border text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'}`}
                  title="Toggle history panels"
                >
                  <History size={16} />
                </button>

                {/* Custom Bilingual Language Switcher */}
                <div className={`p-1 rounded-xl flex items-center gap-1 text-[11px] font-bold border shrink-0 ${isDark ? 'bg-white/5 border-glass-border' : 'bg-slate-100 border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center gap-1.5 px-2 text-text-secondary select-none">
                    <Languages size={13} className="text-brand-blue" />
                    <span className="hidden md:inline uppercase text-[9px] tracking-wider font-mono">{lang === 'bn' ? 'ভাষা' : 'Lang'}</span>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'bn', label: 'বাংলা' }
                    ].map((item) => {
                      const isActive = (selectedLangMode === 'bn' || (selectedLangMode === 'auto' && lang === 'bn')) 
                        ? item.code === 'bn' 
                        : item.code === 'en';
                      return (
                        <button
                          key={item.code}
                          onClick={() => handleLangToggle(item.code as 'en' | 'bn')}
                          className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md font-extrabold scale-[1.02]'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>



                {/* Theme toggle sync client */}
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-glass-border text-brand-blue hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-brand-blue hover:bg-slate-200'}`}
                  title="Toggle Light / Dark mode"
                >
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
            </header>

            {/* Inner Dashboard layout workspace */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* LEFT CHATS HISTORY SIDEBAR PANEL */}
              <aside
                className={`w-[290px] h-full shrink-0 border-r flex flex-col transition-all duration-300 z-40 max-lg:fixed max-lg:top-[73px] max-lg:bottom-0 max-lg:left-0 max-lg:bg-[#08080d]/95 ${
                  sidebarOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
                } ${isDark ? 'bg-[#09090f] border-glass-border' : 'bg-white border-slate-200'} lg:block`}
              >
                {/* New Chat core button */}
                <div className="p-4 shrink-0">
                  <button
                    onClick={handleCreateNewChat}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple hover:scale-[1.02] active:scale-98 transition-all font-bold text-xs uppercase tracking-[0.15em] text-white flex items-center justify-center gap-2 border border-white/10 shadow-lg shadow-brand-blue/15 cursor-pointer"
                  >
                    <Plus size={15} />
                    {getLoc('new_chat')}
                  </button>
                </div>

                {/* Filter search box */}
                <div className="px-4 pb-3 shrink-0 relative">
                  <input
                    type="text"
                    value={searchHistoryQuery}
                    onChange={(e) => setSearchHistoryQuery(e.target.value)}
                    placeholder={getLoc('search')}
                    className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition-all ${isDark ? 'bg-white/5 border border-glass-border text-white focus:border-brand-blue/70 placeholder-white/20' : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400'}`}
                  />
                  <Search size={13} className="absolute left-7 top-3 text-text-secondary" />
                </div>

                {/* Threads listing list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] px-2 mb-2">{getLoc('recent')}</h4>
                  
                  {filteredThreadsBySearch.length === 0 ? (
                    <p className="text-xs text-text-secondary italic p-4 text-center">No threads matched...</p>
                  ) : (
                    filteredThreadsBySearch.map((thread) => {
                      const isActive = thread.id === activeThreadId;
                      return (
                        <div
                          key={thread.id}
                          onClick={() => {
                            setActiveThreadId(thread.id);
                            setSidebarOpen(false); // Auto Collapse on mobile select
                          }}
                          className={`group w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            isActive 
                              ? isDark 
                                ? 'bg-brand-blue/10 border-brand-blue/40 text-white' 
                                : 'bg-slate-100 border-brand-blue text-slate-900'
                              : isDark
                                ? 'bg-white/0 border-transparent text-white/50 hover:bg-white/5 hover:text-white/90'
                                : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden text-left">
                            <MessageSquare size={14} className={isActive ? 'text-brand-blue' : 'opacity-40'} />
                            <div className="overflow-hidden">
                              <h5 className="text-xs font-bold truncate tracking-tight">{lang === 'bn' ? thread.titleBn : thread.title}</h5>
                              <span className="text-[9px] opacity-40 font-mono italic">{thread.lastUpdated}</span>
                            </div>
                          </div>

                          {/* Delete Anchor */}
                          <button
                            onClick={(e) => handleDeleteThread(thread.id, e)}
                            className={`p-1.5 rounded-lg transition-all opacity-40 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 cursor-pointer ${
                              isDark ? 'text-white/40 hover:text-red-400 hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
                            }`}
                            title="Delete thread"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Clear All Persistence safety belt */}
                <div className={`p-4 border-t shrink-0 ${isDark ? 'border-glass-border bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
                  <button
                    onClick={() => {
                      if (window.confirm(lang === 'bn' ? 'আপনি কি সম্পূর্ণ হিস্টোরি ডিলিট করতে চান?' : 'Are you sure you want to restore default chat history? All saved progress will be deleted.')) {
                        localStorage.removeItem('sauvik_ai_threads');
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-500/30 text-[10px] font-mono tracking-widest uppercase font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    {getLoc('clear_history')}
                  </button>
                </div>
              </aside>

              {/* RIGHT MAIN WORKSPACE CONSOLE */}
              <main className="flex-1 h-full flex flex-col justify-between overflow-hidden bg-gradient-to-t from-transparent to-black/10">
                
                {/* Active Chat Stack container */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin">
                  
                  {/* Empty Chat State - Brand Dashboard */}
                  {(!activeThread || activeThread.messages.length === 0) ? (
                    <div className="max-w-3xl mx-auto space-y-12 py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        <div className="relative inline-block">
                          <div className="p-6 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-2xl">
                            <Bot size={48} className="animate-pulse" />
                          </div>
                          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-app-bg animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-white to-brand-purple">
                          SauvikAI
                        </h2>
                        <p className="text-text-secondary text-sm font-light max-w-lg mx-auto">
                          {getLoc('welcome')}
                        </p>
                      </motion.div>

                      {/* Prompts list matrix */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d2ff]">{getLoc('capability_title')}</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                          {[
                            { title: getLoc('prompt_1'), desc: getLoc('cap_web_desc'), icon: <Code2 className="text-brand-blue" /> },
                            { title: getLoc('prompt_2'), desc: getLoc('cap_code_desc'), icon: <FileText className="text-brand-purple" /> },
                            { title: getLoc('prompt_3'), desc: getLoc('cap_math_desc'), icon: <Calculator className="text-brand-blue" /> },
                            { title: getLoc('prompt_4'), desc: getLoc('cap_copy_desc'), icon: <Compass className="text-brand-purple" /> },
                          ].map((p, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => {
                                setCurrentInput(p.title);
                                showToast(lang === 'bn' ? 'প্রম্পট ইনপুটে কপি করা হয়েছে!' : 'Prompt template selected!', 'success');
                              }}
                              className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all hover:scale-[1.01] cursor-pointer ${isDark ? 'bg-white/5 border-glass-border hover:bg-white/10 hover:border-brand-blue/30' : 'bg-white border-slate-200 hover:border-brand-blue shadow-sm hover:shadow'}`}
                            >
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">{p.icon}</div>
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white">{p.title}</h4>
                                <p className="text-[10px] text-text-secondary mt-1 font-light">{p.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Rendering messages
                    <div className="max-w-4xl mx-auto space-y-6">
                      {activeThread.messages.map((m) => {
                        const isUser = m.sender === 'user';
                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 max-w-full ${isUser ? 'ml-auto flex-row-reverse text-right items-start' : 'mr-auto text-left items-start'}`}
                          >
                            {/* Avatar */}
                            <div className={`p-3 rounded-2xl shrink-0 h-fit border shadow-md transition-all duration-300 hover:scale-110 ${
                              isUser 
                                ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue' 
                                : isDark 
                                  ? 'bg-white/5 border-glass-border text-brand-purple' 
                                  : 'bg-indigo-50 border-indigo-100 text-brand-purple'
                            }`}>
                              {isUser ? <User size={18} /> : <Bot size={18} />}
                            </div>

                            {/* Message Bubble box */}
                            <div className="space-y-1.5 max-w-[80vw] sm:max-w-3xl text-left">
                              <div className={`px-5 py-4 rounded-3xl border shadow-lg leading-relaxed text-sm transition-all duration-300 hover:scale-[1.005] hover:shadow-xl hover:-translate-y-[1px] ${
                                isUser 
                                  ? isDark 
                                    ? 'bg-gradient-to-r from-brand-blue/90 to-brand-blue text-white rounded-tr-none border-brand-blue/40 hover:from-brand-blue hover:to-brand-blue/95 hover:border-brand-blue/60' 
                                    : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-brand-purple text-white rounded-tr-none border-indigo-500 hover:opacity-95 shadow-[0_4px_20px_rgba(79,70,229,0.15)]'
                                  : isDark
                                    ? 'bg-[#12121c]/90 backdrop-blur-md border-glass-border rounded-tl-none font-normal text-white/95 hover:bg-[#151525]/95 hover:border-brand-purple/40 hover:shadow-brand-purple/5'
                                    : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800 rounded-tl-none font-normal hover:bg-white hover:border-brand-blue/30 hover:shadow-[0_8px_30px_rgba(148,163,184,0.15)]'
                              }`}>
                                <MessageContentRenderer text={m.text} isUser={isUser} isDark={isDark} />
                              </div>

                              {/* Timestamp and toolbar actions */}
                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-secondary px-2 uppercase font-mono tracking-widest">
                                <span className="mr-auto font-bold opacity-50">{m.timestamp}</span>

                                {!isUser && (
                                  <>
                                    {/* Copy response action */}
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(m.text);
                                        showToast(getLoc('copy_success'), 'success');
                                      }}
                                      className="hover:text-brand-blue transition-colors flex items-center gap-1 cursor-pointer"
                                      title={getLoc('copy')}
                                    >
                                      <Copy size={11} />
                                      {getLoc('copy')}
                                    </button>

                                    {/* Regenerate Response */}
                                    {activeThread.messages[activeThread.messages.length - 1].id === m.id && (
                                      <button
                                        onClick={handleRegenerateResponse}
                                        className="hover:text-brand-purple transition-colors flex items-center gap-1 cursor-pointer"
                                        title={getLoc('regenerate')}
                                      >
                                        <RotateCcw size={11} />
                                        {getLoc('regenerate')}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Simulated typing indicator */}
                      {isGenerating && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-4 mr-auto text-left items-start"
                        >
                          <div className="p-3 rounded-2xl bg-white/5 border border-glass-border text-brand-purple shrink-0 animate-spin">
                            <Bot size={18} />
                          </div>
                          <div className="space-y-1 text-left max-w-lg">
                            <div className="px-5 py-4 bg-white/5 border border-glass-border rounded-3xl rounded-tl-none text-xs italic text-brand-purple font-mono flex items-center gap-2">
                              {getLoc('voice_end')}
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  <div ref={chatEndWsRef} />
                </div>

                {/* FILE INPUTS BUFFER ALERTS BAR */}
                {attachedFile && (
                  <div className={`mx-6 px-4 py-2 bg-brand-blue/10 border border-brand-blue/30 rounded-xl flex items-center justify-between text-xs text-brand-blue mt-2`}>
                    <div className="flex items-center gap-2">
                      <Paperclip size={13} className="animate-pulse" />
                      <span>{getLoc('file_uploaded')} <strong>{attachedFile.name}</strong> ({Math.round(attachedFile.size / 1024)} KB)</span>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="p-1 hover:bg-white/10 rounded-lg text-brand-blue transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* VOICE LISTENING PORTAL OVERLAY CONTAINER */}
                {isVoiceListening && (
                  <div className="mx-6 p-4 bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border border-glass-border rounded-2xl flex flex-col items-center justify-center gap-3">
                    <span className="text-xs uppercase font-bold font-mono tracking-widest text-[#00d2ff] animate-pulse flex items-center gap-1.5">
                      <Volume2 size={14} className="animate-bounce" />
                      {getLoc('voice_active')}
                    </span>
                    
                    {/* Visualizer bars matrix */}
                    <div className="flex items-end justify-center gap-1.5 h-10 w-48">
                      {pulseWaveform.map((height, hIdx) => (
                        <div
                          key={hIdx}
                          style={{ height: `${height}px` }}
                          className="w-1 bg-brand-blue rounded-full transition-all duration-100"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Core Input Deck */}
                <div className={`p-6 border-t shrink-0 ${isDark ? 'border-glass-border bg-[#0a0a10]' : 'border-slate-200 bg-white shadow-lg'}`}>
                  <div className="max-w-4xl mx-auto flex items-end gap-3 max-sm:flex-col">
                    
                    {/* Toolbar helpers panel */}
                    <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">
                      {/* File uploads click triggers */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 text-text-secondary hover:text-brand-blue cursor-pointer shrink-0 ${isDark ? 'bg-white/5 border-glass-border hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
                        title={getLoc('drag_n_drop')}
                      >
                        <Paperclip size={16} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".txt,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.php,.html,.css,.json,.md"
                      />

                      {/* Microphone Voice triggers */}
                      <button
                        onClick={handleSimulateVoiceInput}
                        className={`p-3.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 text-text-secondary hover:text-brand-purple cursor-pointer shrink-0 ${isDark ? 'bg-white/5 border-glass-border hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
                        title="Voice Input (Microphone)"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    {/* Main Prompt Textarea zone */}
                    <div className="flex-1 relative max-sm:w-full">
                      <textarea
                        rows={1}
                        value={currentInput}
                        onChange={(e) => {
                          setCurrentInput(e.target.value);
                          // Auto resize height
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={getLoc('placeholder')}
                        className={`w-full max-h-36 min-h-[52px] text-sm font-light rounded-2xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all resize-none ${isDark ? 'bg-white/5 border border-glass-border text-white placeholder-white/30' : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-slate-50'}`}
                      />

                      {/* Language switcher override inside context */}
                      <div className="absolute right-3.5 bottom-3.5 flex gap-1.5">
                        <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-text-secondary select-none">
                          {selectedLangMode === 'auto' ? 'Auto' : selectedLangMode}
                        </span>
                      </div>
                    </div>

                    {/* Trigger click Send */}
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isGenerating || (!currentInput.trim() && !attachedFile)}
                      className="px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple hover:scale-105 active:scale-95 disabled:opacity-40 transition-all font-bold text-xs uppercase text-white shadow-lg shadow-brand-blue/25 tracking-[0.2em] flex items-center justify-center cursor-pointer border border-white/5 shrink-0 max-sm:w-full"
                    >
                      <Send size={14} className="mr-2" />
                      SUBMIT
                    </button>
                  </div>

                  {/* Acceptable compliance footnotes */}
                  <div className="text-center text-[9px] uppercase tracking-widest font-bold text-text-secondary mt-4 font-mono select-none">
                    SAUVIK_AI_TERMINAL_SESSION: ACTIVE • CENSOR_COMPLIANT: TRUE
                  </div>
                </div>

              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
