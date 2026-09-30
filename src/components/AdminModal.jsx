import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  User, 
  PlusCircle, 
  Award, 
  FolderPlus, 
  Database, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  X, 
  Upload, 
  ExternalLink, 
  FileText, 
  Palette, 
  Eye, 
  EyeOff,
  Download,
  Sparkles,
  Search,
  RotateCcw,
  Edit3,
  Save,
  Home,
  Globe,
  Cpu,
  Zap,
  Mail,
  MessageSquare,
  MapPin,
  Terminal,
  Plus,
  Send
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import { 
  validateUploadedFile, 
  sanitizeText, 
  sanitizeFilePath, 
  validateAndSanitizeUrl 
} from '../utils/security';
import { 
  verifyAdminLogin, 
  isAdminLoggedIn, 
  logoutAdmin, 
  getAdminCredentials, 
  updateAdminCredentials,
  getCustomCertificates,
  addCustomCertificate,
  getCustomProjects,
  addCustomProject,
  getEffectiveCertificates,
  getEffectiveProjects,
  updateCertificate,
  updateProject,
  deleteCertificate,
  deleteProject,
  restoreDeletedCertificates,
  restoreDeletedProjects,
  getDeletedCertificateIds,
  getDeletedProjectIds,
  getSkillsData,
  saveSkillsData,
  addSkill,
  deleteSkill,
  addSkillCategory,
  deleteSkillCategory,
  resetSkillsData,
  getHomeData,
  updateHomeData,
  addHomeRole,
  deleteHomeRole,
  updateProfilePic,
  resetProfilePic,
  resetHomeData,
  getAboutData,
  updateAboutData,
  addAboutMetric,
  deleteAboutMetric,
  resetAboutData,
  getContactData,
  updateContactData,
  addSocialLink,
  deleteSocialLink,
  resetContactData,
  getResumeData,
  updateResumeData,
  deleteResume,
  resetResumeData,
  isFirebaseConfigured,
  setFirebaseConfig,
  getActiveFirebaseConfig,
  uploadAllLocalDataToCloud,
  exportFullPortfolioData,
  importFullPortfolioData,
  initCloudSync,
  getStoredContactMessages,
  deleteLocalContactMessage
} from '../utils/portfolioStorage';
import { getCloudCollection, deleteCloudDoc } from '../utils/firebase';

const AdminModal = ({ isOpen, onClose }) => {
  const context = useContext(SettingsContext);
  const playClick = context?.playClick;
  const playHover = context?.playHover;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('add-cert'); // 'add-cert' | 'add-project' | 'manage' | 'security'
  
  // Login Form
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Cert Form State
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    subtitle: '',
    certNumber: '',
    date: '',
    validity: 'Permanent',
    category: 'Cybersecurity',
    glowColor: '#00f0ff',
    image: '',
    url: '',
    badge: 'Certified',
    description: ''
  });

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tech: '',
    github: '',
    live: '',
    image: ''
  });

  // Password Change State
  const [newId, setNewId] = useState('');
  const [newPass, setNewPass] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Notification Banner
  const [actionSuccess, setActionSuccess] = useState('');

  // Refresh trigger for manage tab
  const [refreshKey, setRefreshKey] = useState(0);

  // Search Filters for Delete & Edit Sections
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  // Editing State
  const [editingCert, setEditingCert] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [editCertForm, setEditCertForm] = useState({
    id: '',
    title: '',
    issuer: '',
    subtitle: '',
    certNumber: '',
    date: '',
    validity: '',
    category: '',
    glowColor: '#00f0ff',
    image: '',
    url: '',
    badge: '',
    description: ''
  });

  const [editProjectForm, setEditProjectForm] = useState({
    id: '',
    title: '',
    description: '',
    tech: '',
    github: '',
    live: '',
    image: ''
  });

  // Main Section Navigation
  const [activeSection, setActiveSection] = useState('certs'); // 'certs' | 'projects' | 'skills' | 'home' | 'about' | 'contacts' | 'security'
  const [certSubTab, setCertSubTab] = useState('add'); // 'add' | 'edit' | 'delete'
  const [projectSubTab, setProjectSubTab] = useState('add'); // 'add' | 'edit' | 'delete'

  // Skills State
  const [skillsList, setSkillsList] = useState(getSkillsData());
  const [newSkillCategoryName, setNewSkillCategoryName] = useState('');
  const [skillCategorySelect, setSkillCategorySelect] = useState('Frontend.sys');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Home & Avatar & Letters State
  const [homeForm, setHomeForm] = useState(getHomeData());
  const [newLetterRole, setNewLetterRole] = useState('');

  // About State
  const [aboutForm, setAboutForm] = useState(getAboutData());
  const [newMetricForm, setNewMetricForm] = useState({
    name: '',
    icon: 'Code',
    level: 85
  });

  // Contact State
  const [contactForm, setContactForm] = useState(getContactData());
  const [newSocialForm, setNewSocialForm] = useState({
    platform: '',
    url: '',
    icon: 'Link'
  });

  // Resume State
  const [resumeData, setResumeData] = useState(() => getResumeData());
  const [resumeButtonText, setResumeButtonText] = useState(() => getResumeData().buttonText || 'Download CV');
  const [isResumeUploading, setIsResumeUploading] = useState(false);

  // Cloud Sync State
  const [isCloudConfigured, setIsCloudConfigured] = useState(() => isFirebaseConfigured());
  const [cloudConfigInput, setCloudConfigInput] = useState('');
  const [cloudSyncMsg, setCloudSyncMsg] = useState('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Contact Messages State
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const local = getStoredContactMessages();
      let cloud = [];
      try {
        cloud = await getCloudCollection('contact_messages');
      } catch (e) {
        console.warn("Could not fetch cloud messages:", e);
      }
      const combined = [...local];
      cloud.forEach(c => {
        if (!combined.some(m => m.id === c.id || (m.email === c.email && m.receivedAt === c.receivedAt))) {
          combined.push(c);
        }
      });
      combined.sort((a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0));
      setReceivedMessages(combined);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Delete this transmission log?")) return;
    deleteLocalContactMessage(msgId);
    try {
      await deleteCloudDoc('contact_messages', msgId);
    } catch {}
    setReceivedMessages(prev => prev.filter(m => m.id !== msgId));
  };

  useEffect(() => {
    const handleMsgUpdate = () => loadMessages();
    window.addEventListener('portfolio_messages_updated', handleMsgUpdate);
    return () => window.removeEventListener('portfolio_messages_updated', handleMsgUpdate);
  }, [loadMessages]);

  useEffect(() => {
    const handleStatus = () => setIsCloudConfigured(isFirebaseConfigured());
    window.addEventListener('portfolio_firebase_status_changed', handleStatus);
    return () => window.removeEventListener('portfolio_firebase_status_changed', handleStatus);
  }, []);

  const handleSaveFirebaseConfig = () => {
    try { playClick?.(); } catch {}
    if (!cloudConfigInput.trim()) {
      alert("Please paste your firebaseConfig code or JSON.");
      return;
    }

    try {
      let cleaned = cloudConfigInput.trim();
      if (cleaned.includes('{') && cleaned.includes('}')) {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        }
      }
      
      const normalized = cleaned
        .replace(/(\w+)\s*:/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*\}/g, '}');

      const parsed = JSON.parse(normalized);
      if (!parsed.apiKey || !parsed.projectId) {
        alert("The pasted config does not contain a valid apiKey and projectId.");
        return;
      }

      setFirebaseConfig(parsed);
      initCloudSync();
      setIsCloudConfigured(true);
      setCloudConfigInput('');
      setCloudSyncMsg('Firebase Cloud Database Connected Successfully! Multi-device sync is now ACTIVE.');
    } catch (err) {
      alert("Could not parse the pasted Firebase config. Please ensure it looks like:\n{\n  apiKey: '...',\n  projectId: '...'\n}");
    }
  };

  const handleDisconnectFirebase = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Disconnect Firebase Cloud Database? The portfolio will revert to local offline storage.")) {
      setFirebaseConfig(null);
      setIsCloudConfigured(false);
      setCloudSyncMsg('Firebase disconnected. Portfolio is in local offline mode.');
    }
  };

  const handleUploadAllToCloud = async () => {
    try { playClick?.(); } catch {}
    setIsCloudSyncing(true);
    setCloudSyncMsg('Syncing all local projects, skills, certificates & data to Firebase...');
    try {
      await uploadAllLocalDataToCloud();
      setCloudSyncMsg('All portfolio data successfully synchronized to Firebase Cloud! Every visitor and device will now see the latest data.');
    } catch (e) {
      alert("Cloud Sync Error: " + (e.message || e));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleExportFullBackup = () => {
    try { playClick?.(); } catch {}
    const data = exportFullPortfolioData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biswajit-portfolio-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActionSuccess('Complete portfolio backup downloaded.');
  };

  const handleImportFullBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        importFullPortfolioData(parsed);
        setActionSuccess('Portfolio data successfully restored from backup file!');
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        alert("Failed to import backup file: Invalid JSON structure.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Check login on open & sync data
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(isAdminLoggedIn());
      setLoginError('');
      setActionSuccess('');
      const creds = getAdminCredentials();
      setNewId(creds.adminId);
      setSkillsList(getSkillsData());
      setHomeForm(getHomeData());
      setAboutForm(getAboutData());
      setContactForm(getContactData());
      const r = getResumeData();
      setResumeData(r);
      setResumeButtonText(r.buttonText || 'Download CV');
      loadMessages();
    }
  }, [isOpen, refreshKey, loadMessages]);

  const handleLogin = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!adminId || !password) {
      setLoginError('Admin ID and Password are required.');
      return;
    }

    const res = verifyAdminLogin(adminId, password);
    const success = typeof res === 'object' ? res.success : res;
    if (success) {
      setIsAuthenticated(true);
      setLoginError('');
      setAdminId('');
      setPassword('');
    } else {
      const errMsg = (typeof res === 'object' && res.message) 
        ? res.message 
        : 'Access Denied: Invalid Admin ID or Security Key.';
      setLoginError(errMsg);
    }
  };

  const handleLogout = () => {
    try { playClick?.(); } catch {}
    logoutAdmin();
    setIsAuthenticated(false);
    setActionSuccess('Admin session terminated safely.');
  };

  // Compress image to ensure small lightweight base64 (<100KB) for lightning-fast Cloud Firestore sync
  const compressImageFile = (file, maxWidth = 900, quality = 0.75) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target.result);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Secure Image Upload with Deep Magic Bytes & MIME Inspection
  const handleImageUpload = async (e, targetForm) => {
    const file = e.target.files[0];
    if (!file) return;

    // Strict validation: max 2.5MB, extension, MIME, and real binary magic bytes
    const validation = await validateUploadedFile(file, { maxSize: 2.5 * 1024 * 1024 });
    if (!validation.valid) {
      alert(`[Security Alert: File Rejected]\n${validation.error}`);
      e.target.value = '';
      return;
    }

    const compressed = await compressImageFile(file);
    if (targetForm === 'cert') {
      setCertForm(prev => ({ ...prev, image: compressed }));
    } else {
      setProjectForm(prev => ({ ...prev, image: compressed }));
    }
  };

  // Submit Certificate
  const handleCertSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}

    if (!certForm.title || !certForm.issuer) {
      alert("Title and Issuer are mandatory fields.");
      return;
    }

    addCustomCertificate({
      ...certForm,
      image: certForm.image || '/certificates/cert-ibm-cybersecurity.png',
      url: certForm.url || '#'
    });

    setActionSuccess(`Certificate "${certForm.title}" published in FRONT (first) of your portfolio!`);
    setCertForm({
      title: '',
      issuer: '',
      subtitle: '',
      certNumber: '',
      date: '',
      validity: 'Permanent',
      category: 'Cybersecurity',
      glowColor: '#00f0ff',
      image: '',
      url: '',
      badge: 'Certified',
      description: ''
    });
    setRefreshKey(prev => prev + 1);
  };

  // Submit Project
  const handleProjectSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}

    if (!projectForm.title || !projectForm.description) {
      alert("Title and Description are mandatory fields.");
      return;
    }

    const techArray = projectForm.tech 
      ? projectForm.tech.split(',').map(t => t.trim()).filter(Boolean)
      : ['React', 'Cybersecurity'];

    addCustomProject({
      ...projectForm,
      tech: techArray,
      image: projectForm.image || "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      github: projectForm.github || 'https://github.com/',
      live: projectForm.live || '#'
    });

    setActionSuccess(`Project "${projectForm.title}" published in FRONT (first) of your portfolio!`);
    setProjectForm({
      title: '',
      description: '',
      tech: '',
      github: '',
      live: '',
      image: ''
    });
    setRefreshKey(prev => prev + 1);
  };

  // Change Password
  const handleSecurityUpdate = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}

    if (!newId || !newPass) {
      alert("Admin ID and new password cannot be empty.");
      return;
    }

    updateAdminCredentials(newId, newPass);
    setSecuritySuccess('Security credentials updated successfully!');
    setTimeout(() => setSecuritySuccess(''), 4000);
  };

  // Edit Handlers for Certificates
  const handleStartEditCert = (cert) => {
    try { playClick?.(); } catch {}
    setEditingCert(cert);
    setEditCertForm({
      id: cert.id,
      title: cert.title || '',
      issuer: cert.issuer || '',
      subtitle: cert.subtitle || '',
      certNumber: cert.certNumber || '',
      date: cert.date || '',
      validity: cert.validity || 'Permanent',
      category: cert.category || 'Cybersecurity',
      glowColor: cert.glowColor || '#00f0ff',
      image: cert.image || '',
      url: cert.url || '',
      badge: cert.badge || 'Certified',
      description: cert.description || ''
    });
    setActiveSection('certs');
    setCertSubTab('edit');
    setActiveTab('edit-cert');
  };

  const handleEditCertImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = await validateUploadedFile(file, { maxSize: 2.5 * 1024 * 1024 });
      if (!validation.valid) {
        alert(`[Security Alert: File Rejected]\n${validation.error}`);
        e.target.value = '';
        return;
      }
      const compressed = await compressImageFile(file);
      setEditCertForm(prev => ({ ...prev, image: compressed }));
    }
  };

  const handleUpdateCertSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!editCertForm.title || !editCertForm.issuer) {
      alert('Certificate Title and Issuer are required.');
      return;
    }
    updateCertificate(editCertForm.id, editCertForm);
    setActionSuccess(`Certificate "${editCertForm.title}" updated successfully!`);
    setEditingCert(null);
    setRefreshKey(prev => prev + 1);
  };

  // Edit Handlers for Projects
  const handleStartEditProject = (proj) => {
    try { playClick?.(); } catch {}
    setEditingProject(proj);
    setEditProjectForm({
      id: proj.id || proj.title,
      title: proj.title || '',
      description: proj.description || '',
      tech: Array.isArray(proj.tech) ? proj.tech.join(', ') : (proj.tech || ''),
      github: proj.github || '',
      live: proj.live || '',
      image: proj.image || ''
    });
    setActiveSection('projects');
    setProjectSubTab('edit');
    setActiveTab('edit-project');
  };

  const handleEditProjectImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = await validateUploadedFile(file, { maxSize: 2.5 * 1024 * 1024 });
      if (!validation.valid) {
        alert(`[Security Alert: File Rejected]\n${validation.error}`);
        e.target.value = '';
        return;
      }
      const compressed = await compressImageFile(file);
      setEditProjectForm(prev => ({ ...prev, image: compressed }));
    }
  };

  const handleUpdateProjectSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!editProjectForm.title || !editProjectForm.description) {
      alert('Project Title and Description are required.');
      return;
    }
    const techArray = editProjectForm.tech
      ? editProjectForm.tech.split(',').map(t => t.trim()).filter(Boolean)
      : ['React'];

    const targetId = editProjectForm.id || editProjectForm.title;
    updateProject(targetId, {
      ...editProjectForm,
      tech: techArray
    });
    setActionSuccess(`Project "${editProjectForm.title}" updated successfully!`);
    setEditingProject(null);
    setRefreshKey(prev => prev + 1);
  };

  // Delete & Restore Handlers
  const handleDeleteCert = (cert) => {
    try { playClick?.(); } catch {}
    const isConfirmed = window.confirm(`Are you sure you want to permanently delete certificate "${cert.title}" from your portfolio?`);
    if (isConfirmed) {
      deleteCertificate(cert.id);
      setActionSuccess(`Certificate "${cert.title}" has been deleted.`);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleDeleteProject = (proj) => {
    try { playClick?.(); } catch {}
    const targetId = proj.id || proj.title;
    const isConfirmed = window.confirm(`Are you sure you want to permanently delete project "${proj.title}" from your portfolio?`);
    if (isConfirmed) {
      deleteProject(targetId);
      setActionSuccess(`Project "${proj.title}" has been deleted.`);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRestoreCerts = () => {
    try { playClick?.(); } catch {}
    if (window.confirm('Restore all original default certificates that were deleted?')) {
      restoreDeletedCertificates();
      setActionSuccess('All original default certificates have been restored!');
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRestoreProjects = () => {
    try { playClick?.(); } catch {}
    if (window.confirm('Restore all original default projects that were deleted?')) {
      restoreDeletedProjects();
      setActionSuccess('All original default projects have been restored!');
      setRefreshKey(prev => prev + 1);
    }
  };

  // Export Data JSON
  const handleExportData = () => {
    try { playClick?.(); } catch {}
    const data = {
      certificates: getEffectiveCertificates(),
      projects: getEffectiveProjects(),
      deletedCertIds: getDeletedCertificateIds(),
      deletedProjectIds: getDeletedProjectIds(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // SKILLS HANDLERS
  // ==========================================
  const handleAddSkill = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!newSkillInput.trim()) return;
    const targetCat = skillCategorySelect || (skillsList[0] ? skillsList[0].title : 'Frontend.sys');
    addSkill(targetCat, newSkillInput.trim());
    setNewSkillInput('');
    setSkillsList(getSkillsData());
    setActionSuccess(`Added "${newSkillInput.trim()}" in FRONT (first) of ${targetCat}!`);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteSkill = (catTitle, skillName) => {
    try { playClick?.(); } catch {}
    deleteSkill(catTitle, skillName);
    setSkillsList(getSkillsData());
    setActionSuccess(`Removed "${skillName}" from ${catTitle}.`);
    setRefreshKey(prev => prev + 1);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!newSkillCategoryName.trim()) return;
    addSkillCategory(newSkillCategoryName.trim());
    setSkillCategorySelect(newSkillCategoryName.trim());
    setNewSkillCategoryName('');
    setSkillsList(getSkillsData());
    setActionSuccess(`Created category "${newSkillCategoryName.trim()}" in FRONT (first)!`);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteCategory = (catTitle) => {
    try { playClick?.(); } catch {}
    if (window.confirm(`Are you sure you want to delete entire category "${catTitle}" and all its skills?`)) {
      deleteSkillCategory(catTitle);
      setSkillsList(getSkillsData());
      setActionSuccess(`Deleted category "${catTitle}".`);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRestoreSkills = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Reset all skills and categories back to factory defaults?")) {
      resetSkillsData();
      setSkillsList(getSkillsData());
      setActionSuccess("Skills have been restored to defaults.");
      setRefreshKey(prev => prev + 1);
    }
  };

  // ==========================================
  // HOME & AVATAR & LETTERS HANDLERS
  // ==========================================
  const handleUpdateHomeSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    updateHomeData(homeForm);
    setActionSuccess("Home section content saved successfully!");
  };

  const handleAddLetterRole = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!newLetterRole.trim()) return;
    addHomeRole(newLetterRole.trim());
    setHomeForm(getHomeData());
    setNewLetterRole('');
    setActionSuccess(`Added animated phrase "${newLetterRole.trim()}"!`);
  };

  const handleDeleteLetterRole = (index, roleText) => {
    try { playClick?.(); } catch {}
    deleteHomeRole(index);
    setHomeForm(getHomeData());
    setActionSuccess(`Removed animated phrase "${roleText}".`);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = await validateUploadedFile(file, { maxSize: 2.5 * 1024 * 1024 });
      if (!validation.valid) {
        alert(`[Security Alert: File Rejected]\n${validation.error}`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePic(reader.result);
        setHomeForm(getHomeData());
        setActionSuccess("Profile picture updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = () => {
    try { playClick?.(); } catch {}
    resetProfilePic();
    setHomeForm(getHomeData());
    setActionSuccess("Profile picture reset to default avatar.");
  };

  const handleRestoreHome = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Reset Home & Avatar settings back to factory defaults?")) {
      resetHomeData();
      setHomeForm(getHomeData());
      setActionSuccess("Home settings have been reset to defaults.");
    }
  };

  // ==========================================
  // ABOUT SECTION HANDLERS
  // ==========================================
  const handleUpdateAboutSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    updateAboutData(aboutForm);
    setActionSuccess("About section bio saved successfully!");
  };

  const handleAddMetric = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!newMetricForm.name.trim()) return;
    addAboutMetric(newMetricForm);
    setAboutForm(getAboutData());
    setNewMetricForm({ name: '', icon: 'Code', level: 85 });
    setActionSuccess(`Added metric card "${newMetricForm.name.trim()}"!`);
  };

  const handleDeleteMetric = (metric) => {
    try { playClick?.(); } catch {}
    deleteAboutMetric(metric.id || metric.name);
    setAboutForm(getAboutData());
    setActionSuccess(`Removed metric "${metric.name}".`);
  };

  const handleRestoreAbout = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Reset About section & metrics back to factory defaults?")) {
      resetAboutData();
      setAboutForm(getAboutData());
      setActionSuccess("About section has been reset to defaults.");
    }
  };

  // ==========================================
  // CONTACTS HANDLERS
  // ==========================================
  const handleUpdateContactSubmit = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    updateContactData(contactForm);
    setActionSuccess("Contact details updated successfully!");
  };

  const handleAddSocial = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    if (!newSocialForm.platform.trim() || !newSocialForm.url.trim()) return;
    addSocialLink(newSocialForm);
    setContactForm(getContactData());
    setNewSocialForm({ platform: '', url: '', icon: 'Link' });
    setActionSuccess(`Added link for "${newSocialForm.platform.trim()}"!`);
  };

  const handleDeleteSocial = (social) => {
    try { playClick?.(); } catch {}
    deleteSocialLink(social.id || social.url);
    setContactForm(getContactData());
    setActionSuccess(`Removed social link "${social.platform}".`);
  };

  const handleRestoreContact = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Reset contact information and links back to factory defaults?")) {
      resetContactData();
      setContactForm(getContactData());
      setActionSuccess("Contact information has been reset to defaults.");
    }
  };

  // ==========================================
  // RESUME / CV HANDLERS
  // ==========================================
  const handleResumeFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try { playClick?.(); } catch {}

    setIsResumeUploading(true);
    // Max 10MB, strictly genuine PDF verification
    const validation = await validateUploadedFile(file, {
      maxSize: 10 * 1024 * 1024,
      allowedExtensions: ['pdf'],
      allowedMimeTypes: ['application/pdf']
    });

    if (!validation.valid) {
      alert(`[Security Alert: File Rejected]\n${validation.error}`);
      e.target.value = '';
      setIsResumeUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileSizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      updateResumeData({
        url: reader.result,
        fileName: file.name,
        fileSize: fileSizeStr,
        buttonText: resumeButtonText || 'Download CV'
      });
      setResumeData(getResumeData());
      setActionSuccess(`Resume "${file.name}" uploaded successfully! Visitors can now download your CV from the Home section.`);
      setIsResumeUploading(false);
      setRefreshKey(prev => prev + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteResume = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Are you sure you want to delete your current resume? The download button will reflect that the CV is in progress.")) {
      deleteResume();
      setResumeData(getResumeData());
      setActionSuccess("Resume removed from portfolio.");
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleResetResume = () => {
    try { playClick?.(); } catch {}
    if (window.confirm("Restore default Biswajit Baral resume PDF?")) {
      resetResumeData();
      setResumeData(getResumeData());
      setActionSuccess("Default Biswajit Baral resume restored!");
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveResumeSettings = (e) => {
    e.preventDefault();
    try { playClick?.(); } catch {}
    updateResumeData({
      buttonText: resumeButtonText.trim() || 'Download CV'
    });
    setResumeData(getResumeData());
    setActionSuccess("Resume button label saved!");
  };

  if (!isOpen) return null;

  const effectiveCerts = getEffectiveCertificates();
  const effectiveProjects = getEffectiveProjects();
  const deletedCertIds = getDeletedCertificateIds();
  const deletedProjectIds = getDeletedProjectIds();

  const filteredCerts = effectiveCerts.filter(cert => {
    if (!certSearchQuery.trim()) return true;
    const q = certSearchQuery.toLowerCase();
    return (
      (cert.title && cert.title.toLowerCase().includes(q)) ||
      (cert.issuer && cert.issuer.toLowerCase().includes(q)) ||
      (cert.certNumber && cert.certNumber.toLowerCase().includes(q)) ||
      (cert.category && cert.category.toLowerCase().includes(q))
    );
  });

  const filteredProjects = effectiveProjects.filter(proj => {
    if (!projectSearchQuery.trim()) return true;
    const q = projectSearchQuery.toLowerCase();
    const techStr = Array.isArray(proj.tech) ? proj.tech.join(' ') : (proj.tech || '');
    return (
      (proj.title && proj.title.toLowerCase().includes(q)) ||
      (proj.description && proj.description.toLowerCase().includes(q)) ||
      techStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl 2xl:max-w-5xl glass-panel border border-cyber-blue/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] bg-cyber-dark/95 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]"
      >
        {/* Top Cyber Console Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-black/60 relative">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/40 text-cyber-blue">
              <Shield size={20} className={isAuthenticated ? "text-green-400" : "text-cyber-blue animate-pulse"} />
            </div>
            <div>
              <h2 className="text-white font-orbitron font-bold tracking-wider text-base md:text-lg flex items-center gap-2">
                ADMINISTRATIVE CONSOLE
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-widest ${isAuthenticated ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30'}`}>
                  {isAuthenticated ? 'UNLOCKED // LEVEL 5' : 'LOCKED'}
                </span>
              </h2>
              <p className="text-[11px] font-mono text-gray-400">
                Secure portal for future certificates and project deployment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                onMouseEnter={() => playHover?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyber-red/40 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20 text-xs font-orbitron transition-colors cursor-pointer"
                title="Lock Console"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={() => {
                try { playClick?.(); } catch {}
                onClose();
              }}
              onMouseEnter={() => playHover?.()}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Console Body Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated ? (
            /* 1. SECURE LOGIN SCREEN */
            <div className="max-w-md mx-auto py-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyber-blue/10 border-2 border-cyber-blue/50 flex items-center justify-center text-cyber-blue shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Restricted Access</h3>
                <p className="text-gray-400 text-xs font-inter leading-relaxed">
                  Only the authorized administrator can access this control panel to upload future credentials and projects.
                </p>
              </div>

              {loginError && (
                <div className="mb-6 p-3 rounded-xl bg-cyber-red/15 border border-cyber-red/50 text-cyber-red text-xs font-mono flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-orbitron text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={13} className="text-cyber-blue" />
                    Admin ID
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter Admin ID"
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none focus:ring-1 focus:ring-cyber-blue transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-orbitron text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Key size={13} className="text-cyber-blue" />
                    Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Security Password"
                      autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none focus:ring-1 focus:ring-cyber-blue transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  onMouseEnter={() => playHover?.()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-purple text-black font-orbitron font-bold text-sm tracking-widest uppercase hover:opacity-90 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <Unlock size={16} />
                  Authorize Clearance
                </button>
              </form>
            </div>
          ) : (
            /* 2. AUTHENTICATED ADMIN DASHBOARD */
            <div>
              {/* Notification Banner */}
              {actionSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/15 border border-green-500/50 text-green-300 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span>{actionSuccess}</span>
                  </div>
                  <button onClick={() => setActionSuccess('')} className="text-green-400 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Primary Section Navigation Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('certs'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'certs'
                      ? 'bg-cyber-blue text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Award size={14} />
                  <span>Certificates</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('projects'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'projects'
                      ? 'bg-cyber-purple text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <FolderPlus size={14} />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('skills'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'skills'
                      ? 'bg-emerald-400 text-black font-bold shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-emerald-400 border border-white/10'
                  }`}
                >
                  <Zap size={14} />
                  <span>Skills</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('home'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'home'
                      ? 'bg-cyber-yellow text-black font-bold shadow-[0_0_15px_rgba(252,238,10,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-cyber-yellow border border-white/10'
                  }`}
                >
                  <Home size={14} />
                  <span>Home & Avatar</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('about'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'about'
                      ? 'bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-cyan-400 border border-white/10'
                  }`}
                >
                  <User size={14} />
                  <span>About</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('contacts'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'contacts'
                      ? 'bg-pink-500 text-white font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-pink-400 border border-white/10'
                  }`}
                >
                  <Mail size={14} />
                  <span>Contacts</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('resume'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'resume'
                      ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-amber-400 border border-white/10'
                  }`}
                >
                  <FileText size={14} />
                  <span>Resume / CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('security'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'security'
                      ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Key size={14} />
                  <span>Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => { try { playClick?.(); } catch {} setActiveSection('cloud'); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-orbitron tracking-wider uppercase transition-all cursor-pointer ${
                    activeSection === 'cloud'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'glass-panel text-gray-400 hover:text-amber-400 border border-white/10'
                  }`}
                >
                  <Database size={14} />
                  <span className="flex items-center gap-1">
                    Cloud Sync
                    {isCloudConfigured && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </span>
                </button>
              </div>

              {/* Sub-Tabs for Certificates */}
              {activeSection === 'certs' && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => { try { playClick?.(); } catch {} setCertSubTab('add'); setActiveTab('add-cert'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider cursor-pointer ${certSubTab === 'add' ? 'bg-cyber-blue text-black font-bold' : 'glass-panel text-gray-400 hover:text-white border border-white/10'}`}
                  >
                    + Add New Cert
                  </button>
                  <button
                    type="button"
                    onClick={() => { try { playClick?.(); } catch {} setCertSubTab('edit'); setActiveTab('edit-cert'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider cursor-pointer ${certSubTab === 'edit' ? 'bg-emerald-400 text-black font-bold' : 'glass-panel text-gray-400 hover:text-emerald-400 border border-white/10'}`}
                  >
                    ✏️ Edit Cert ({effectiveCerts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { try { playClick?.(); } catch {} setCertSubTab('delete'); setActiveTab('delete-cert'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider cursor-pointer ${certSubTab === 'delete' ? 'bg-cyber-red text-white font-bold' : 'glass-panel text-gray-400 hover:text-cyber-red border border-white/10'}`}
                  >
                    🗑️ Delete Cert ({effectiveCerts.length})
                  </button>
                </div>
              )}

              {/* Sub-Tabs for Projects */}
              {activeSection === 'projects' && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => { try { playClick?.(); } catch {} setProjectSubTab('add'); setActiveTab('add-project'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider cursor-pointer ${projectSubTab === 'add' ? 'bg-cyber-purple text-white font-bold' : 'glass-panel text-gray-400 hover:text-white border border-white/10'}`}
                  >
                    + Add New Project
                  </button>
                  <button
                    type="button"
                    onClick={() => { try { playClick?.(); } catch {} setProjectSubTab('edit'); setActiveTab('edit-project'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider cursor-pointer ${projectSubTab === 'edit' ? 'bg-teal-400 text-black font-bold' : 'glass-panel text-gray-400 hover:text-teal-400 border border-white/10'}`}
                  >
                    ✏️ Edit Project ({effectiveProjects.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { try { playClick?.(); } catch {} setProjectSubTab('delete'); setActiveTab('delete-project'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider cursor-pointer ${projectSubTab === 'delete' ? 'bg-cyber-yellow text-black font-bold' : 'glass-panel text-gray-400 hover:text-cyber-yellow border border-white/10'}`}
                  >
                    🗑️ Delete Project ({effectiveProjects.length})
                  </button>
                </div>
              )}

              {/* TAB 1: ADD CERTIFICATE */}
              {activeSection === 'certs' && certSubTab === 'add' && (
                <form onSubmit={handleCertSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Certificate Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={certForm.title}
                        onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                        placeholder="e.g. AWS Certified Solutions Architect"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Issuing Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={certForm.issuer}
                        onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                        placeholder="e.g. Amazon Web Services, IBM, Google"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Program Subtitle
                      </label>
                      <input
                        type="text"
                        value={certForm.subtitle}
                        onChange={(e) => setCertForm({ ...certForm, subtitle: e.target.value })}
                        placeholder="e.g. Associate Level Verification"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Credential / Cert Number
                      </label>
                      <input
                        type="text"
                        value={certForm.certNumber}
                        onChange={(e) => setCertForm({ ...certForm, certNumber: e.target.value })}
                        placeholder="e.g. AWS-82914-BB"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Issue Date
                      </label>
                      <input
                        type="text"
                        value={certForm.date}
                        onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                        placeholder="e.g. October 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Validity
                      </label>
                      <input
                        type="text"
                        value={certForm.validity}
                        onChange={(e) => setCertForm({ ...certForm, validity: e.target.value })}
                        placeholder="e.g. Permanent or Valid upto 2029"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Category & Badge Label
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={certForm.category}
                          onChange={(e) => setCertForm({ ...certForm, category: e.target.value })}
                          placeholder="Category (e.g. Cloud)"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs"
                        />
                        <input
                          type="text"
                          value={certForm.badge}
                          onChange={(e) => setCertForm({ ...certForm, badge: e.target.value })}
                          placeholder="Badge (e.g. AWS Certified)"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Neon Glow Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        {['#00f0ff', '#a855f7', '#fcee0a', '#ff003c', '#00ff66'].map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setCertForm({ ...certForm, glowColor: color })}
                            className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                              certForm.glowColor === color ? 'scale-125 border-white shadow-[0_0_12px_#fff]' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Verification Link (URL)
                    </label>
                    <input
                      type="url"
                      value={certForm.url}
                      onChange={(e) => setCertForm({ ...certForm, url: e.target.value })}
                      placeholder="https://coursera.org/verify/... or https://credly.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Certificate Image (File Upload or URL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={certForm.image.startsWith('data:') ? '[Uploaded Image File Stored]' : certForm.image}
                        onChange={(e) => setCertForm({ ...certForm, image: e.target.value })}
                        placeholder="Image URL (e.g. /certificates/... or https://...)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs"
                      />
                      <label className="px-4 py-2.5 rounded-xl border border-cyber-blue/50 bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue font-orbitron text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap">
                        <Upload size={14} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'cert')}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Description / Key Learnings
                    </label>
                    <textarea
                      rows={3}
                      value={certForm.description}
                      onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                      placeholder="Summarize the core topics covered, projects executed, or competencies verified."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs leading-relaxed focus:border-cyber-blue focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    onMouseEnter={() => playHover?.()}
                    className="w-full py-3.5 rounded-xl bg-cyber-blue text-black font-orbitron font-bold text-sm tracking-wider uppercase hover:opacity-90 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <PlusCircle size={16} />
                    Publish Certificate to Portfolio
                  </button>
                </form>
              )}

              {/* TAB 2: ADD PROJECT */}
              {activeSection === 'projects' && projectSubTab === 'add' && (
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="e.g. Cyber Sentinel - Automated Vulnerability Scanner"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-cyber-purple focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="High-impact overview of what the project solves, architecture, and capabilities."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs leading-relaxed focus:border-cyber-purple focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Technologies & Tools (Comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectForm.tech}
                      onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                      placeholder="e.g. React, Node.js, Python, TailwindCSS, Docker"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-purple focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        GitHub Repository URL
                      </label>
                      <input
                        type="url"
                        value={projectForm.github}
                        onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                        placeholder="https://github.com/biswajit/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-purple focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Live Preview / Deployment URL
                      </label>
                      <input
                        type="url"
                        value={projectForm.live}
                        onChange={(e) => setProjectForm({ ...projectForm, live: e.target.value })}
                        placeholder="https://my-app.vercel.app/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-purple focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                      Project Cover Image (File Upload or URL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={projectForm.image.startsWith('data:') ? '[Uploaded Image Stored]' : projectForm.image}
                        onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                        placeholder="Image URL or Leave empty for cyber gradient"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs"
                      />
                      <label className="px-4 py-2.5 rounded-xl border border-cyber-purple/50 bg-cyber-purple/10 hover:bg-cyber-purple/20 text-cyber-purple font-orbitron text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap">
                        <Upload size={14} />
                        Upload Cover
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'project')}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    onMouseEnter={() => playHover?.()}
                    className="w-full py-3.5 rounded-xl bg-cyber-purple text-white font-orbitron font-bold text-sm tracking-wider uppercase hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <FolderPlus size={16} />
                    Deploy Project to Portfolio
                  </button>
                </form>
              )}

              {/* TAB: EDIT CERTIFICATES */}
              {activeSection === 'certs' && certSubTab === 'edit' && !editingCert && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Edit3 size={16} className="text-emerald-400" />
                        <span>Edit Certificates</span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {filteredCerts.length} Available
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Select any certificate below to modify its details, titles, images, or verification links.
                      </p>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={certSearchQuery}
                      onChange={(e) => setCertSearchQuery(e.target.value)}
                      placeholder="Search certificates to edit..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>

                  {/* Certificates List */}
                  {filteredCerts.length === 0 ? (
                    <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center text-gray-500 text-xs font-mono">
                      {certSearchQuery ? 'No certificates matching your search query.' : 'No certificates available to edit.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredCerts.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-3.5 rounded-xl border border-white/10 bg-black/50 hover:border-emerald-400/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-black/80 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {cert.image ? (
                                <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                              ) : (
                                <Award size={20} className="text-cyber-blue" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-orbitron text-xs font-bold truncate max-w-[280px] sm:max-w-md">
                                  {cert.title}
                                </span>
                                {cert.isCustom || cert.id?.startsWith('custom') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30">
                                    Custom Upload
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/30">
                                    Original
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-[11px] font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                                <span>{cert.issuer}</span>
                                <span>•</span>
                                <span>{cert.date || 'Permanent'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartEditCert(cert)}
                            onMouseEnter={() => playHover?.()}
                            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 hover:border-emerald-500 font-orbitron text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] flex-shrink-0 self-end sm:self-center"
                          >
                            <Edit3 size={13} />
                            <span>Edit Certificate</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Certificate Edit Form Modal View */}
              {activeSection === 'certs' && certSubTab === 'edit' && editingCert && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30 bg-emerald-500/10 p-3 rounded-xl">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Edit3 size={16} className="text-emerald-400" />
                        <span>Editing: {editingCert.title}</span>
                      </h4>
                      <p className="text-gray-400 text-xs font-mono mt-0.5">
                        Modify certificate details below and click Save Changes.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingCert(null)}
                      onMouseEnter={() => playHover?.()}
                      className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-orbitron cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleUpdateCertSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Certificate Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={editCertForm.title}
                          onChange={(e) => setEditCertForm({ ...editCertForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Issuing Organization *
                        </label>
                        <input
                          type="text"
                          required
                          value={editCertForm.issuer}
                          onChange={(e) => setEditCertForm({ ...editCertForm, issuer: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Subtitle / Program Track
                        </label>
                        <input
                          type="text"
                          value={editCertForm.subtitle}
                          onChange={(e) => setEditCertForm({ ...editCertForm, subtitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Credential ID / Cert Number
                        </label>
                        <input
                          type="text"
                          value={editCertForm.certNumber}
                          onChange={(e) => setEditCertForm({ ...editCertForm, certNumber: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Issue Date
                        </label>
                        <input
                          type="text"
                          value={editCertForm.date}
                          onChange={(e) => setEditCertForm({ ...editCertForm, date: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Validity Period
                        </label>
                        <input
                          type="text"
                          value={editCertForm.validity}
                          onChange={(e) => setEditCertForm({ ...editCertForm, validity: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={editCertForm.category}
                          onChange={(e) => setEditCertForm({ ...editCertForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Badge / Accreditation Text
                        </label>
                        <input
                          type="text"
                          value={editCertForm.badge}
                          onChange={(e) => setEditCertForm({ ...editCertForm, badge: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Cyber Glow Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editCertForm.glowColor}
                          onChange={(e) => setEditCertForm({ ...editCertForm, glowColor: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <div className="flex gap-2 flex-wrap">
                          {['#00f0ff', '#fcee0a', '#a855f7', '#ff003c', '#10b981', '#38bdf8'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditCertForm({ ...editCertForm, glowColor: color })}
                              className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Image Preview & Upload/URL */}
                    <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                        Certificate Image
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-24 h-16 rounded-lg bg-black border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {editCertForm.image ? (
                            <img src={editCertForm.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Award size={24} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditCertImageUpload}
                            className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-orbitron file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 file:cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editCertForm.image}
                            onChange={(e) => setEditCertForm({ ...editCertForm, image: e.target.value })}
                            placeholder="Or enter image URL (https://... or /certificates/...)"
                            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Online Verification Link (URL)
                      </label>
                      <input
                        type="text"
                        value={editCertForm.url}
                        onChange={(e) => setEditCertForm({ ...editCertForm, url: e.target.value })}
                        placeholder="e.g. https://coursera.org/verify/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Full Certificate Description
                      </label>
                      <textarea
                        rows={3}
                        value={editCertForm.description}
                        onChange={(e) => setEditCertForm({ ...editCertForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-emerald-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                      >
                        <Save size={15} />
                        Save & Update Certificate
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCert(null)}
                        onMouseEnter={() => playHover?.()}
                        className="px-5 py-3 rounded-xl border border-white/20 glass-panel text-gray-300 hover:text-white font-orbitron text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: EDIT PROJECTS */}
              {activeSection === 'projects' && projectSubTab === 'edit' && !editingProject && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Edit3 size={16} className="text-teal-400" />
                        <span>Edit Projects</span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          {filteredProjects.length} Available
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Select any project below to modify its description, tech stack, links, or banner.
                      </p>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      placeholder="Search projects to edit..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-colors"
                    />
                  </div>

                  {/* Projects List */}
                  {filteredProjects.length === 0 ? (
                    <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center text-gray-500 text-xs font-mono">
                      {projectSearchQuery ? 'No projects matching your search query.' : 'No projects available to edit.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredProjects.map((proj) => (
                        <div
                          key={proj.id || proj.title}
                          className="p-3.5 rounded-xl border border-white/10 bg-black/50 hover:border-teal-400/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-black/80 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {proj.image && !proj.image.startsWith('linear-gradient') ? (
                                <div
                                  className="w-full h-full bg-cover bg-center"
                                  style={{ backgroundImage: proj.image.startsWith('url(') ? proj.image : `url('${proj.image}')` }}
                                />
                              ) : (
                                <FolderPlus size={20} className="text-cyber-purple" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-orbitron text-xs font-bold truncate max-w-[280px] sm:max-w-md">
                                  {proj.title}
                                </span>
                                {proj.isCustom || proj.id?.startsWith('custom') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30">
                                    Custom Project
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-yellow/15 text-cyber-yellow border border-cyber-yellow/30">
                                    Original
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-[11px] font-mono mt-0.5 line-clamp-1">
                                {proj.description}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {(Array.isArray(proj.tech) ? proj.tech : (proj.tech ? proj.tech.split(',') : [])).map((tech, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 border border-white/10 text-gray-300">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartEditProject(proj)}
                            onMouseEnter={() => playHover?.()}
                            className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-400 hover:text-black border border-teal-500/40 hover:border-teal-500 font-orbitron text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] flex-shrink-0 self-end sm:self-center"
                          >
                            <Edit3 size={13} />
                            <span>Edit Project</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Project Edit Form Modal View */}
              {activeSection === 'projects' && projectSubTab === 'edit' && editingProject && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-teal-500/30 bg-teal-500/10 p-3 rounded-xl">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Edit3 size={16} className="text-teal-400" />
                        <span>Editing: {editingProject.title}</span>
                      </h4>
                      <p className="text-gray-400 text-xs font-mono mt-0.5">
                        Modify project details below and click Save Changes.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingProject(null)}
                      onMouseEnter={() => playHover?.()}
                      className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-orbitron cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProjectSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editProjectForm.title}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-teal-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={editProjectForm.description}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-sm focus:border-teal-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        Technologies Used (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={editProjectForm.tech}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, tech: e.target.value })}
                        placeholder="e.g. React, Next.js, TailwindCSS, MongoDB"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-teal-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          GitHub Repository URL
                        </label>
                        <input
                          type="text"
                          value={editProjectForm.github}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, github: e.target.value })}
                          placeholder="https://github.com/..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-teal-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Live Deployment URL
                        </label>
                        <input
                          type="text"
                          value={editProjectForm.live}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, live: e.target.value })}
                          placeholder="https://example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-teal-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Image Preview & Upload/URL */}
                    <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                        Project Thumbnail / Cover Image
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-24 h-16 rounded-lg bg-black border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {editProjectForm.image && !editProjectForm.image.startsWith('linear-gradient') ? (
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: editProjectForm.image.startsWith('url(') ? editProjectForm.image : `url('${editProjectForm.image}')` }}
                            />
                          ) : (
                            <FolderPlus size={24} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditProjectImageUpload}
                            className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-orbitron file:bg-teal-500/20 file:text-teal-300 hover:file:bg-teal-500/30 file:cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editProjectForm.image}
                            onChange={(e) => setEditProjectForm({ ...editProjectForm, image: e.target.value })}
                            placeholder="Or enter image URL (https://... or /project1.png)"
                            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-teal-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                      >
                        <Save size={15} />
                        Save & Update Project
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        onMouseEnter={() => playHover?.()}
                        className="px-5 py-3 rounded-xl border border-white/20 glass-panel text-gray-300 hover:text-white font-orbitron text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: DELETE CERTIFICATES */}
              {activeSection === 'certs' && certSubTab === 'delete' && (
                <div className="space-y-4">
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Trash2 size={16} className="text-cyber-red" />
                        <span>Delete Certificates</span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-cyber-red/20 text-cyber-red border border-cyber-red/30">
                          {filteredCerts.length} Active
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Select any certificate below to permanently delete it from your live portfolio.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {deletedCertIds.length > 0 && (
                        <button
                          onClick={handleRestoreCerts}
                          onMouseEnter={() => playHover?.()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-orbitron cursor-pointer transition-colors"
                          title="Restore Deleted Original Certificates"
                        >
                          <RotateCcw size={13} />
                          <span>Restore Defaults ({deletedCertIds.length})</span>
                        </button>
                      )}
                      <button
                        onClick={handleExportData}
                        onMouseEnter={() => playHover?.()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-orbitron cursor-pointer transition-colors"
                        title="Export Backup JSON"
                      >
                        <Download size={13} />
                        <span>Backup JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={certSearchQuery}
                      onChange={(e) => setCertSearchQuery(e.target.value)}
                      placeholder="Filter certificates by title, issuer, category, or credential ID..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-red focus:outline-none focus:ring-1 focus:ring-cyber-red transition-colors"
                    />
                  </div>

                  {/* Certificate Items List */}
                  {filteredCerts.length === 0 ? (
                    <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center text-gray-500 text-xs font-mono">
                      {certSearchQuery ? 'No certificates matching your search query.' : 'No certificates currently active.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredCerts.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-3.5 rounded-xl border border-white/10 bg-black/50 hover:border-cyber-red/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-lg bg-black/80 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {cert.image ? (
                                <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                              ) : (
                                <Award size={20} className="text-cyber-blue" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-orbitron text-xs font-bold truncate max-w-[280px] sm:max-w-md">
                                  {cert.title}
                                </span>
                                {cert.isCustom || cert.id?.startsWith('custom') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30">
                                    Custom Upload
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/30">
                                    Original
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-[11px] font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                                <span>{cert.issuer}</span>
                                <span>•</span>
                                <span>{cert.date || 'Permanent'}</span>
                                {cert.certNumber && (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-500">ID: {cert.certNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleStartEditCert(cert)}
                              onMouseEnter={() => playHover?.()}
                              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 hover:border-emerald-500 font-orbitron text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                              title={`Edit ${cert.title}`}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCert(cert)}
                              onMouseEnter={() => playHover?.()}
                              className="px-3.5 py-2 rounded-xl bg-cyber-red/15 hover:bg-cyber-red text-cyber-red hover:text-white border border-cyber-red/40 hover:border-cyber-red font-orbitron text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,0,60,0.4)]"
                              title={`Delete ${cert.title}`}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DELETE PROJECTS */}
              {activeSection === 'projects' && projectSubTab === 'delete' && (
                <div className="space-y-4">
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Trash2 size={16} className="text-cyber-yellow" />
                        <span>Delete Projects</span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/30">
                          {filteredProjects.length} Active
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Select any project below to permanently delete it from your live portfolio.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {deletedProjectIds.length > 0 && (
                        <button
                          onClick={handleRestoreProjects}
                          onMouseEnter={() => playHover?.()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-orbitron cursor-pointer transition-colors"
                          title="Restore Deleted Original Projects"
                        >
                          <RotateCcw size={13} />
                          <span>Restore Defaults ({deletedProjectIds.length})</span>
                        </button>
                      )}
                      <button
                        onClick={handleExportData}
                        onMouseEnter={() => playHover?.()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-orbitron cursor-pointer transition-colors"
                        title="Export Backup JSON"
                      >
                        <Download size={13} />
                        <span>Backup JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      placeholder="Filter projects by title, description, or technology stack..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-yellow focus:outline-none focus:ring-1 focus:ring-cyber-yellow transition-colors"
                    />
                  </div>

                  {/* Projects Items List */}
                  {filteredProjects.length === 0 ? (
                    <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center text-gray-500 text-xs font-mono">
                      {projectSearchQuery ? 'No projects matching your search query.' : 'No projects currently active.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredProjects.map((proj) => (
                        <div
                          key={proj.id || proj.title}
                          className="p-3.5 rounded-xl border border-white/10 bg-black/50 hover:border-cyber-yellow/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-lg bg-black/80 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {proj.image && !proj.image.startsWith('linear-gradient') ? (
                                <div
                                  className="w-full h-full bg-cover bg-center"
                                  style={{ backgroundImage: proj.image.startsWith('url(') ? proj.image : `url('${proj.image}')` }}
                                />
                              ) : (
                                <FolderPlus size={20} className="text-cyber-purple" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-orbitron text-xs font-bold truncate max-w-[280px] sm:max-w-md">
                                  {proj.title}
                                </span>
                                {proj.isCustom || proj.id?.startsWith('custom') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30">
                                    Custom Project
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyber-yellow/15 text-cyber-yellow border border-cyber-yellow/30">
                                    Original
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-[11px] font-mono mt-0.5 line-clamp-1">
                                {proj.description}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {(Array.isArray(proj.tech) ? proj.tech : (proj.tech ? proj.tech.split(',') : [])).map((tech, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 border border-white/10 text-gray-300">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleStartEditProject(proj)}
                              onMouseEnter={() => playHover?.()}
                              className="px-3 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-black border border-teal-500/40 hover:border-teal-500 font-orbitron text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                              title={`Edit ${proj.title}`}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj)}
                              onMouseEnter={() => playHover?.()}
                              className="px-3.5 py-2 rounded-xl bg-cyber-red/15 hover:bg-cyber-red text-cyber-red hover:text-white border border-cyber-red/40 hover:border-cyber-red font-orbitron text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,0,60,0.4)]"
                              title={`Delete ${proj.title}`}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: SKILLS MANAGEMENT */}
              {activeSection === 'skills' && (
                <div className="space-y-6">
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Zap size={16} className="text-emerald-400" />
                        <span>Skills & Tech.Stack Architecture</span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {skillsList.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)} Total Skills
                        </span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Add and remove technologies, programming languages, and categories from your Tech.Stack section.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreSkills}
                      onMouseEnter={() => playHover?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-orbitron cursor-pointer transition-colors"
                      title="Reset Skills to Factory Defaults"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  {/* Add Skill & Add Category Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Add Skill Form */}
                    <form onSubmit={handleAddSkill} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                      <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                        <Plus size={14} className="text-emerald-400" />
                        <span>Add New Skill Item</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Target Category</label>
                          <select
                            value={skillCategorySelect}
                            onChange={(e) => setSkillCategorySelect(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/70 border border-white/15 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                          >
                            {skillsList.map((cat) => (
                              <option key={cat.id || cat.title} value={cat.title}>
                                {cat.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Skill Name</label>
                          <input
                            type="text"
                            required
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            placeholder="e.g. Next.js, Docker, Rust"
                            className="w-full px-3 py-2 rounded-lg bg-black/70 border border-white/15 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      >
                        <Plus size={14} />
                        <span>Add Skill to {skillCategorySelect}</span>
                      </button>
                    </form>

                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategory} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                      <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                        <FolderPlus size={14} className="text-cyber-blue" />
                        <span>Create New Skill Category</span>
                      </h5>
                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Category Title</label>
                        <input
                          type="text"
                          required
                          value={newSkillCategoryName}
                          onChange={(e) => setNewSkillCategoryName(e.target.value)}
                          placeholder="e.g. Mobile_Dev.apk, Cloud_Infra.sys"
                          className="w-full px-3 py-2 rounded-lg bg-black/70 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="w-full py-2 rounded-lg bg-cyber-blue hover:bg-cyber-blue/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                      >
                        <FolderPlus size={14} />
                        <span>Create Category</span>
                      </button>
                    </form>
                  </div>

                  {/* Filter Search */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      placeholder="Search skills or categories to inspect/delete..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Categories & Skills Display with Instant Deletion */}
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {skillsList.map((cat) => (
                      <div key={cat.id || cat.title} className="p-4 rounded-xl border border-white/10 bg-black/50 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-orbitron text-xs font-bold text-cyber-blue">
                              &gt; {cat.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-gray-300">
                              {cat.skills?.length || 0} skills
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.title)}
                            onMouseEnter={() => playHover?.()}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyber-red/30 bg-cyber-red/10 hover:bg-cyber-red text-cyber-red hover:text-white text-[10px] font-orbitron transition-all cursor-pointer"
                            title={`Delete category ${cat.title}`}
                          >
                            <Trash2 size={11} />
                            <span>Delete Category</span>
                          </button>
                        </div>

                        {/* Skill Badges with Delete button */}
                        <div className="flex flex-wrap gap-2">
                          {(cat.skills || []).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-dark border border-cyber-blue/30 text-gray-200 text-xs font-mono hover:border-cyber-red/50 transition-colors"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(cat.title, skill)}
                                onMouseEnter={() => playHover?.()}
                                className="text-gray-400 hover:text-cyber-red p-0.5 rounded transition-colors"
                                title={`Delete ${skill}`}
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                          {(!cat.skills || cat.skills.length === 0) && (
                            <span className="text-gray-500 text-xs font-mono italic">No skills in this category yet.</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: HOME & AVATAR & LETTERS */}
              {activeSection === 'home' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Home size={16} className="text-cyber-yellow" />
                        <span>Home Page, Profile Pic & Animated Letters</span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Manage your avatar, typewriter letter sequence, greeting, and hero description.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreHome}
                      onMouseEnter={() => playHover?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-orbitron cursor-pointer transition-colors"
                      title="Reset Home settings to defaults"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  {/* 1. Profile Picture (Avatar) Box */}
                  <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                      <User size={14} className="text-cyber-blue" />
                      <span>Profile Picture / Avatar Management</span>
                    </h5>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Avatar Preview */}
                      <div className="relative w-24 h-24 rounded-full border-2 border-cyber-blue overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.4)] flex-shrink-0 bg-cyber-dark flex items-center justify-center">
                        <img
                          src={homeForm.profilePic || "/avatar.png"}
                          alt="Current Avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          <label className="px-4 py-2 rounded-xl bg-cyber-blue/15 hover:bg-cyber-blue text-cyber-blue hover:text-black border border-cyber-blue/40 font-orbitron text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm">
                            <Upload size={14} />
                            <span>Upload Avatar From PC</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarUpload}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleResetAvatar}
                            onMouseEnter={() => playHover?.()}
                            className="px-3.5 py-2 rounded-xl border border-white/20 glass-panel text-gray-300 hover:text-cyber-red hover:border-cyber-red/40 font-orbitron text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Reset to Default Avatar</span>
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                            Or Custom Image URL
                          </label>
                          <input
                            type="text"
                            value={homeForm.profilePic?.startsWith('data:') ? '[Uploaded Custom Avatar Stored]' : (homeForm.profilePic || '')}
                            onChange={(e) => {
                              updateProfilePic(e.target.value);
                              setHomeForm(getHomeData());
                            }}
                            placeholder="https://... or /avatar.png"
                            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Animated Letters & Roles Box */}
                  <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <div>
                      <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                        <Sparkles size={14} className="text-cyber-yellow" />
                        <span>Animated Letters / Typewriter Sequence</span>
                      </h5>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        These phrases rotate continuously in your hero headline with the typing animation.
                      </p>
                    </div>

                    {/* Add Letter Form */}
                    <form onSubmit={handleAddLetterRole} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newLetterRole}
                        onChange={(e) => setNewLetterRole(e.target.value)}
                        placeholder="Add new phrase (e.g. AI Specialist, Security Analyst)..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-yellow focus:outline-none"
                      />
                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="px-4 py-2 rounded-xl bg-cyber-yellow hover:bg-cyber-yellow/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(252,238,10,0.3)] whitespace-nowrap"
                      >
                        <Plus size={14} />
                        <span>Add Phrase</span>
                      </button>
                    </form>

                    {/* Active Letters List */}
                    <div className="space-y-2">
                      {(homeForm.roles || []).map((role, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-white/10 bg-black/50 flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-cyber-yellow/15 border border-cyber-yellow/30 text-cyber-yellow text-[10px] font-mono flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-white font-orbitron text-xs">
                              {role}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteLetterRole(idx, role)}
                            onMouseEnter={() => playHover?.()}
                            className="p-1 rounded text-gray-400 hover:text-cyber-red hover:bg-cyber-red/10 transition-colors"
                            title={`Delete phrase "${role}"`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      {(!homeForm.roles || homeForm.roles.length === 0) && (
                        <div className="text-gray-500 text-xs font-mono italic">No typewriter phrases active.</div>
                      )}
                    </div>
                  </div>

                  {/* 3. Home Headings & Bio Content Box */}
                  <form onSubmit={handleUpdateHomeSubmit} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                      <FileText size={14} className="text-white" />
                      <span>Home Headline & Mission Text</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Status Badge</label>
                        <input
                          type="text"
                          value={homeForm.systemStatus || ''}
                          onChange={(e) => setHomeForm({ ...homeForm, systemStatus: e.target.value })}
                          placeholder="System Online"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Greeting Text</label>
                        <input
                          type="text"
                          value={homeForm.greeting || ''}
                          onChange={(e) => setHomeForm({ ...homeForm, greeting: e.target.value })}
                          placeholder="Hi, I'm"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          value={homeForm.name || ''}
                          onChange={(e) => setHomeForm({ ...homeForm, name: e.target.value })}
                          placeholder="Biswajit Baral"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Hero Intro / Bio Tagline</label>
                      <textarea
                        rows={3}
                        value={homeForm.bio || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs leading-relaxed focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      onMouseEnter={() => playHover?.()}
                      className="w-full py-3 rounded-xl bg-cyber-blue hover:bg-cyber-blue/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    >
                      <Save size={15} />
                      <span>Save Home Content</span>
                    </button>
                  </form>
                </div>
              )}

              {/* SECTION: ABOUT MANAGEMENT */}
              {activeSection === 'about' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <User size={16} className="text-cyan-400" />
                        <span>About Section & Data.Profile Management</span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Update your origin story bio and add or delete interactive skill metric cards.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreAbout}
                      onMouseEnter={() => playHover?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-orbitron cursor-pointer transition-colors"
                      title="Reset About to factory defaults"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  {/* 1. Bio & Origin Story Form */}
                  <form onSubmit={handleUpdateAboutSubmit} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                      <FileText size={14} className="text-cyan-400" />
                      <span>Origin Story & Bio Text</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Section Title</label>
                        <input
                          type="text"
                          value={aboutForm.title || ''}
                          onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                          placeholder="Data.Profile"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Heading</label>
                        <input
                          type="text"
                          value={aboutForm.heading || ''}
                          onChange={(e) => setAboutForm({ ...aboutForm, heading: e.target.value })}
                          placeholder="Origin Story"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Bio Paragraph 1</label>
                      <textarea
                        rows={3}
                        value={aboutForm.paragraph1 || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, paragraph1: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs leading-relaxed focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Bio Paragraph 2</label>
                      <textarea
                        rows={3}
                        value={aboutForm.paragraph2 || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, paragraph2: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-inter text-xs leading-relaxed focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      onMouseEnter={() => playHover?.()}
                      className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <Save size={15} />
                      <span>Save About Bio</span>
                    </button>
                  </form>

                  {/* 2. Skill Metric Cards (Add & Delete) */}
                  <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <div>
                      <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                        <Cpu size={14} className="text-cyan-400" />
                        <span>Skill Metric Cards Management</span>
                      </h5>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Add and remove progress bar metric cards displayed on your Data.Profile.
                      </p>
                    </div>

                    {/* Add Metric Form */}
                    <form onSubmit={handleAddMetric} className="p-3.5 rounded-xl border border-white/10 bg-black/60 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Metric Name</label>
                          <input
                            type="text"
                            required
                            value={newMetricForm.name}
                            onChange={(e) => setNewMetricForm({ ...newMetricForm, name: e.target.value })}
                            placeholder="e.g. Architecture, DevOps"
                            className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Card Icon</label>
                          <select
                            value={newMetricForm.icon}
                            onChange={(e) => setNewMetricForm({ ...newMetricForm, icon: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                          >
                            <option value="Globe">Globe (Frontend)</option>
                            <option value="Database">Database (Backend)</option>
                            <option value="Cpu">Cpu (Architecture)</option>
                            <option value="Code">Code (Clean Code)</option>
                            <option value="Shield">Shield (Security)</option>
                            <option value="Terminal">Terminal (DevOps)</option>
                            <option value="Zap">Zap (Performance)</option>
                            <option value="Award">Award (Certifications)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                            Proficiency Level: {newMetricForm.level}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={newMetricForm.level}
                            onChange={(e) => setNewMetricForm({ ...newMetricForm, level: parseInt(e.target.value, 10) })}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="w-full py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      >
                        <Plus size={14} />
                        <span>Add Metric Card</span>
                      </button>
                    </form>

                    {/* Active Cards List with Delete buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(aboutForm.metrics || []).map((metric, idx) => (
                        <div
                          key={metric.id || idx}
                          className="p-3 rounded-xl border border-white/10 bg-black/50 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-xs font-orbitron mb-1">
                              <span className="text-white font-bold truncate">{metric.name}</span>
                              <span className="text-cyan-400 font-mono text-[11px]">{metric.level}%</span>
                            </div>
                            <div className="w-full bg-black/80 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${metric.level}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteMetric(metric)}
                            onMouseEnter={() => playHover?.()}
                            className="p-1.5 rounded-lg border border-cyber-red/30 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red hover:text-white transition-colors cursor-pointer"
                            title={`Delete metric "${metric.name}"`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CONTACTS MANAGEMENT */}
              {activeSection === 'contacts' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Mail size={16} className="text-pink-400" />
                        <span>Contact Channels & Transmission Configuration</span>
                      </h4>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Configure email delivery, WhatsApp direct link, location, and social network links.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreContact}
                      onMouseEnter={() => playHover?.()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-orbitron cursor-pointer transition-colors"
                      title="Reset Contacts to factory defaults"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  {/* 1. Contact Info Form */}
                  <form onSubmit={handleUpdateContactSubmit} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                      <Send size={14} className="text-pink-400" />
                      <span>Primary Contact & Transmission Details</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                          Delivery Email Address (Form Transmissions Go Here)
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email || ''}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="freelixir.b@gmail.com"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                          Phone / WhatsApp Display Text
                        </label>
                        <input
                          type="text"
                          value={contactForm.phone || ''}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="+91 912****550"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                          WhatsApp Chat Digits (e.g. 9124160550)
                        </label>
                        <input
                          type="text"
                          value={contactForm.whatsappNumber || ''}
                          onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                          placeholder="9124160550"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                          Physical Location / Headquarters
                        </label>
                        <input
                          type="text"
                          value={contactForm.location || ''}
                          onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                          placeholder="Balugaon, Khordha, Odisha, India"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">
                          Default Pre-chat Message (WhatsApp & Chat Box)
                        </label>
                        <input
                          type="text"
                          value={contactForm.defaultChatMessage || ''}
                          onChange={(e) => setContactForm({ ...contactForm, defaultChatMessage: e.target.value })}
                          placeholder="Hey Biswa, can we talk? 👋 Let's connect! 💬"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-500 mt-1 block">
                          Automatically pre-pasted in WhatsApp, Gmail, and the contact message box when visitors connect.
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      onMouseEnter={() => playHover?.()}
                      className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                    >
                      <Save size={15} />
                      <span>Save Contact Information</span>
                    </button>
                  </form>

                  {/* 2. Social Links Management */}
                  <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <div>
                      <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-1.5">
                        <Globe size={14} className="text-pink-400" />
                        <span>Social Links & Transmission Uplinks</span>
                      </h5>
                      <p className="text-gray-400 text-xs font-inter mt-0.5">
                        Add and remove social icons displayed in your hero and communication channels.
                      </p>
                    </div>

                    {/* Add Social Form */}
                    <form onSubmit={handleAddSocial} className="p-3.5 rounded-xl border border-white/10 bg-black/60 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Platform Name</label>
                          <input
                            type="text"
                            required
                            value={newSocialForm.platform}
                            onChange={(e) => setNewSocialForm({ ...newSocialForm, platform: e.target.value })}
                            placeholder="e.g. GitHub, LinkedIn, Discord, Telegram"
                            className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-orbitron text-gray-400 uppercase mb-1">Profile Link URL</label>
                          <input
                            type="url"
                            required
                            value={newSocialForm.url}
                            onChange={(e) => setNewSocialForm({ ...newSocialForm, url: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:border-pink-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                      >
                        <Plus size={14} />
                        <span>Add Social Link</span>
                      </button>
                    </form>

                    {/* Active Links List with Delete buttons */}
                    <div className="space-y-2">
                      {(contactForm.socials || []).map((social) => (
                        <div
                          key={social.id || social.url}
                          className="p-3 rounded-xl border border-white/10 bg-black/50 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-orbitron text-xs font-bold">{social.platform}</span>
                            </div>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-cyber-blue text-[11px] font-mono truncate block max-w-sm sm:max-w-md"
                            >
                              {social.url}
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSocial(social)}
                            onMouseEnter={() => playHover?.()}
                            className="p-1.5 rounded-lg border border-cyber-red/30 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red hover:text-white transition-colors cursor-pointer"
                            title={`Delete ${social.platform}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Received Contact Messages / Transmissions Inbox */}
                  <div className="p-4 rounded-xl border border-cyber-blue/30 bg-black/50 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                      <div>
                        <h5 className="text-white font-orbitron text-xs font-bold flex items-center gap-2">
                          <MessageSquare size={15} className="text-cyber-blue" />
                          <span>Transmission Inbox ({receivedMessages.length})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30 font-mono">
                            LIVE CLOUD + LOCAL
                          </span>
                        </h5>
                        <p className="text-gray-400 text-[11px] font-inter mt-0.5">
                          Real-time incoming messages sent through portfolio Contact form (saved in Firebase Firestore & local storage).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={loadMessages}
                        disabled={loadingMessages}
                        onMouseEnter={() => playHover?.()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyber-blue/40 bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue text-xs font-orbitron cursor-pointer transition-colors"
                      >
                        <RotateCcw size={12} className={loadingMessages ? "animate-spin" : ""} />
                        <span>{loadingMessages ? "Syncing..." : "Refresh Inbox"}</span>
                      </button>
                    </div>

                    {receivedMessages.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-400 text-xs font-mono">
                        <MessageSquare size={24} className="mx-auto mb-2 text-gray-500 opacity-60" />
                        <div>No transmissions received yet.</div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          When visitors or recruiters send messages via the contact form, they will appear here instantly!
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {receivedMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className="p-3.5 rounded-xl border border-white/10 bg-black/70 hover:border-cyber-blue/40 transition-all space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-orbitron font-bold text-xs text-white">
                                  {msg.name || "Anonymous"}
                                </span>
                                {msg.email && (
                                  <a 
                                    href={`mailto:${msg.email}`}
                                    className="text-[11px] font-mono text-cyber-blue hover:underline"
                                  >
                                    ({msg.email})
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400">
                                  {msg.receivedAt ? new Date(msg.receivedAt).toLocaleString() : "Just now"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1 rounded text-gray-500 hover:text-cyber-red transition-colors cursor-pointer"
                                  title="Delete message"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-200 text-xs font-mono whitespace-pre-wrap leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5">
                              {msg.message}
                            </p>
                            {msg.email && (
                              <div className="pt-1 flex justify-end">
                                <a
                                  href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: Portfolio Message from ' + (msg.name || 'Visitor'))}&body=${encodeURIComponent('\n\n--- Original Transmission ---\n' + msg.message)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyber-blue/15 hover:bg-cyber-blue text-cyber-blue hover:text-black font-orbitron font-bold text-[10px] uppercase transition-all"
                                >
                                  <Mail size={11} />
                                  <span>Reply via Email</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: RESUME / CV MANAGEMENT */}
              {activeSection === 'resume' && (
                <div className="space-y-6">
                  {/* Top Intro */}
                  <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-400/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/40 text-amber-400">
                        <FileText size={22} />
                      </div>
                      <div>
                        <h4 className="text-white font-orbitron font-bold text-sm tracking-wide flex items-center gap-2">
                          RESUME / CV REPOSITORY
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            HOME DOWNLOAD BUTTON
                          </span>
                        </h4>
                        <p className="text-gray-400 text-xs font-inter">
                          Upload, replace, or delete your curriculum vitae PDF. Visitors download this directly from the Home section.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetResume}
                      onMouseEnter={() => playHover?.()}
                      className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <RotateCcw size={12} />
                      <span>Restore Default CV</span>
                    </button>
                  </div>

                  {/* Current Active Resume Status */}
                  <div className="glass-panel p-5 rounded-xl border border-white/10">
                    <h5 className="text-xs font-orbitron text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      Current Active Resume Status
                    </h5>

                    {resumeData?.url ? (
                      <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                            <FileText size={24} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-mono font-bold text-sm truncate">
                                {resumeData.fileName || 'Biswajit_Baral_Resume.pdf'}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40">
                                ACTIVE ON HOME
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-0.5 flex items-center gap-3">
                              {resumeData.fileSize && <span>Size: {resumeData.fileSize}</span>}
                              {resumeData.updatedAt && (
                                <span>Updated: {new Date(resumeData.updatedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={resumeData.url}
                            download={resumeData.fileName || "Biswajit_Baral_Resume.pdf"}
                            target="_blank"
                            rel="noreferrer"
                            onMouseEnter={() => playHover?.()}
                            className="px-3.5 py-2 rounded-lg bg-cyber-blue text-black font-orbitron font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_#00f0ff] transition-all cursor-pointer"
                          >
                            <Download size={14} />
                            <span>Download / Preview</span>
                          </a>

                          <button
                            type="button"
                            onClick={handleDeleteResume}
                            onMouseEnter={() => playHover?.()}
                            className="px-3.5 py-2 rounded-lg border border-cyber-red/40 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red hover:text-white font-orbitron font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Delete Current Resume"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-cyber-red/30 bg-cyber-red/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center text-cyber-red">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <div className="text-white font-orbitron text-xs font-bold text-cyber-red">
                              NO RESUME ACTIVE
                            </div>
                            <div className="text-[11px] font-mono text-gray-400">
                              Upload a PDF below to enable the Download CV button on the Home section.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload / Replace Resume Form */}
                  <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-4">
                    <h5 className="text-xs font-orbitron text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Upload size={14} className="text-cyber-blue" />
                      Upload New Resume (PDF)
                    </h5>

                    <div>
                      <label className="block text-xs font-inter text-gray-400 mb-2">
                        Select a verified PDF file from your device (Max 10MB):
                      </label>

                      <div className="relative border-2 border-dashed border-white/20 hover:border-cyber-blue/60 rounded-xl p-6 text-center transition-colors bg-black/40">
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleResumeFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isResumeUploading}
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue flex items-center justify-center">
                            <Upload size={22} className={isResumeUploading ? "animate-bounce" : ""} />
                          </div>
                          <div className="text-xs font-orbitron text-white">
                            {isResumeUploading ? "Verifying & Uploading PDF..." : "Click or Drag & Drop new Resume PDF here"}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">
                            Strict binary signature verification &bull; High-speed delivery
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customize Button Text Form */}
                    <form onSubmit={handleSaveResumeSettings} className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                          Home Button Text
                        </label>
                        <input
                          type="text"
                          value={resumeButtonText}
                          onChange={(e) => setResumeButtonText(e.target.value)}
                          placeholder="DOWNLOAD CV"
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-cyber-blue focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        onMouseEnter={() => playHover?.()}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-cyber-blue hover:text-black text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>Save Label</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY SETTINGS */}
              {activeSection === 'security' && (
                <div className="max-w-md mx-auto py-4">
                  <div className="mb-6">
                    <h4 className="text-white font-orbitron text-sm font-bold mb-1">Update Security Clearance</h4>
                    <p className="text-gray-400 text-xs font-inter leading-relaxed">
                      Change your Administrator ID and Access Password to ensure only you have exclusive access.
                    </p>
                  </div>

                  {securitySuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-green-500/15 border border-green-500/50 text-green-300 text-xs font-mono flex items-center gap-2">
                      <CheckCircle size={15} />
                      <span>{securitySuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSecurityUpdate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        New Admin ID
                      </label>
                      <input
                        type="text"
                        required
                        value={newId}
                        onChange={(e) => setNewId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-1">
                        New Security Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Enter new strong password"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      onMouseEnter={() => playHover?.()}
                      className="w-full py-3 rounded-xl bg-white text-black font-orbitron font-bold text-xs tracking-wider uppercase hover:opacity-90 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
                    >
                      Update Credentials
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: CLOUD DATABASE & BACKUP SYNC */}
              {activeSection === 'cloud' && (
                <div className="max-w-2xl mx-auto py-4 space-y-6">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border ${
                    isCloudConfigured 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database size={18} className={isCloudConfigured ? 'text-emerald-400' : 'text-amber-400'} />
                        <span className="font-orbitron font-bold text-sm tracking-wider uppercase">
                          {isCloudConfigured ? '🔥 Firebase Cloud Database: Connected' : '⚪ Cloud Database: Offline / Local Mode'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                        isCloudConfigured ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                      }`}>
                        {isCloudConfigured ? 'REALTIME SYNC ACTIVE' : 'LOCAL ONLY'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-inter">
                      {isCloudConfigured 
                        ? 'Your website is connected to Google Firebase Cloud Firestore. Any skill, project, or certificate you add or edit will automatically sync across all phones, computers, and visitors in real-time.'
                        : 'Your website is currently storing edits in your browser memory on this computer only. Connect your free Google Firebase database below to make all edits visible on your phone and to visitors worldwide.'}
                    </p>
                  </div>

                  {cloudSyncMsg && (
                    <div className="p-3 rounded-xl bg-cyber-blue/15 border border-cyber-blue/50 text-cyber-blue text-xs font-mono flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>{cloudSyncMsg}</span>
                    </div>
                  )}

                  {/* Section A: Firebase Setup Box */}
                  <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                          <Zap size={15} className="text-amber-400" />
                          <span>Google Firebase Configuration</span>
                        </h4>
                        <p className="text-gray-400 text-xs mt-1">
                          Paste your Firebase Web App configuration below to connect instantly.
                        </p>
                      </div>
                      {isCloudConfigured && (
                        <button
                          type="button"
                          onClick={handleDisconnectFirebase}
                          className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-orbitron transition-all cursor-pointer"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>

                    <div>
                      <textarea
                        rows={6}
                        value={cloudConfigInput}
                        onChange={(e) => setCloudConfigInput(e.target.value)}
                        placeholder={`const firebaseConfig = {\n  apiKey: "your-api-key",\n  authDomain: "portfolio.firebaseapp.com",\n  projectId: "your-project-id",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-amber-400 focus:outline-none placeholder-gray-600"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleSaveFirebaseConfig}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-orbitron font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      >
                        Connect Cloud Database
                      </button>

                      {isCloudConfigured && (
                        <button
                          type="button"
                          disabled={isCloudSyncing}
                          onClick={handleUploadAllToCloud}
                          className="px-5 py-2.5 rounded-xl bg-cyber-blue/15 border border-cyber-blue/50 text-cyber-blue font-orbitron font-bold text-xs tracking-wider uppercase hover:bg-cyber-blue/25 transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Upload size={14} />
                          <span>{isCloudSyncing ? 'Uploading...' : 'Upload Local Data To Cloud'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section B: Offline Backup & Cross-Device Import/Export */}
                  <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                    <div>
                      <h4 className="text-white font-orbitron text-sm font-bold flex items-center gap-2">
                        <Database size={15} className="text-cyber-blue" />
                        <span>Instant File Backup & Cross-Device Transfer</span>
                      </h4>
                      <p className="text-gray-400 text-xs mt-1">
                        Download a complete backup JSON file of all your projects, skills, certificates, and settings to transfer between devices without needing any cloud account.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={handleExportFullBackup}
                        className="px-4 py-2.5 rounded-xl border border-cyber-blue/40 bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue font-orbitron text-xs flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Export Backup File (.json)</span>
                      </button>

                      <label className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-orbitron text-xs flex items-center gap-2 transition-all cursor-pointer">
                        <Upload size={14} />
                        <span>Import Backup File (.json)</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleImportFullBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminModal;
