import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Send, 
  Lock, 
  Unlock, 
  Mail, 
  Trash2, 
  Check, 
  X, 
  ArrowRight, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Archive, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  Inbox, 
  Smartphone, 
  Globe, 
  Key 
} from 'lucide-react';
import { useLanguage } from '../App';
import { useToast } from './Toast';
import { 
  addMessageToFirestore, 
  fetchMessagesFromFirestore, 
  markMessageAsReadInFirestore, 
  deleteMessageInFirestore, 
  isOfflineMode, 
  VisitorMessage,
  signInAdminWithGoogle,
  logoutAdmin,
  onAdminAuthStateChanged
} from '../db/firebase';

export const AskSauvikAI = () => {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  
  // Message history state
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'bot';
    time: string;
    isForm?: boolean;
    formSubmitted?: boolean;
  }>>([
    {
      id: 'init-1',
      text: lang === 'en' 
        ? "👋 Hi! I'm Sauvik AI. Ask me anything about Sauvik's skills, services, projects, experience, or contact information."
        : "👋 হাই! আমি সৌভিক এআই। সৌভিকের দক্ষতা, সেবা, প্রজেক্ট, অভিজ্ঞতা বা যোগাযোগের তথ্য সম্পর্কে আমাকে যেকোনো কিছু জিজ্ঞাসা করুন।",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  // Admin Overlay States
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Admin Dashboard States
  const [adminMessages, setAdminMessages] = useState<VisitorMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  // Rate limiting & security
  const lastSubmitKey = 'sauvik_portfolio_last_submit_ts';

  // Toggle Language Effect
  useEffect(() => {
    // Keep initial greeting in sync with currently chosen language
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [
          {
            id: 'init-1',
            text: lang === 'en' 
              ? "👋 Hi! I'm Sauvik AI. Ask me anything about Sauvik's skills, services, projects, experience, or contact information."
              : "👋 হাই! আমি সৌভিক এআই। সৌভিকের দক্ষতা, সেবা, প্রজেক্ট, অভিজ্ঞতা বা যোগাযোগের তথ্য সম্পর্কে আমাকে যেকোনো কিছু জিজ্ঞাসা করুন।",
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      }
      return prev;
    });
  }, [lang]);

  // Listen to Google Auth state transitions
  useEffect(() => {
    if (!isOfflineMode) {
      const unsubscribe = onAdminAuthStateChanged((user: any) => {
        if (user && user.email === 'sauvikd68@gmail.com') {
          setIsAdminAuthenticated(true);
          loadAdminMessages();
        } else {
          setIsAdminAuthenticated(false);
          setShowAdminDashboard(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Labels dictionary for translation
  const labels = {
    title: lang === 'en' ? 'Ask Sauvik AI' : 'জিজ্ঞেস করুন সৌভিক এআই',
    subtitle: lang === 'en' ? 'INTELLIGENT AGENT v1.0' : 'ইন্টেলিজেন্ট অ্যাসিস্ট্যান্ট v1.0',
    placeholder: lang === 'en' ? 'Type a question or enter "admin" for portal...' : 'প্রশ্ন টাইপ করুন অথবা পাসকোড টাইপ করুন...',
    send: lang === 'en' ? 'SEND' : 'পাঠান',
    online: lang === 'en' ? 'Online & Active' : 'অনলাইন এবং সক্রিয়',
    localCache: lang === 'en' ? 'Sandbox Mode' : 'স্যান্ডবক্স মোড',
    dbActive: lang === 'en' ? 'Firestore Live' : 'ফায়ারস্টোর লাইভ',
    spamAlert: lang === 'en' ? 'Please wait 60s before sending another message.' : 'নতুন মেসেজ পাঠানোর আগে ৬০ সেকেন্ড অপেক্ষা করুন।',
    invalidEmail: lang === 'en' ? 'Please enter a valid email address.' : 'দয়া করে একটি সঠিক ইমেল আইডি প্রদান করুন।',
    formHeader: lang === 'en' ? 'Contact Form' : 'যোগাযোগের ফর্ম',
    submitButton: lang === 'en' ? 'Submit Inquiry' : 'সাবমিট করুন',
    successMessage: lang === 'en' ? '✅ Your message has been sent successfully. Sauvik will review it soon.' : '✅ আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে। সৌভিক দ্রুত রিভিউ করবেন।',
    spamBlocked: lang === 'en' ? 'Submission blocked due to spam detection.' : 'স্প্যামিং শনাক্ত হওয়ায় সাবমিশন ব্লক করা হয়েছে।'
  };

  const quickQuestionsList = [
    { en: 'Who is Sauvik?', bn: 'সৌভিক কে?' },
    { en: 'What services do you offer?', bn: 'আপনি কি কি সেবা অফার করেন?' },
    { en: 'What skills do you have?', bn: 'আপনার কি কি দক্ষতা রয়েছে?' },
    { en: 'Show your projects', bn: 'আপনার প্রজেক্টগুলো দেখান' },
    { en: 'Why should I hire you?', bn: 'আপনাকে কেন হায়ার করা উচিত?' },
    { en: 'Contact Sauvik', bn: 'সৌভিকের সাথে যোগাযোগ করবো?' },
    { en: 'Tell me about sauvikdev.in', bn: 'sauvikdev.in সম্পর্কে বলুন' }
  ];

  // Logic to process queries and output rich answers
  const getKnowledgeResponse = (query: string): { text: string; triggerForm?: boolean } => {
    const norm = query.toLowerCase().trim();
    const isEn = lang === 'en';

    // Group A: Contact / Hire requests
    if (
      norm.includes('contact') || 
      norm.includes('instagram') || 
      norm.includes('hire') || 
      norm.includes('যোগাযোগ') || 
      norm.includes('ইনস্টাগ্রাম') || 
      norm.includes('হায়ার')
    ) {
      return {
        text: isEn 
          ? "You can contact Sauvik directly on Instagram for project discussions, freelance work, collaborations, and business inquiries.\n\nInstagram: @sauvikdev.in\n\nFeel free to send a direct message."
          : "আপনি প্রজেক্ট আলোচনা, ফ্রিল্যান্স কাজ, কোলাবরেশন এবং ব্যবসায়িক অনুসন্ধানের জন্য সরাসরি ইনস্টাগ্রামের মাধ্যমে সৌভিকের সাথে যোগাযোগ করতে পারেন।\n\nইনস্টাগ্রাম: @sauvikdev.in\n\nনির্দ্বিধায় সরাসরি মেসেজ পাঠান।",
        triggerForm: true
      };
    }

    // Group B: website sauvikdev.in details
    if (
      norm.includes('sauvikdev.in') || 
      norm.includes('website') || 
      norm.includes('ওয়েবসাইট')
    ) {
      return {
        text: isEn
          ? "sauvikdev.in is Sauvik Das's premium and high-end personal portfolio website where visitors can explore his achievements, professional services, cinematic video work catalog, and live skill metrics. It features modern Glassmorphic and fluid interactive aesthetics."
          : "sauvikdev.in হল সৌভিক দাসের প্রিমিয়াম ও আধুনিক কোয়ালিটির পোর্টফোলিও ওয়েবসাইট। দর্শকরা এখানে তার প্রফেশনাল স্কিল, সিনেমাটিক কাজের ডেমো, কাজের প্রাইজ এবং অর্জনগুলো ইন্টারেক্টিভ ডিজাইনে অন্বেষণ করতে পারবেন।"
      };
    }

    // Group C: Who is Sauvik?
    if (
      norm.includes('who is') || 
      norm.includes('sauvik das') || 
      norm.includes('identity') || 
      norm.includes('সৌভিক কে') || 
      norm.includes('কে সৌভিক')
    ) {
      return {
        text: isEn
          ? "Sauvik Das is a highly creative and experienced Web Developer, Freelancer, Video Editor, Content Creator, and AI Enthusiast. He focuses on crafting ultra-fast high-conversion landing pages, customized enterprise platforms, and eye-catching professional digital video edits."
          : "সৌভিক দাস একজন অত্যন্ত ক্রিয়েটিভ ও প্রফেশনাল ওয়েব ডেভেলপার, ফ্রিল্যান্সার, কালারিস্ট ভিডিও এডিটর এবং এআই মেকার। তিনি সুপার-ফাস্ট রূপান্তরকারী ল্যান্ডিং পেজ, ডায়নামিক পোর্টফোলিও এবং সোশাল মিডিয়া সিনেমাটিক কন্টেন্ট ডিজাইনে পারদর্শী।"
      };
    }

    // Group D: Services
    if (
      norm.includes('service') || 
      norm.includes('offer') || 
      norm.includes('সেবা') || 
      norm.includes('সার্ভিস')
    ) {
      return {
        text: isEn
          ? "Sauvik offers custom-crafted high-end modern digital services:\n\n• 🌐 Personal Portfolio Websites – Fast, responsive, glassmorphic styles\n• 💼 Business & Startup Websites – Fluid user flows and lead magnets\n• 🚀 Conversion Landing Pages – Optimised speed and copywriting layout\n• ✍️ Complete Website Customization – Redesigns and feature additions\n• 🎬 Dynamic Video Editing & Production – Cinematic grading, motion assets\n• 🧠 Custom Digital AI Solutions – Custom bots, integrations, and tools"
          : "সৌভিক অত্যন্ত যত্নসহকারে নিম্নোক্ত কাস্টম ক্রিয়েটিভ ডিজিটাল সার্ভিসগুলো অফার করে থাকেন:\n\n• 🌐 আকর্ষণীয় বা পার্সোনাল পোর্টফোলিও ওয়েবসাইট মেকিং\n• 💼 বিজনেস ও স্টার্টআপের ডায়নামিক পূর্ণাঙ্গ পোর্টাল ডেভেলপমেন্ট\n• 🚀 রূপান্তর-বান্ধব প্রফেশনাল ল্যান্ডিং পেজ\n• ✍️ নিখুঁত ওয়েবসাইট কাস্টমাইজেশন ও কারিগরি সমাধান\n• 🎬 সিনেমাটিক ভিডিও এডিটিং, কালার গ্রেডিং ও থাম্বনেল ডিজাইন\n• 🧠 এআই বট ইন্টিগ্রেশন ও অটোমেশন সলিউশনস"
      };
    }

    // Group E: Skills
    if (
      norm.includes('skill') || 
      norm.includes('experience') || 
      norm.includes('দক্ষতা') || 
      norm.includes('টেকনোলজি')
    ) {
      return {
        text: isEn
          ? "Sauvik boasts an outstanding versatile digital and development technical stack:\n\n• Development: HTML, CSS, JavaScript, React.js, TypeScript, Tailwind CSS, Material UI, responsive layouts\n• Creation: Creative Video Production, High-grade color correction, Motion Graphics, Custom Thumbnails, social asset optimization\n• AI Workflows: Prompt Engineering, Agent integration (Gemini / OpenAI), pipeline tools"
          : "সৌভিকের মূল টেকনিক্যাল ও ক্রিয়েটিভ প্রফেশনাল ক্ষমতাগুলো নিম্নরূপ:\n\n• ডেভেলপমেন্ট: HTML, CSS, JavaScript, React.js, TypeScript, Tailwind CSS এবং রেসপন্সিভ ডিজাইন আর্কিটেকচার\n• ক্রিয়েটিভ এডিটিং: এডোবি প্রমিয়ার প্রো ও ডাভিঞ্চি কালার গ্রেডিং, কাস্টম থাম্বনেল মেকিং, মোশন গ্রাফিক্স\n• এআই টুলস: জেমিনি এপিআই, প্রম্পটিং এবং অটোমেশন ইন্টিগ্রেশন"
      };
    }

    // Group F: Projects
    if (
      norm.includes('project') || 
      norm.includes('work') || 
      norm.includes('portfolio') || 
      norm.includes('প্রজেক্ট') || 
      norm.includes('কাজ')
    ) {
      return {
        text: isEn
          ? "Sauvik's outstanding project portfolio catalog features:\n\n1. His elegant digital workspace (sauvikdev.in) crafted with maximum speed optimization.\n2. Built-in interactive AI Assistance and real-time support overlays.\n3. Custom Client Dashboard & management panels.\n4. More than 45+ premier video editing projects delivered to global digital creators."
          : "সৌভিকের করা কয়েকটি সেরা প্রজেক্ট ক্যাটাগরি নিম্নরূপ:\n\n১. তার নিজের প্রিমিয়াম গতি সম্পন্ন পার্সোনাল পোর্টফোলিও (sauvikdev.in)।\n২. রিয়েল-টাইম এআই অ্যাসিস্ট্যান্ট এবং ডায়নামিক ইন্টিগ্রেশন মডিউলস।\n৩. কাস্টম এডমিন প্যানেল ও রিপোর্টিং ড্যাশবোর্ড।\n৪. বিশ্বব্যাপী ক্রিয়েটরদের জন্য তৈরি করা ৪৫টিরও বেশি সিনেমাটিক থাম্বনেল ও প্রিমিয়াম প্রজেক্ট ভিডিও এডিটিং।"
      };
    }

    // Group G: Why Hire
    if (
      norm.includes('why should') || 
      norm.includes('why hire') || 
      norm.includes('হায়ার') || 
      norm.includes('সুবিধা')
    ) {
      return {
        text: isEn
          ? "Why you should hire Sauvik Das:\n\n✨ Intersectional Advantage: He is both a highly capable systems developer and a high-caliber creative media editor. This means your website will look gorgeous and your video marketing assets will be beautifully streamlined in one unified package.\n✨ Pristine execution, conversion-oriented layout strategy, friendly direct feedback, and swift target delivery."
          : "সৌভিক বড় প্লাস পয়েন্ট কেন:\n\n✨ অনন্য বৈচিত্র্য: তিনি একই সাথে একজন দক্ষ টেকনিক্যাল কোডার এবং উচ্চ মানের সিনেমাটিক মিডিয়া এডিটর। এর ফলে আপনার প্রজেক্টের কারিগরি কোডিং থেকে শুরু করে ভিজ্যুয়াল মিডিয়া মার্কেটিং একই ছাদের নিচে সেরা কোয়ালিটিতে শেষ হবে।\n✨ নিখুঁত ও আধুনিক আর্কিটেকচার, বন্ধুত্বপূর্ণ সাবলীল যোগাযোগ এবং সঠিক সময়ে প্রজেক্ট ডেলিভারী।"
      };
    }

    // Default response triggers direct message form
    return {
      text: isEn
        ? "I don't have specified details about that. Would you like to leave a direct message for Sauvik Das? Please fill out the contact form below and Sauvik will get back to you directly:"
        : "আমার কাছে এই বিষয়ে সুনির্দিষ্ট তথ্য নেই। আপনি কি সৌভিক দাসের কাছে সরাসরি মেসেজ পাঠাতে চান? নিচের ফর্মটি পূরণ করুন এবং সৌভিক দ্রুত আপনার সাথে যোগাযোগ করবেন:",
      triggerForm: true
    };
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Check for secret admin access keyword
    if (text.toLowerCase().trim() === 'admin' || text.toLowerCase().trim() === 'sauvikadmin') {
      setInputValue('');
      setShowAdminLogin(true);
      showToast(lang === 'en' ? '🔐 Enter Admin PIN' : '🔐 এডমিন পাসকোড লিখুন', 'info');
      return;
    }

    const userMsg = {
      id: 'msg-' + Date.now(),
      text: text,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const result = getKnowledgeResponse(text);
      const botResponseMsg: any = {
        id: 'msg-bot-' + Date.now(),
        text: result.text,
        sender: 'bot' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botResponseMsg]);
      setIsTyping(false);

      if (result.triggerForm) {
        // Automatically inject the Form component inside the chat
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'form-' + Date.now(),
              text: '',
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isForm: true
            }
          ]);
        }, 500);
      }
    }, 1100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  // Admin Login Verification
  const handleAdminAuth = () => {
    const defaultPin = 'sauvikdev';
    if (adminPin === defaultPin || adminPin === 'admin') {
      setAdminPin('');
      setIsAdminAuthenticated(true);
      setShowAdminDashboard(true);
      setShowAdminLogin(false);
      showToast(lang === 'en' ? '🔓 Authenticated successfully' : '🔓 সফলভাবে অথেনটিকেটেড', 'success');
      loadAdminMessages();
    } else {
      showToast(lang === 'en' ? '❌ Invalid PIN' : '❌ ভুল পিন নম্বর', 'error');
      setAdminPin('');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInAdminWithGoogle();
      if (user && user.email === 'sauvikd68@gmail.com') {
        setIsAdminAuthenticated(true);
        setShowAdminDashboard(true);
        setShowAdminLogin(false);
        showToast(lang === 'en' ? '🔓 Authenticated successfully' : '🔓 সফলভাবে অথেনটিকেটেড', 'success');
        loadAdminMessages();
      } else {
        await logoutAdmin();
        showToast(lang === 'en' ? '🚫 Unauthorized Admin Account' : '🚫 অননুমোদিত অ্যাডমিন অ্যাকাউন্ট', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast(lang === 'en' ? 'Google Auth Failed' : 'গুগল অথেনটিকেশন ব্যর্থ', 'error');
    }
  };

  const loadAdminMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const data = await fetchMessagesFromFirestore();
      setAdminMessages(data);
    } catch (e) {
      showToast(lang === 'en' ? 'Failed to fetch' : 'মেসেজ পেতে ব্যর্থ', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleToggleRead = async (msgId: string, currentStatus: 'read' | 'unread') => {
    const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      await markMessageAsReadInFirestore(msgId, nextStatus);
      setAdminMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: nextStatus } : m));
      showToast(lang === 'en' ? 'Status updated' : 'স্ট্যাটাস আপডেট করা হয়েছে', 'success');
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteMessageInFirestore(msgId);
      setAdminMessages(prev => prev.filter(m => m.id !== msgId));
      showToast(lang === 'en' ? 'Message deleted' : 'মেসেজটি মুছে ফেলা হয়েছে', 'success');
    } catch {
      showToast('Error deleting message', 'error');
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Messages Filter inside Admin Component
  const filteredMessages = adminMessages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchText.toLowerCase()) || 
      m.email.toLowerCase().includes(searchText.toLowerCase()) || 
      m.message.toLowerCase().includes(searchText.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && m.status === statusFilter;
  });

  return (
    <section id="ask-ai" className="py-24 bg-app-bg relative overflow-hidden">
      {/* Absolute design aesthetic rings */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-brand-blue/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-brand-purple/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 w-full">
        {/* Visual Title Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-[0_0_15px_rgba(0,210,255,0.1)]">
            <Cpu size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span>{labels.subtitle}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-thin tracking-tight uppercase text-white mb-4">
            {lang === 'en' ? 'Ask' : 'জিজ্ঞেস করুন'}{' '}
            <span className="font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
              {lang === 'en' ? 'Sauvik AI' : 'সৌভিক এআই'}
            </span>
          </h2>
          <p className="text-neutral-400 text-xs md:text-sm max-w-lg mx-auto font-light">
            {lang === 'en' 
              ? "Discover instant insights on Sauvik's skills, creative works, active services, or send him direct secure inquiries." 
              : "সৌভিকের দক্ষতা, সার্ভিসের তালিকা, প্রজেক্ট এবং অন্যান্য তথ্য জানতে এআই বটের সাহায্য নিন ও সরাসরি কাস্টম মেসেজ পাঠান।"}
          </p>
        </div>

        {/* Console Interactive Box */}
        <div className="bg-[#050814]/80 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl relative backdrop-blur-2xl overflow-hidden min-h-[480px] flex flex-col transition-all duration-500">
          
          {/* Simulated hardware system header bar */}
          <div className="bg-[#090e21] border-b border-white/5 py-3.5 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/10 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/10 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40 border border-green-500/10 block" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-2">
                sauvik-node-v3.0
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              {/* Optional Admin quick badge */}
              <button
                onClick={() => {
                  if (showAdminDashboard) {
                    setShowAdminDashboard(false);
                  } else if (isAdminAuthenticated) {
                    setShowAdminDashboard(true);
                  } else {
                    setShowAdminLogin(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-mono transition-all active:scale-95 cursor-pointer ${
                  showAdminDashboard || isAdminAuthenticated 
                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                    : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                }`}
              >
                {isAdminAuthenticated ? <Unlock size={10} /> : <Lock size={10} />}
                <span>{showAdminDashboard ? 'Chat Interface' : 'Admin Portal'}</span>
              </button>

              <div className="flex items-center gap-1.5 border-l border-white/10 pl-2.5">
                <span className={`w-2 h-2 rounded-full animate-pulse block ${isOfflineMode ? 'bg-[#ffaa00]' : 'bg-[#00ffcc]'}`} />
                <span className="text-[10px] font-mono text-white/50 capitalize font-medium">
                  {isOfflineMode ? labels.localCache : labels.online}
                </span>
              </div>
            </div>
          </div>

          {/* Core Panel: Conditional rendering of Admin vs regular Chat Interface */}
          {showAdminDashboard ? (
            /* --- ADMIN PANEL COMPONENT --- */
            <div className="flex-grow flex flex-col bg-[#02050f] text-neutral-200">
              {/* Dashboard top stats bar */}
              <div className="grid grid-cols-2 md:grid-cols-3 border-b border-white/5 bg-black/30">
                <div className="p-4 border-r border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Total Submissions</p>
                  <p className="text-2xl font-bold font-mono text-white mt-1">{adminMessages.length}</p>
                </div>
                <div className="p-4 border-r border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Unread Messages</p>
                  <p className="text-2xl font-bold font-mono text-brand-blue mt-1">
                    {adminMessages.filter(m => m.status === 'unread').length}
                  </p>
                </div>
                <div className="p-4 col-span-2 md:col-span-1 flex items-center justify-between max-md:border-t max-md:border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Database Status</p>
                    <p className="text-xs font-semibold text-neutral-300 mt-1 flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOfflineMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      {isOfflineMode ? 'Local Cache Mode' : 'Cloud Firestore'}
                    </p>
                  </div>
                  <button 
                    onClick={loadAdminMessages}
                    disabled={isLoadingMessages}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isLoadingMessages ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Filtering Toolbar */}
              <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between bg-black/10">
                <div className="relative w-full md:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search name, email, query..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-brand-blue"
                  />
                  {searchText && (
                    <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {(['all', 'unread', 'read'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStatusFilter(opt)}
                      className={`px-3 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer capitalize flex-grow md:flex-grow-0 ${
                        statusFilter === opt 
                          ? 'bg-brand-blue border-brand-blue text-white' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    onClick={async () => {
                      if (!isOfflineMode) {
                        try {
                          await logoutAdmin();
                        } catch (err) {
                          console.error('Logout error', err);
                        }
                      }
                      setIsAdminAuthenticated(false);
                      setShowAdminDashboard(false);
                      showToast(lang === 'en' ? '🔐 Logged out' : '🔐 লগ-আউট করা হয়েছে', 'info');
                    }}
                    className="px-3 py-1 rounded-md text-[11px] font-mono border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Messages Listing viewport */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3 h-[320px] select-text">
                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw size={24} className="text-brand-blue animate-spin" />
                    <p className="text-xs text-white/40 font-mono">Synchronizing database entries...</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-white/30">
                    <Archive size={32} className="mb-2 opacity-50" />
                    <p className="text-xs font-mono">No visitor submissions matched your filters.</p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        msg.status === 'unread' 
                          ? 'bg-white/5 border-brand-blue/30 shadow-[0_0_15px_rgba(30,144,255,0.05)]' 
                          : 'bg-black/20 border-white/5'
                      }`}
                    >
                      {/* Sub card info header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                            msg.status === 'unread' ? 'bg-brand-blue/20 text-brand-blue' : 'bg-white/15 text-white/60'
                          }`}>
                            {msg.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">{msg.name}</h4>
                            <a href={`mailto:${msg.email}`} className="text-[10px] text-white/50 hover:text-brand-blue transition-colors flex items-center gap-1 mt-0.5 font-mono">
                              <Mail size={10} />
                              {msg.email}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/30 font-mono">
                            {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: '2-digit' })}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border ${
                            msg.status === 'unread' 
                              ? 'bg-brand-blue/10 border-brand-blue/30 text-[#00d2ff]' 
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                      </div>

                      {/* Main Message Body text */}
                      <p className="text-neutral-200 text-xs md:text-sm pl-1 font-light leading-relaxed mb-3 whitespace-pre-wrap select-text">
                        {msg.message}
                      </p>

                      {/* Technical user metadata & action hooks */}
                      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-white/30 font-mono">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="flex items-center gap-1 shrink-0">
                            <Globe size={11} /> {msg.sourceWebsite}
                          </span>
                          <span className="truncate max-w-[240px] flex items-center gap-1" title={msg.browserInfo}>
                            <Smartphone size={11} /> {msg.browserInfo}
                          </span>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleToggleRead(msg.id, msg.status)}
                            className={`p-1.5 rounded-md border flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer text-[10px] ${
                              msg.status === 'unread'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                            title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                          >
                            <Check size={12} />
                            <span>{msg.status === 'unread' ? 'Read' : 'Unread'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-md border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Delete submission"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* --- DEFAULT CHATBOT VIEW --- */
            <>
              {/* Message History flow screen */}
              <div className="flex-grow h-[360px] md:h-[400px] overflow-y-auto p-4 md:p-6 space-y-4 font-sans select-text scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  
                  if (msg.isForm) {
                    // Inline submission system form
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 max-w-[90%] md:max-w-[75%]"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_12px_rgba(0,180,255,0.25)]">
                          <Cpu size={14} />
                        </div>
                        <InteractiveSubmitForm msgId={msg.id} onSubmitSuccess={() => {
                          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, formSubmitted: true } : m));
                        }} labels={labels} showToast={showToast} lastSubmitKey={lastSubmitKey} />
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto justify-end' : ''}`}
                    >
                      {!isUser && (
                        <div className="w-7 md:w-8 h-7 md:h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_12px_rgba(0,180,255,0.2)]">
                          <Cpu size={13} />
                        </div>
                      )}

                      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-tr-none'
                              : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none font-light whitespace-pre-line'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-wide">
                          {msg.time}
                        </span>
                      </div>

                      {isUser && (
                        <div className="w-7 md:w-8 h-7 md:h-8 rounded-xl bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold font-mono">
                          U
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex-shrink-0 flex items-center justify-center text-white text-[10px] shadow-[0_0_12px_rgba(0,180,255,0.2)]">
                      <Cpu size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 w-16">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 block animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 block animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 block animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick suggestions lists with scroll forward/backward navigation */}
              <div className="relative flex items-center bg-black/40 border-t border-white/5 group/suggestions overflow-hidden">
                {/* Left (Backward) Scroll Key */}
                <button
                  type="button"
                  onClick={() => {
                    if (suggestionsScrollRef.current) {
                      suggestionsScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                    }
                  }}
                  className="absolute left-2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-black border border-white/10 hover:border-brand-blue/30 flex items-center justify-center text-white/50 hover:text-brand-blue hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] transition-all active:scale-90 cursor-pointer shadow-lg"
                  aria-label="Scroll left"
                >
                  <ArrowRight size={13} className="rotate-180" />
                </button>

                {/* Horizontal Scroll Containers */}
                <div 
                  ref={suggestionsScrollRef}
                  className="w-full px-12 py-3.5 overflow-x-auto select-none flex gap-2.5 scrollbar-none shrink-0 z-10 scroll-smooth"
                >
                  {quickQuestionsList.map((q, i) => {
                    const pillLabel = lang === 'en' ? q.en : q.bn;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(lang === 'en' ? q.en : q.bn)}
                        className="group/pill whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-brand-blue/40 text-[10px] md:text-xs text-white/70 hover:text-[#00d2ff] hover:bg-brand-blue/10 transition-all font-mono tracking-wide cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5"
                      >
                        <span>{pillLabel}</span>
                        <ArrowRight size={10} className="opacity-40 group-hover/pill:opacity-100 group-hover/pill:translate-x-0.5 transition-all text-[#00d2ff]" />
                      </button>
                    );
                  })}
                </div>

                {/* Right (Forward) Scroll Key */}
                <button
                  type="button"
                  onClick={() => {
                    if (suggestionsScrollRef.current) {
                      suggestionsScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                    }
                  }}
                  className="absolute right-2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-black border border-white/10 hover:border-brand-blue/30 flex items-center justify-center text-white/50 hover:text-brand-blue hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] transition-all active:scale-90 cursor-pointer shadow-lg"
                  aria-label="Scroll right"
                >
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Message inputs form footer */}
              <div className="p-4 bg-black/35 border-t border-white/5 flex gap-2.5 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={labels.placeholder}
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white disabled:opacity-45 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-xs font-bold tracking-wider font-mono disabled:cursor-not-allowed"
                >
                  <span>{labels.send}</span>
                  <Send size={12} className="relative top-[-0.5px]" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Biometric-style login prompt overlay for secure portal entry */}
        <AnimatePresence>
          {showAdminLogin && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
              {/* Overlay Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAdminLogin(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Box Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-[#050915] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-sm w-full relative z-10 shadow-2xl text-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand-blue/10 border border-brand-blue/30 mx-auto flex items-center justify-center text-brand-blue mb-4 shadow-[0_0_15px_rgba(0,180,255,0.2)]">
                  <Lock size={22} className="animate-pulse" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1.5 text-center uppercase tracking-wider font-mono">
                  Identity Verification
                </h3>
                <p className="text-neutral-400 text-xs font-light mb-6">
                  Please verify your credentials or enter code to unlock Sauvik's central message database.
                </p>

                {!isOfflineMode && (
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full mb-4 py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs font-mono tracking-wider hover:bg-neutral-100 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.70-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.13h4.01c2.34-2.16 3.68-5.32 3.68-8.75z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.01-3.13c-1.11.75-2.54 1.19-3.92 1.19-3.02 0-5.58-2.04-6.5-4.78H1.31v3.23A12.001 12.001 0 0 0 12 24z"/>
                      <path fill="#FBBC05" d="M5.5 14.37a7.24 7.24 0 0 1 0-4.74V6.4H1.31a12.014 12.014 0 0 0 0 11.2l4.19-3.23z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12.001 12.001 0 0 0 1.31 6.4l4.19 3.23c.92-2.74 3.48-4.78 6.5-4.78z"/>
                    </svg>
                    SIGN IN WITH GOOGLE
                  </button>
                )}

                {!isOfflineMode && (
                  <div className="flex items-center my-4 text-white/20">
                    <div className="flex-grow border-t border-white/10" />
                    <span className="px-2 text-[9px] font-mono uppercase">or PIN fallback</span>
                    <div className="flex-grow border-t border-white/10" />
                  </div>
                )}

                <div className="relative mb-4">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    placeholder="Enter admin passcode..."
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-center font-mono letter-spacing-lg"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-3 text-xs font-mono tracking-wider font-bold text-white/60 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleAdminAuth}
                    className="flex-1 py-3 text-xs font-mono tracking-wider font-bold text-white bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl hover:shadow-[0_0_15px_rgba(0,180,255,0.3)] transition-all cursor-pointer"
                  >
                    VERIFY
                  </button>
                </div>
                
                <div className="mt-4 text-[9px] text-white/20 font-mono">
                  HINT: 'sauvikdev' or 'admin'
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/* --- SUB COMPONENT: CUSTOM IN-CHAT FORM FOR CONTACT SYSTEM --- */
interface FormProps {
  msgId: string;
  onSubmitSuccess: () => void;
  labels: {
    invalidEmail: string;
    formHeader: string;
    submitButton: string;
    successMessage: string;
    spamAlert: string;
    spamBlocked: string;
  };
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  lastSubmitKey: string;
}

const InteractiveSubmitForm = ({ msgId, onSubmitSuccess, labels, showToast, lastSubmitKey }: FormProps) => {
  const { lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // Honeypot trap to capture automated spam bots
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || submitSuccess) return;

    // 1. Honeypot check
    if (honeypot.trim().length > 0) {
      showToast(labels.spamBlocked, 'error');
      console.warn('Spam trap triggered');
      return;
    }

    // 2. Client validations
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast(name.trim() ? (email.trim() ? 'Please provide detailed enquiry message' : 'Please fill out email field') : 'Please fill out name field', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast(labels.invalidEmail, 'error');
      return;
    }

    // 3. Simple Rate Limiting (60s check)
    const lastSubmitTime = localStorage.getItem(lastSubmitKey);
    const now = Date.now();
    if (lastSubmitTime && now - parseInt(lastSubmitTime, 10) < 60000) {
      showToast(labels.spamAlert, 'error');
      return;
    }

    setIsSubmitting(true);
    showToast(
      lang === 'en' 
        ? 'Sending your message...' 
        : 'আপনার বার্তা পাঠানো হচ্ছে...', 
      'info'
    );

    try {
      let success = false;
      const browserInfo = navigator.userAgent || 'Unknown Browser';

      // Submit via secure backend API endpoint
      let telegramResult: any = null;
      if (!isOfflineMode) {
        try {
          const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              message: message.trim(),
            }),
          });

          if (response.ok) {
            const resData = await response.json();
            success = !!resData.success;
            telegramResult = resData.telegramResult;
          } else {
            console.error('Backend API returned non-ok status:', response.status);
          }
        } catch (apiErr) {
          console.error('Backend API error, attempting direct client-side fallback:', apiErr);
        }
      }

      // Fallback/Direct write if API is unavailable or offline
      if (!success) {
        success = await addMessageToFirestore(
          name.trim(),
          email.trim(),
          message.trim(),
          browserInfo
        );
      }

      if (success) {
        setSubmitSuccess(true);
        localStorage.setItem(lastSubmitKey, String(Date.now()));
        showToast(labels.successMessage, 'success');
        
        if (telegramResult && !telegramResult.success) {
          setTimeout(() => {
            showToast(
              lang === 'en' 
                ? `⚡ Saved in DB but Telegram failed! Reason: ${telegramResult.reason}`
                : `⚡ ডাটাবেজে সেভ হয়েছে কিন্তু টেলিগ্রাম মেসেজ যায়নি! কারণ: ${telegramResult.reason}`,
              'error'
            );
          }, 1200);
        }
        onSubmitSuccess();
      } else {
        showToast('System dispatching failure', 'error');
      }
    } catch (err) {
      console.error('Submission failed', err);
      showToast('Error sending message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 w-full font-sans shadow-md relative overflow-hidden">
      {/* Indeterminate loader bar at the top of the form during submission */}
      {isSubmitting && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden z-10">
          <motion.div 
            className="h-full bg-gradient-to-r from-brand-blue to-brand-purple w-1/3 rounded"
            animate={{
              x: ['-100%', '300%']
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: 'linear'
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5 mb-4">
        <Mail size={13} className="text-[#00d2ff]" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          {labels.formHeader}
        </h3>
      </div>

      {submitSuccess ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 flex flex-col items-center gap-2 text-[#00ffbb]"
        >
          <CheckCircle2 size={24} />
          <p className="text-xs font-light text-neutral-300">
            {labels.successMessage}
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot field - completely invisible to real users but filled by spambots */}
          <div className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
            <input 
              type="text" 
              name="website_honey" 
              value={honeypot} 
              onChange={(e) => setHoneypot(e.target.value)} 
              tabIndex={-1} 
              autoComplete="off" 
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-white/50 tracking-wider mb-1 font-bold">
              Full Name
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. Siddhartha Ganguly"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-white/50 tracking-wider mb-1 font-bold">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-white/50 tracking-wider mb-1 font-bold">
              Detailed Inquiry Msg
            </label>
            <textarea
              required
              rows={3}
              disabled={isSubmitting}
              placeholder="Provide information on your project scope or freelance requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:shadow-[0_0_12px_rgba(0,180,255,0.2)] active:scale-95 transition-all text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <span>{labels.submitButton}</span>
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
