import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  Instagram, 
  Mail,
  X,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../App';

export const FloatingContact = () => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      id: 'whatsapp',
      name: lang === 'en' ? 'WhatsApp' : 'হোয়াটসঅ্যাপ',
      icon: <MessageCircle size={20} />,
      href: 'https://wa.me/919475331894?text=Hi%20Sauvik,%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20discuss%20a%20project!',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.30)]',
      tooltip: lang === 'en' ? 'Chat on WhatsApp' : 'হোয়াটসঅ্যাপে চ্যাট করুন',
    },
    {
      id: 'telegram',
      name: lang === 'en' ? 'Telegram' : 'টেলিগ্রাম',
      icon: <Send size={18} />,
      href: 'https://t.me/sauvikdev',
      bgColor: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(14,165,233,0.30)]',
      tooltip: lang === 'en' ? 'Message on Telegram' : 'টেলিগ্রামে মেসেজ করুন',
    },
    {
      id: 'instagram',
      name: lang === 'en' ? 'Instagram' : 'ইনস্টাগ্রাম',
      icon: <Instagram size={18} />,
      href: 'https://instagram.com/sauvikdev.in',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(236,72,153,0.30)]',
      tooltip: lang === 'en' ? 'Follow on Instagram' : 'ইনস্টাগ্রামে ফলো করুন',
    },
    {
      id: 'email',
      name: lang === 'en' ? 'Email' : 'ইমেইল',
      icon: <Mail size={18} />,
      href: 'mailto:sauvikd68@gmail.com?subject=Collaborative Inquiry from Portfolio',
      bgColor: 'bg-brand-blue/10 hover:bg-brand-blue/20 text-[#00d2ff] border-brand-blue/30',
      glowColor: 'shadow-[0_0_15px_rgba(0,210,255,0.30)]',
      tooltip: lang === 'en' ? 'Send an Email' : 'ইমেইল পাঠান',
    },
  ];

  return (
    <div className="fixed bottom-8 left-8 z-[150] flex flex-col items-start font-sans">
      <div className="relative flex flex-col items-start">
        {/* Expanded Options */}
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col gap-3.5 mb-4 items-start pl-1">
              {contactOptions.map((opt, idx) => (
                <motion.div
                  key={opt.id}
                  initial={{ opacity: 0, y: 15, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 22,
                    delay: idx * 0.05 
                  }}
                  className="flex items-center gap-3 group/item pointer-events-auto"
                >
                  <a
                    href={opt.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 backdrop-blur-md ${opt.bgColor} ${opt.glowColor} hover:scale-110 active:scale-95`}
                  >
                    {opt.icon}
                  </a>

                  {/* Tooltip Label */}
                  <span className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#0e0e15] border border-white/5 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 shadow-lg pointer-events-none tracking-wide whitespace-nowrap">
                    {opt.tooltip}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center border font-semibold text-white transition-all duration-300 shadow-xl cursor-pointer ${
            isOpen 
              ? 'bg-[#151522] border-white/10 hover:border-white/30 hover:scale-105' 
              : 'bg-gradient-to-r from-brand-blue to-brand-purple border-white/10 shadow-brand-blue/20 hover:shadow-brand-purple/30 hover:scale-110'
          }`}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle Floating Contact Widgets"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="msg-icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageSquare size={22} />
                {/* Visual pulse alert for user notice */}
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#000] scale-100 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#000]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};
