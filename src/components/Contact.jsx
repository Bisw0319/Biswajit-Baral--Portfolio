import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Mail, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  RotateCcw 
} from 'lucide-react';
import AnimeCompanion from './AnimeCompanion';
import { getContactData } from '../utils/portfolioStorage';
import { 
  sanitizeText, 
  validateAndSanitizeUrl, 
  checkRateLimit, 
  recordRateLimitAttempt, 
  getOrCreateCsrfToken 
} from '../utils/security';

const DEFAULT_PRECHAT_MESSAGE = "Hey Biswa, can we talk? 👋 Let's connect! 💬";

const Contact = () => {
  const [contactData, setContactData] = useState(getContactData());
  const initialMessage = contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: initialMessage
  });

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getContactData();
      setContactData(updated);
      setFormData(prev => {
        const fallback = updated.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE;
        if (!prev.message || prev.message === DEFAULT_PRECHAT_MESSAGE) {
          return { ...prev, message: fallback };
        }
        return prev;
      });
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = async (email) => {
    // 1. Basic Regex check
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return { valid: false, message: 'Invalid transmission format. Please enter a valid email address.' };

    const rawDomain = email.split('@')[1]?.toLowerCase() || '';
    // SSRF Defense: Sanitize domain and block loopback/metadata addresses
    const domain = rawDomain.replace(/[^a-z0-9.-]/g, '');
    if (!domain || domain.includes('localhost') || domain.includes('127.0.0.1') || domain.endsWith('.internal')) {
      return { valid: false, message: 'Invalid or restricted email domain.' };
    }

    // 2. Common Typo check
    const commonTypos = {
      'gamil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'gnail.com': 'gmail.com'
    };

    if (commonTypos[domain]) {
      return { valid: false, message: `Domain error detected. Did you mean @${commonTypos[domain]}?` };
    }

    // 3. DNS MX Record check with quick timeout (Advanced)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.Status === 3 || (data.Answer && data.Answer.length === 0)) {
        return { valid: false, message: 'The specified email domain cannot receive incoming messages.' };
      }
    } catch (error) {
      // If DNS check times out or network is offline, don't block the user
    }

    return { valid: true };
  };

  const [lastSentData, setLastSentData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('All transmission channels (Name, Email, Message) are required.');
      return;
    }

    // 1. DoS / DDoS Rate Limiting Defense (Max 3 submissions per 2 mins)
    const rateCheck = checkRateLimit('contact_form', 3, 120000);
    if (!rateCheck.allowed) {
      setErrorMessage(`Transmission Throttled: ${rateCheck.message}`);
      return;
    }

    setIsSubmitting(true);

    const validation = await validateEmail(formData.email);
    if (!validation.valid) {
      setIsSubmitting(false);
      setErrorMessage(validation.message);
      return;
    }

    const recipient = contactData.email || "freelixir.b@gmail.com";
    
    // 2. Comprehensive Input Sanitization (XSS, SQLi, Command Injection, Path Traversal Defense)
    const payload = {
      name: sanitizeText(formData.name.trim(), 80),
      email: sanitizeText(formData.email.trim(), 100),
      message: sanitizeText(formData.message.trim(), 2000)
    };

    // 3. Anti-CSRF Token Generation
    const csrfToken = getOrCreateCsrfToken();

    // Prepare FormData payload for FormSubmit
    const fd = new FormData();
    fd.append('name', payload.name);
    fd.append('email', payload.email);
    fd.append('message', payload.message);
    fd.append('_subject', `New Transmission from ${payload.name} [Portfolio Message.exe]`);
    fd.append('_replyto', payload.email);
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');
    fd.append('_csrf_token', csrfToken);

    // Record submission attempt for sliding-window rate limiting
    recordRateLimitAttempt('contact_form', 120000);

    // Use local proxy if on localhost to preserve headers, else direct FormSubmit endpoint
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const primaryUrl = isLocalhost 
      ? `/api/formsubmit/ajax/${encodeURIComponent(recipient)}` 
      : `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;
    const fallbackUrl = `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;

    try {
      let response = await fetch(primaryUrl, {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: fd
      }).catch(async (fetchErr) => {
        // Fallback to direct URL if proxy is unavailable
        if (primaryUrl !== fallbackUrl) {
          return await fetch(fallbackUrl, {
            method: "POST",
            headers: { 'Accept': 'application/json' },
            body: fd
          });
        }
        throw fetchErr;
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (jsonErr) {}

      // FormSubmit strictly returns success: "true" when dispatched
      const isOk = response.ok && responseData && (responseData.success === 'true' || responseData.success === true);

      if (isOk) {
        setLastSentData(payload);
        setSubmissionSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        const msg = responseData?.message || `Gateway returned status ${response.status}`;
        throw new Error(msg);
      }
    } catch (error) {
      console.warn("Direct transmission relay warning:", error);
      const errMsg = error.message || 'Network gateway blocked';
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="min-h-screen pt-28 md:pt-32 pb-20 relative z-10">
      <div className="container mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron inline-block relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-white">
              Comm.Link
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-cyber-blue neon-border-blue"></div>
          </h2>
        </motion.div>

        {/* Interactive Floating Anime Assistant (Comes from right side, draggable anywhere) */}
        <AnimeCompanion />

        <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto">

          {/* Contact Info - Row-Wise 2-Column Grid on Mobile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-4 sm:space-y-6"
          >
            <div className="glass-panel p-4 sm:p-8 rounded-xl relative overflow-hidden group">
              <div className="absolute left-0 top-0 w-1 h-full bg-cyber-blue group-hover:neon-border-blue transition-all"></div>
              <h3 className="text-xl sm:text-2xl font-orbitron text-white mb-2 sm:mb-4">Initialize Connection</h3>
              <p className="text-gray-400 font-inter text-xs sm:text-sm mb-4 sm:mb-6">
                Ready to start a project? Open a secure channel. I'm currently available for freelance work and cyber development opportunities.
              </p>

              {/* Row-Wise Contact Info Grid on Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-4">
                <div className="flex items-center gap-3 text-gray-300 hover:text-cyber-blue transition-colors group/item p-2.5 sm:p-3 rounded-lg bg-cyber-dark/40 border border-white/5">
                  <div className="p-2 sm:p-2.5 bg-cyber-dark/70 rounded-lg border border-white/5 group-hover/item:border-cyber-blue/50 flex-shrink-0">
                    <Mail size={18} className="text-cyber-blue" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-orbitron text-gray-500 uppercase">Email</div>
                    <div className="font-mono text-xs sm:text-sm truncate text-white">{contactData.email || "freelixir.b@gmail.com"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300 hover:text-cyber-yellow transition-colors group/item p-2.5 sm:p-3 rounded-lg bg-cyber-dark/40 border border-white/5">
                  <div className="p-2 sm:p-2.5 bg-cyber-dark/70 rounded-lg border border-white/5 group-hover/item:border-cyber-yellow/50 flex-shrink-0">
                    <MessageSquare size={18} className="text-cyber-yellow" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-orbitron text-gray-500 uppercase">WhatsApp / Contact</div>
                    <div className="font-mono text-xs sm:text-sm truncate text-white">{contactData.phone || "+91 912****550"}</div>
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-3 text-gray-300 group/item p-2.5 sm:p-3 rounded-lg bg-cyber-dark/40 border border-white/5">
                  <div className="p-2 sm:p-2.5 bg-cyber-dark/70 rounded-lg border border-white/5 flex-shrink-0">
                    <MapPin size={18} className="text-cyber-purple" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-orbitron text-gray-500 uppercase">Location</div>
                    <div className="font-mono text-xs sm:text-sm truncate text-white">{contactData.location || "Balugaon, Khordha, Odisha, India"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Connect Quick CTAs - Side-by-Side Row-Wise on Mobile */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`https://wa.me/${(contactData.whatsappNumber || "9124160550").replace(/[^0-9]/g, '')}?text=${encodeURIComponent(contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE)}`}
                target="_blank"
                rel="noreferrer"
                className="glass-panel p-3 sm:p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-cyber-yellow/50 transition-colors"
                title="Chat with Biswajit on WhatsApp"
              >
                <div className="min-w-0">
                  <h4 className="font-orbitron text-cyber-yellow text-xs sm:text-sm font-bold truncate">WhatsApp Direct</h4>
                  <p className="text-[10px] text-gray-400 hidden xs:block">Chat instantly</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyber-yellow/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-yellow/20">
                  <MessageSquare className="text-cyber-yellow" size={16} />
                </div>
              </a>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactData.email || 'freelixir.b@gmail.com')}&su=${encodeURIComponent('Portfolio Inquiry for Biswajit Baral')}&body=${encodeURIComponent(contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE)}`}
                target="_blank"
                rel="noreferrer"
                className="glass-panel p-3 sm:p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-cyber-blue/50 transition-colors"
                title="Send pre-filled message via Gmail"
              >
                <div className="min-w-0">
                  <h4 className="font-orbitron text-cyber-blue text-xs sm:text-sm font-bold truncate">Direct Gmail</h4>
                  <p className="text-[10px] text-gray-400 hidden xs:block">Open client</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyber-blue/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-blue/20">
                  <Mail className="text-cyber-blue" size={16} />
                </div>
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            {submissionSuccess ? (
              <div className="glass-panel p-8 rounded-xl h-full flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-green-400 shadow-[0_0_25px_rgba(74,222,128,0.5)]">
                  <CheckCircle size={36} className="animate-pulse" />
                </div>
                
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400">
                    TRANSMISSION CONFIRMED // STATUS: 200 OK
                  </span>
                  <h3 className="text-2xl font-orbitron font-bold text-white mt-3 mb-2">
                    Message Dispatched
                  </h3>
                  <p className="text-gray-300 text-sm font-inter max-w-md mx-auto leading-relaxed">
                    Your transmission payload has been encrypted and securely delivered to Biswajit's private inbox.
                  </p>
                </div>

                <div className="w-full max-w-sm p-4 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-xs space-y-1.5 text-gray-400">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ROUTING:</span>
                    <span className="text-green-400 font-bold">SECURE_DIRECT_RELAY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">DESTINATION:</span>
                    <span className="text-white">AUTHORIZED_RECIPIENT // VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TIME:</span>
                    <span className="text-gray-300">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Instant Guaranteed Backup Channels */}
                <div className="w-full max-w-md pt-2 space-y-3">
                  <div className="text-[11px] font-mono text-gray-400">
                    Want to guarantee 100% instant inbox arrival?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactData.email || 'freelixir.b@gmail.com')}&su=${encodeURIComponent('Portfolio Message from ' + (lastSentData?.name || 'Visitor'))}&body=${encodeURIComponent('From: ' + (lastSentData?.name || 'Visitor') + ' (' + (lastSentData?.email || 'No email') + ')\n\nMessage:\n' + (lastSentData?.message || 'Hello Biswajit!'))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2.5 rounded-lg bg-cyber-blue/15 hover:bg-cyber-blue text-cyber-blue hover:text-black border border-cyber-blue/40 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Mail size={14} />
                      <span>Send Direct via Gmail</span>
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href={`https://wa.me/${(contactData.whatsappNumber || "9124160550").replace(/[^0-9]/g, '')}?text=${encodeURIComponent('🚀 Transmission from ' + (lastSentData?.name || 'Visitor') + ' (' + (lastSentData?.email || 'No email') + '):\n\n' + (lastSentData?.message || 'Hello Biswajit!'))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-400 text-emerald-400 hover:text-black border border-emerald-500/40 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <MessageSquare size={14} />
                      <span>Notify via WhatsApp</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Biswajit Admin Spam Activation Guide */}
                  <div className="p-3.5 rounded-xl bg-cyber-yellow/10 border border-cyber-yellow/30 text-left space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-cyber-yellow font-orbitron font-bold text-[11px]">
                      <AlertCircle size={15} className="flex-shrink-0" />
                      <span>ADMIN NOTICE: CHECK SPAM FOLDER</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      FormSubmit sends an initial activation email that Gmail automatically places in your <strong className="text-yellow-400">SPAM / JUNK</strong> folder!
                    </p>
                    <div className="text-[10px] text-gray-400 space-y-1">
                      <div>1. Go to Gmail &gt; <span className="text-yellow-300 font-semibold">Spam folder</span> (or search "FormSubmit")</div>
                      <div>2. Open email: <span className="text-white">"FormSubmit: Action Required - Activate FormSubmit"</span></div>
                      <div>3. Click the green <span className="text-emerald-400 font-bold">"Activate Form"</span> button</div>
                      <div>4. Click <span className="text-white font-semibold">"Not Spam"</span> so all messages land in your Primary inbox</div>
                    </div>
                    <div className="pt-1">
                      <a
                        href="https://mail.google.com/mail/u/0/#search/FormSubmit"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-yellow text-black font-orbitron font-bold text-[10px] uppercase tracking-wider hover:bg-yellow-300 transition-all cursor-pointer"
                      >
                        <span>Search Gmail Spam for FormSubmit</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmissionSuccess(false)}
                  className="px-6 py-3 rounded-xl bg-cyber-blue hover:bg-cyber-blue/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  <RotateCcw size={14} />
                  <span>Transmit Another Message</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-xl h-full flex flex-col relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-2xl font-orbitron text-white flex items-center gap-2">
                    <span className="text-cyber-blue">&gt;</span> Message.exe
                  </h3>
                  <div className="text-[11px] font-mono text-cyber-blue/80 flex items-center gap-1.5 bg-cyber-dark/60 px-2.5 py-1 rounded-lg border border-cyber-blue/20">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span>ENCRYPTED NEURAL CHANNEL // SECURE GATEWAY</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className={`mb-6 p-4 rounded-xl border text-xs font-mono space-y-2.5 ${
                    errorMessage.toLowerCase().includes('activation')
                      ? 'bg-cyber-yellow/15 border-cyber-yellow/40 text-yellow-300 shadow-[0_0_15px_rgba(252,238,10,0.15)]'
                      : 'bg-cyber-red/15 border-cyber-red/40 text-cyber-red'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={18} className={`flex-shrink-0 mt-0.5 ${errorMessage.toLowerCase().includes('activation') ? 'text-cyber-yellow' : 'text-cyber-red'}`} />
                      <div>
                        <strong className="block font-orbitron text-white text-xs mb-1">
                          {errorMessage.toLowerCase().includes('activation') ? 'ACTION REQUIRED: 1-CLICK ACTIVATION' : 'TRANSMISSION GATEWAY ALERT'}
                        </strong>
                        <p className="text-gray-300 leading-relaxed text-[11px]">
                          {errorMessage.toLowerCase().includes('activation')
                            ? "FormSubmit sent a 1-time activation email to your mailbox. Please check your Inbox (or Spam/Junk folder) for 'FormSubmit' and click 'Activate Form' once. After that single click, all transmissions will be received immediately!"
                            : errorMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactData.email || 'freelixir.b@gmail.com')}&su=${encodeURIComponent('Portfolio Message from ' + (formData.name || 'Visitor'))}&body=${encodeURIComponent('From: ' + (formData.name || 'Visitor') + ' (' + (formData.email || 'No email') + ')\n\nMessage:\n' + (formData.message || ''))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-blue text-black hover:bg-cyber-blue/90 text-xs font-orbitron font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <span>Send Direct via Gmail</span>
                        <ExternalLink size={13} />
                      </a>
                      <a
                        href={`https://wa.me/${(contactData.whatsappNumber || "9124160550").replace(/[^0-9]/g, '')}?text=${encodeURIComponent('🚀 Transmission from ' + (formData.name || 'Visitor') + ' (' + (formData.email || 'No email') + '):\n\n' + (formData.message || ''))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-orbitron font-bold transition-all cursor-pointer"
                      >
                        <span>Send via WhatsApp</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}

                <div className="space-y-4 flex-grow">
                  {/* Name and Return Address in 2-Column Row on Mobile & Desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-orbitron text-gray-400 uppercase mb-1.5">Subject_Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full bg-cyber-dark/50 border border-white/10 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all disabled:opacity-50"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-400 uppercase mb-1.5">Return_Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full bg-cyber-dark/50 border border-white/10 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all disabled:opacity-50"
                        placeholder="e.g. name@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-orbitron text-gray-400 uppercase">Payload_Data</label>
                      <span className="text-[10px] font-mono text-cyber-blue hidden xs:inline-block">Quick Pre-chat Prompts:</span>
                    </div>

                    {/* Pre-chat Quick Action Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, message: contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE })}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-cyber-blue/15 hover:bg-cyber-blue/30 text-cyber-blue border border-cyber-blue/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Paste pre-chat prompt"
                      >
                        <span>👋 "Hey Biswa, can we talk?"</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, message: "Hey Biswa, let's discuss a project! 💻🚀" })}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Paste project prompt"
                      >
                        <span>💻 "Project Inquiry"</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, message: "Hey Biswa, are you available for freelance work? ✨" })}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Paste freelance prompt"
                      >
                        <span>🚀 "Freelance Work"</span>
                      </button>
                      {formData.message && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, message: '' })}
                          className="text-[10px] font-mono px-2 py-1 rounded-md bg-white/5 hover:bg-cyber-red/20 text-gray-400 hover:text-cyber-red border border-white/10 hover:border-cyber-red/30 transition-all cursor-pointer ml-auto"
                          title="Clear message box"
                        >
                          <span>Clear ✕</span>
                        </button>
                      )}
                    </div>

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      rows="3"
                      className="w-full flex-grow bg-cyber-dark/50 border border-white/10 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all resize-none disabled:opacity-50"
                      placeholder={contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE}
                    ></textarea>
                  </div>
                </div>

                {/* Primary Transmit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-orbitron uppercase tracking-widest hover:bg-cyber-blue hover:text-black transition-all duration-300 neon-border-blue flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-cyber-blue" />
                      <span>Transmitting Payload...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Guaranteed 100% Direct Channels */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-2">
                    <span>Guaranteed Direct Channels:</span>
                    <span className="text-emerald-400 font-bold">100% Instant Delivery</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactData.email || 'freelixir.b@gmail.com')}&su=${encodeURIComponent('Portfolio Message from ' + (formData.name || 'Visitor'))}&body=${encodeURIComponent('From: ' + (formData.name || 'Visitor') + ' (' + (formData.email || 'No email') + ')\n\nMessage:\n' + (formData.message || contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-cyber-blue/15 hover:bg-cyber-blue text-cyber-blue hover:text-black border border-cyber-blue/40 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Opens pre-filled email in Gmail"
                    >
                      <Mail size={13} />
                      <span>Direct via Gmail</span>
                      <ExternalLink size={12} />
                    </a>

                    <a
                      href={`https://wa.me/${(contactData.whatsappNumber || "9124160550").replace(/[^0-9]/g, '')}?text=${encodeURIComponent(formData.message ? ('🚀 Transmission from ' + (formData.name || 'Visitor') + ' (' + (formData.email || 'No email') + '):\n\n' + formData.message) : (contactData.defaultChatMessage || DEFAULT_PRECHAT_MESSAGE))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-400 text-emerald-400 hover:text-black border border-emerald-500/40 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Sends message directly to WhatsApp"
                    >
                      <MessageSquare size={13} />
                      <span>Direct via WhatsApp</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
