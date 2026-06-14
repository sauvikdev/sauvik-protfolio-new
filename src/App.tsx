/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'motion/react';
import { ToastProvider, useToast } from './components/Toast';
import { AskSauvikAI } from './components/AskSauvikAI';
import { FloatingContact } from './components/FloatingContact';
import { 
  Code2, 
  Video, 
  Palette, 
  ExternalLink, 
  Mail, 
  Globe, 
  MapPin,
  Instagram, 
  Linkedin,
  Twitter,
  Github,
  Send,
  ChevronRight,
  Monitor,
  Cpu,
  Smartphone,
  CheckCircle2,
  X,
  Hexagon,
  ShieldCheck,
  Lock,
  CreditCard,
  Moon,
  Sun,
  Zap,
  DollarSign,
  Heart,
  MessageCircle,
  Award,
  Star,
  Quote,
  Download,
  MessageSquare,
  ArrowUp,
  ChevronDown
} from 'lucide-react';

// --- Security Hook ---

const useContentProtection = () => {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's')) ||
        (e.ctrlKey && (e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. DevTools Detection (Basic)
    let devtoolsOpen = false;
    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          console.warn('%cThis site is protected. Unauthorized copying is prohibited.', 'color: red; font-size: 20px; font-weight: bold;');
          // alert('Inspecting is not allowed');
          devtoolsOpen = true;
        }
      } else {
        devtoolsOpen = false;
      }
    };

    // 4. Disable Print
    const handleBeforePrint = () => {
      document.body.style.display = 'none';
      setTimeout(() => {
        document.body.style.display = 'block';
      }, 100);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkDevTools);
    window.addEventListener('beforeprint', handleBeforePrint);

    // Initial console warning
    console.log('%cSAUVIKDEV.IN PROTECTION SYSTEM ACTIVE', 'color: #00d2ff; font-weight: bold; font-size: 14px;');
    console.log('%cUnauthorized access or copying of content is strictly prohibited.', 'color: #888;');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkDevTools);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);
};

// --- Language/Internationalization (i18n) Context & Dictionary ---

export type Language = 'en' | 'bn';

const translations = {
  en: {
    // Navigation / General
    'nav_home': 'Home',
    'nav_about': 'About',
    'nav_portfolio': 'Portfolio',
    'nav_work_segments': 'Work segments',
    'nav_skill': 'Skill',
    'nav_contact': 'Contact',
    'hire_me': 'HIRE ME',
    'view_cv': 'View CV',
    'archive': 'Archive',
    'process': 'Process',
    'feedback': 'Feedback',
    'investment': 'Investment',
    'get_in_touch': 'Get In Touch',
    'back_to_top': 'Back to Top',
    'open_artifact': 'Open Artifact',
    'expertise': 'Expertise',

    // Hero Section
    'premium_exp': 'Premium Digital Experiences',
    'i_am': 'I am',
    'hero_tagline': "I'm a Web Developer & Editor",

    // Brand Marquee Services
    'service_web_dev': 'Web Development',
    'service_ui_ux': 'UI/UX Design',
    'service_video_edit': 'Video Editing',
    'service_motion': 'Motion Graphics',
    'service_strategy': 'Digital Strategy',
    'service_design': 'Graphic Design',
    'service_identity': 'Brand Identity',
    'service_cinema': 'Cinematography',

    // About Section
    'about_title': 'The Creative Spirit',
    'about_desc': 'Crafting modern websites, engaging videos, and high-quality poster designs with a focus on immersive user experiences.',
    'projects_done': 'Projects Done',
    'experience_label': 'Experience',
    'experience_years': '3+ Years',

    // Why Choose Me Section
    'why_choose_me_title_1': 'Why',
    'why_choose_me_title_2': 'Choose',
    'why_choose_me_title_3': 'Me?',
    'point_fast_delivery_title': 'Fast Delivery',
    'point_fast_delivery_desc': 'Quick turnaround without compromising on quality.',
    'point_affordable_title': 'Affordable Pricing',
    'point_affordable_desc': 'Top-tier results at a price that respects your budget.',
    'point_creative_title': 'Creative Design',
    'point_creative_desc': 'Unique visual identities that stand out in the noise.',
    'point_friendly_title': 'Friendly Communication',
    'point_friendly_desc': 'Crystal clear updates and collaborative spirit.',
    'point_quality_title': 'Quality Work',
    'point_quality_desc': 'Meticulous attention to detail in every single pixel.',

    // Testimonials
    'feedback_subtitle': 'Feedback',
    'testimonial_title_main': 'Client',
    'testimonial_title_span': 'Stories',
    'rev1_name': 'Saikat Sarkar',
    'rev1_text': 'Sauvik transformed our vision into a digital masterpiece. The speed and quality were unmatched.',
    'rev2_name': 'Aniket Dey',
    'rev2_text': 'Incredible attention to detail. The branding and website look absolutely futuristic!',
    'rev3_name': 'Arko Paul',
    'rev3_text': 'Professional, creative, and very easy to work with. Highly recommended for any high-end project.',

    // Portfolio
    'portfolio_subtitle': 'Visual Gallery',
    'portfolio_title_main': 'Impactful',
    'portfolio_title_span': 'Results',
    'portfolio_desc': 'A showcase of cinematic edits, high-quality poster designs and performance web applications.',
    'port_title_1': 'Futuristic Visuals',
    'port_cat_1': 'Poster Design',
    'port_title_2': 'Web Experience',
    'port_cat_2': 'Development',
    'port_title_3': 'Cinematic Motion',
    'port_cat_3': 'Video Edit',

    // Work Gallery
    'work_segments_title_1': 'Work',
    'work_segments_title_2': 'Segments',
    'cat_banner_title': 'Banner Editing',
    'cat_banner_label': 'Banners',
    'cat_editing_title': 'General Editing',
    'cat_editing_label': 'Retouching',
    'cat_motion_title': 'Motion & FX',
    'cat_motion_label': 'Visuals',
    'cat_design_title': 'Design Concepts',
    'cat_design_label': 'Brand',
    'slot_label': 'Slot',

    // Pricing
    'pricing_title_main': 'Pricing',
    'pricing_title_span': 'Packages',
    'plan_intro': 'Select the plan that best fits your project vision.',
    'per_project': '/ project',
    'popular_badge': 'Most Popular',
    'plan_basic': 'Basic',
    'plan_standard': 'Standard',
    'plan_premium': 'Premium',
    'feature_single_page': 'Single Page Website',
    'feature_basic_video': 'Basic Video Editing',
    'feature_design_concepts_2': '2 Design Concepts',
    'feature_fast_delivery': 'Fast Delivery',
    'feature_multi_page': 'Multi-page Website',
    'feature_pro_video': 'Pro Video Editing',
    'feature_design_concepts_5': '5 Design Concepts',
    'feature_priority_support': 'Priority Support',
    'feature_full_custom': 'Full Custom Development',
    'feature_cinematic': 'Cinematic Production',
    'feature_unlimited_designs': 'Unlimited Designs',
    'feature_dedicated_manager': 'Dedicated Manager',
    'choose_plan': 'Choose Plan',

    // Skills
    'skills_title_main': 'Technical',
    'skills_title_span': 'Prowess',
    'skills_desc': 'The digital arsenal used to shape immersive experiences.',
    'skill_label_ui': 'UI Design',
    'skill_label_perf': 'Fast Performance',
    'skill_label_resp': 'Responsiveness',
    'skill_label_global': 'Global Standard',

    // Contact
    'contact_title_prefix': "Let's Ignite",
    'contact_title_span': 'The Next',
    'contact_title_suffix': 'Vision.',
    'contact_description': 'Available for immersive web solutions, cinematic visual production, and high-impact design collaborations.',
    'email_label': 'Email',
    'website_label': 'Website',
    'location_label': 'Location',
    'location_value': 'Gangasagar, West Bengal, India',
    'instagram_label': 'Instagram',
    'form_label_name': 'Name',
    'form_label_email': 'Email Address',
    'form_label_message': 'Message',
    'form_placeholder_identity': 'Your identity...',
    'form_placeholder_email': 'your@email.com',
    'form_placeholder_message': 'Tell me about your amazing vision...',
    'btn_send_message': 'Send Message',
    'btn_sending': 'Sending...',

    // Footer
    'footer_copyright': '© 2026 Sauvik Das Portfolio. All rights reserved.',
    'footer_byline': 'Designed with precision & futuristic glow.',

    // CV Modal
    'cv_web_dev_designer': 'Web Developer & Digital Designer',
    'cv_loc': 'Gangasagar, South 24 Parganas, West Bengal, India',
    'cv_objective': 'Objective',
    'cv_objective_text': 'Passionate and creative Web Developer & Digital Designer seeking opportunities to build modern, user-friendly, and impactful digital experiences. I aim to deliver high-quality work that helps clients grow their online presence.',
    'cv_skills': 'Skills',
    'cv_prof_exp': 'Professional Experience',
    'cv_freelance_dev': 'Freelance Web Developer',
    'cv_freelance_dev_desc': 'Build and design responsive portfolio & service websites using HTML, CSS, JavaScript, and React.',
    'cv_video_creator': 'Video Creator & Editor',
    'cv_video_creator_desc': 'Creating high-impact cinematic edits, montages, and educational programming for online audiences.',
    'cv_education': 'Education',
    'cv_degree': 'Bachelor of Arts (General)',
    'cv_school': 'Mankar College, Burdwan University',
    'cv_projects': 'Projects',
    'cv_portfolio_project': 'Portfolio Website',
    'cv_portfolio_project_desc': 'Designed and developed a highly optimized, fully secure responsive personal portfolio utilizing glassmorphism and motion libraries.',
    'cv_landing_pages': 'Custom Landing Pages',
    'cv_landing_pages_desc': 'Collaborated with small business owners to create bespoke product showcases.',
    'cv_video_work': 'Video Editing Work',
    'cv_video_work_desc': 'Edited professional videos for content creators.',
    'cv_pdf_doc': 'Portfolio Document',
    'cv_personal_info': 'Personal Info',
    'cv_father_name': "Father's Name",
    'cv_mother_name': "Mother's Name",
    'cv_dob': 'Date of Birth',
    'cv_gender': 'Gender',
    'cv_male': 'Male',
    'cv_nationality': 'Nationality',
    'cv_indian': 'Indian',
    'cv_maritial': 'Marital Status',
    'cv_single': 'Single',
    'cv_languages': 'Languages Known',
    'cv_lang_list': 'Bengali (Native), Hindi, English',
    'cv_address': 'Permanent Address',
    'cv_declaration': 'Declaration',
    'cv_declaration_text': 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
    'faq_subtitle': 'FAQ',
    'faq_title_1': 'Frequently Asked',
    'faq_title_2': 'Questions',
    'faq_q1': 'What services do you offer?',
    'faq_a1': 'I specialize in full-stack/client-side web development (React, HTML/CSS, JS), aesthetic graphic design (social media banners, posters, brand visuals), and high-quality video editing/motion graphics.',
    'faq_q2': 'Which technologies do you use for web development?',
    'faq_a2': 'My core web stack includes React, TypeScript, HTML5, CSS3, Tailwind CSS, JavaScript, and Vite. I focus on creating highly responsive, pixel-perfect, and exceptionally fast-loading digital web experiences.',
    'faq_q3': 'What software do you use for video editing and poster design?',
    'faq_a3': 'For graphic design, I utilize Photoshop, Illustrator, and Canva. For video production and motion graphics, my tools of choice are Adobe Premiere Pro, After Effects, and CapCut.',
    'faq_q4': 'How do you handle pricing and project timelines?',
    'faq_a4': 'Pricing depends on standard tiers (Basic, Standard, Premium packages) which can also be customized. Simple projects take 2-4 days, while complex custom development is tailored dynamically. Friendly communication is ensured throughout.',
    'faq_q5': 'Are you open to custom freelancer contracts or long-term team roles?',
    'faq_a5': 'Yes, I am completely open to both short-term freelance contract collaborations and full-time or long-term roles. Please reach out via the Gmail inquiry form below or through direct message!',
  },
  bn: {
    // Navigation / General
    'nav_home': 'মূল পাতা',
    'nav_about': 'সম্পর্কে',
    'nav_portfolio': 'পোর্টফোলিও',
    'nav_work_segments': 'কাজসমূহ',
    'nav_skill': 'দক্ষতা',
    'nav_contact': 'যোগাযোগ',
    'hire_me': 'যোগাযোগ করুন',
    'view_cv': 'সিভি দেখুন',
    'archive': 'আর্কাইভ',
    'process': 'প্রক্রিয়া',
    'feedback': 'ফিডব্যাক',
    'investment': 'বিনিয়োগ',
    'get_in_touch': 'যোগাযোগ করুন',
    'back_to_top': 'উপরে যান',
    'open_artifact': 'ছবি খুলুন',
    'expertise': 'দক্ষতা ক্ষেত্র',

    // Hero Section
    'premium_exp': 'প্রিমিয়াম ডিজিটাল অভিজ্ঞতা',
    'i_am': 'আমি',
    'hero_tagline': 'আমি একজন ওয়েব ডেভেলপার এবং এডিটর',

    // Brand Marquee Services
    'service_web_dev': 'ওয়েব ডেভেলপমেন্ট',
    'service_ui_ux': 'ইউআই / ইউএক্স ডিজাইন',
    'service_video_edit': 'ভিডিও এডিটিং',
    'service_motion': 'মোশন গ্রাফিক্স',
    'service_strategy': 'ডিজিটাল কৌশল',
    'service_design': 'গ্রাফিক ডিজাইন',
    'service_identity': 'ব্র্যান্ড আইডেন্টিটি',
    'service_cinema': 'সিনেমাটোগ্রাফি',

    // About Section
    'about_title': 'সৃজনশীল চেতনা',
    'about_desc': 'নিমজ্জিত ব্যবহারকারী অভিজ্ঞতার উপর ফোকাস সহ আধুনিক ওয়েবসাইট, আকর্ষণীয় ভিডিও এবং উচ্চ-মানের পোস্টার ডিজাইন তৈরি করা।',
    'projects_done': 'সম্পন্ন প্রজেক্ট',
    'experience_label': 'অভিজ্ঞতা',
    'experience_years': '৩+ বছর',

    // Why Choose Me Section
    'why_choose_me_title_1': 'কেন',
    'why_choose_me_title_2': 'আমাকে',
    'why_choose_me_title_3': 'পছন্দ করবেন?',
    'point_fast_delivery_title': 'দ্রুত ডেলিভারি',
    'point_fast_delivery_desc': 'মানের সাথে আপস না করে দ্রুততম সময়ে ডেলিভারি প্রদান।',
    'point_affordable_title': 'সাশ্রয়ী মূল্য',
    'point_affordable_desc': 'আপনার বাজেটকে সম্মান করে এমন মূল্যে সেরা ফলাফল।',
    'point_creative_title': 'সৃজনশীল ডিজাইন',
    'point_creative_desc': 'অনন্য ভিজ্যুয়াল আইডেন্টিটি যা আপনাকে অন্যদের থেকে আলাদা করবে।',
    'point_friendly_title': 'বন্ধুসুলভ যোগাযোগ',
    'point_friendly_desc': 'সহজ আপডেট এবং সুন্দর সহযোগিতামূলক মনোভাব।',
    'point_quality_title': 'গুণগত কাজ',
    'point_quality_desc': 'প্রতিটি পিক্সেলে নিখুঁত সুক্ষ্ম নজর ও আন্তরিক কাজ।',

    // Testimonials
    'feedback_subtitle': 'ফিডব্যাক',
    'testimonial_title_main': 'গ্রাহকদের',
    'testimonial_title_span': 'মতামত',
    'rev1_name': 'সৈকত সরকার',
    'rev1_text': 'সৌভিক আমাদের স্বপ্নকে একটি ডিজিটাল মাস্টারপিসে রূপান্তরিত করেছেন। তার গতি এবং গুণমান অতুলনীয় ছিল।',
    'rev2_name': 'অনিকেত দে',
    'rev2_text': 'কাজের প্রতিটি ডিটেলে অবিশ্বাস্য মনোযোগ। ব্র্যান্ডিং এবং ওয়েবসাইটটি দেখতে চমৎকার কাল্পনিক যুগের মতো মনে হয়!',
    'rev3_name': 'অর্ক পাল',
    'rev3_text': 'পেশাদার, সৃজনশীল এবং যার সাথে কাজ করা খুব সহজ। যে কোনো উন্নত প্রকল্পের জন্য তাকে অত্যন্ত সুপারিশ করছি।',

    // Portfolio
    'portfolio_subtitle': 'ভিজ্যুয়াল গ্যালারি',
    'portfolio_title_main': 'প্রভাবশালী',
    'portfolio_title_span': 'ফলাফল',
    'portfolio_desc': 'সিনেমাটিক এডিট, উচ্চ মানের পোস্টার ডিজাইন এবং আধুনিক কর্মক্ষম ওয়েব অ্যাপ্লিকেশনের সংগ্রহশালা।',
    'port_title_1': 'ভবিষ্যতধর্মী ভিজ্যুয়াল',
    'port_cat_1': 'পোস্টার ডিজাইন',
    'port_title_2': 'ওয়েব অভিজ্ঞতা',
    'port_cat_2': 'ডেভেলপমেন্ট',
    'port_title_3': 'সিনেমাটিক মোশন',
    'port_cat_3': 'ভিডিও এডিটিং',

    // Work Gallery
    'work_segments_title_1': 'কাজ',
    'work_segments_title_2': 'বিভাগসমূহ',
    'cat_banner_title': 'ব্যানার এডিটিং',
    'cat_banner_label': 'ব্যানার্স',
    'cat_editing_title': 'সাধারণ এডিটিং',
    'cat_editing_label': 'রিটাচিং',
    'cat_motion_title': 'মোশন ও এফএক্স',
    'cat_motion_label': 'ভিজ্যুয়াল',
    'cat_design_title': 'ডিজাইন কনসেপ্টস',
    'cat_design_label': 'ব্র্যান্ড',
    'slot_label': 'স্লট',

    // Pricing
    'pricing_title_main': 'মূল্য নির্ধারণ',
    'pricing_title_span': 'প্যাকেজসমূহ',
    'plan_intro': 'আপনার প্রকল্পের পরিকল্পনার জন্য সবচেয়ে উপযুক্ত প্ল্যানটি নির্বাচন করুন।',
    'per_project': '/ প্রজেক্ট',
    'popular_badge': 'সবচেয়ে জনপ্রিয়',
    'plan_basic': 'বেসিক',
    'plan_standard': 'স্ট্যান্ডার্ড',
    'plan_premium': 'প্রিমিয়াম',
    'feature_single_page': 'এক পাতার ওয়েবসাইট',
    'feature_basic_video': 'সাধারণ ভিডিও এডিটিং',
    'feature_design_concepts_2': '২টি ডিজাইন কনসেপ্ট',
    'feature_fast_delivery': 'দ্রুত ডেলিভারি',
    'feature_multi_page': 'বহু পাতার ওয়েবসাইট',
    'feature_pro_video': 'প্রো ভিডিও এডিটিং',
    'feature_design_concepts_5': '৫টি ডিজাইন কনসেপ্ট',
    'feature_priority_support': 'অগ্রাধিকার সাপোর্ট',
    'feature_full_custom': 'সম্পূর্ণ কাস্টম ডেভেলপমেন্ট',
    'feature_cinematic': 'সিনেমাটিক প্রোডাকশন',
    'feature_unlimited_designs': 'আনলিমিটেড কালার ডিজাইন',
    'feature_dedicated_manager': 'ডেডিকেটেড ম্যানেজার',
    'choose_plan': 'প্ল্যান বেছে নিন',

    // Skills
    'skills_title_main': 'প্রযুক্তিগত',
    'skills_title_span': 'দক্ষতা',
    'skills_desc': 'চমৎকার এবং আধুনিক ডিজিটাল অভিজ্ঞতা তৈরি করতে ব্যবহৃত প্রযুক্তিগত সরঞ্জামসমূহ।',
    'skill_label_ui': 'ইউআই ডিজাইন',
    'skill_label_perf': 'দ্রুততম পারফরম্যান্স',
    'skill_label_resp': 'রেসপন্সিভনেস',
    'skill_label_global': 'বৈশ্বিক মানদণ্ড',

    // Contact
    'contact_title_prefix': 'আসুন শুরু করি',
    'contact_title_span': 'নতুন কোনো',
    'contact_title_suffix': 'পরিকল্পনা।',
    'contact_description': 'সহজ ওয়েব সমাধান, সিনেমাটিক ভিজ্যুয়াল এবং উচ্চ-মানের ডিজাইন সহযোগিতার জন্য উপলব্ধ।',
    'email_label': 'ইমেইল',
    'website_label': 'ওয়েবসাইট',
    'location_label': 'অবস্থান',
    'location_value': 'গঙ্গাসাগর, পশ্চিমবঙ্গ, ভারত',
    'instagram_label': 'ইনস্টাগ্রাম',
    'form_label_name': 'নাম',
    'form_label_email': 'ইমেইল ঠিকানা',
    'form_label_message': 'বার্তা',
    'form_placeholder_identity': 'আপনার নাম...',
    'form_placeholder_email': 'your@email.com',
    'form_placeholder_message': 'আপনার সুন্দর পরিকল্পনা সম্পর্কে বলুন...',
    'btn_send_message': 'বার্তা পাঠান',
    'btn_sending': 'পাঠানো হচ্ছে...',

    // Footer
    'footer_copyright': '© ২০২৬ সৌভিক দাস পোর্টফোলিও। সর্বস্বত্ব সংরক্ষিত।',
    'footer_byline': 'নির্ভুলতা এবং ভবিষ্যৎধর্মী উজ্জ্বলতার সাথে ডিজাইনকৃত।',

    // CV Modal
    'cv_web_dev_designer': 'ওয়েব ডেভেলপার এবং ডিজিটাল ডিজাইনার',
    'cv_loc': 'গঙ্গাসাগর, দক্ষিণ ২৪ পরগণা, পশ্চিমবঙ্গ, ভারত',
    'cv_objective': 'উদ্দেশ্য',
    'cv_objective_text': 'উত্সাহী এবং পরিশ্রমী ওয়েব ডেভেলপার এবং ডিজিটাল ডিজাইনার হিসাবে এমন সুযোগের সন্ধান করছি যা আধুনিক, ব্যবহারকারী-বান্ধব এবং প্রভাবশালী ডিজিটাল অভিজ্ঞতা তৈরি করতে সাহায্য করে। আমার লক্ষ্য উচ্চ-মানের কাজ প্রদান করা যা ক্লায়েন্টদের অনলাইন উপস্থিতি বাড়াতে সাহায্য করবে।',
    'cv_skills': 'দক্ষতাসমূহ',
    'cv_prof_exp': 'পেশাগত অভিজ্ঞতা',
    'cv_freelance_dev': 'ফ্রিল্যান্স ওয়েব ডেভেলপার',
    'cv_freelance_dev_desc': 'HTML, CSS, JavaScript এবং React ব্যবহার করে রেসপন্সিভ পোর্টফোলিও এবং সার্ভিসের ওয়েবসাইট তৈরি ও ডিজাইন।',
    'cv_video_creator': 'ভিডিও নির্মাতা ও সম্পাদক',
    'cv_video_creator_desc': 'অনলাইন দর্শকদের জন্য অত্যন্ত আকর্ষক সিনেমাটিক এডিট, ভিডিও মন্টেজ এবং শিক্ষামূলক কন্টেন্ট তৈরি করা।',
    'cv_education': 'শিক্ষা',
    'cv_degree': 'বি.এ. (সাধারণ)',
    'cv_school': 'মানকর কলেজ, বর্ধমান বিশ্ববিদ্যালয়',
    'cv_projects': 'প্রকল্পসমূহ',
    'cv_portfolio_project': 'পোর্টফোলিও ওয়েবসাইট',
    'cv_portfolio_project_desc': 'গ্লাসমরফিজম এবং মোশন লাইব্রেরির সাহায্যে অত্যন্ত সুরক্ষিত এবং অপ্টিমাইজড রেসপন্সিভ ব্যক্তিগত পোর্টফোলিও ডিজাইন ও বিকাশ।',
    'cv_landing_pages': 'কাস্টম ল্যান্ডিং পেজ',
    'cv_landing_pages_desc': 'ছোট ব্যবসার জন্য তাদের পণ্যের চমৎকার প্রদর্শনী ল্যান্ডিং পেজ তৈরি করা।',
    'cv_video_work': 'ভিডিও এডিটিংয়ের কাজ',
    'cv_video_work_desc': 'বিভিন্ন কন্টেন্ট ক্রিয়েটরদের জন্য প্রফেশনাল ভিডিও এডিটিং করা।',
    'cv_pdf_doc': 'পোর্টফোলিও ডকুমেন্ট',
    'cv_personal_info': 'ব্যক্তিগত তথ্য',
    'cv_father_name': 'পিতার নাম',
    'cv_mother_name': 'মাতার নাম',
    'cv_dob': 'জন্ম তারিখ',
    'cv_gender': 'লিঙ্গ',
    'cv_male': 'পুরুষ',
    'cv_nationality': 'জাতীয়তা',
    'cv_indian': 'ভারতীয়',
    'cv_maritial': 'বৈবাহিক অবস্থা',
    'cv_single': 'অবিবাহিত',
    'cv_languages': 'পরিচিত ভাষা',
    'cv_lang_list': 'বাংলা (মাতৃভাষা), হিন্দি, ইংরেজি',
    'cv_address': 'স্থায়ী ঠিকানা',
    'cv_declaration': 'ঘোষণা',
    'cv_declaration_text': 'আমি এতদ্বারা ঘোষণা করছি যে উপরে প্রদত্ত সমস্ত তথ্য আমার সর্বোত্তম জ্ঞান এবং বিশ্বাস অনুযায়ী সম্পূর্ণ সত্য এবং সঠিক।',
    'faq_subtitle': 'এফএকিউ',
    'faq_title_1': 'সাধারণ জিজ্ঞাসা ও',
    'faq_title_2': 'উত্তর',
    'faq_q1': 'আপনি কী কী সেবা অফার করেন?',
    'faq_a1': 'আমি ওয়েব ডেভেলপমেন্ট (রিঅ্যাক্ট, HTML/CSS, JS), নান্দনিক গ্রাফিক ডিজাইন (সোশ্যাল মিডিয়া ব্যানার, পোস্টার, ব্র্যান্ড ভিজ্যুয়াল) এবং পেশাদার মানের ভিডিও এডিটিং/মোশন গ্রাফিক্সে পারদর্শী।',
    'faq_q2': 'ওয়েব ডেভেলপমেন্টের জন্য আপনি কোন প্রযুক্তি ব্যবহার করেন?',
    'faq_a2': 'আমার মূল বা প্রধান ওয়েব স্ট্যাকের মধ্যে রয়েছে রিঅ্যাক্ট, টাইপস্ক্রিপ্ট, HTML5, CSS3, টেলউইন্ড সিএসএস, জাভাস্ক্রিপ্ট এবং ভাইট। আমি সর্বদাই অত্যন্ত রেসপন্সিভ এবং দ্রুতগতির ডিজিটাল ওয়েব অভিজ্ঞতা তৈরিতে মনোনিবেশ করি।',
    'faq_q3': 'ভিডিও এডিটিং এবং ডিজাইন কাজের জন্য কোন সফটওয়্যার ব্যবহার করেন?',
    'faq_a3': 'ডিজাইনের জন্য আমি ফটোশপ, ইলাস্ট্রেটর এবং ক্যানভা ব্যবহার করি। ভিডিও প্রোডাকশন এবং মোশন গ্রাফিক্সের জন্য আমার পছন্দের প্রধান টুলগুলো হল অ্যাডোবি প্রিমিয়ার প্রো, আফটার ইফেক্টস এবং ক্যাপকাট।',
    'faq_q4': 'আপনি কাজের মূল্য এবং প্রকল্পের সময়সীমা কীভাবে নির্ধারণ করেন?',
    'faq_a4': 'কাজের মূল্য সাধারণত নির্ধারিত প্যাকেজ (বেসিক, স্ট্যান্ডার্ড, প্রিমিয়াম) অনুযায়ী বা প্রজেক্ট অনুযায়ী আলোচনা সাপেক্ষে হতে পারে। সাধারণ কাজ ২-৪ দিনে শেষ হয় এবং কাস্টম ডেভেলপমেন্টের ক্ষেত্রে সময় আলোচনা সাপেক্ষে নির্ধারিত হয়।',
    'faq_q5': 'আপনি কি ফ্রিল্যান্স চুক্তি বা দীর্ঘমেয়াদী কাজ করার জন্য উপলব্ধ?',
    'faq_a5': 'হ্যাঁ, আমি স্বল্পমেয়াদী ফ্রিল্যান্স চুক্তি এবং দীর্ঘমেয়াদী বা ফুল-টাইম দলগত উভয় কাজের জন্য সম্পূর্ণ উপলব্ধ। নিচে দেওয়া জিমেইল ইনকোয়ারি ফর্ম বা ডিরেক্ট মেসেজের মাধ্যমে আমার সাথে যোগাযোগ করতে পারেন!',
  },
};

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('portfolio_lang') as Language;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('portfolio_lang', newLang);
  };

  const t = (key: string): string => {
    const dict = translations[lang];
    if (key in dict) {
      return (dict as any)[key];
    }
    // Fallback to English dictionary
    const fallbackDict = translations['en'];
    if (key in fallbackDict) {
      return (fallbackDict as any)[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// --- Components ---

const GlowingDivider = () => {
  return (
    <div className="relative w-full h-[1px] flex justify-center items-center pointer-events-none my-1">
      {/* Central glowing light streak with motion animation */}
      <motion.div 
        initial={{ width: "0%", opacity: 0 }}
        whileInView={{ width: "100%", opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute h-[1px] bg-gradient-to-r from-transparent via-brand-blue to-transparent w-full"
      />
      
      {/* Reversing light streak to cross/blend */}
      <motion.div 
        initial={{ width: "0%", opacity: 0 }}
        whileInView={{ width: "80%", opacity: 0.8 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
        className="absolute h-[1px] bg-gradient-to-r from-transparent via-brand-purple to-transparent w-[80%]"
      />

      {/* The glowing blur background */}
      <motion.div 
        initial={{ opacity: 0, scaleX: 0.5 }}
        whileInView={{ opacity: [0, 0.4, 0.2], scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
        className="absolute h-8 w-[60%] bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent blur-md pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scaleX: 0.5 }}
        whileInView={{ opacity: [0, 0.3, 0.15], scaleX: 0.8 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
        className="absolute h-6 w-[40%] bg-gradient-to-r from-transparent via-brand-purple/20 to-transparent blur-lg pointer-events-none"
      />

      {/* Center diamond flare or accent node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, delay: 0.8 }}
        className="absolute w-2.5 h-2.5 rotate-45 border border-brand-blue/40 bg-app-bg shadow-[0_0_8px_rgba(0,210,255,0.8)] z-10"
      />
    </div>
  );
};

const ThemeToggle = ({ isDark, toggle }: { isDark: boolean, toggle: () => void }) => (
  <button 
    onClick={toggle}
    className="p-2 rounded-full bg-white/5 border border-glass-border text-brand-blue hover:bg-white/10 transition-all"
    aria-label="Toggle Theme"
  >
    {isDark ? <Sun size={18} /> : <Moon size={18} />}
  </button>
);

const Navbar = ({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-app-bg/60 backdrop-blur-xl border-b border-glass-border py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 group"
        >
          <a 
            href="https://sauvikdev.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2.5"
          >
            <div className="relative flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-8 h-8 text-brand-blue group-hover:scale-110 transition-transform duration-300" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d2ff" />
                    <stop offset="100%" stopColor="#0066ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M80 33 L50 16 L20 33 L20 45 L80 55 L80 67 L50 84 L20 67"
                  stroke="url(#logo-gradient)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute inset-0 bg-brand-blue/20 blur-md rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-grotesk font-semibold text-lg sm:text-xl text-white tracking-tight flex items-center leading-none">
              Sauvik<span className="text-brand-blue">Dev.in</span>
            </span>
          </a>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex space-x-8 text-[10px] font-semibold uppercase tracking-widest text-white/70"
        >
          {[
            { name: t('nav_home'), href: '#home' },
            { name: t('nav_about'), href: '#about' },
            { name: t('nav_portfolio'), href: '#portfolio' },
            { name: t('nav_work_segments'), href: '#work-segments' },
            { name: t('nav_skill'), href: '#skills' },
            { name: t('nav_contact'), href: '#contact' }
          ].map((item) => (
            <a 
              key={item.href} 
              href={item.href}
              className="hover:text-white transition-colors relative group whitespace-nowrap"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all group-hover:w-full" />
            </a>
          ))}
        </motion.div>

        <div className="flex items-center gap-4">
          {/* Glowing Dual-Pill Language Switcher */}
          <div className="flex items-center bg-white/5 border border-glass-border rounded-full p-1 text-[10px] font-mono">
            <button 
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full transition-all tracking-wider font-bold cursor-pointer ${lang === 'en' ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md shadow-brand-blue/20' : 'text-white/40 hover:text-white/80'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 rounded-full transition-all tracking-wider font-bold cursor-pointer ${lang === 'bn' ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md shadow-brand-purple/20' : 'text-white/40 hover:text-white/80'}`}
            >
              বাংলা
            </button>
          </div>

          <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          
          <a 
            href="mailto:sauvikd68@gmail.com?subject=Collaborative Inquiry from Portfolio"
            className="hidden md:block px-6 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold rounded-full hover:scale-105 transition-transform tracking-widest text-center"
          >
            {t('hire_me')}
          </a>
        </div>
        <button className="md:hidden text-white">
          <ChevronRight className="rotate-90" />
        </button>
      </div>
    </nav>
  );
};

const CVModal = ({ isOpen, onClose, isDark }: { isOpen: boolean; onClose: () => void; isDark: boolean }) => {
  if (!isOpen) return null;
  const { t, lang } = useLanguage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className={`relative max-w-2xl w-full rounded-2xl shadow-2xl p-8 md:p-12 border border-glass-border ${
            isDark ? 'bg-[#0a0a0f] text-white' : 'bg-white text-gray-900 border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-8 text-gray-500 hover:text-brand-blue transition-colors"
          >
            <X size={28} />
          </button>

          <header className="mb-12 border-b border-glass-border pb-8">
            <h2 className="text-4xl font-bold mb-2 tracking-tight">SAUVIK DAS</h2>
            <p className="text-brand-blue font-bold uppercase tracking-[0.2em] text-xs">{t('cv_web_dev_designer')}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">📧 sauvikd68@gmail.com</span>
              <span className="flex items-center gap-1">📸 Instagram: @sauvikdev.in</span>
            </div>
          </header>

          <div className="space-y-10">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-purple mb-4 flex items-center gap-2">
                <Hexagon size={14} className="fill-brand-purple/20" /> {t('cv_objective')}
              </h3>
              <p className="text-sm font-light leading-relaxed opacity-80">
                {t('cv_objective_text')}
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-10">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-blue mb-4 flex items-center gap-2">
                  <Monitor size={14} /> {t('cv_skills')}
                </h3>
                <ul className="space-y-2 text-sm opacity-80 font-light">
                  <li className="flex justify-between"><span>HTML</span><span>90%</span></li>
                  <li className="flex justify-between"><span>CSS</span><span>85%</span></li>
                  <li className="flex justify-between"><span>JavaScript</span><span>70%</span></li>
                  <li>{lang === 'en' ? 'Basic React' : 'বেসিক রিঅ্যাক্ট'}</li>
                  <li>{lang === 'en' ? 'Graphic Design (Canva, Photoshop)' : 'গ্রাফিক ডিজাইন (ক্যানভা, ফটোশপ)'}</li>
                  <li>{lang === 'en' ? 'Video Editing (Premiere Pro)' : 'ভিডিও এডিটিং (প্রিমিয়ার প্রো)'}</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-blue mb-4 flex items-center gap-2">
                  <Palette size={14} /> {lang === 'en' ? 'Services' : 'সেবাসমূহ'}
                </h3>
                <ul className="space-y-3 text-sm opacity-80 font-light">
                  <li><strong className="text-brand-blue block">{lang === 'en' ? 'Website Development' : 'ওয়েবসাইট ডেভেলপমেন্ট'}</strong> {lang === 'en' ? 'Modern, responsive and fast-loading websites' : 'আধুনিক, রেসপন্সিভ এবং দ্রুত লোড হওয়া ওয়েবসাইট'}</li>
                  <li><strong className="text-brand-blue block">{lang === 'en' ? 'Graphic Design' : 'গ্রাফিক ডিজাইন'}</strong> {lang === 'en' ? 'Creative banners, posters and social media designs' : 'আকর্ষণীয় ব্যানার, পোস্টার এবং সোশ্যাল মিডিয়া ডিজাইন'}</li>
                  <li><strong className="text-brand-blue block">{lang === 'en' ? 'Video Editing' : 'ভিডিও এডিটিং'}</strong> {lang === 'en' ? 'Professional editing for YouTube, reels and promos' : 'ইউটিউব, রিল এবং প্রমোর জন্য পেশাদার এডিটিং'}</li>
                  <li><strong className="text-brand-blue block">{lang === 'en' ? 'UI Design' : 'ইউআই ডিজাইন'}</strong> {lang === 'en' ? 'Clean and user-friendly interface design' : 'পরিচ্ছন্ন এবং ব্যবহারকারী-বান্ধব ইন্টারফেস ডিজাইন'}</li>
                </ul>
              </section>
            </div>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-purple mb-4 flex items-center gap-2">
                <Hexagon size={14} className="fill-brand-purple/20" /> {t('cv_projects')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold">{lang === 'en' ? '1. Portfolio Website' : '১. পোর্টফোলিও ওয়েবসাইট'}</h4>
                  <p className="text-xs opacity-60">{lang === 'en' ? 'A modern responsive personal portfolio website with smooth animations (HTML, CSS, JS)' : 'স্মুথ অ্যানিমেশন সহ একটি আধুনিক রেসপন্সিভ ব্যক্তিগত পোর্টফোলিও ওয়েবসাইট (HTML, CSS, JS)'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold">{lang === 'en' ? '2. Banner Design Projects' : '২. ব্যানার ডিজাইন প্রজেক্ট'}</h4>
                  <p className="text-xs opacity-60">{lang === 'en' ? 'Created multiple creative banners for clients and social media' : 'ক্লায়েন্ট এবং সোশ্যাল মিডিয়ার জন্য একাধিক ব্যানার তৈরি করেছেন'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold">{lang === 'en' ? '3. Video Editing Work' : '৩. ভিডিও এডিটিংয়ের কাজ'}</h4>
                  <p className="text-xs opacity-60">{lang === 'en' ? 'Edited professional videos for content creators' : 'কন্টেন্ট ক্রিয়েটরদের জন্য প্রফেশনাল ভিডিও এডিটিং করা'}</p>
                </div>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-10 border-t border-glass-border pt-8">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-blue mb-4">{lang === 'en' ? 'Why Choose Me' : 'কেন আমাকে বেছে নেবেন'}</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    lang === 'en' ? 'Fast Delivery' : 'দ্রুত ডেলিভারি', 
                    lang === 'en' ? 'Affordable' : 'সাশ্রয়ী', 
                    lang === 'en' ? 'Creative' : 'সৃজনশীল', 
                    lang === 'en' ? 'Friendly' : 'বন্ধুসুলভ', 
                    lang === 'en' ? 'Satisfaction' : 'সন্তুষ্টি'
                  ].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-brand-blue/10 rounded-full text-[10px] font-bold text-brand-blue uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-blue mb-4">{t('cv_education')}</h3>
                <p className="text-xs opacity-70 italic">{lang === 'en' ? 'Currently pursuing graduation (BCA / relevant field)' : 'বর্তমানে গ্র্যাজুয়েশন সম্পন্ন করছেন (BCA / অনুরূপ বিভাগ)'}</p>
              </section>
            </div>
          </div>

          <footer className="mt-12 text-center text-[10px] text-text-secondary uppercase tracking-[0.3em] font-bold">
            © 2026 Sauvik Das • {t('cv_pdf_doc')}
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Hero = ({ onOpenCV }: { onOpenCV: () => void }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const fullText = t('hero_tagline');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        setTimeout(() => { index = 0; }, 5000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-app-bg pt-44 lg:pt-52 pb-24">
      {/* Animated Gradient Background - Kept but colors adjusted */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-purple/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Particles Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="stars h-full w-full" />
      </div>

      <div className="relative z-10 text-center px-6 w-full max-w-7xl mx-auto">
        {/* Modern Full-Width Hero Cover Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[280px] sm:h-[350px] md:h-[480px] lg:h-[540px] rounded-[20px] md:rounded-[24px] overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.12)] mb-16 group bg-[#06060a]"
        >
          {/* Animated Gradient Glow Frame */}
          <div className="absolute inset-0 rounded-[20px] md:rounded-[24px] p-[1px] bg-gradient-to-r from-brand-blue/40 via-brand-purple/20 to-brand-blue/40 opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          {/* Immersive Image & Overlay Layer */}
          <div className="w-full h-full absolute inset-0 overflow-hidden rounded-[20px] md:rounded-[24px]">
            <img 
              src="https://i.ibb.co/XZJJKDQx/retouch-2026061223150200.webp" 
              alt="Futuristic Cyberpunk Cover" 
              className="w-full h-full object-cover opacity-75 transition-all duration-[2.5s] ease-out group-hover:scale-[1.03] group-hover:brightness-115"
              referrerPolicy="no-referrer"
            />
            
            {/* Tech grid mesh backdrop to give it a sci-fi screen identity */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] z-10" />
            
            {/* Ambient gradients to blend with black starry background */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/60 to-transparent opacity-90 z-10" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#08080c] to-transparent z-15" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-15" />
          </div>

          {/* Floating Cyberpunk Ambient Particles Background Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-brand-blue/60 blur-[0.5px]"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                }}
                animate={{
                  y: [0, -35, 0],
                  x: [0, Math.sin(i) * 15, 0],
                  opacity: [0.1, 0.7, 0.1],
                  scale: [1, 1.4, 1],
                }}
                transition={{
                  duration: 6 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 3,
                }}
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`p-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-brand-purple/50 blur-[0.5px]"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                }}
                animate={{
                  y: [0, -45, 0],
                  x: [0, Math.cos(i) * 20, 0],
                  opacity: [0.1, 0.6, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 7 + Math.random() * 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Sci-fi System Status Displays */}
          <div className="absolute top-6 left-6 z-25 hidden sm:flex flex-col gap-1 text-[9px] font-mono text-white/50 tracking-widest text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              <span>SYS_STABLE: OK</span>
            </div>
          </div>

          {/* Top-Right Glowing Badge */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-brand-blue/30 backdrop-blur-md rounded-full text-[10px] font-mono tracking-widest text-brand-blue font-bold z-25">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            CORE_SECURE
          </div>

          {/* Premium Bottom-Left Optional Overlay Text Area (Cyberpunk HUD style) */}
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-left z-25 bg-black/70 border border-white/10 md:border-brand-blue/20 backdrop-blur-md p-4 md:p-5 rounded-2xl max-w-[280px] sm:max-w-xs md:max-w-md shadow-lg">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-brand-blue font-bold mb-1 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              SYSTEM PORTFOLIO
            </div>
            <h3 className="text-white text-sm md:text-base font-bold tracking-tight mb-1 font-sans uppercase">
              Sauvik Das // Developer
            </h3>
            <p className="text-white/60 text-[10px] md:text-[11px] leading-relaxed font-light">
              Crafting premium interfaces, immersive full-stack architectures, and high-fidelity video graphics layouts. Designed with futuristic aesthetics.
            </p>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-4"
        >
          {t('premium_exp')}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-6xl font-thin text-app-text mb-6 uppercase tracking-tight"
        >
          {t('i_am')} <span className="font-bold text-brand-blue">Sauvik Das</span>
        </motion.h1>

        {/* Profile photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-72 h-72 md:w-96 md:h-96 mx-auto rounded-full overflow-hidden mb-12 shadow-2xl relative"
        >
          <img 
            src="https://i.ibb.co/YBpdC4bn/retouch-2026061223405003.webp" 
            alt="Sauvik Das" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-text-secondary text-base md:text-lg mb-10 h-8 font-light"
        >
          {text}<span className="border-r-2 border-brand-purple ml-1 animate-pulse" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button 
            onClick={() => {
              const contact = document.getElementById('contact');
              contact?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="px-10 py-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-brand-blue/20 cursor-pointer"
          >
            {t('hire_me')}
          </button>
          <button 
            onClick={onOpenCV}
            className="px-10 py-3 bg-white/5 border border-glass-border hover:border-brand-blue text-app-text rounded-full font-bold transition-all backdrop-blur-sm shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            {t('view_cv')}
          </button>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

const BrandMarquee = () => {
  const { t } = useLanguage();
  const services = [
    t('service_web_dev'), t('service_ui_ux'), t('service_video_edit'), t('service_motion'),
    t('service_strategy'), t('service_design'), t('service_identity'), t('service_cinema')
  ];

  return (
    <div className="py-16 bg-black/40 border-y border-white/5 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-bg via-transparent to-app-bg z-10 pointer-events-none" />
      <div className="animate-marquee flex">
        {[...services, ...services].map((service, i) => (
          <div key={i} className="flex items-center gap-12 px-6">
            <span className="text-3xl md:text-5xl font-display text-white/10 uppercase tracking-tighter hover:text-brand-blue/40 transition-colors cursor-default select-none">
              {service}
            </span>
            <div className="w-2 h-2 rounded-full bg-brand-purple/20 shadow-[0_0_10px_rgba(157,80,187,0.3)]" />
          </div>
        ))}
      </div>
    </div>
  );
};

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { t, lang } = useLanguage();

  const bulletPoints = lang === 'en' 
    ? ['Custom Web Solutions', 'Professional Video Editing', 'High-End Graphic Design', 'User Experience Optimization']
    : ['কাস্টম ওয়েব সমাধান', 'পেশাদার ভিডিও এডিটিং', 'উচ্চ-মানের গ্রাফিক ডিজাইন', 'ব্যবহারকারী অভিজ্ঞতা অপ্টিমাইজেশন'];

  return (
    <section id="about" className="py-24 bg-app-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
           <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-blue to-brand-purple rounded-2xl opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
            <div className="relative bg-glass-bg border border-glass-border p-8 rounded-[20px] backdrop-blur-xl">
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <Code2 size={24} />
                </div>
                <div className="w-12 h-12 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  <Video size={24} />
                </div>
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                  <Palette size={24} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-app-text mb-2">{t('about_title')}</h2>
              <p className="text-text-secondary leading-relaxed mb-6 italic text-sm">
                {t('about_desc')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/3 p-4 rounded-xl border border-glass-border">
                  <h4 className="text-app-text font-bold text-lg">{lang === 'en' ? '100+' : '১০০+'}</h4>
                  <p className="text-[10px] text-brand-purple uppercase font-bold tracking-widest">{t('projects_done')}</p>
                </div>
                <div className="bg-white/3 p-4 rounded-xl border border-glass-border">
                  <h4 className="text-app-text font-bold text-lg">{t('experience_years')}</h4>
                  <p className="text-[10px] text-brand-purple uppercase font-bold tracking-widest">{t('experience_label')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Motto / Callout Badge */}
          <div className="flex flex-col gap-2.5 mb-8 p-5 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] font-mono tracking-[0.2em] text-brand-blue font-bold uppercase">MOTTO / দর্শন</span>
            <ul className="space-y-1.5 text-xs text-text-secondary font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                {lang === 'en' ? 'Education is important.' : 'শিক্ষা অত্যন্ত গুরুত্বপূর্ণ।'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                {lang === 'en' ? 'Change is important.' : 'পরিবর্তন অত্যন্ত গুরুত্বপূর্ণ।'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {lang === 'en' ? 'Bring about change.' : 'পরিবর্তন নিয়ে আসুন।'}
              </li>
            </ul>
          </div>

          <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-2 block">{lang === 'en' ? 'About Me' : 'আমার সম্পর্কে'}</span>
          <h2 className="text-3xl md:text-4xl font-thin text-app-text mb-6">
            {lang === 'en' ? (
              <>Creative Digital <span className="font-bold text-brand-blue">Professional</span></>
            ) : (
              <><span className="font-bold text-brand-blue">সৃজনশীল ডিজিটাল</span> প্রফেশনাল</>
            )}
          </h2>

          <div className="space-y-4 text-text-secondary font-light text-sm leading-relaxed mb-8">
            <p>
              {lang === 'en' 
                ? "Hello! I'm Sauvik Das, a passionate freelancer and creative digital professional with expertise in website development, graphic design, and multimedia content creation."
                : "হ্যালো! আমি সৌভিক দাস, একজন অনুরাগী ফ্রিল্যান্সার এবং সৃজনশীল ডিজিটাল পেশাদার যার ওয়েবসাইট ডেভেলপমেন্ট, গ্রাফিক ডিজাইন এবং মাল্টিমিডিয়া কনটেন্ট তৈরিতে বিশেষ পারদর্শিতা রয়েছে।"
              }
            </p>
            <p>
              {lang === 'en'
                ? "I specialize in building modern, responsive, and user-friendly websites for businesses, personal brands, and online projects. Alongside web development, I have strong experience in photo editing, video editing, promotional banner design, and digital content creation."
                : "আমি ব্যবসা, ব্যক্তিগত ব্র্যান্ড এবং অনলাইন প্রজেক্টের জন্য আধুনিক, রেসপন্সিভ এবং ব্যবহারকারী-বান্ধব ওয়েবসাইট তৈরিতে পারদর্শী। ওয়েব ডেভেলপমেন্টের পাশাপাশি, ফটো এডিটিং, ভিডিও এডিটিং, প্রচারণামূলক ব্যানার ডিজাইন এবং ডিজিটাল কনটেন্ট তৈরিতেও আমার দীর্ঘ অভিজ্ঞতা রয়েছে।"
              }
            </p>
            <p>
              {lang === 'en'
                ? "My technical skills include Python, HTML, CSS, and website design, enabling me to create functional and visually appealing web solutions. I am dedicated to delivering high-quality work, maintaining attention to detail, and helping clients establish a strong online presence."
                : "আমার প্রযুক্তিগত দক্ষতার মধ্যে রয়েছে পাইথন (Python), এইচটিএমএল (HTML), সিএসএস (CSS) এবং ওয়েবসাইট ডিজাইন, যা আমাকে কার্যকরী এবং মানসম্মত ওয়েব সলিউশন তৈরি করতে সক্ষম করে। আমি কাজে সঠিক মান বজায় রাখতে, খুঁটিনাটি বিষয়ের দিকে নজর দিতে এবং ক্লায়েন্টদের একটি শক্তিশালী অনলাইন উপস্থিতি গঠনে সহায়তা করতে প্রতিশ্রুতিবদ্ধ।"
              }
            </p>
          </div>

          <h3 className="text-sm font-bold text-app-text mb-4 tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-brand-blue rounded-full" />
            {lang === 'en' ? 'Skills & Expertise' : 'দক্ষতা এবং পারদর্শিতা'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {(lang === 'en' 
              ? [
                  'Website Development',
                  'Freelance Website Creation',
                  'HTML & CSS',
                  'Python Programming',
                  'Responsive Web Design',
                  'Photo Editing & Retouching',
                  'Video Editing',
                  'Promotional Banner Design',
                  'Social Media Graphics',
                  'Creative Content Design',
                  'Digital Branding Support'
                ]
              : [
                  'ওয়েবসাইট ডেভেলপমেন্ট',
                  'ফ্রিল্যান্স ওয়েবসাইট তৈরি',
                  'এইচটিএমএল ও সিএসএস',
                  'পাইথন প্রোগ্রামিং',
                  'রেসপন্সিভ ওয়েব ডিজাইন',
                  'ফটো এডিটিং এবং রিটাচিং',
                  'ভিডিও এডিটিং',
                  'প্রচারণামূলক ব্যানার ডিজাইন',
                  'সোশ্যাল মিডিয়া গ্রাফিক্স',
                  'ক্রিয়েটিভ কনটেন্ট ডিজাইন',
                  'ডিজিটাল ব্র্যান্ডিং সাপোর্ট'
                ]
            ).map((skill, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/2 border border-white/5 hover:border-brand-blue/30 transition-all group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue group-hover:scale-125 transition-transform" />
                <span className="text-xs text-text-secondary group-hover:text-app-text transition-colors">{skill}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-text-secondary italic border-l-2 border-brand-purple/40 pl-3 leading-relaxed">
            {lang === 'en'
              ? 'I continuously learn new technologies and design trends to provide innovative solutions that meet modern digital requirements.'
              : 'আধুনিক ডিজিটাল যুগের প্রয়োজনীয়তা মেটাতে আমি অনবরত নতুন নতুন প্রযুক্তি এবং ডিজাইন ট্রেন্ড শিখছি।'
            }
          </p>
        </motion.div>
      </div>
    </section>
  );
};



const WhyChooseMe = () => {
  const { t, lang } = useLanguage();
  const points = [
    { icon: <Zap />, title: t('point_fast_delivery_title'), desc: t('point_fast_delivery_desc') },
    { icon: <DollarSign />, title: t('point_affordable_title'), desc: t('point_affordable_desc') },
    { icon: <Palette />, title: t('point_creative_title'), desc: t('point_creative_desc') },
    { icon: <MessageCircle />, title: t('point_friendly_title'), desc: t('point_friendly_desc') },
    { icon: <Award />, title: t('point_quality_title'), desc: t('point_quality_desc') }
  ];

  return (
    <section className="py-24 bg-app-bg border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('process')}</span>
        <h2 className="text-4xl md:text-5xl font-thin text-[var(--text-primary)] mb-16 uppercase">
          {lang === 'en' ? 'Why ' : 'কেন '}
          <span className="font-bold text-brand-blue">
            {lang === 'en' ? 'Choose' : 'আমাকে'}
          </span>{' '}
          {lang === 'en' ? 'Me?' : 'পছন্দ করবেন?'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {points.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="p-8 bg-glass-bg border border-glass-border rounded-2xl hover:border-brand-blue/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mx-auto mb-6 group-hover:scale-110 transition-transform">
                {point.icon}
              </div>
              <h3 className="text-[var(--text-primary)] font-bold text-lg mb-3">{point.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};



const Testimonials = () => {
  const { t } = useLanguage();
  const reviews = [
    { name: t('rev1_name'), text: t('rev1_text'), rating: 5 },
    { name: t('rev2_name'), text: t('rev2_text'), rating: 5 },
    { name: t('rev3_name'), text: t('rev3_text'), rating: 5 }
  ];

  return (
    <section className="py-24 bg-app-bg">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <span className="text-brand-purple font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('feedback_subtitle')}</span>
        <h2 className="text-4xl md:text-5xl font-thin text-[var(--text-primary)] mb-16 uppercase">
          {t('testimonial_title_main')} <span className="font-bold text-brand-purple">{t('testimonial_title_span')}</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 bg-glass-bg border border-glass-border rounded-3xl relative group hover:bg-white/5 transition-all"
            >
              <Quote className="absolute top-6 right-8 text-brand-purple/20 group-hover:text-brand-purple/40 transition-colors" size={40} />
              <div className="flex gap-1 mb-6">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-brand-blue text-brand-blue" />
                ))}
              </div>
              <p className="text-[var(--text-primary)]/80 italic mb-8 relative z-10 leading-relaxed font-light">"{rev.text}"</p>
              <div className="h-px w-12 bg-brand-purple/30 mb-4" />
              <h4 className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-xs">{rev.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const { t, lang } = useLanguage();
  const plans = [
    { 
      name: t('plan_basic'), 
      price: lang === 'en' ? "₹50" : "৫০ টাকা", 
      features: [t('feature_single_page'), t('feature_basic_video'), t('feature_design_concepts_2'), t('feature_fast_delivery')],
      popular: false
    },
    { 
      name: t('plan_standard'), 
      price: lang === 'en' ? "₹100" : "১০০ টাকা", 
      features: [t('feature_multi_page'), t('feature_pro_video'), t('feature_design_concepts_5'), t('feature_priority_support')],
      popular: true
    },
    { 
      name: t('plan_premium'), 
      price: lang === 'en' ? "₹200" : "২০০ টাকা", 
      features: [t('feature_full_custom'), t('feature_cinematic'), t('feature_unlimited_designs'), t('feature_dedicated_manager')],
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-app-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-purple/5 blur-[120px] rounded-full" />
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 relative z-10"
      >
        <div className="text-center mb-16">
          <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('investment')}</span>
          <h2 className="text-4xl md:text-5xl font-thin text-[var(--text-primary)] mb-4 uppercase">
            {t('pricing_title_main')} <span className="font-bold text-brand-blue">{t('pricing_title_span')}</span>
          </h2>
          <p className="text-text-secondary text-sm font-light">{t('plan_intro')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-10 rounded-3xl border ${plan.popular ? 'border-brand-blue bg-brand-blue/5 scale-105 shadow-2xl shadow-brand-blue/10' : 'border-glass-border bg-glass-bg'} flex flex-col`}
            >
              {plan.popular && (
                <span className="text-[10px] font-bold bg-brand-blue text-white px-3 py-1 rounded-full w-fit mb-6 uppercase tracking-widest">{t('popular_badge')}</span>
              )}
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                <span className="text-text-secondary text-xs">{t('per_project')}</span>
              </div>
              
              {/* Distinctive Facilities / Features List */}
              <ul className="space-y-3.5 mb-10 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-secondary text-sm group/item">
                    <div className={`p-1 rounded-lg shrink-0 transition-all ${plan.popular ? 'bg-brand-blue/20 text-brand-blue' : 'bg-white/5 text-brand-purple'}`}>
                      <CheckCircle2 size={12} className="transition-transform group-hover/item:scale-115" />
                    </div>
                    <span className="group-hover/item:text-[var(--text-primary)] transition-colors text-xs md:text-sm font-light">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex-grow" />
              <button 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${plan.popular ? 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20' : 'bg-white/5 text-[var(--text-primary)] hover:bg-white/10 border border-glass-border'}`}
              >
                {t('choose_plan')}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Secure Checkout / Trust Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-3xl bg-glass-bg border border-glass-border relative overflow-hidden backdrop-blur-md"
        >
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/5 blur-[80px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 text-left max-w-lg">
              <div className="p-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/30 text-brand-blue shrink-0">
                <ShieldCheck size={28} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-app-text flex items-center gap-2">
                  <Lock size={12} className="text-brand-blue" />
                  {lang === 'en' ? '100% Secure Transactions' : '১০০% নিরাপদ ট্রানজেকশন'}
                </h4>
                <p className="text-xs text-text-secondary mt-1 font-light leading-relaxed">
                  {lang === 'en' 
                    ? 'Every invoice and transaction is protected using 256-bit SSL encryption. We accept secure direct bank transfers, Card payments, and UPI. All deposits are backed by a satisfaction guarantee contract.'
                    : 'প্রতিটি ইনভয়েস এবং আর্থিক লেনদেন ২৫কে-বিট SSL এনক্রিপশন দ্বারা সুরক্ষিত। আমরা নিরাপদ ব্যাংক ট্রান্সফার, কার্ড পেমেন্ট এবং ইউপিআই গ্রহণ করি। সব ডিপোজিট চুক্তিনামা এবং সর্বোচ্চ মানের নিশ্চয়তা দ্বারা সুরক্ষিত।'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">
                {lang === 'en' ? 'ACCEPTED SAFE PAYMENT METHOD' : 'অনুমোদিত নিরাপদ পেমেন্ট মেথড'}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Visa Badge */}
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-brand-blue/30">
                  <span className="text-xs font-serif font-black tracking-widest text-[#1a1f71] dark:text-[#ffffff] flex items-center gap-1">
                    <span className="text-brand-blue">V</span>ISA
                  </span>
                </div>
                {/* Mastercard Badge */}
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-brand-blue/30">
                  <span className="text-[10px] font-bold tracking-tight text-white flex items-center gap-1 font-sans">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eb001b] -mr-1.5 inline-block opacity-90" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f79e1b] inline-block opacity-90" />
                    <span className="ml-1 font-mono text-[9px] uppercase tracking-tighter opacity-80">MC</span>
                  </span>
                </div>
                {/* UPI Badge */}
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-brand-blue/30">
                  <span className="text-[10px] font-extrabold tracking-widest text-brand-blue font-mono">
                    UPI
                  </span>
                </div>
                {/* Bank Transfer Badge */}
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-1.5 transition-all hover:bg-white/10 hover:border-brand-blue/30">
                  <CreditCard size={11} className="text-brand-purple" />
                  <span className="text-[9px] font-bold tracking-wider text-text-secondary uppercase font-mono">
                    {lang === 'en' ? 'BANK' : 'ব্যাংক'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-brand-blue font-mono tracking-wider mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-ping" />
                SSL_ENCRYPTED_GATEWAY: ACTIVE
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const InteractiveChatbot = ({ lang, onClose }: { lang: 'en' | 'bn'; onClose: () => void }) => {
  const [messages, setMessages] = useState<Array<{ id: number; sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'en' 
        ? "Hello! 👋 I'm your AI assistant designed for Sauvik's showcase platform. Ask me anything about Sauvik's professional services, tech stack, or creative design experience!"
        : "হ্যালো! 👋 আমি সৌভিকের শৌখিন পোর্টফোলিও প্ল্যাটফর্মে নিয়োজিত এআই অ্যাসিস্ট্যান্ট। সৌভিকের প্রফেশনাল সার্ভিস, টেক স্ট্যাক বা ক্রিয়েটিভ ডিজাইন সম্পর্কে আমাকে যেকোনো প্রশ্ন করতে পারেন!",
      time: '12:00 PM'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const promptPills = lang === 'en' ? [
    { text: "Who is Sauvik Das?", key: "who" },
    { text: "What services does he offer?", key: "services" },
    { text: "What is his core tech stack?", key: "stack" },
    { text: "How can I contact or hire him?", key: "hire" }
  ] : [
    { text: "সৌভিক দাস কে?", key: "who" },
    { text: "তিনি কি কি সেবা প্রদান করেন?", key: "services" },
    { text: "তার ব্যবহৃত প্রধান টেক স্ট্যাক কি?", key: "stack" },
    { text: "কিভাবে তার সাথে যোগাযোগ বা কাজ করব?", key: "hire" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'user' as const,
      text: textToSend,
      time: currentTime
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('who') || lower.includes('সৌভিক') || lower.includes('background') || lower.includes('portfolio') || lower.includes('das')) {
        replyText = lang === 'en'
          ? "Sauvik Das is an multi-disciplinary Web Developer & UI/UX Designer based in West Bengal, India. He builds high-performance responsive portals, personal brand websites, and interactive single-page applications optimized for indexing and rapid response."
          : "সৌভিক দাস একজন অভিজ্ঞ ওয়েব ডেভেলপার ও ইউআই/ইউএক্স ডিজাইনার। তিনি অত্যন্ত দ্রুতগতির ওয়েবসাইট, পোর্টাল এবং রিয়েল-টাইম সিঙ্গেল-পেজ অ্যাপ্লিকেশন তৈরি করেন যা সম্পূর্ণ ইউজার-ফ্রেন্ডলি।";
      } else if (lower.includes('service') || lower.includes('সেবা') || lower.includes('deliver') || lower.includes('offer')) {
        replyText = lang === 'en'
          ? "Sauvik delivers bespoke personal brand portfolios, conversion-focused creative landing showcases, complex frontend portals, premium video post-production editing, and high-CTR social media asset designs tailored for high retention."
          : "সৌভিক মূলত কাস্টম কর্পোরেট বা ইনডিভিজুয়াল পোর্টফোলিও ওয়েবসাইট, হাই-কনভার্সন ক্রিয়েটিভ ল্যান্ডিং পেজ, এবং সোশাল মিডিয়ার জন্য উচ্চমানের ভিডিও এডিটিং ও গ্রাফিক্স থাম্বনেল ডিজাইন সেবা প্রদান করেন।";
      } else if (lower.includes('tech') || lower.includes('stack') || lower.includes('প্রযুক্তি') || lower.includes('react') || lower.includes('code')) {
        replyText = lang === 'en'
          ? "His core technical ecosystem includes React 19, TypeScript, Tailwind CSS v4, Vite, Node.js (Express), and deployment integration setups on premium cloud providers like Vercel."
          : "তার প্রধান টেকনিক্যাল দক্ষতার মধ্যে রয়েছে React 19, TypeScript, Tailwind CSS v4, Vite, Node.js (Express), এবং ভিজিটর আউটের জন্য Vercel ডিপ্লয়মেন্ট সেটআপ।";
      } else if (lower.includes('contact') || lower.includes('hire') || lower.includes('যোগাযোগ') || lower.includes('email')) {
        replyText = lang === 'en'
          ? "You can contact Sauvik directly via business email at sauvikd68@gmail.com, or visit his personal landing coordinate at sauvikdev.in. He is also responsive across his social channels @sauvikdev!"
          : "সৌভিকের সাথে কাজ করতে সরাসরি sauvikd68@gmail.com ইমেলের মাধ্যমে যোগাযোগ করতে পারেন। এছাড়া sauvikdev.in ওয়েবসাইটে বা তার সোশাল মিডিয়া হ্যান্ডেল @sauvikdev এ নক করতে পারেন!";
      } else {
        replyText = lang === 'en'
          ? "That is a great query! Sauvik works diligently to craft digital interfaces that are responsive, accessible, and fast. Let me know if you would like me to summarize his core services, projects, or professional coordinates!"
          : "এটি একটি চমৎকার প্রশ্ন! সৌভিক মূলত অসাধারণ ডিজাইন ও পরিষ্কার কোডের মাধ্যমে ডিজিটাল প্ল্যাটফর্ম তৈরি করতে পছন্দ করেন। তার অভিজ্ঞতা বা ইমেইল আইডি জানতে চাইলে আমায় বলতে পারেন!";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot' as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="w-[320px] xs:w-[360px] sm:w-[460px] bg-[#060814]/95 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[450px] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
      <div className="absolute top-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
      
      <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-lg shadow-lg">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-wide">AI Assistant Console</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider font-bold">online // model active</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans select-text scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-xs shrink-0 self-end shadow-md">
                🤖
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className={`px-3 py-2 rounded-2xl text-[12px] leading-relaxed shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-brand-blue text-white rounded-br-none' 
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
              <span className={`text-[8px] font-mono text-white/30 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-xs shrink-0 self-end shadow-md">
              🤖
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-2 bg-black/30 border-t border-white/5 flex gap-1.5 overflow-x-auto select-none z-10 scrollbar-none shrink-0">
        {promptPills.map((pill) => (
          <button
            key={pill.key}
            onClick={() => handleSend(pill.text)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-blue/40 text-[9.5px] text-white/80 hover:text-white whitespace-nowrap hover:bg-brand-blue/10 transition-all font-sans shrink-0 cursor-pointer"
          >
            {pill.text}
          </button>
        ))}
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
        className="p-3 bg-white/[0.01] border-t border-white/5 flex gap-2 items-center z-10 shrink-0"
      >
        <input 
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={lang === 'en' ? "Ask a custom message..." : "আপনার প্রশ্নটি লিখুন..."}
          className="flex-grow px-3 py-2 rounded-xl bg-[#030409] border border-white/10 text-[11px] text-white focus:outline-none focus:border-brand-blue/50 placeholder-white/20"
        />
        <button 
          type="submit"
          className="w-8 h-8 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center justify-center shadow-lg hover:shadow-brand-blue/20 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
};

const InteractiveWeather = ({ lang, onClose }: { lang: 'en' | 'bn'; onClose: () => void }) => {
  const [selectedCity, setSelectedCity] = useState<'gangasagar' | 'kolkata' | 'newyork' | 'london'>('gangasagar');

  const weatherData = {
    gangasagar: {
      nameEn: 'Gangasagar',
      nameBn: 'গঙ্গাসাগর',
      temp: '28°C',
      conditionEn: 'Tropical Breeze',
      conditionBn: 'উষ্ণমণ্ডলীয় বাতাস',
      icon: '⛅',
      humidity: '78%',
      wind: '14 km/h',
      uvIndex: 'High',
      press: '1012 hPa',
      forecast: lang === 'en' 
        ? [ { day: 'Mon', temp: '29°C', icon: '☀️' }, { day: 'Tue', temp: '28°C', icon: '🌧️' }, { day: 'Wed', temp: '27°C', icon: '⛈️' } ]
        : [ { day: 'সোম', temp: '২৯°সে', icon: '☀️' }, { day: 'মঙ্গল', temp: '২৮°সে', icon: '🌧️' }, { day: 'বুধ', temp: '২৭°সে', icon: '⛈️' } ]
    },
    kolkata: {
      nameEn: 'Kolkata',
      nameBn: 'কলকাতা',
      temp: '32°C',
      conditionEn: 'Humid Haze',
      conditionBn: 'আর্দ্র কুয়াশা',
      icon: '☀️',
      humidity: '82%',
      wind: '10 km/h',
      uvIndex: 'Very High',
      press: '1008 hPa',
      forecast: lang === 'en'
        ? [ { day: 'Mon', temp: '33°C', icon: '☀️' }, { day: 'Tue', temp: '31°C', icon: '⛅' }, { day: 'Wed', temp: '30°C', icon: '⛈️' } ]
        : [ { day: 'সোম', temp: '৩৩°সে', icon: '☀️' }, { day: 'মঙ্গল', temp: '৩১°সে', icon: '⛅' }, { day: 'বুধ', temp: '৩০°সে', icon: '⛈️' } ]
    },
    newyork: {
      nameEn: 'New York',
      nameBn: 'নিউ ইয়র্ক',
      temp: '18°C',
      conditionEn: 'Clear Skies',
      conditionBn: 'পরিষ্কার আকাশ',
      icon: '🌙',
      humidity: '45%',
      wind: '18 km/h',
      uvIndex: 'Low',
      press: '1018 hPa',
      forecast: lang === 'en'
        ? [ { day: 'Mon', temp: '19°C', icon: '☀️' }, { day: 'Tue', temp: '17°C', icon: '⛅' }, { day: 'Wed', temp: '15°C', icon: '🌧️' } ]
        : [ { day: 'সোম', temp: '১৯°সে', icon: '☀️' }, { day: 'মঙ্গল', temp: '১৭°সে', icon: '⛅' }, { day: 'বুধ', temp: '১৫°সে', icon: '🌧️' } ]
    },
    london: {
      nameEn: 'London',
      nameBn: 'লন্ডন',
      temp: '14°C',
      conditionEn: 'Light Drizzle',
      conditionBn: 'গুড়িগুড়ি বৃষ্টি',
      icon: '🌧️',
      humidity: '90%',
      wind: '22 km/h',
      uvIndex: 'Low',
      press: '1006 hPa',
      forecast: lang === 'en'
        ? [ { day: 'Mon', temp: '13°C', icon: '🌧️' }, { day: 'Tue', temp: '14°C', icon: '⛅' }, { day: 'Wed', temp: '16°C', icon: '☀️' } ]
        : [ { day: 'সোম', temp: '১৩°সে', icon: '🌧️' }, { day: 'মঙ্গল', temp: '১৪°সে', icon: '⛅' }, { day: 'বুধ', temp: '১৬°সে', icon: '☀️' } ]
    }
  };

  const active = weatherData[selectedCity];

  return (
    <div className="w-[320px] xs:w-[360px] sm:w-[460px] bg-[#040816]/95 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[450px] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      
      <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg shadow-lg filter drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            ⛅
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-wide">Weather Tracking Unit</span>
              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-[#00d2ff] rounded text-[8px] font-mono uppercase tracking-widest leading-none font-black">ACTIVE</span>
            </div>
            <span className="text-[10px] text-text-secondary font-mono">live interactive weather module</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans flex flex-col justify-between scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="grid grid-cols-4 gap-1.5 z-10 shrink-0">
          {(Object.keys(weatherData) as Array<keyof typeof weatherData>).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedCity(tab)}
              className={`py-1.5 rounded-lg border text-[10px] font-bold tracking-tight transition-all uppercase cursor-pointer ${
                selectedCity === tab
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-[#00d2ff]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {lang === 'en' ? weatherData[tab].nameEn : weatherData[tab].nameBn}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-white/[0.01]/70 border border-white/5 rounded-xl p-4 relative py-5 overflow-hidden flex-grow my-2">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl" />
          
          <div className="space-y-1 z-10">
            <span className="text-[9px] text-[#00d2ff] uppercase font-mono tracking-wider">{lang === 'en' ? 'LOCAL SENSORS:' : 'লোকাল সেন্সর:'}</span>
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-white leading-none tracking-tighter">{active.temp}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium text-white/70 uppercase tracking-tight">{lang === 'en' ? active.conditionEn : active.conditionBn}</span>
            </div>
          </div>

          <div className="text-5xl filter drop-shadow-[0_0_15px_rgba(0,210,255,0.45)] select-none">
            {active.icon}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 shrink-0">
          <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg text-center">
            <span className="text-[8px] text-white/40 block font-mono">{lang === 'en' ? 'HUM' : 'আর্দ্রতা'}</span>
            <p className="text-[11px] font-bold text-white">{active.humidity}</p>
          </div>
          <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg text-center">
            <span className="text-[8px] text-white/40 block font-mono">{lang === 'en' ? 'WIND' : 'বায়ু'}</span>
            <p className="text-[11px] font-bold text-white">{active.wind}</p>
          </div>
          <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg text-center">
            <span className="text-[8px] text-white/40 block font-mono">UV</span>
            <p className="text-[11px] font-bold text-cyan-400">{active.uvIndex}</p>
          </div>
          <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg text-center">
            <span className="text-[8px] text-white/40 block font-mono">PRESS</span>
            <p className="text-[11px] font-bold text-white">{active.press}</p>
          </div>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2 shrink-0">
          <h5 className="text-[8px] font-mono font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'OUTLOOK FORECAST:' : 'ভবিষ্যৎ পূর্বাভাস:'}</h5>
          <div className="grid grid-cols-3 gap-1.5">
            {active.forecast.map((fc, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded border border-white/5">
                <span className="text-[10px] text-white/70">{fc.day}</span>
                <span className="text-xs select-none">{fc.icon}</span>
                <span className="text-[10px] text-white font-bold">{fc.temp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatbotMockup = ({ lang }: { lang: 'en' | 'bn' }) => {
  return (
    <div className="absolute inset-0 bg-[#05060d] bg-gradient-to-br from-[#0a0f26] via-[#05060d] to-[#120822] overflow-hidden p-3 md:p-3.5 flex flex-col justify-between select-none">
      {/* Glow overlays */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[65%] rounded-full bg-brand-blue/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[55%] rounded-full bg-brand-purple/20 blur-3xl pointer-events-none" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between z-10">
        <div className="bg-brand-blue/15 text-[#00d2ff] border border-brand-blue/35 roundedpx-1 md:rounded-md px-1 py-0.5 text-[6px] md:text-[7px] font-sans font-extrabold tracking-wider uppercase flex items-center gap-0.5 shadow-[0_0_10px_rgba(0,210,255,0.1)]">
          <span className="w-1 h-1 rounded-full bg-[#00d2ff] animate-pulse shrink-0" />
          <span>AI POWERED</span>
        </div>
        
        <div className="flex items-center gap-0.5 text-[6.5px] md:text-[7px] font-black tracking-tight text-white font-sans uppercase">
          <span className="text-[#00d2ff]">&lt;/&gt;</span>
          <span>SAUVIK</span>
          <span className="text-brand-blue">DEV</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-12 gap-2 items-center z-10 flex-grow my-0.5">
        {/* Left Column (Main Info) */}
        <div className="col-span-5 flex flex-col gap-0.5">
          <h4 className="text-[9px] md:text-[11px] font-black tracking-tight text-white uppercase leading-none font-sans">
            AI CHATBOT
          </h4>
          <h4 className="text-[7.5px] md:text-[9.5px] font-extrabold tracking-tight text-brand-blue uppercase leading-none font-sans">
            WEB PROJECT
          </h4>
          
          <div className="h-[1px] w-6 bg-brand-blue/50 my-0.5" />
          
          <p className="text-[5px] md:text-[6px] text-white/50 font-sans tracking-wide leading-relaxed">
            {lang === 'en' ? 'Smart conversations.' : 'স্মার্ট কথপোকথন।'}
          </p>
          <p className="text-[5px] md:text-[6px] text-white/50 font-sans tracking-wide leading-relaxed">
            {lang === 'en' ? 'Real-time solutions.' : 'রিয়েল-টাইম সমাধান।'}
          </p>

          <div className="flex flex-col gap-0.5 mt-0.5 text-[4.5px] md:text-[5px] text-white/60 font-mono">
            <div className="flex items-center gap-0.5">
              <span className="text-[#00d2ff] font-bold">✓</span>
              <span>Gemini API</span>
            </div>
          </div>
        </div>

        {/* Right Column (Console) */}
        <div className="col-span-7 h-full flex flex-col justify-center">
          <div className="w-full bg-[#0d1225]/95 border border-white/10 rounded-lg p-1 flex flex-col justify-between h-[65px] md:h-[72px] relative overflow-hidden backdrop-blur-md">
            {/* Simulation headers */}
            <div className="flex items-center justify-between border-b border-white/5 pb-0.5 mb-0.5">
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[4.5px] md:text-[5px] font-bold text-white tracking-wide uppercase font-sans">AI Chatbot</span>
              </div>
              <span className="text-[4px] text-emerald-400 font-mono">online</span>
            </div>

            {/* Simulating chat messages */}
            <div className="flex flex-col gap-0.5 overflow-hidden flex-grow px-0.5 justify-end">
              {/* Bot bubble */}
              <div className="flex gap-0.5 items-start">
                <div className="w-2 h-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-[4px] shrink-0">
                  🤖
                </div>
                <div className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[4px] text-white/90 leading-tight max-w-[85%] font-sans">
                  Hello! 👋 I'm your AI assistant.
                </div>
              </div>
              
              {/* User bubble */}
              <div className="flex gap-0.5 items-start justify-end">
                <div className="bg-[#0055ff] rounded px-1 py-0.5 text-[4px] text-white font-medium leading-tight max-w-[85%] font-sans">
                  Explain AI summary.
                </div>
              </div>

              {/* Bot reply */}
              <div className="flex gap-0.5 items-start">
                <div className="w-2 h-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-[4px] shrink-0">
                  🤖
                </div>
                <div className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[4px] text-white/90 leading-tight max-w-[85%] font-sans truncate">
                  AI mimics human intelligence to learn and solve...
                </div>
              </div>
            </div>

            {/* Simulated input bar */}
            <div className="mt-0.5 bg-[#060a17] border border-white/5 rounded px-1 py-0.5 flex items-center justify-between">
              <span className="text-[4px] text-white/30 font-sans">Type message...</span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-blue flex items-center justify-center text-[3px] text-white">
                ➤
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between border-t border-white/5 pt-0.5 z-10">
        <div className="flex items-center gap-0.5">
          <span className="text-[3.5px] font-mono font-bold text-white/30 uppercase tracking-widest mr-0.5">STK //</span>
          <span className="px-1 py-0.2 bg-orange-500/10 border border-orange-500/10 text-orange-400 rounded-sm text-[3.5px] font-bold font-mono">HTML5</span>
          <span className="px-1 py-0.2 bg-blue-500/10 border border-blue-500/10 text-blue-400 rounded-sm text-[3.5px] font-bold font-mono">CSS3</span>
          <span className="px-1 py-0.2 bg-yellow-500/10 border border-yellow-500/10 text-yellow-500 rounded-sm text-[3.5px] font-bold font-mono">JS</span>
          <span className="px-1 py-0.2 bg-sky-500/10 border border-sky-500/10 text-sky-400 rounded-sm text-[3.5px] font-bold font-mono">REACT</span>
        </div>

        <div className="text-[5.5px] md:text-[6.5px] font-extrabold text-brand-blue tracking-tighter font-sans flex items-center gap-0.5">
          <span>sauvikdev.in</span>
        </div>
      </div>
    </div>
  );
};

const WeatherMockup = ({ lang }: { lang: 'en' | 'bn' }) => {
  return (
    <div className="absolute inset-0 bg-[#040914] bg-gradient-to-br from-[#0b1c31] via-[#040914] to-[#180826] overflow-hidden p-3 md:p-3.5 flex flex-col justify-between select-none">
      {/* Ambient sky glows */}
      <div className="absolute top-[-25%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00d2ff]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-15%] w-[55%] h-[55%] rounded-full bg-brand-purple/15 blur-3xl pointer-events-none" />
      
      {/* Header of the poster */}
      <div className="flex items-center justify-between z-10">
        <div className="bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20 roundedpx-1 md:rounded-md px-1 py-0.5 text-[6px] md:text-[6.5px] font-sans font-extrabold tracking-wider uppercase flex items-center gap-0.5">
          <span>TRACK WEATHER</span>
        </div>
        
        <div className="flex items-center gap-0.5 text-[6.5px] md:text-[7px] font-black tracking-tight text-white font-sans uppercase">
          <span className="text-[#00d2ff]">&lt;/&gt;</span>
          <span>SAUVIK</span>
          <span className="text-brand-blue">DEV</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-2 items-center z-10 flex-grow my-0.5">
        {/* Left Column (Widget Details) */}
        <div className="col-span-5 flex flex-col gap-0.5">
          <h4 className="text-[9px] md:text-[11px] font-black tracking-tight text-white uppercase leading-none font-sans">
            WEATHER FLOW
          </h4>
          <h4 className="text-[7.5px] md:text-[9.5px] font-extrabold tracking-tight text-[#00d2ff] uppercase leading-none font-sans">
            GPS UTILITY
          </h4>
          
          <div className="h-[1px] w-6 bg-[#00d2ff]/50 my-0.5" />
          
          <p className="text-[5px] md:text-[6px] text-white/50 font-sans tracking-wide leading-relaxed">
            {lang === 'en' ? 'Live GPS tracking.' : 'লাইভ জিপিএস ট্র্যাকিং।'}
          </p>
          <p className="text-[5px] md:text-[6px] text-white/50 font-sans tracking-wide leading-relaxed">
            {lang === 'en' ? 'Dynamic forecasts.' : 'ডায়নামিক পূর্বাভাস।'}
          </p>
        </div>

        {/* Right Column (Weather Glass Widget Mockup) */}
        <div className="col-span-7 h-full flex flex-col justify-center">
          <div className="w-full bg-[#081222]/90 border border-[#00d2ff]/20 rounded-lg p-1 flex flex-col justify-between h-[65px] md:h-[72px] relative overflow-hidden backdrop-blur-md">
            
            {/* Widget top bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
              <div className="flex items-center gap-0.5">
                <span className="text-[4px] text-white/50 font-mono uppercase font-bold tracking-wider">LIVE LOCATION</span>
              </div>
              <span className="text-[4px] text-cyan-400 font-mono uppercase animate-pulse">GPS ACTIVE</span>
            </div>

            {/* Weather numbers display */}
            <div className="flex items-center justify-between py-0.5 px-0.5">
              <div>
                <span className="text-[13px] md:text-[15px] font-black text-white leading-none font-sans">24°C</span>
                <p className="text-[4px] text-white/60 font-sans uppercase font-bold mt-0.5">Partly Cloudy</p>
              </div>
              <div className="w-5 h-5 flex items-center justify-center text-[12px] filter drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]">
                ⛅
              </div>
            </div>

            {/* Stats info boxes */}
            <div className="grid grid-cols-2 gap-0.5 border-t border-white/5 pt-0.5 text-[3.5px] text-white/70 font-mono">
              <div className="bg-white/5 p-0.2 rounded flex flex-col text-center">
                <span>WIND: 12km/h</span>
              </div>
              <div className="bg-white/5 p-0.2 rounded flex flex-col text-center">
                <span>HUM: 65%</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer info bar */}
      <div className="flex items-center justify-between border-t border-white/5 pt-0.5 z-10">
        <div className="flex items-center gap-0.5">
          <span className="text-[3.5px] font-mono font-bold text-white/30 uppercase tracking-widest mr-0.5">STK //</span>
          <span className="px-1 py-0.2 bg-yellow-500/10 border border-yellow-500/10 text-yellow-500 rounded-sm text-[3.5px] font-bold font-mono">JS</span>
          <span className="px-1 py-0.2 bg-blue-500/10 border border-blue-500/10 text-blue-400 rounded-sm text-[3.5px] font-bold font-mono">CSS3</span>
          <span className="px-1 py-0.2 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 rounded-sm text-[3.5px] font-bold font-mono">API</span>
        </div>

        <div className="text-[5.5px] md:text-[6.5px] font-extrabold text-[#00d2ff] tracking-tighter font-sans flex items-center gap-0.5">
          <span>sauvikdev.in</span>
        </div>
      </div>
    </div>
  );
};

interface PortfolioItemProps {
  key?: number | string;
  src: string;
  title: string;
  category: string;
  description?: string;
  liveDemo?: string;
  onPreview: (src: string) => void;
  stats?: {
    techStack: string;
    clientType: string;
    impactScore: string;
  };
  customThumbnail?: React.ReactNode;
}

const PortfolioItem = ({ src, title, category, description, liveDemo, onPreview, stats, customThumbnail }: PortfolioItemProps) => {
  const { t, lang } = useLanguage();
  
  const handleCardClick = () => {
    onPreview(src);
  };

  return (
    <div 
      className="group relative cursor-pointer flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-blue/30 transition-all duration-500 hover:bg-white/[0.04]"
      onClick={handleCardClick}
    >
      {/* Thumbnail Aspect frame */}
      <div className="relative aspect-[16/11] overflow-hidden bg-[#0a0a0c]">
        {customThumbnail ? (
          customThumbnail
        ) : (
          <img 
            src={src} 
            alt={title} 
            className="w-full h-full object-cover opacity-75 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        {/* Subtle visual guide on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-medium text-white flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
            <ExternalLink size={12} className="text-brand-blue" />
            <span>{t('open_artifact')}</span>
          </div>
        </div>
      </div>

      {/* Info Panel & Stats Grid */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-brand-blue text-[10px] font-bold uppercase tracking-[0.15em]">{category}</span>
          </div>
          <h3 className="text-white text-sm font-bold tracking-tight group-hover:text-brand-blue transition-colors line-clamp-1 mb-1.5">{title}</h3>
          {description && (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3 font-light">{description}</p>
          )}
        </div>

        {stats && (
          <div className="flex flex-col gap-2.5">
            {/* High tech separator */}
            <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent w-full" />
            
            {/* Interactive Specs block */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {/* Tech Stack - Span 2 columns */}
              <div className="col-span-2 px-2.5 py-1.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-2 hover:border-white/10 transition-colors">
                <Code2 size={10} className="text-brand-blue shrink-0" />
                <span className="text-text-secondary shrink-0">{lang === 'en' ? 'Stack:' : 'স্ট্যাক:'}</span>
                <span className="text-white font-medium truncate">{stats.techStack}</span>
              </div>
              
              {/* Client Type */}
              <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-1.5 hover:border-white/10 transition-colors">
                <Globe size={10} className="text-brand-purple shrink-0" />
                <span className="text-text-secondary shrink-0">{lang === 'en' ? 'Client:' : 'ক্লায়েন্ট:'}</span>
                <span className="text-white font-medium truncate">{stats.clientType}</span>
              </div>

              {/* Impact Score */}
              <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-1.5 hover:border-white/10 transition-colors">
                <Zap size={10} className="text-amber-400 shrink-0 animate-pulse" />
                <span className="text-text-secondary shrink-0">{lang === 'en' ? 'Impact:' : 'ইম্প্যাক্ট:'}</span>
                <span className="text-[#39FF14] font-bold truncate">{stats.impactScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons - Live Demo and GitHub Repo */}
        {liveDemo && (
          <div className="flex items-center gap-2.5 mt-2 pt-1 border-t border-white/5">
            <a 
              href={liveDemo !== '#' ? liveDemo : undefined}
              target={liveDemo !== '#' ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                if (liveDemo === '#') {
                  onPreview(src);
                }
              }}
              className="flex-grow inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white transition-all text-[11px] font-bold font-mono tracking-wider active:scale-95 cursor-pointer"
            >
              <ExternalLink size={10} />
              <span>{lang === 'en' ? 'VIEW' : 'দেখুন'}</span>
            </a>
          </div>
        )}
      </div>

      {/* Futuristic Ambient Glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 bg-brand-blue/5 blur-xl scale-[1.02]" />
    </div>
  );
};

const Portfolio = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { t, lang } = useLanguage();

  const works = [
    { 
      src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop', 
      title: lang === 'en' ? 'Personal Portfolio Website' : 'ব্যক্তিগত পোর্টফোলিও ওয়েবসাইট', 
      category: lang === 'en' ? 'Development' : 'ডেভেলপমেন্ট',
      type: 'development',
      description: lang === 'en' 
        ? 'A premium, responsive portfolio with smooth scrolling, dual language support, and interactive glass effects.' 
        : 'স্মুথ স্ক্রোলিং, ডুয়াল ল্যাঙ্গুয়েজ সাপোর্ট এবং ইন্টারঅ্যাক্টিভ গ্লাস এফেক্টস সমৃদ্ধ একটি প্রিমিয়াম পোর্টফোলিও ওয়েবসাইট।',
      liveDemo: 'https://sauvikdev.in',
      githubUrl: 'https://github.com/sauvikcode/portfolio',
      stats: {
        techStack: 'React, Tailwind CSS',
        clientType: lang === 'en' ? 'Personal Portfolio' : 'ব্যক্তিগত পোর্টফোলিও',
        impactScore: lang === 'en' ? '100% Speed Opt' : '১০০% স্পিড অপ্টিমাইজড'
      }
    },
    { 
      src: 'https://images.unsplash.com/photo-1675557009875-436fec96a1a8?auto=format&fit=crop&q=80&w=800', 
      title: lang === 'en' ? 'AI Chatbot Project' : 'এআই চ্যাটবট প্রোজেক্ট', 
      category: lang === 'en' ? 'Development' : 'ডেভেলপমেন্ট',
      type: 'development',
      customThumbnail: <ChatbotMockup lang={lang} />,
      description: lang === 'en' 
        ? 'A high-performance intelligent chat interface leveraging the modern Google Gemini API for real-time stream responses.' 
        : 'রিয়েল-টাইম স্ট্রিম উত্তরের জন্য আধুনিক গুগল জেমিনি এপিআই ব্যবহার করে তৈরি একটি অনন্য চ্যাটবট ইন্টারফেস প্রজেক্ট।',
      liveDemo: '#',
      githubUrl: 'https://github.com/sauvikcode/gemini-chatbot',
      stats: {
        techStack: 'Google Gemini API, React',
        clientType: lang === 'en' ? 'Open Source' : 'ওপেন সোর্স',
        impactScore: lang === 'en' ? 'Contextual' : 'প্রাসঙ্গিকতা ১০০%'
      }
    },
    { 
      src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', 
      title: lang === 'en' ? 'Landing Page Design' : 'ল্যান্ডিং পেজ ডিজাইন', 
      category: lang === 'en' ? 'Design' : 'ডিজাইন',
      type: 'design',
      description: lang === 'en' 
        ? 'Dynamic conversion-focused creative landing showcases featuring sleek typography, visual grid styling, and high appeal.' 
        : 'চমৎকার টাইপোগ্রাফি ও লেআউট গ্রিড সহ সর্বাধিক রূপান্তর (Conversion) অর্জনের উপযোগী কাস্টম ক্রিয়েটিভ ল্যান্ডিং পেজ।',
      liveDemo: '#',
      githubUrl: 'https://github.com/sauvikcode/landing-designs',
      stats: {
        techStack: 'Figma, Tailwind CSS, JS',
        clientType: lang === 'en' ? 'Tech Startup' : 'টেক স্টার্টআপ',
        impactScore: lang === 'en' ? '+45% conversion' : '+৪৫% রূপান্তর হার'
      }
    },

    { 
      src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800&auto=format&fit=crop', 
      title: lang === 'en' ? 'Freelance Client Website' : 'ফ্রিল্যান্স ক্লায়েন্ট ওয়েবসাইট', 
      category: lang === 'en' ? 'Development' : 'ডেভেলপমেন্ট',
      type: 'development',
      description: lang === 'en' 
        ? 'A production-grade bespoke commercial portal built to reinforce the local outreach of small business projects.' 
        : 'স্থানীয় বা ছোট ব্যবসায়ের প্রচার এবং ব্র্যান্ড ভ্যালু বাড়ানোর জন্য তৈরি একটি কাস্টম প্রোডাকশন-গ্রেড বাণিজ্যিক পোর্টাল।',
      liveDemo: '#',
      githubUrl: 'https://github.com/sauvikcode/client-platform',
      stats: {
        techStack: 'HTML, CSS, JS, Glassmorphism',
        clientType: lang === 'en' ? 'SME Business' : 'ছোট ও মাঝারি ব্যবসা',
        impactScore: lang === 'en' ? '100% Mobile Ready' : '১০০% মোবাইল রেডি'
      }
    },
    { 
      src: 'https://i.ibb.co/mFzb4mGw/IMG-20260417-WA0030.webp', 
      title: lang === 'en' ? 'Cinematic Motion' : 'সিনেমাটিক মোশন', 
      category: lang === 'en' ? 'Video Edit' : 'ভিডিও এডিটিং',
      type: 'video_edit',
      description: lang === 'en' 
        ? 'High impact promotional visual editing featuring kinetic sync, frame grade, and detailed visual and audio effects.' 
        : 'কাইনেটিক সিঙ্ক, ফ্রেম কালার গ্রেড এবং উন্নত অডিও-ভিজ্যুয়াল এফেক্টস সমৃদ্ধ একটি চমৎকার সিনেমাটিক প্রোমোশনাল এডিটিং।',
      liveDemo: '#',
      githubUrl: 'https://github.com/sauvikcode/cinematic-motion',
      stats: {
        techStack: 'After Effects, Premiere Pro',
        clientType: lang === 'en' ? 'Media Agency' : 'মিডিয়া এজেন্সি',
        impactScore: lang === 'en' ? '120K+ views' : '১২০কে+ ভিউস'
      }
    },
    { 
      src: 'https://i.ibb.co/twDjxY3Q/IMG-20260422-WA0000.webp', 
      title: lang === 'en' ? 'Promo & Reel FX' : 'প্রোমো ও রিল এফেক্টস', 
      category: lang === 'en' ? 'Video Edit' : 'ভিডিও এডিটিং',
      type: 'video_edit',
      description: lang === 'en' 
        ? 'Short vertical promo Reels formatted for optimal user retention and fast visual hook on modern social networks.' 
        : 'ইউটিউব শর্টস বা রিলসের উপযোগী এডিটিং যা প্রথম মুহূর্তেই দর্শকদের আকর্ষন করতে পারবে এবং রিটেনশন বৃদ্ধি করবে।',
      liveDemo: '#',
      githubUrl: 'https://github.com/sauvikcode/reel-fx',
      stats: {
        techStack: 'Ae, CapCut Pro',
        clientType: lang === 'en' ? 'YouTube Creator' : 'ইউটিউব ক্রিয়েটর',
        impactScore: lang === 'en' ? '+80% retention' : '+৮০% রিটেনশন'
      }
    }
  ];

  const filterCategories = [
    { key: 'all', label: lang === 'en' ? 'All' : 'সব' },
    { key: 'development', label: lang === 'en' ? 'Development' : 'ডেভেলপমেন্ট' },
    { key: 'video_edit', label: lang === 'en' ? 'Video Editing' : 'ভিডিও এডিটিং' },
    { key: 'design', label: lang === 'en' ? 'Design' : 'ডিজাইন' },
  ];

  const getCount = (type: string) => {
    if (type === 'all') return works.length;
    return works.filter(w => w.type === type).length;
  };

  const filteredWorks = selectedCategory === 'all'
    ? works
    : works.filter(work => work.type === selectedCategory);

  return (
    <section id="portfolio" className="py-24 bg-app-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 text-center md:text-left">
          <div>
            <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('portfolio_subtitle')}</span>
            <h2 className="text-4xl md:text-6xl font-thin text-app-text uppercase italic">{t('portfolio_title_main')} <span className="font-bold text-brand-blue">{t('portfolio_title_span')}</span></h2>
          </div>
          <p className="text-text-secondary max-w-sm mb-2 text-sm font-light">
            {t('portfolio_desc')}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
          {filterCategories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`relative px-5 py-2.5 rounded-xl text-xs font-medium tracking-wide uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'text-white' 
                    : 'text-text-secondary hover:text-white bg-white/2 border border-white/5 hover:border-white/10'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeFilterBg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple -z-10 shadow-lg shadow-brand-blue/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-text-secondary'}`}>
                  {getCount(cat.key)}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div 
          layout 
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredWorks.map((work, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 140,
                    damping: 18,
                    delay: index * 0.05
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  y: 20,
                  transition: { 
                    duration: 0.2
                  } 
                }}
                transition={{ 
                  layout: { 
                    type: 'spring', 
                    stiffness: 220, 
                    damping: 28 
                  } 
                }}
                key={work.src}
              >
                <PortfolioItem 
                  src={work.src} 
                  title={work.title} 
                  category={work.category} 
                  description={work.description}
                  liveDemo={work.liveDemo}
                  onPreview={setPreviewImage} 
                  stats={work.stats}
                  customThumbnail={work.customThumbnail}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {previewImage === 'https://images.unsplash.com/photo-1675557009875-436fec96a1a8?auto=format&fit=crop&q=80&w=800' ? (
                <InteractiveChatbot lang={lang} onClose={() => setPreviewImage(null)} />
              ) : previewImage === 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=800' ? (
                <InteractiveWeather lang={lang} onClose={() => setPreviewImage(null)} />
              ) : (
                <>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X size={24} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const WorkGallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t } = useLanguage();

  const categories = [
    { 
      id: 'banner', 
      title: t('cat_banner_title'), 
      label: t('cat_banner_label'),
      images: [
        "https://i.ibb.co/JWFPqBj1/IMG-20260421-WA0004.webp",
        "https://i.ibb.co/FfDY1Fw/IMG-20260421-WA0001.webp",
        "https://i.ibb.co/cSC6KwFc/IMG-20260421-WA0003.webp",
        "https://i.ibb.co/756JyJj/IMG-20260421-WA0002.webp"
      ]
    },
    { 
      id: 'editing', 
      title: t('cat_editing_title'), 
      label: t('cat_editing_label'),
      images: [
        "https://i.ibb.co/6RZpwSMQ/IMG-20260422-WA0003.webp",
        "https://i.ibb.co/N67QM28q/IMG-20260422-WA0001.webp",
        "https://i.ibb.co/pBfbhftt/IMG-20260422-WA0002.webp",
        "https://i.ibb.co/twDjxY3Q/IMG-20260422-WA0000.webp"
      ]
    },
    { 
      id: 'motion', 
      title: t('cat_motion_title'), 
      label: t('cat_motion_label'),
      images: [
        "https://picsum.photos/seed/motion1/800/800",
        "https://picsum.photos/seed/motion2/800/800",
        "https://picsum.photos/seed/motion3/800/800",
        "https://picsum.photos/seed/motion4/800/800"
      ]
    },
    { 
      id: 'design', 
      title: t('cat_design_title'), 
      label: t('cat_design_label'),
      images: [
        "https://i.ibb.co/9k7z7C6M/IMG-20260422-WA0007.webp",
        "https://i.ibb.co/h1gcCq36/IMG-20260422-WA0005.webp",
        "https://i.ibb.co/wrgd4vNB/IMG-20260422-WA0004.webp",
        "https://i.ibb.co/G31ptxN6/IMG-20260422-WA0006.webp"
      ]
    }
  ];

  return (
    <section id="work-segments" className="py-24 bg-app-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
          <span className="text-brand-purple font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('archive_subtitle')}</span>
          <h2 className="text-4xl md:text-6xl font-thin text-app-text uppercase italic">{t('work_title_main')} <span className="font-bold text-brand-purple">{t('work_title_span')}</span></h2>
        </div>

        <div className="space-y-32">
          {categories.map((cat) => (
            <div key={cat.id} className="relative">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="text-center px-4">
                  <span className="text-brand-blue text-[10px] font-bold uppercase tracking-[0.3em] block mb-2">{cat.label}</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-app-text uppercase">{cat.title}</h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    onClick={() => cat.images && cat.images[i] && setSelectedImage(cat.images[i])}
                    className="aspect-square bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group overflow-hidden relative cursor-zoom-in hover:border-brand-blue/30 transition-all duration-500 shadow-xl shadow-black/40"
                  >
                    {cat.images && cat.images[i] ? (
                      <img 
                        src={cat.images[i]} 
                        alt={`${cat.title} ${i + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-x-0 bottom-4 text-center z-20">
                          <span className="text-white/10 text-[8px] uppercase tracking-[0.5em] font-mono group-hover:text-brand-blue/50 transition-colors">Slot {i + 1}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 opacity-40" />
                        <div className="w-12 h-12 border border-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <span className="text-white/20 group-hover:text-brand-blue/40 text-xl font-thin">+</span>
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-zoom-out"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-6xl w-full max-h-full flex items-center justify-center"
              >
                <button 
                  className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
                  onClick={() => setSelectedImage(null)}
                >
                  <X size={32} />
                </button>
                <img 
                  src={selectedImage} 
                  alt="Enlarged view" 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="h-48" />
      </div>
    </section>
  );
};

const Skills = () => {
  const { t } = useLanguage();
  const skills = [
    { name: 'HTML / CSS', level: 95 },
    { name: 'Photoshop', level: 90 },
    { name: 'After Effects', level: 85, category: 'Video Edit' },
    { name: 'Poster Design', level: 80, category: 'Design' },
  ];

  return (
    <section id="skills" className="py-24 bg-[#08080c] relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-purple font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('expertise')}</span>
          <h2 className="text-4xl font-thin text-app-text mb-4 uppercase">{t('skills_title_main')} <span className="font-bold text-brand-blue">{t('skills_title_span')}</span></h2>
          <p className="text-text-secondary font-light text-sm italic">{t('skills_desc')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {skills.map((skill, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-white font-medium text-sm">{skill.name}</span>
                </div>
                <span className="text-text-secondary text-xs font-bold tracking-widest">{skill.level}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-purple"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          {[
            { icon: <Monitor />, label: t('skill_label_ui') },
            { icon: <Cpu />, label: t('skill_label_perf') },
            { icon: <Smartphone />, label: t('skill_label_resp') },
            { icon: <Globe />, label: t('skill_label_global') },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-4 text-gray-500 hover:text-white transition-colors p-6 bg-white/5 border border-white/5 rounded-2xl"
            >
              <div className="text-blue-500">{item.icon}</div>
              <span className="text-xs uppercase tracking-widest font-mono text-center">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
    { question: t('faq_q4'), answer: t('faq_a4') },
    { question: t('faq_q5'), answer: t('faq_a5') },
  ];

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#08080c] relative overflow-hidden">
      {/* Absolute ambient lights behind FAQ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-6 relative z-10 text-center"
      >
        <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-4 block">
          {t('faq_subtitle')}
        </span>
        <h2 className="text-4xl md:text-5xl font-thin text-[var(--text-primary)] mb-16 uppercase">
          {t('faq_title_1')}{' '}
          <span className="font-bold text-brand-blue">{t('faq_title_2')}</span>
        </h2>

        <div className="text-left space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-glass-bg border border-glass-border rounded-xl md:rounded-2xl overflow-hidden hover:border-brand-blue/30 transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full flex justify-between items-center p-6 md:p-7 text-left outline-none cursor-pointer group"
                >
                  <span className="text-app-text font-semibold text-sm md:text-base group-hover:text-brand-blue transition-colors pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue/10 transition-colors">
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-7 md:px-7 md:pb-8 border-t border-glass-border/30 text-text-secondary text-xs md:text-sm leading-relaxed font-light">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

// AskSauvikAI is now imported from src/components/AskSauvikAI.tsx

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const handleSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      e.preventDefault();
      showToast(
        lang === 'en' 
          ? 'Please fill in all fields before sending.' 
          : 'দয়া করে পাঠানোর আগে সব ক্ষেত্র পূরণ করুন।',
        'error'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      e.preventDefault();
      showToast(
        lang === 'en'
          ? 'Please enter a valid email address.'
          : 'দয়া করে একটি সঠিক ইমেল ঠিকানা প্রবেশ করান।',
        'error'
      );
      return;
    }

    showToast(
      lang === 'en'
        ? 'Draft prepared! Opening your mail application...'
        : 'খসড়া প্রস্তুত! আপনার ইমেল অ্যাপ্লিকেশন খোলা হচ্ছে...',
      'success'
    );

    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
    }, 800);
  };

  return (
    <section id="contact" className="py-24 bg-app-bg">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        <div>
          <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase mb-4 block">{t('get_in_touch')}</span>
          <h2 className="text-4xl md:text-6xl font-thin text-app-text italic uppercase mb-8 leading-tight">
            {t('contact_title_prefix')} <br /> {t('contact_title_span')} <span className="font-bold text-brand-blue">{t('contact_title_suffix')}</span>
          </h2>
          <p className="text-text-secondary text-lg mb-12 max-w-md font-light">
            {t('contact_description')}
          </p>
          
          <div className="space-y-6">
            <a href="mailto:sauvikd68@gmail.com" className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em]">{t('email_label')}</p>
                <p className="text-app-text font-medium">sauvikd68@gmail.com</p>
              </div>
            </a>

            <a 
              href="https://sauvikdev.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-6 group"
            >
              <div className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em]">{t('website_label')}</p>
                <p className="text-app-text font-medium">sauvikdev.in</p>
              </div>
            </a>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-glass-bg backdrop-blur-xl border border-glass-border p-10 rounded-[20px]"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-purple">{lang === 'en' ? 'Name' : 'নাম'}</label>
                <input 
                  type="text" 
                  placeholder={lang === 'en' ? 'Your identity...' : 'আপনার নাম...'} 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/20 border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-purple">{lang === 'en' ? 'Email Address' : 'ইমেল ঠিকানা'}</label>
                <input 
                  type="email" 
                  placeholder={lang === 'en' ? 'your@email.com' : 'আপনার ইমেল...'} 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/20 border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors text-sm" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-purple">{lang === 'en' ? 'Inquiry' : 'বার্তা'}</label>
              <textarea 
                placeholder={lang === 'en' ? 'How can we help define your story?' : 'আমরা কীভাবে আপনাকে সাহায্য করতে পারি?...'} 
                rows={3} 
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/20 border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors resize-none text-sm"
              ></textarea>
            </div>

            <div className="pt-4">
              <a 
                href={`mailto:sauvikd68@gmail.com?subject=Portfolio Inquiry from sauvikdev.in&body=Hi Sauvik,%0D%0A%0D%0AMy Name: ${formData.name}%0D%0AMy Email: ${formData.email}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`}
                onClick={handleSend}
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-brand-blue/20 active:scale-95 text-xs tracking-[0.2em]"
              >
                {lang === 'en' ? 'SEND MESSAGE VIA GMAIL' : 'জিমেইলের মাধ্যমে মেসেজ পাঠান'}
              </a>
              <p className="text-[9px] text-white/30 text-center uppercase tracking-[0.2em] mt-4">
                {lang === 'en' ? 'Clicking will open your default email app' : 'ক্লিক করলে আপনার ডিফল্ট ইমেল অ্যাপ খুলবে'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { lang } = useLanguage();
  return (
    <footer className="py-12 bg-app-bg border-t border-glass-border text-center px-6">
      <div className="flex justify-center items-center gap-4 mb-6">
        <a 
          href="https://github.com/sauvikdev" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 rounded-full border border-glass-border flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-300"
          aria-label="GitHub"
        >
          <Github size={18} />
        </a>
        <a 
          href="https://www.linkedin.com/in/sauvik-das-05029b3bb?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 rounded-full border border-glass-border flex items-center justify-center text-white/70 hover:text-[#0077b5] hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 transition-all duration-300"
          aria-label="LinkedIn"
        >
          <Linkedin size={18} />
        </a>
        <a 
          href="https://instagram.com/sauvikdev.in" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 rounded-full border border-glass-border flex items-center justify-center text-white/70 hover:text-[#e1306c] hover:border-[#e1306c]/40 hover:bg-[#e1306c]/10 transition-all duration-300"
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
      </div>
      <div className="text-gray-500 text-sm font-mono uppercase tracking-widest">
        {lang === 'en' ? '© 2026 Sauvik Das Portfolio. All rights reserved.' : '© २०२৬ সৌভিক দাস পোর্টফোলিও। সর্বস্বত্ব সংরক্ষিত।'}
      </div>
      <div className="mt-4 text-gray-600 font-mono text-[10px]">
        {lang === 'en' ? 'Designed with precision & futuristic glow.' : 'নির্ভুলতা এবং ভবিষ্যৎমুখী সৌন্দর্যের সমন্বয়ে ডিজাইন করা।'}
      </div>
    </footer>
  );
};

// --- Main App ---

function PortfolioApp() {
  useContentProtection();
  const [isDark, setIsDark] = useState(true);
  const [showCV, setShowCV] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    }

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className={`selection:bg-brand-blue selection:text-white overflow-x-hidden font-sans ${isDark ? 'bg-app-bg text-white' : 'light bg-app-bg text-[#0f172a]'}`}>
      {/* Scroll Progress Indicator */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-purple z-[100] origin-left" style={{ scaleX }} />
      
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <Hero onOpenCV={() => setShowCV(true)} />
      <GlowingDivider />
      <BrandMarquee />
      <GlowingDivider />
      <About />
      <GlowingDivider />
      <WhyChooseMe />
      <GlowingDivider />
      <Portfolio />
      <GlowingDivider />
      <Testimonials />
      <GlowingDivider />
      <WorkGallery />
      <GlowingDivider />
      <Pricing />
      <GlowingDivider />
      <Skills />
      <GlowingDivider />
      <FAQ />
      <GlowingDivider />
      <AskSauvikAI />
      <FloatingContact />
      <GlowingDivider />
      <Contact />
      <Footer />

      <CVModal isOpen={showCV} onClose={() => setShowCV(false)} isDark={isDark} />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[150] p-4 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-lg shadow-brand-blue/30 hover:shadow-brand-purple/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 cursor-pointer"
            aria-label="Back to Top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background decoration elements - Updated to match Elegant Dark design */}
      <div className="fixed -z-10 w-full h-full top-0 left-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ 
           background: 'radial-gradient(circle at 20% 20%, rgba(0, 210, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(157, 80, 187, 0.15) 0%, transparent 40%)' 
         }} />
      </div>

      <style>{`
        html {
          scroll-behavior: smooth;
        }
        
        .stars {
          background-image: 
          radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: stars-animation 100s linear infinite;
        }

        @keyframes stars-animation {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <PortfolioApp />
      </ToastProvider>
    </LanguageProvider>
  );
}


