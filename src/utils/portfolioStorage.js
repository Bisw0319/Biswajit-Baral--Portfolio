// Portfolio Custom Storage & Admin Access Manager
import {
  safeJsonParse,
  sanitizeText,
  sanitizeFilePath,
  timingSafeEqual,
  generateSecureSessionToken,
  getClientContextHash,
  checkRateLimit,
  recordRateLimitAttempt,
  clearRateLimit
} from './security';

import {
  isFirebaseConfigured,
  saveCloudDoc,
  deleteCloudDoc,
  subscribeToCollection,
  getFirebaseDb,
  setFirebaseConfig,
  getActiveFirebaseConfig
} from './firebase';

export {
  isFirebaseConfigured,
  setFirebaseConfig,
  getActiveFirebaseConfig
};

const CERTS_KEY = 'biswajit_custom_certificates';
const PROJECTS_KEY = 'biswajit_custom_projects';
const CREDS_KEY = 'biswajit_admin_credentials';
const AUTH_KEY = 'biswajit_admin_session';
const DELETED_CERTS_KEY = 'biswajit_deleted_cert_ids';
const DELETED_PROJECTS_KEY = 'biswajit_deleted_project_ids';
const OVERRIDES_CERTS_KEY = 'biswajit_cert_overrides';
const OVERRIDES_PROJECTS_KEY = 'biswajit_project_overrides';
const SKILLS_KEY = 'biswajit_skills_data';
const HOME_KEY = 'biswajit_home_data';
const ABOUT_KEY = 'biswajit_about_data';
const CONTACT_KEY = 'biswajit_contact_data';

// Default Admin Credentials (Accessible by Biswajit)
const DEFAULT_CREDS = {
  adminId: 'biswajit',
  password: 'biswajit2026'
};

// Default Original Certificates
export const DEFAULT_CERTIFICATES = [
  {
    id: "dcsc-pentest",
    title: "Web Application Penetration Testing (DCSC)",
    subtitle: "Drop Certified Security Course",
    issuer: "TDO Tech Education Pvt. Ltd.",
    certNumber: "DCSC-BBBB0425",
    date: "21-04-2026",
    validity: "Valid upto 21-04-2029",
    category: "Penetration Testing",
    glowColor: "#00f0ff", // cyber-blue
    image: "/certificates/cert-tdo-security.png",
    url: "#",
    verified: true,
    badge: "ISO 9001:2015",
    description: "Successfully completed all rigorous criteria and requirements for Web Application Penetration Testing through formal examination administered by TDO Tech Education."
  },
  {
    id: "tdo-internship",
    title: "Cybersecurity Internship",
    subtitle: "Practical Industry Security Program",
    issuer: "TDO Tech Education Pvt. Ltd.",
    certNumber: "DCSC-BBBB0426",
    date: "21-04-2026",
    validity: "Completed",
    category: "Security Internship",
    glowColor: "#fcee0a", // cyber-yellow
    image: "/certificates/cert-tdo-internship.png",
    url: "#",
    verified: true,
    badge: "Industry Internship",
    description: "Awarded in recognition of outstanding performance, technical diligence, and practical contributions during the Cybersecurity Internship program."
  },
  {
    id: "ibm-cybersecurity",
    title: "Cybersecurity Case Studies and Capstone Project",
    subtitle: "IBM Skills Network",
    issuer: "IBM & Coursera",
    certNumber: "B47MQ4OOFSOY",
    date: "May 5, 2025",
    validity: "Permanent",
    category: "Security Capstone",
    glowColor: "#ff003c", // cyber-red
    image: "/certificates/cert-ibm-cybersecurity.png",
    url: "https://coursera.org/verify/B47MQ4OOFSOY",
    verified: true,
    badge: "IBM Capstone",
    description: "Deep-dive analysis of real-world cybersecurity breaches, threat modeling, defense strategies, incident response, and hands-on capstone project execution."
  },
  {
    id: "ibm-genai",
    title: "Generative AI: Impact, Considerations, and Ethical Issues",
    subtitle: "IBM Skills Network",
    issuer: "IBM & Coursera",
    certNumber: "5ROD03A2UU7X",
    date: "Apr 29, 2025",
    validity: "Permanent",
    category: "AI & Ethics",
    glowColor: "#38bdf8", // bright sky blue
    image: "/certificates/cert-ibm-genai.png",
    url: "https://coursera.org/verify/5ROD03A2UU7X",
    verified: true,
    badge: "IBM Authorized",
    description: "Comprehensive study into foundational Generative AI principles, real-world societal impact, ethical governance, risk mitigation, and algorithmic accountability."
  },
  {
    id: "coursera-resume",
    title: "Build a Professional Resume using Canva",
    subtitle: "Coursera Project Network",
    issuer: "Coursera Project Network",
    certNumber: "3QO2VOOL2HD5",
    date: "Apr 16, 2025",
    validity: "Permanent",
    category: "Professional Skills",
    glowColor: "#a855f7", // cyber-purple
    image: "/certificates/cert-coursera-resume.png",
    url: "https://coursera.org/verify/3QO2VOOL2HD5",
    verified: true,
    badge: "Coursera Project",
    description: "Applied project covering modern layout design, personal branding, and high-impact technical resume presentation principles."
  }
];

// Default Original Projects
export const DEFAULT_PROJECTS = [
  {
    id: "neon-nexus",
    title: "Neon Nexus",
    description: "A cyberpunk themed e-commerce platform with 3D product previews and crypto payments integration.",
    tech: ["React", "Three.js", "Node.js", "MongoDB"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project1.png') center/cover no-repeat"
  },
  {
    id: "datastream-analytics",
    title: "DataStream Analytics",
    description: "Real-time dashboard for monitoring network traffic and server health with predictive AI alerts.",
    tech: ["Next.js", "Python", "TensorFlow", "WebSockets"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project2.png') center/cover no-repeat"
  },
  {
    id: "holo-ui-library",
    title: "Holo UI Library",
    description: "An open-source React component library focused on glassmorphism and animated interfaces.",
    tech: ["React", "Framer Motion", "TailwindCSS"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project3.png') center/cover no-repeat"
  },
  {
    id: "neural-net-visualizer",
    title: "Neural Net visualizer",
    description: "Interactive educational tool to visualize how neural networks learn and process information.",
    tech: ["Vue.js", "D3.js", "Express"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project4.png') center/cover no-repeat"
  }
];

// 1. Credentials & Auth
export const getAdminCredentials = () => {
  try {
    const stored = localStorage.getItem(CREDS_KEY);
    if (stored) {
      return safeJsonParse(stored);
    }
  } catch (e) {
    console.error("Error reading admin credentials:", e);
  }
  return DEFAULT_CREDS;
};

export const updateAdminCredentials = (adminId, password) => {
  if (!isAdminLoggedIn()) {
    console.warn("Security Alert: Unauthorized credential update blocked.");
    return false;
  }
  try {
    const cleanId = sanitizeText(adminId.trim(), 50);
    const cleanPass = password.trim();
    if (!cleanId || !cleanPass) return false;
    const creds = { adminId: cleanId, password: cleanPass };
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
    return true;
  } catch (e) {
    console.error("Error saving admin credentials:", e);
    return false;
  }
};

export const verifyAdminLogin = (idInput, passInput) => {
  // 1. Brute-Force & Credential Stuffing Defense (Max 5 attempts / 60s)
  const rateCheck = checkRateLimit('admin_auth', 5, 60000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      rateLimited: true,
      waitSeconds: rateCheck.waitSeconds,
      message: `Security Lockout: Too many login attempts. Please wait ${rateCheck.waitSeconds}s.`
    };
  }

  const creds = getAdminCredentials();
  const idMatch = timingSafeEqual(creds.adminId.toLowerCase(), idInput.trim().toLowerCase());
  // 2. Timing Attack Defense (Constant-time comparison)
  const passMatch = timingSafeEqual(creds.password, passInput.trim());

  if (idMatch && passMatch) {
    clearRateLimit('admin_auth');
    try {
      // 3. Cryptographically Secure Session Token
      const token = generateSecureSessionToken();
      // 4. Client Fingerprint Binding (Session Hijacking Defense)
      const contextHash = getClientContextHash();
      const session = {
        authenticated: true,
        token,
        contextHash,
        adminId: creds.adminId,
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return { success: true };
    } catch (e) {
      console.error("Error setting admin session:", e);
      return { success: false, message: "Could not initialize secure session." };
    }
  }

  // Record failed attempt for rate limiting
  recordRateLimitAttempt('admin_auth', 60000);
  return { 
    success: false, 
    rateLimited: false,
    message: "Access Denied: Invalid Admin ID or Security Key." 
  };
};

export const isAdminLoggedIn = () => {
  try {
    const sessionRaw = localStorage.getItem(AUTH_KEY);
    if (!sessionRaw) return false;
    const session = safeJsonParse(sessionRaw);
    if (!session || session.authenticated !== true) return false;

    // 5. Sliding Window Session Expiration (2 hours timeout)
    const MAX_INACTIVITY_MS = 2 * 60 * 60 * 1000;
    const now = Date.now();
    if (session.lastActive && now - session.lastActive > MAX_INACTIVITY_MS) {
      logoutAdmin();
      return false;
    }

    // 6. Session Hijacking & Fixation Defense (verify client fingerprint)
    if (session.contextHash && session.contextHash !== getClientContextHash()) {
      console.warn("Security Alert: Session client context mismatch. Session terminated.");
      logoutAdmin();
      return false;
    }

    // Refresh activity timestamp
    session.lastActive = now;
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return true;
  } catch (e) {
    return false;
  }
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error("Error logging out:", e);
  }
};

// 2. Custom Certificates
export const getCustomCertificates = () => {
  try {
    const data = localStorage.getItem(CERTS_KEY);
    const parsed = data ? safeJsonParse(data) : [];
    if (!Array.isArray(parsed)) return [];
    // Ensure newest first (in front) by sorting by createdAt / date descending
    return parsed.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || b.date || 0).getTime() || 0;
      return timeB - timeA;
    });
  } catch (e) {
    console.error("Error reading custom certificates:", e);
    return [];
  }
};

export const addCustomCertificate = (cert) => {
  try {
    const existing = getCustomCertificates();
    const newCert = {
      ...cert,
      id: cert.id || `custom-cert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isCustom: true
    };
    // Always prepend new certificate to index 0 (in front / first)
    const updated = [newCert, ...existing.filter(c => c.id !== newCert.id)];
    localStorage.setItem(CERTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('certificates', newCert.id, newCert); } catch (e) {}
    return newCert;
  } catch (e) {
    console.error("Error adding custom certificate:", e);
    throw e;
  }
};

export const deleteCustomCertificate = (id) => {
  try {
    const existing = getCustomCertificates();
    const updated = existing.filter(c => c.id !== id);
    localStorage.setItem(CERTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { deleteCloudDoc('certificates', id); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error deleting custom certificate:", e);
    return false;
  }
};

// 3. Custom Projects
export const getCustomProjects = () => {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    const parsed = data ? safeJsonParse(data) : [];
    if (!Array.isArray(parsed)) return [];
    // Ensure newest first (in front) by sorting by createdAt descending
    return parsed.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      return timeB - timeA;
    });
  } catch (e) {
    console.error("Error reading custom projects:", e);
    return [];
  }
};

export const addCustomProject = (project) => {
  try {
    const existing = getCustomProjects();
    const newProject = {
      ...project,
      id: project.id || `custom-proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isCustom: true
    };
    // Always prepend new project to index 0 (in front / first)
    const updated = [newProject, ...existing.filter(p => p.id !== newProject.id && p.title !== newProject.title)];
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('projects', newProject.id, newProject); } catch (e) {}
    return newProject;
  } catch (e) {
    console.error("Error adding custom project:", e);
    throw e;
  }
};

export const deleteCustomProject = (idOrTitle) => {
  try {
    const existing = getCustomProjects();
    const updated = existing.filter(p => p.id !== idOrTitle && p.title !== idOrTitle);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { deleteCloudDoc('projects', idOrTitle); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error deleting custom project:", e);
    return false;
  }
};

// 4. Deleted Items Tracking (Allow deleting both custom and default items)
export const getDeletedCertificateIds = () => {
  try {
    const data = localStorage.getItem(DELETED_CERTS_KEY);
    return data ? safeJsonParse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getDeletedProjectIds = () => {
  try {
    const data = localStorage.getItem(DELETED_PROJECTS_KEY);
    return data ? safeJsonParse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getCertOverrides = () => {
  try {
    const data = localStorage.getItem(OVERRIDES_CERTS_KEY);
    return data ? safeJsonParse(data) : {};
  } catch (e) {
    return {};
  }
};

export const getProjectOverrides = () => {
  try {
    const data = localStorage.getItem(OVERRIDES_PROJECTS_KEY);
    return data ? safeJsonParse(data) : {};
  } catch (e) {
    return {};
  }
};

// Unified Getters for Live Portfolio Display
export const getEffectiveCertificates = () => {
  const custom = getCustomCertificates();
  const deleted = getDeletedCertificateIds();
  const overrides = getCertOverrides();
  const filteredDefaults = DEFAULT_CERTIFICATES
    .filter(c => !deleted.includes(c.id))
    .map(c => overrides[c.id] ? { ...c, ...overrides[c.id] } : c);
  return [...custom, ...filteredDefaults];
};

export const getEffectiveProjects = () => {
  const custom = getCustomProjects();
  const deleted = getDeletedProjectIds();
  const overrides = getProjectOverrides();
  const filteredDefaults = DEFAULT_PROJECTS
    .filter(p => !deleted.includes(p.id) && !deleted.includes(p.title))
    .map(p => {
      const key = p.id || p.title;
      return overrides[key] ? { ...p, ...overrides[key] } : p;
    });
  return [...custom, ...filteredDefaults];
};

// Universal Update Handlers
export const updateCertificate = (id, updatedFields) => {
  try {
    const custom = getCustomCertificates();
    const customIndex = custom.findIndex(c => c.id === id);
    if (customIndex !== -1) {
      custom[customIndex] = {
        ...custom[customIndex],
        ...updatedFields,
        id,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(CERTS_KEY, JSON.stringify(custom));
    } else {
      // It's a default certificate override
      const overrides = getCertOverrides();
      overrides[id] = {
        ...(overrides[id] || {}),
        ...updatedFields,
        id,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(OVERRIDES_CERTS_KEY, JSON.stringify(overrides));
    }
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try {
      const fullCert = getEffectiveCertificates().find(c => c.id === id);
      if (fullCert) saveCloudDoc('certificates', id, fullCert);
    } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error updating certificate:", e);
    return false;
  }
};

export const updateProject = (idOrTitle, updatedFields) => {
  try {
    const custom = getCustomProjects();
    const customIndex = custom.findIndex(p => p.id === idOrTitle || p.title === idOrTitle);
    if (customIndex !== -1) {
      custom[customIndex] = {
        ...custom[customIndex],
        ...updatedFields,
        id: custom[customIndex].id || idOrTitle,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(custom));
    } else {
      // It's a default project override
      const overrides = getProjectOverrides();
      overrides[idOrTitle] = {
        ...(overrides[idOrTitle] || {}),
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(OVERRIDES_PROJECTS_KEY, JSON.stringify(overrides));
    }
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try {
      const fullProj = getEffectiveProjects().find(p => p.id === idOrTitle || p.title === idOrTitle);
      if (fullProj) saveCloudDoc('projects', fullProj.id || idOrTitle, fullProj);
    } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error updating project:", e);
    return false;
  }
};

// Universal Delete Handlers
export const deleteCertificate = (id) => {
  try {
    const custom = getCustomCertificates();
    const isCustom = custom.some(c => c.id === id);
    if (isCustom) {
      deleteCustomCertificate(id);
    } else {
      const deleted = getDeletedCertificateIds();
      if (!deleted.includes(id)) {
        const updated = [...deleted, id];
        localStorage.setItem(DELETED_CERTS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    }
    return true;
  } catch (e) {
    console.error("Error deleting certificate:", e);
    return false;
  }
};

export const deleteProject = (idOrTitle) => {
  try {
    const custom = getCustomProjects();
    const isCustom = custom.some(p => p.id === idOrTitle || p.title === idOrTitle);
    if (isCustom) {
      deleteCustomProject(idOrTitle);
    } else {
      const deleted = getDeletedProjectIds();
      if (!deleted.includes(idOrTitle)) {
        const updated = [...deleted, idOrTitle];
        localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    }
    return true;
  } catch (e) {
    console.error("Error deleting project:", e);
    return false;
  }
};

export const restoreDeletedCertificates = () => {
  try {
    localStorage.removeItem(DELETED_CERTS_KEY);
    localStorage.removeItem(OVERRIDES_CERTS_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

export const restoreDeletedProjects = () => {
  try {
    localStorage.removeItem(DELETED_PROJECTS_KEY);
    localStorage.removeItem(OVERRIDES_PROJECTS_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ==========================================
// 1. SKILLS MANAGEMENT
// ==========================================
export const DEFAULT_SKILL_CATEGORIES = [
  {
    id: "frontend",
    title: "Frontend.sys",
    skills: ["React", "Next.js", "Vue.js", "TailwindCSS", "Framer Motion", "Three.js", "TypeScript"]
  },
  {
    id: "backend",
    title: "Backend.sys",
    skills: ["Node.js", "Express", "Python", "Django", "GraphQL", "REST APIs"]
  },
  {
    id: "database",
    title: "Database.sys",
    skills: ["MongoDB", "PostgreSQL", "Redis", "Firebase", "Supabase"]
  },
  {
    id: "devops",
    title: "DevOps_Tools.exe",
    skills: ["Git", "Docker", "AWS", "Vercel", "Linux", "CI/CD"]
  }
];

export const getSkillsData = () => {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    if (!raw) return safeJsonParse(JSON.stringify(DEFAULT_SKILL_CATEGORIES));
    return safeJsonParse(raw);
  } catch (e) {
    console.error("Error reading skills data:", e);
    return safeJsonParse(JSON.stringify(DEFAULT_SKILL_CATEGORIES));
  }
};

export const saveSkillsData = (categories) => {
  try {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('skills', 'main', { categories }); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error saving skills data:", e);
    return false;
  }
};

export const addSkill = (categoryTitle, skillName) => {
  try {
    const trimmedSkill = skillName.trim();
    const trimmedCat = categoryTitle.trim();
    if (!trimmedSkill || !trimmedCat) return false;

    const categories = getSkillsData();
    const existingIndex = categories.findIndex(
      c => c.title.toLowerCase() === trimmedCat.toLowerCase() || c.id === trimmedCat.toLowerCase()
    );

    if (existingIndex >= 0) {
      const targetCategory = categories[existingIndex];
      // Prepend skill to front of category skills list (index 0), filtering out any duplicate
      targetCategory.skills = [
        trimmedSkill,
        ...targetCategory.skills.filter(s => s.toLowerCase() !== trimmedSkill.toLowerCase())
      ];
      // Move this updated category to index 0 of categories so it renders first on the page
      categories.splice(existingIndex, 1);
      categories.unshift(targetCategory);
    } else {
      // Prepend brand new category to front (index 0) with the new skill at index 0
      categories.unshift({
        id: trimmedCat.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: trimmedCat,
        skills: [trimmedSkill]
      });
    }

    saveSkillsData(categories);
    return true;
  } catch (e) {
    console.error("Error adding skill:", e);
    return false;
  }
};

export const deleteSkill = (categoryTitle, skillName) => {
  try {
    const categories = getSkillsData();
    const cat = categories.find(
      c => c.title.toLowerCase() === categoryTitle.toLowerCase() || c.id === categoryTitle.toLowerCase()
    );
    if (cat) {
      cat.skills = cat.skills.filter(s => s.toLowerCase() !== skillName.toLowerCase());
      saveSkillsData(categories);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error deleting skill:", e);
    return false;
  }
};

export const addSkillCategory = (title) => {
  try {
    const trimmed = title.trim();
    if (!trimmed) return false;
    const categories = getSkillsData();
    const existingIndex = categories.findIndex(c => c.title.toLowerCase() === trimmed.toLowerCase());
    if (existingIndex >= 0) {
      // Move existing category to front (index 0)
      const [cat] = categories.splice(existingIndex, 1);
      categories.unshift(cat);
      saveSkillsData(categories);
      return true;
    }
    // Prepend brand new category to index 0 (in front / first)
    categories.unshift({
      id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: trimmed,
      skills: []
    });
    saveSkillsData(categories);
    return true;
  } catch (e) {
    return false;
  }
};

export const deleteSkillCategory = (categoryTitle) => {
  try {
    const categories = getSkillsData();
    const filtered = categories.filter(
      c => c.title.toLowerCase() !== categoryTitle.toLowerCase() && c.id !== categoryTitle.toLowerCase()
    );
    saveSkillsData(filtered);
    return true;
  } catch (e) {
    return false;
  }
};

export const resetSkillsData = () => {
  try {
    localStorage.removeItem(SKILLS_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ==========================================
// 2. HOME, LETTERS & PROFILE PIC MANAGEMENT
// ==========================================
export const DEFAULT_HOME_DATA = {
  systemStatus: "System Online",
  greeting: "Hi, I'm",
  name: "Biswajit Baral",
  roles: [
    "Full Stack Developer",
    "React Developer",
    "Cyber Security Enthusiast"
  ],
  bio: "Building futuristic digital experiences with clean code and cutting-edge technologies. Welcome to my digital frontier.",
  ctaText: "Initiate Link",
  ctaLink: "/projects",
  profilePic: "/avatar.png"
};

export const getHomeData = () => {
  try {
    const raw = localStorage.getItem(HOME_KEY);
    if (!raw) return safeJsonParse(JSON.stringify(DEFAULT_HOME_DATA));
    return { ...DEFAULT_HOME_DATA, ...safeJsonParse(raw) };
  } catch (e) {
    console.error("Error reading home data:", e);
    return safeJsonParse(JSON.stringify(DEFAULT_HOME_DATA));
  }
};

export const updateHomeData = (fields) => {
  try {
    const current = getHomeData();
    const updated = { ...current, ...fields };
    localStorage.setItem(HOME_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('home', 'main', updated); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error updating home data:", e);
    return false;
  }
};

export const addHomeRole = (roleText) => {
  try {
    const trimmed = roleText.trim();
    if (!trimmed) return false;
    const current = getHomeData();
    current.roles = [
      trimmed,
      ...current.roles.filter(r => r.toLowerCase() !== trimmed.toLowerCase())
    ];
    return updateHomeData({ roles: current.roles });
  } catch (e) {
    return false;
  }
};

export const deleteHomeRole = (roleIndexOrText) => {
  try {
    const current = getHomeData();
    if (typeof roleIndexOrText === 'number') {
      current.roles = current.roles.filter((_, idx) => idx !== roleIndexOrText);
    } else {
      current.roles = current.roles.filter(r => r.toLowerCase() !== roleIndexOrText.toLowerCase());
    }
    return updateHomeData({ roles: current.roles });
  } catch (e) {
    return false;
  }
};

export const updateProfilePic = (imageSrc) => {
  return updateHomeData({ profilePic: imageSrc });
};

export const resetProfilePic = () => {
  return updateHomeData({ profilePic: DEFAULT_HOME_DATA.profilePic });
};

export const resetHomeData = () => {
  try {
    localStorage.removeItem(HOME_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ==========================================
// 3. ABOUT SECTION MANAGEMENT
// ==========================================
export const DEFAULT_ABOUT_DATA = {
  title: "Data.Profile",
  heading: "Origin Story",
  paragraph1: "I am a digital architect operating at the intersection of design and engineering. My prime directive is building immersive, high-performance web applications that push the boundaries of what's possible in the browser.",
  paragraph2: "With a deep understanding of modern JavaScript ecosystems and a passion for cyberpunk aesthetics, I craft interfaces that don't just look futuristic—they feel futuristic. I specialize in React, Node.js, and creating fluid animations.",
  metrics: [
    { id: "frontend", name: "Frontend", icon: "Globe", level: 90 },
    { id: "backend", name: "Backend", icon: "Database", level: 85 },
    { id: "architecture", name: "Architecture", icon: "Cpu", level: 80 },
    { id: "cleancode", name: "Clean Code", icon: "Code", level: 95 }
  ]
};

export const getAboutData = () => {
  try {
    const raw = localStorage.getItem(ABOUT_KEY);
    if (!raw) return safeJsonParse(JSON.stringify(DEFAULT_ABOUT_DATA));
    return { ...DEFAULT_ABOUT_DATA, ...safeJsonParse(raw) };
  } catch (e) {
    console.error("Error reading about data:", e);
    return safeJsonParse(JSON.stringify(DEFAULT_ABOUT_DATA));
  }
};

export const updateAboutData = (fields) => {
  try {
    const current = getAboutData();
    const updated = { ...current, ...fields };
    localStorage.setItem(ABOUT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('about', 'main', updated); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error updating about data:", e);
    return false;
  }
};

export const addAboutMetric = (metric) => {
  try {
    const current = getAboutData();
    const newMetric = {
      id: 'metric-' + Date.now(),
      name: metric.name?.trim() || 'Skill',
      icon: metric.icon || 'Code',
      level: Math.min(100, Math.max(1, parseInt(metric.level, 10) || 85))
    };
    current.metrics = [
      newMetric,
      ...(current.metrics || []).filter(m => m.name.toLowerCase() !== newMetric.name.toLowerCase())
    ];
    return updateAboutData({ metrics: current.metrics });
  } catch (e) {
    return false;
  }
};

export const deleteAboutMetric = (metricIdOrName) => {
  try {
    const current = getAboutData();
    current.metrics = current.metrics.filter(
      m => m.id !== metricIdOrName && m.name.toLowerCase() !== metricIdOrName.toLowerCase()
    );
    return updateAboutData({ metrics: current.metrics });
  } catch (e) {
    return false;
  }
};

export const resetAboutData = () => {
  try {
    localStorage.removeItem(ABOUT_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ==========================================
// 4. CONTACTS & SOCIAL LINKS MANAGEMENT
// ==========================================
export const DEFAULT_CONTACT_DATA = {
  email: "freelixir.b@gmail.com",
  phone: "+91 912****550",
  whatsappNumber: "9124160550",
  location: "Balugaon, Khordha, Odisha, India",
  ctaTitle: "Direct Neural Link",
  ctaSubtitle: "Chat directly via WhatsApp",
  socials: [
    { id: "github", platform: "GitHub", url: "https://github.com/Bisw0319", icon: "FaGithub" },
    { id: "linkedin", platform: "LinkedIn", url: "https://www.linkedin.com/in/biswajit-baral-abb842325/?skipRedirect=true", icon: "FaLinkedin" },
    { id: "instagram", platform: "Instagram", url: "https://instagram.com", icon: "FaInstagram" },
    { id: "twitter", platform: "X / Twitter", url: "https://x.com", icon: "FaXTwitter" }
  ]
};

export const getContactData = () => {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    if (!raw) return safeJsonParse(JSON.stringify(DEFAULT_CONTACT_DATA));
    return { ...DEFAULT_CONTACT_DATA, ...safeJsonParse(raw) };
  } catch (e) {
    console.error("Error reading contact data:", e);
    return safeJsonParse(JSON.stringify(DEFAULT_CONTACT_DATA));
  }
};

export const updateContactData = (fields) => {
  try {
    const current = getContactData();
    const updated = { ...current, ...fields };
    localStorage.setItem(CONTACT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('contact', 'main', updated); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error updating contact data:", e);
    return false;
  }
};

export const addSocialLink = (social) => {
  try {
    const current = getContactData();
    const newSocial = {
      id: 'social-' + Date.now(),
      platform: social.platform?.trim() || 'Link',
      url: social.url?.trim() || '#',
      icon: social.icon || 'Link'
    };
    current.socials = [
      newSocial,
      ...(current.socials || []).filter(s => s.platform.toLowerCase() !== newSocial.platform.toLowerCase())
    ];
    return updateContactData({ socials: current.socials });
  } catch (e) {
    return false;
  }
};

export const deleteSocialLink = (socialIdOrUrl) => {
  try {
    const current = getContactData();
    current.socials = current.socials.filter(
      s => s.id !== socialIdOrUrl && s.url !== socialIdOrUrl && s.platform.toLowerCase() !== socialIdOrUrl.toLowerCase()
    );
    return updateContactData({ socials: current.socials });
  } catch (e) {
    return false;
  }
};

export const resetContactData = () => {
  try {
    localStorage.removeItem(CONTACT_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ==========================================
// 5. RESUME / CV MANAGEMENT
// ==========================================
export const RESUME_KEY = 'biswajit_resume_data';

export const DEFAULT_RESUME_DATA = {
  url: "/Biswajit_Baral_Resume.pdf",
  fileName: "Biswajit_Baral_Resume.pdf",
  fileSize: "1.2 MB",
  updatedAt: "2026-09-27T00:00:00.000Z",
  buttonText: "Download CV"
};

export const getResumeData = () => {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return safeJsonParse(JSON.stringify(DEFAULT_RESUME_DATA));
    return { ...DEFAULT_RESUME_DATA, ...safeJsonParse(raw) };
  } catch (e) {
    console.error("Error reading resume data:", e);
    return safeJsonParse(JSON.stringify(DEFAULT_RESUME_DATA));
  }
};

export const updateResumeData = (fields) => {
  try {
    const current = getResumeData();
    const updated = {
      ...current,
      ...fields,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(RESUME_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('resume', 'main', updated); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error updating resume data:", e);
    return false;
  }
};

export const deleteResume = () => {
  try {
    const cleared = {
      url: "",
      fileName: "",
      fileSize: "",
      updatedAt: new Date().toISOString(),
      buttonText: "Download CV"
    };
    localStorage.setItem(RESUME_KEY, JSON.stringify(cleared));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    try { saveCloudDoc('resume', 'main', cleared); } catch (e) {}
    return true;
  } catch (e) {
    console.error("Error deleting resume:", e);
    return false;
  }
};

export const resetResumeData = () => {
  try {
    localStorage.removeItem(RESUME_KEY);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

// ==========================================
// 6. CLOUD FIREBASE REALTIME SYNC & BACKUP ENGINE
// ==========================================
let activeCloudSubscriptions = [];

export const initCloudSync = () => {
  if (!isFirebaseConfigured()) {
    console.info("ℹ️ Cloud Database: Running in offline/local storage mode.");
    return;
  }

  // Clear any existing active listeners to avoid duplicates
  activeCloudSubscriptions.forEach(unsub => {
    try { unsub(); } catch (e) {}
  });
  activeCloudSubscriptions = [];

  console.info("🔥 Activating Firebase Cloud Synchronization...");

  try {
    // 1. Certificates Real-Time Sync
    const unsubCerts = subscribeToCollection('certificates', (cloudCerts) => {
      if (Array.isArray(cloudCerts) && cloudCerts.length > 0) {
        localStorage.setItem(CERTS_KEY, JSON.stringify(cloudCerts));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubCerts);

    // 2. Projects Real-Time Sync
    const unsubProjects = subscribeToCollection('projects', (cloudProjects) => {
      if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(cloudProjects));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubProjects);

    // 3. Skills Real-Time Sync
    const unsubSkills = subscribeToCollection('skills', (docs) => {
      const skillsDoc = docs.find(d => d.id === 'main');
      if (skillsDoc && skillsDoc.categories) {
        localStorage.setItem(SKILLS_KEY, JSON.stringify(skillsDoc.categories));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubSkills);

    // 4. Home Real-Time Sync
    const unsubHome = subscribeToCollection('home', (docs) => {
      const homeDoc = docs.find(d => d.id === 'main');
      if (homeDoc) {
        const { id, updatedAt, ...rest } = homeDoc;
        localStorage.setItem(HOME_KEY, JSON.stringify(rest));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubHome);

    // 5. About Real-Time Sync
    const unsubAbout = subscribeToCollection('about', (docs) => {
      const aboutDoc = docs.find(d => d.id === 'main');
      if (aboutDoc) {
        const { id, updatedAt, ...rest } = aboutDoc;
        localStorage.setItem(ABOUT_KEY, JSON.stringify(rest));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubAbout);

    // 6. Contact Real-Time Sync
    const unsubContact = subscribeToCollection('contact', (docs) => {
      const contactDoc = docs.find(d => d.id === 'main');
      if (contactDoc) {
        const { id, updatedAt, ...rest } = contactDoc;
        localStorage.setItem(CONTACT_KEY, JSON.stringify(rest));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubContact);

    // 7. Resume Real-Time Sync
    const unsubResume = subscribeToCollection('resume', (docs) => {
      const resumeDoc = docs.find(d => d.id === 'main');
      if (resumeDoc) {
        const { id, updatedAt, ...rest } = resumeDoc;
        localStorage.setItem(RESUME_KEY, JSON.stringify(rest));
        window.dispatchEvent(new Event('portfolio_data_updated'));
      }
    });
    activeCloudSubscriptions.push(unsubResume);

    window.dispatchEvent(new Event('portfolio_firebase_status_changed'));
  } catch (err) {
    console.warn("Could not establish Firebase real-time listeners:", err);
  }
};

// Push all current local data up to Firebase Cloud
export const uploadAllLocalDataToCloud = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Please enter your Firebase Configuration first.");
  }

  const customCerts = getCustomCertificates();
  for (const cert of customCerts) {
    await saveCloudDoc('certificates', cert.id, cert);
  }

  const customProjects = getCustomProjects();
  for (const proj of customProjects) {
    await saveCloudDoc('projects', proj.id, proj);
  }

  const skills = getSkillsData();
  await saveCloudDoc('skills', 'main', { categories: skills });

  const home = getHomeData();
  await saveCloudDoc('home', 'main', home);

  const about = getAboutData();
  await saveCloudDoc('about', 'main', about);

  const contact = getContactData();
  await saveCloudDoc('contact', 'main', contact);

  const resume = getResumeData();
  await saveCloudDoc('resume', 'main', resume);

  return true;
};

// Export complete portfolio state as JSON
export const exportFullPortfolioData = () => {
  return {
    version: "2.0",
    exportedAt: new Date().toISOString(),
    certificates: getEffectiveCertificates(),
    customCertificates: getCustomCertificates(),
    projects: getEffectiveProjects(),
    customProjects: getCustomProjects(),
    skills: getSkillsData(),
    home: getHomeData(),
    about: getAboutData(),
    contact: getContactData(),
    resume: getResumeData(),
    deletedCertIds: getDeletedCertificateIds(),
    deletedProjectIds: getDeletedProjectIds(),
    certOverrides: getCertOverrides(),
    projectOverrides: getProjectOverrides()
  };
};

// Import complete portfolio state from JSON
export const importFullPortfolioData = (data) => {
  if (!data || typeof data !== 'object') throw new Error("Invalid backup format.");

  if (Array.isArray(data.customCertificates)) {
    localStorage.setItem(CERTS_KEY, JSON.stringify(data.customCertificates));
  }
  if (Array.isArray(data.customProjects)) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.customProjects));
  }
  if (Array.isArray(data.skills)) {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(data.skills));
  }
  if (data.home && typeof data.home === 'object') {
    localStorage.setItem(HOME_KEY, JSON.stringify(data.home));
  }
  if (data.about && typeof data.about === 'object') {
    localStorage.setItem(ABOUT_KEY, JSON.stringify(data.about));
  }
  if (data.contact && typeof data.contact === 'object') {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(data.contact));
  }
  if (data.resume && typeof data.resume === 'object') {
    localStorage.setItem(RESUME_KEY, JSON.stringify(data.resume));
  }
  if (Array.isArray(data.deletedCertIds)) {
    localStorage.setItem(DELETED_CERTS_KEY, JSON.stringify(data.deletedCertIds));
  }
  if (Array.isArray(data.deletedProjectIds)) {
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(data.deletedProjectIds));
  }
  if (data.certOverrides) {
    localStorage.setItem(OVERRIDES_CERTS_KEY, JSON.stringify(data.certOverrides));
  }
  if (data.projectOverrides) {
    localStorage.setItem(OVERRIDES_PROJECTS_KEY, JSON.stringify(data.projectOverrides));
  }

  window.dispatchEvent(new Event('portfolio_data_updated'));

  // If cloud is configured, sync up to cloud as well
  if (isFirebaseConfigured()) {
    uploadAllLocalDataToCloud().catch(e => console.warn("Cloud sync post-import failed:", e));
  }

  return true;
};
