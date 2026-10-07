/**
 * ==============================================================================
 * AI HACKATHON TEAM MATCHER — Main Application Logic
 * ==============================================================================
 * 
 * An interactive, client-side web application for hackathon organizers.
 * Uses a heuristic constraint-satisfaction algorithm in pure JavaScript to
 * balance teams across technical roles, experience levels, and domain interests.
 * 
 * Architecture:
 * 1. State & Storage (LocalStorage sync)
 * 2. Participant Management (Add, Edit, Delete, Clear, Filter, Demo Data)
 * 3. Simulated AI Team Matcher Algorithm (Heuristic scoring & distribution)
 * 4. Team Results & Exports (Cards, Copy, Download TXT)
 * 5. Personalized Email Generator (mailto: link builder)
 * 6. UI Helpers (Toasts, Modals, Sliders)
 */

// ==============================================================================
// 1. STATE & CONSTANTS
// ==============================================================================

const STORAGE_KEYS = {
  PARTICIPANTS: 'hackmatch_participants_v1',
  TEAMS: 'hackmatch_teams_v1',
  SETTINGS: 'hackmatch_settings_v1',
  VIEW_MODE: 'hackmatch_view_mode_v1'
};

const TEAM_NAMES = [
  'TEAM ALPHA', 'TEAM NEBULA', 'TEAM CYBER', 'TEAM QUANTUM', 
  'TEAM SYNAPSE', 'TEAM TITAN', 'TEAM APEX', 'TEAM VORTEX',
  'TEAM PHOENIX', 'TEAM HORIZON', 'TEAM NEXUS', 'TEAM SPECTRUM'
];

const DEMO_PARTICIPANTS = [
  {
    id: 'demo-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 43210',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'HTML'],
    role: 'Frontend',
    experience: 'Intermediate',
    interests: ['FinTech', 'AI / GenAI']
  },
  {
    id: 'demo-2',
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    phone: '+91 98123 45678',
    skills: ['Python', 'PyTorch', 'HuggingFace', 'FastAPI'],
    role: 'AI/ML',
    experience: 'Advanced',
    interests: ['HealthTech', 'AI / GenAI']
  },
  {
    id: 'demo-3',
    name: 'Amit Verma',
    email: 'amit.verma@gmail.com',
    phone: '+91 98234 56789',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
    role: 'Backend',
    experience: 'Intermediate',
    interests: ['FinTech', 'Web3']
  },
  {
    id: 'demo-4',
    name: 'Sneha Rao',
    email: 'sneha.rao@gmail.com',
    phone: '+91 98345 67890',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Wireframing'],
    role: 'UI/UX',
    experience: 'Beginner',
    interests: ['EdTech', 'HealthTech']
  },
  {
    id: 'demo-5',
    name: 'Vikram Malhotra',
    email: 'vikram.m@gmail.com',
    phone: '+91 98456 78901',
    skills: ['Python', 'OpenAI API', 'Scikit-Learn', 'Pandas'],
    role: 'AI/ML',
    experience: 'Intermediate',
    interests: ['ClimateTech', 'AI / GenAI']
  },
  {
    id: 'demo-6',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@gmail.com',
    phone: '+91 98567 89012',
    skills: ['React', 'Next.js', 'Redux', 'CSS'],
    role: 'Frontend',
    experience: 'Advanced',
    interests: ['EdTech', 'Open Innovation']
  },
  {
    id: 'demo-7',
    name: 'Karthik Nair',
    email: 'karthik.nair@gmail.com',
    phone: '+91 98678 90123',
    skills: ['Go', 'Docker', 'PostgreSQL', 'Redis'],
    role: 'Backend',
    experience: 'Advanced',
    interests: ['FinTech', 'ClimateTech']
  },
  {
    id: 'demo-8',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@gmail.com',
    phone: '+91 98789 01234',
    skills: ['Flutter', 'Dart', 'Firebase', 'Mobile UI'],
    role: 'Mobile',
    experience: 'Beginner',
    interests: ['HealthTech', 'Open Innovation']
  },
  {
    id: 'demo-9',
    name: 'Neha Chawla',
    email: 'neha.chawla@gmail.com',
    phone: '+91 98890 12345',
    skills: ['Figma', 'User Research', 'Prototyping', 'CSS'],
    role: 'UI/UX',
    experience: 'Intermediate',
    interests: ['FinTech', 'EdTech']
  },
  {
    id: 'demo-10',
    name: 'Arjun Das',
    email: 'arjun.das@gmail.com',
    phone: '+91 98901 23456',
    skills: ['React', 'Node.js', 'Express', 'Tailwind'],
    role: 'Full Stack',
    experience: 'Intermediate',
    interests: ['AI / GenAI', 'ClimateTech']
  },
  {
    id: 'demo-11',
    name: 'Divya Joshi',
    email: 'divya.joshi@gmail.com',
    phone: '+91 98012 34567',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
    role: 'DevOps/Cloud',
    experience: 'Beginner',
    interests: ['Open Innovation', 'Web3']
  },
  {
    id: 'demo-12',
    name: 'Tanvi Kapoor',
    email: 'tanvi.kapoor@gmail.com',
    phone: '+91 98123 98765',
    skills: ['Python', 'LangChain', 'TensorFlow', 'SQL'],
    role: 'AI/ML',
    experience: 'Intermediate',
    interests: ['EdTech', 'AI / GenAI']
  }
];

// Application state
const state = {
  participants: [],
  teams: [],
  settings: {
    strategyMode: 'teamCount', // 'teamCount' or 'maxMembers'
    value: 3
  },
  viewMode: 'cards', // 'cards' or 'table'
  searchQuery: '',
  roleFilter: 'ALL',
  editingParticipantId: null
};

// ==============================================================================
// 2. INITIALIZATION & LOCALSTORAGE
// ==============================================================================

function loadState() {
  try {
    const storedParticipants = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (storedParticipants) {
      state.participants = JSON.parse(storedParticipants);
    } else {
      // Default to demo data for new visitors so the app is instantly rich and testable!
      state.participants = [...DEMO_PARTICIPANTS];
      saveParticipants();
    }

    const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (storedTeams) {
      state.teams = JSON.parse(storedTeams);
    }

    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) {
      state.settings = JSON.parse(storedSettings);
    }

    const storedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (storedViewMode) {
      state.viewMode = storedViewMode;
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }
}

function saveParticipants() {
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(state.participants));
}

function saveTeams() {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(state.teams));
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

function saveViewMode() {
  localStorage.setItem(STORAGE_KEYS.VIEW_MODE, state.viewMode);
}

// ==============================================================================
// 3. DOM ELEMENTS
// ==============================================================================

const elements = {
  // Stats
  statTotalParticipants: document.getElementById('stat-total-participants'),
  statTotalTeams: document.getElementById('stat-total-teams'),
  statBalanceScore: document.getElementById('stat-balance-score'),
  statRolesDiversity: document.getElementById('stat-roles-diversity'),

  // Participant Form
  form: document.getElementById('participant-form'),
  participantIdInput: document.getElementById('participant-id'),
  nameInput: document.getElementById('name'),
  emailInput: document.getElementById('email'),
  phoneInput: document.getElementById('phone'),
  roleSelect: document.getElementById('role'),
  experienceSelect: document.getElementById('experience'),
  skillsInput: document.getElementById('skills'),
  interestsInput: document.getElementById('interests'),
  submitBtn: document.getElementById('submit-participant-btn'),
  submitBtnText: document.getElementById('submit-btn-text'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  formCardTitle: document.getElementById('form-card-title'),
  formModeBadge: document.getElementById('form-mode-badge'),
  skillChips: document.getElementById('skill-chips'),
  interestChips: document.getElementById('interest-chips'),

  // Team Settings
  modeTeamCountRadio: document.getElementById('mode-team-count'),
  modeMaxMembersRadio: document.getElementById('mode-max-members'),
  settingValueLabel: document.getElementById('setting-value-label'),
  settingValueDisplay: document.getElementById('setting-value-display'),
  rangeSlider: document.getElementById('setting-range-slider'),
  rangeMinLabel: document.getElementById('range-min-label'),
  rangeMaxLabel: document.getElementById('range-max-label'),
  teamProjectionBanner: document.getElementById('team-projection-banner'),
  teamProjectionText: document.getElementById('team-projection-text'),
  generateTeamsBtn: document.getElementById('generate-teams-btn'),

  // Roster Directory
  rosterCountPill: document.getElementById('roster-count-pill'),
  rosterSearch: document.getElementById('roster-search'),
  rosterRoleFilter: document.getElementById('roster-role-filter'),
  viewCardsBtn: document.getElementById('view-cards-btn'),
  viewTableBtn: document.getElementById('view-table-btn'),
  clearParticipantsBtn: document.getElementById('clear-participants-btn'),
  clearAllNavBtn: document.getElementById('clear-all-nav-btn'),
  quickDemoBtn: document.getElementById('quick-demo-btn'),
  emptyStateDemoBtn: document.getElementById('empty-state-demo-btn'),
  roleBreakdownBar: document.getElementById('role-breakdown-bar'),
  rosterEmptyState: document.getElementById('roster-empty-state'),
  participantsGrid: document.getElementById('participants-grid'),
  participantsTableWrapper: document.getElementById('participants-table-wrapper'),
  participantsTableBody: document.getElementById('participants-table-body'),

  // Team Results
  resultsSection: document.getElementById('results-section'),
  resultsTeamCountPill: document.getElementById('results-team-count-pill'),
  teamResultsActions: document.getElementById('team-results-actions'),
  resultsEmptyState: document.getElementById('results-empty-state'),
  matchingLoader: document.getElementById('matching-loader'),
  loaderStatusText: document.getElementById('loader-status-text'),
  loaderProgressFill: document.getElementById('loader-progress-fill'),
  teamsGrid: document.getElementById('teams-grid'),
  copyAllTeamsBtn: document.getElementById('copy-all-teams-btn'),
  downloadAllTeamsBtn: document.getElementById('download-all-teams-btn'),
  batchEmailsViewBtn: document.getElementById('batch-emails-view-btn'),

  // Email Modal
  emailModal: document.getElementById('email-modal'),
  closeEmailModalBtn: document.getElementById('close-email-modal-btn'),
  modalParticipantSelect: document.getElementById('modal-participant-select'),
  previewRecipientEmail: document.getElementById('preview-recipient-email'),
  previewSubject: document.getElementById('preview-subject'),
  previewEmailBody: document.getElementById('preview-email-body'),
  copyEmailBtn: document.getElementById('copy-email-btn'),
  mailtoLinkBtn: document.getElementById('mailto-link-btn'),

  // Batch Email Modal
  batchEmailModal: document.getElementById('batch-email-modal'),
  closeBatchModalBtn: document.getElementById('close-batch-modal-btn'),
  closeBatchFooterBtn: document.getElementById('close-batch-footer-btn'),
  batchTableBody: document.getElementById('batch-table-body'),

  // Confirm Modal
  confirmModal: document.getElementById('confirm-modal'),
  confirmModalTitle: document.getElementById('confirm-modal-title'),
  confirmModalMessage: document.getElementById('confirm-modal-message'),
  confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
  confirmActionBtn: document.getElementById('confirm-action-btn'),

  // Toasts
  toastContainer: document.getElementById('toast-container')
};

// ==============================================================================
// 4. TOAST NOTIFICATIONS & CONFIRMATION MODAL
// ==============================================================================

function showToast(message, type = 'info', durationMs = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span>${iconMap[type] || '🔔'}</span>
    <span>${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, durationMs);
}

let pendingConfirmAction = null;

function showConfirmDialog(title, message, onConfirm) {
  elements.confirmModalTitle.textContent = title;
  elements.confirmModalMessage.textContent = message;
  elements.confirmModal.classList.remove('hidden');
  pendingConfirmAction = onConfirm;
}

function hideConfirmDialog() {
  elements.confirmModal.classList.add('hidden');
  pendingConfirmAction = null;
}

// ==============================================================================
// 5. STATS & UI SYNCHRONIZATION
// ==============================================================================

function updateStats() {
  const total = state.participants.length;
  elements.statTotalParticipants.textContent = total;
  elements.rosterCountPill.textContent = total;

  // Roles distribution
  const rolesFound = new Set(state.participants.map(p => p.role));
  const coreRoles = ['Frontend', 'Backend', 'AI/ML', 'UI/UX'];
  const coveredCore = coreRoles.filter(r => rolesFound.has(r)).length;
  elements.statRolesDiversity.textContent = `${coveredCore} / 4`;

  // Teams formed
  elements.statTotalTeams.textContent = state.teams.length;
  elements.resultsTeamCountPill.textContent = state.teams.length;

  if (state.teams.length > 0) {
    const avgScore = Math.round(
      state.teams.reduce((acc, t) => acc + (t.balanceScore || 85), 0) / state.teams.length
    );
    elements.statBalanceScore.textContent = `${avgScore}%`;
  } else {
    elements.statBalanceScore.textContent = '--';
  }

  // Update Settings Slider limits & labels
  updateSettingsControls();

  // Enable/disable Generate Teams button
  if (total >= 2) {
    elements.generateTeamsBtn.disabled = false;
  } else {
    elements.generateTeamsBtn.disabled = true;
  }
}

function updateSettingsControls() {
  const total = state.participants.length;

  if (state.settings.strategyMode === 'teamCount') {
    elements.settingValueLabel.textContent = 'Desired Number of Teams:';
    elements.modeTeamCountRadio.checked = true;
    
    // Bounds for team count
    const minTeams = 2;
    const maxTeams = Math.max(2, Math.min(10, total));
    elements.rangeSlider.min = minTeams;
    elements.rangeSlider.max = Math.max(minTeams, maxTeams);
    elements.rangeMinLabel.textContent = minTeams;
    elements.rangeMaxLabel.textContent = Math.max(minTeams, maxTeams);

    // Clamp value
    if (state.settings.value < minTeams) state.settings.value = minTeams;
    if (state.settings.value > maxTeams) state.settings.value = maxTeams;
    elements.rangeSlider.value = state.settings.value;
    elements.settingValueDisplay.textContent = state.settings.value;

    if (total >= 2) {
      const avgSize = (total / state.settings.value).toFixed(1);
      elements.teamProjectionText.innerHTML = `
        <strong>${total}</strong> participants will form <strong>${state.settings.value} teams</strong> (~${avgSize} members per team).
      `;
    } else {
      elements.teamProjectionText.textContent = 'Add at least 2 participants to configure team formation.';
    }
  } else {
    // maxMembers mode
    elements.settingValueLabel.textContent = 'Maximum Members Per Team:';
    elements.modeMaxMembersRadio.checked = true;

    const minSize = 2;
    const maxSize = Math.max(3, Math.min(8, total || 6));
    elements.rangeSlider.min = minSize;
    elements.rangeSlider.max = maxSize;
    elements.rangeMinLabel.textContent = minSize;
    elements.rangeMaxLabel.textContent = maxSize;

    if (state.settings.value < minSize) state.settings.value = minSize;
    if (state.settings.value > maxSize) state.settings.value = maxSize;
    elements.rangeSlider.value = state.settings.value;
    elements.settingValueDisplay.textContent = state.settings.value;

    if (total >= 2) {
      const estTeams = Math.ceil(total / state.settings.value);
      elements.teamProjectionText.innerHTML = `
        With a cap of <strong>${state.settings.value} members</strong>, ~<strong>${estTeams} teams</strong> will be created.
      `;
    } else {
      elements.teamProjectionText.textContent = 'Add at least 2 participants to configure team formation.';
    }
  }
}

function renderRoleBreakdown() {
  const counts = {};
  state.participants.forEach(p => {
    counts[p.role] = (counts[p.role] || 0) + 1;
  });

  const roles = Object.keys(counts);
  if (roles.length === 0) {
    elements.roleBreakdownBar.innerHTML = '';
    return;
  }

  elements.roleBreakdownBar.innerHTML = roles.map(role => `
    <span class="role-pill-stat">
      ${role}: <strong>${counts[role]}</strong>
    </span>
  `).join('');
}

// ==============================================================================
// 6. PARTICIPANT REGISTRATION & CRUD
// ==============================================================================

function getCleanSkills(inputStr) {
  if (!inputStr) return [];
  return inputStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function getCleanInterests(inputStr) {
  if (!inputStr) return [];
  return inputStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function validateParticipantForm() {
  let isValid = true;

  // Clear previous errors
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

  const name = elements.nameInput.value.trim();
  const email = elements.emailInput.value.trim();
  const phone = elements.phoneInput.value.trim();
  const role = elements.roleSelect.value;
  const experience = elements.experienceSelect.value;
  const skills = elements.skillsInput.value.trim();
  const interests = elements.interestsInput.value.trim();

  if (!name) {
    document.getElementById('name-error').textContent = 'Please enter full name';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email address';
    isValid = false;
  }

  if (!phone) {
    document.getElementById('phone-error').textContent = 'Please enter a phone number';
    isValid = false;
  }

  if (!role) {
    document.getElementById('role-error').textContent = 'Please select a preferred role';
    isValid = false;
  }

  if (!experience) {
    document.getElementById('experience-error').textContent = 'Please select experience level';
    isValid = false;
  }

  if (!skills) {
    document.getElementById('skills-error').textContent = 'Please enter at least one skill';
    isValid = false;
  }

  if (!interests) {
    document.getElementById('interests-error').textContent = 'Please specify hackathon track interests';
    isValid = false;
  }

  return isValid;
}

function resetForm() {
  elements.form.reset();
  elements.participantIdInput.value = '';
  state.editingParticipantId = null;
  elements.submitBtnText.textContent = 'Add Participant';
  elements.formCardTitle.textContent = 'Participant Registration';
  elements.formModeBadge.textContent = 'New Entry';
  elements.cancelEditBtn.classList.add('hidden');
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

function startEditParticipant(id) {
  const participant = state.participants.find(p => p.id === id);
  if (!participant) return;

  state.editingParticipantId = id;
  elements.participantIdInput.value = participant.id;
  elements.nameInput.value = participant.name;
  elements.emailInput.value = participant.email;
  elements.phoneInput.value = participant.phone;
  elements.roleSelect.value = participant.role;
  elements.experienceSelect.value = participant.experience;
  elements.skillsInput.value = participant.skills.join(', ');
  elements.interestsInput.value = participant.interests.join(', ');

  elements.submitBtnText.textContent = 'Save Changes';
  elements.formCardTitle.textContent = 'Edit Participant';
  elements.formModeBadge.textContent = 'Editing Mode';
  elements.cancelEditBtn.classList.remove('hidden');

  // Scroll smoothly to form
  elements.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  elements.nameInput.focus();
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateParticipantForm()) {
    showToast('Please fix errors in the form before submitting', 'error');
    return;
  }

  const name = elements.nameInput.value.trim();
  const email = elements.emailInput.value.trim();
  const phone = elements.phoneInput.value.trim();
  const role = elements.roleSelect.value;
  const experience = elements.experienceSelect.value;
  const skills = getCleanSkills(elements.skillsInput.value);
  const interests = getCleanInterests(elements.interestsInput.value);

  if (state.editingParticipantId) {
    // Update existing
    const index = state.participants.findIndex(p => p.id === state.editingParticipantId);
    if (index !== -1) {
      state.participants[index] = {
        ...state.participants[index],
        name,
        email,
        phone,
        role,
        experience,
        skills,
        interests
      };
      saveParticipants();
      showToast(`Updated ${name}'s profile!`, 'success');
    }
  } else {
    // Check for duplicate email
    const exists = state.participants.some(p => p.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      document.getElementById('email-error').textContent = 'A participant with this email already exists';
      showToast('Email already registered', 'warning');
      return;
    }

    const newParticipant = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name,
      email,
      phone,
      role,
      experience,
      skills,
      interests
    };

    state.participants.unshift(newParticipant);
    saveParticipants();
    showToast(`Added ${name} to participants!`, 'success');
  }

  resetForm();
  renderRoster();
  updateStats();
}

function deleteParticipant(id) {
  const p = state.participants.find(item => item.id === id);
  const name = p ? p.name : 'participant';

  showConfirmDialog(
    'Delete Participant',
    `Are you sure you want to remove ${name} from the roster?`,
    () => {
      state.participants = state.participants.filter(item => item.id !== id);
      saveParticipants();

      // If that participant was in formed teams, invalidate teams to prompt re-generation
      if (state.teams.length > 0) {
        state.teams = [];
        saveTeams();
        renderTeams();
        showToast('Teams cleared because roster changed. Please re-generate teams.', 'info');
      }

      if (state.editingParticipantId === id) {
        resetForm();
      }

      showToast(`Removed ${name}`, 'info');
      renderRoster();
      updateStats();
      hideConfirmDialog();
    }
  );
}

function clearAllParticipants() {
  if (state.participants.length === 0) {
    showToast('Roster is already empty', 'info');
    return;
  }

  showConfirmDialog(
    'Clear All Participants',
    'Are you sure you want to delete all participants and all formed teams? This action cannot be undone.',
    () => {
      state.participants = [];
      state.teams = [];
      saveParticipants();
      saveTeams();
      resetForm();
      renderRoster();
      renderTeams();
      updateStats();
      showToast('All participants and teams cleared', 'info');
      hideConfirmDialog();
    }
  );
}

function loadDemoData() {
  state.participants = JSON.parse(JSON.stringify(DEMO_PARTICIPANTS));
  state.teams = [];
  saveParticipants();
  saveTeams();
  resetForm();
  renderRoster();
  renderTeams();
  updateStats();
  showToast('Loaded 12 demo hackathon participants!', 'success');
}

// Quick Chip click handler
function handleChipClick(e) {
  const skillBtn = e.target.closest('[data-skill]');
  if (skillBtn) {
    const skill = skillBtn.dataset.skill;
    const current = elements.skillsInput.value.trim();
    const skillsList = getCleanSkills(current);
    if (!skillsList.includes(skill)) {
      skillsList.push(skill);
      elements.skillsInput.value = skillsList.join(', ');
      elements.skillsInput.focus();
    }
    return;
  }

  const interestBtn = e.target.closest('[data-interest]');
  if (interestBtn) {
    const interest = interestBtn.dataset.interest;
    const current = elements.interestsInput.value.trim();
    const interestsList = getCleanInterests(current);
    if (!interestsList.includes(interest)) {
      interestsList.push(interest);
      elements.interestsInput.value = interestsList.join(', ');
      elements.interestsInput.focus();
    }
    return;
  }
}

// ==============================================================================
// 7. ROSTER RENDERING (GRID & TABLE)
// ==============================================================================

function getFilteredParticipants() {
  let list = [...state.participants];

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchEmail = p.email.toLowerCase().includes(q);
      const matchRole = p.role.toLowerCase().includes(q);
      const matchSkills = p.skills.some(s => s.toLowerCase().includes(q));
      const matchInterests = p.interests.some(i => i.toLowerCase().includes(q));
      return matchName || matchEmail || matchRole || matchSkills || matchInterests;
    });
  }

  // Role filter
  if (state.roleFilter !== 'ALL') {
    list = list.filter(p => p.role === state.roleFilter);
  }

  return list;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRoleCssClass(role) {
  // Normalize role to CSS class safe string
  const clean = role.replace(/[^a-zA-Z]/g, '');
  return `badge-role-${clean}`;
}

function renderRoster() {
  const filtered = getFilteredParticipants();
  renderRoleBreakdown();

  if (state.participants.length === 0) {
    elements.rosterEmptyState.classList.remove('hidden');
    elements.participantsGrid.classList.add('hidden');
    elements.participantsTableWrapper.classList.add('hidden');
    return;
  }

  elements.rosterEmptyState.classList.add('hidden');

  if (state.viewMode === 'cards') {
    elements.participantsGrid.classList.remove('hidden');
    elements.participantsTableWrapper.classList.add('hidden');
    renderGrid(filtered);
  } else {
    elements.participantsGrid.classList.add('hidden');
    elements.participantsTableWrapper.classList.remove('hidden');
    renderTable(filtered);
  }
}

function renderGrid(participants) {
  if (participants.length === 0) {
    elements.participantsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 2rem 1rem;">
        <p class="empty-desc">No participants match your search criteria.</p>
      </div>
    `;
    return;
  }

  elements.participantsGrid.innerHTML = participants.map(p => `
    <div class="participant-card" data-id="${p.id}">
      <div class="participant-card-header">
        <div class="participant-user-info">
          <div class="avatar">${getInitials(p.name)}</div>
          <div>
            <div class="participant-name">${escapeHtml(p.name)}</div>
            <div class="participant-email">${escapeHtml(p.email)}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="action-icon-btn edit-btn" title="Edit Participant" onclick="startEditParticipant('${p.id}')">
            ✏️
          </button>
          <button class="action-icon-btn delete-btn" title="Delete Participant" onclick="deleteParticipant('${p.id}')">
            🗑️
          </button>
        </div>
      </div>

      <div class="participant-meta-row">
        <span class="badge-role ${getRoleCssClass(p.role)}">${p.role}</span>
        <span class="badge-exp badge-exp-${p.experience}">${p.experience}</span>
      </div>

      <div class="skills-tags-list">
        ${p.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
      </div>

      <div class="interests-line">
        <strong>Tracks:</strong>
        <span>${escapeHtml(p.interests.join(', '))}</span>
      </div>
    </div>
  `).join('');
}

function renderTable(participants) {
  if (participants.length === 0) {
    elements.participantsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No participants match your search filter.
        </td>
      </tr>
    `;
    return;
  }

  elements.participantsTableBody.innerHTML = participants.map(p => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div class="avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">${getInitials(p.name)}</div>
          <div>
            <strong>${escapeHtml(p.name)}</strong>
          </div>
        </div>
      </td>
      <td>
        <span class="badge-role ${getRoleCssClass(p.role)}">${p.role}</span>
      </td>
      <td>
        <span class="badge-exp badge-exp-${p.experience}">${p.experience}</span>
      </td>
      <td>
        <div class="skills-tags-list">
          ${p.skills.slice(0, 3).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
          ${p.skills.length > 3 ? `<span class="skill-tag">+${p.skills.length - 3}</span>` : ''}
        </div>
      </td>
      <td>
        <span style="font-size: 0.75rem; color: var(--cyan);">${escapeHtml(p.interests.join(', '))}</span>
      </td>
      <td>
        <div style="font-family: var(--font-mono); font-size: 0.75rem;">
          <a href="mailto:${escapeHtml(p.email)}" class="member-email-link">📧 ${escapeHtml(p.email)}</a>
          <div style="color: var(--text-dim); margin-top: 2px;">📱 ${escapeHtml(p.phone)}</div>
        </div>
      </td>
      <td style="text-align: right;">
        <button class="action-icon-btn edit-btn" style="display: inline-flex;" title="Edit" onclick="startEditParticipant('${p.id}')">✏️</button>
        <button class="action-icon-btn delete-btn" style="display: inline-flex;" title="Delete" onclick="deleteParticipant('${p.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// ==============================================================================
// 8. SIMULATED AI TEAM MATCHER ALGORITHM
// ==============================================================================

/**
 * Intelligent Multi-Objective Local Matching Logic (Simulated AI Engine)
 * 
 * Objectives balanced by the algorithm:
 * 1. Role Diversity: Teams should contain an optimal blend of Frontend, Backend, AI/ML, UI/UX.
 * 2. Experience Equilibrium: Distributes senior mentors alongside intermediate & beginners.
 * 3. Skill Overlap & Complementarity: Encourages full-stack coverage.
 * 4. Domain Track Affinity: Matches hackers with shared hackathon tracks (e.g. FinTech, HealthTech).
 */
function runAiMatchingAlgorithm() {
  const participants = [...state.participants];
  const total = participants.length;

  if (total < 2) {
    showToast('Add at least 2 participants to form teams', 'warning');
    return;
  }

  // 1. Determine number of teams
  let teamCount;
  if (state.settings.strategyMode === 'teamCount') {
    teamCount = Math.min(state.settings.value, total);
  } else {
    // maxMembers mode
    teamCount = Math.ceil(total / state.settings.value);
  }

  teamCount = Math.max(1, teamCount);

  // Initialize empty teams
  const formedTeams = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: TEAM_NAMES[i % TEAM_NAMES.length] || `TEAM ${i + 1}`,
    themeIndex: i % 8,
    members: [],
    balanceScore: 0,
    dominantInterests: []
  }));

  // Experience point weights
  const expWeights = {
    'Advanced': 3,
    'Intermediate': 2,
    'Beginner': 1
  };

  // 2. Separate into Core Specialized Roles vs General Technical Roles
  // Core pillars that every balanced hackathon team desires
  const coreRoles = ['AI/ML', 'Frontend', 'Backend', 'UI/UX'];
  
  // Clone participant pool
  const pool = [...participants];

  // Helper: Get team's current cumulative experience points
  function getTeamExpScore(team) {
    return team.members.reduce((sum, m) => sum + (expWeights[m.experience] || 1), 0);
  }

  // Helper: Count of a specific role inside a team
  function countRoleInTeam(team, role) {
    return team.members.filter(m => m.role === role).length;
  }

  // 3. Round 1: Core Role Distribution
  // For each core role, sort by experience descending to distribute senior pillars evenly
  for (const role of coreRoles) {
    const candidates = pool
      .filter(p => p.role === role)
      .sort((a, b) => (expWeights[b.experience] || 1) - (expWeights[a.experience] || 1));

    for (const candidate of candidates) {
      // Find team with the fewest members of this role; tie-break with lowest total member count
      let bestTeam = formedTeams[0];
      let minRoleCount = countRoleInTeam(bestTeam, role);
      let minSize = bestTeam.members.length;

      for (let i = 1; i < formedTeams.length; i++) {
        const team = formedTeams[i];
        const rCount = countRoleInTeam(team, role);
        const tSize = team.members.length;

        if (rCount < minRoleCount || (rCount === minRoleCount && tSize < minSize)) {
          bestTeam = team;
          minRoleCount = rCount;
          minSize = tSize;
        }
      }

      bestTeam.members.push(candidate);
      // Remove from pool
      const poolIdx = pool.findIndex(p => p.id === candidate.id);
      if (poolIdx !== -1) pool.splice(poolIdx, 1);
    }
  }

  // 4. Round 2: Distribute remaining participants (Full Stack, Mobile, DevOps, Overflow)
  // Sort remaining participants by experience descending
  pool.sort((a, b) => (expWeights[b.experience] || 1) - (expWeights[a.experience] || 1));

  while (pool.length > 0) {
    const candidate = pool.shift();

    // Score candidate match for each team based on:
    // a. Smallest team size (primary constraint to keep teams balanced in headcount)
    // b. Experience leveling (give experienced to teams with lower exp)
    // c. Track interest affinity bonus
    let bestTeam = null;
    let minSize = Infinity;
    let lowestExp = Infinity;
    let highestSynergy = -1;

    for (const team of formedTeams) {
      const size = team.members.length;
      const exp = getTeamExpScore(team);
      
      // Calculate shared interest overlap score
      const existingInterests = team.members.flatMap(m => m.interests);
      const overlap = candidate.interests.filter(int => existingInterests.includes(int)).length;

      // Condition: Team with strictly smaller size gets priority
      if (size < minSize) {
        minSize = size;
        lowestExp = exp;
        highestSynergy = overlap;
        bestTeam = team;
      } else if (size === minSize) {
        // Tie-breaker 1: Team with lower experience needs boost
        if (exp < lowestExp) {
          lowestExp = exp;
          highestSynergy = overlap;
          bestTeam = team;
        } else if (exp === lowestExp) {
          // Tie-breaker 2: Shared interest overlap
          if (overlap > highestSynergy) {
            highestSynergy = overlap;
            bestTeam = team;
          }
        }
      }
    }

    if (bestTeam) {
      bestTeam.members.push(candidate);
    }
  }

  // 5. Evaluate Team Balance Scores & Metadata
  formedTeams.forEach(team => {
    const members = team.members;
    const memberRoles = members.map(m => m.role);
    const uniqueRolesCount = new Set(memberRoles).size;

    // Check presence of key pillars
    const hasFrontend = memberRoles.includes('Frontend') || memberRoles.includes('Full Stack');
    const hasBackend = memberRoles.includes('Backend') || memberRoles.includes('Full Stack');
    const hasAI = memberRoles.includes('AI/ML');
    const hasDesign = memberRoles.includes('UI/UX');

    let score = 70; // baseline

    if (hasFrontend) score += 8;
    if (hasBackend) score += 8;
    if (hasAI) score += 8;
    if (hasDesign) score += 6;

    // Bonus for role diversity variety
    score += Math.min(uniqueRolesCount * 2, 8);

    // Bonus for mentorship balance (has both Beginner & Advanced)
    const exps = members.map(m => m.experience);
    if (exps.includes('Advanced') && exps.includes('Beginner')) {
      score += 4;
    }

    team.balanceScore = Math.min(score, 99);

    // Determine Top Shared Track Interests
    const trackFrequencies = {};
    members.flatMap(m => m.interests).forEach(t => {
      trackFrequencies[t] = (trackFrequencies[t] || 0) + 1;
    });
    team.dominantInterests = Object.entries(trackFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  });

  return formedTeams;
}

/**
 * Executes Team Generation with smooth simulated AI loading sequence
 */
function handleGenerateTeams() {
  if (state.participants.length < 2) {
    showToast('Add at least 2 participants before generating teams', 'warning');
    return;
  }

  // Show loading animation
  elements.resultsEmptyState.classList.add('hidden');
  elements.teamsGrid.classList.add('hidden');
  elements.matchingLoader.classList.remove('hidden');
  elements.generateTeamsBtn.disabled = true;

  const simulationSteps = [
    { text: 'Clustering participant skill vectors and roles...', progress: 30 },
    { text: 'Distributing core technical anchors across squads...', progress: 65 },
    { text: 'Optimizing experience equilibrium and track synergy...', progress: 95 }
  ];

  let stepIdx = 0;
  elements.loaderStatusText.textContent = simulationSteps[0].text;
  elements.loaderProgressFill.style.width = `${simulationSteps[0].progress}%`;

  const interval = setInterval(() => {
    stepIdx++;
    if (stepIdx < simulationSteps.length) {
      elements.loaderStatusText.textContent = simulationSteps[stepIdx].text;
      elements.loaderProgressFill.style.width = `${simulationSteps[stepIdx].progress}%`;
    } else {
      clearInterval(interval);

      // Run algorithm
      const teams = runAiMatchingAlgorithm();
      state.teams = teams;
      saveTeams();

      // Finish loader
      elements.loaderProgressFill.style.width = '100%';
      setTimeout(() => {
        elements.matchingLoader.classList.add('hidden');
        elements.generateTeamsBtn.disabled = false;
        renderTeams();
        updateStats();

        // Scroll smoothly to results
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast(`🎉 Successfully formed ${teams.length} balanced hackathon teams!`, 'success');
      }, 350);
    }
  }, 280);
}

// ==============================================================================
// 9. TEAM RESULTS RENDERING & ACTIONS
// ==============================================================================

function renderTeams() {
  if (state.teams.length === 0) {
    elements.resultsEmptyState.classList.remove('hidden');
    elements.teamsGrid.classList.add('hidden');
    elements.teamResultsActions.style.display = 'none';
    return;
  }

  elements.resultsEmptyState.classList.add('hidden');
  elements.teamsGrid.classList.remove('hidden');
  elements.teamResultsActions.style.display = 'flex';

  elements.teamsGrid.innerHTML = state.teams.map((team, idx) => `
    <div class="team-card team-card-theme-${team.themeIndex || idx % 8}">
      <div class="team-card-header">
        <div class="team-title-group">
          <div class="team-badge-name">
            <span>🛡️</span> ${escapeHtml(team.name)}
          </div>
          <span class="team-meta-tag">${team.members.length} Squad Members</span>
        </div>
        <div class="team-balance-badge">
          ✨ ${team.balanceScore}% Balanced
        </div>
      </div>

      <div class="team-synergy-banner">
        <span class="synergy-chip">
          Shared Tracks: <strong>${team.dominantInterests.length > 0 ? escapeHtml(team.dominantInterests.join(', ')) : 'General'}</strong>
        </span>
      </div>

      <div class="team-members-list">
        ${team.members.map(member => `
          <div class="team-member-item">
            <div class="member-top-row">
              <div class="member-identity">
                <div class="member-avatar">${getInitials(member.name)}</div>
                <div>
                  <div class="member-name">👤 ${escapeHtml(member.name)}</div>
                </div>
              </div>
              <span class="badge-role ${getRoleCssClass(member.role)}">${member.role}</span>
            </div>

            <div class="member-details-row">
              <span><strong>Skills:</strong> ${escapeHtml(member.skills.join(', '))}</span>
              <span class="badge-exp badge-exp-${member.experience}">${member.experience}</span>
            </div>

            <div>
              <a href="mailto:${escapeHtml(member.email)}" class="member-email-link" title="Click to email ${escapeHtml(member.name)}">
                📧 ${escapeHtml(member.email)}
              </a>
              <span style="font-size: 0.72rem; color: var(--text-dim); margin-left: 0.6rem;">📱 ${escapeHtml(member.phone)}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="team-card-footer">
        <button class="btn btn-secondary btn-sm" onclick="copyTeamDetails('${team.id}')" title="Copy Team Details to clipboard">
          <span>📋</span> Copy Team
        </button>
        <button class="btn btn-secondary btn-sm" onclick="downloadTeamDetails('${team.id}')" title="Download text report for this team">
          <span>💾</span> Download
        </button>
        <button class="btn btn-primary btn-sm" onclick="openEmailModalForTeam('${team.id}')" title="Generate personalized email for members">
          <span>📧</span> Generate Email
        </button>
      </div>
    </div>
  `).join('');
}

// Format team details into readable markdown / text
function formatTeamDetailsText(team) {
  let text = `========================================\n`;
  text += `${team.name.toUpperCase()}\n`;
  text += `AI Balance Score: ${team.balanceScore}%\n`;
  text += `Members Count: ${team.members.length}\n`;
  text += `Top Tracks: ${team.dominantInterests.join(', ') || 'General'}\n`;
  text += `========================================\n\n`;

  team.members.forEach((m, idx) => {
    text += `${idx + 1}. 👤 ${m.name}\n`;
    text += `   Role: ${m.role}\n`;
    text += `   Experience: ${m.experience}\n`;
    text += `   Skills: ${m.skills.join(', ')}\n`;
    text += `   Email: ${m.email}\n`;
    text += `   Phone: ${m.phone}\n`;
    text += `   Interests: ${m.interests.join(', ')}\n\n`;
  });

  return text;
}

function copyTeamDetails(teamId) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return;

  const text = formatTeamDetailsText(team);
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied ${team.name} details to clipboard!`, 'success');
  }).catch(() => {
    // Fallback
    fallbackCopyToClipboard(text);
    showToast(`Copied ${team.name} details!`, 'success');
  });
}

function downloadTeamDetails(teamId) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return;

  const text = formatTeamDetailsText(team);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const filename = `${team.name.toLowerCase().replace(/\s+/g, '-')}-details.txt`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Downloaded ${filename}!`, 'success');
}

function copyAllTeamsSummary() {
  if (state.teams.length === 0) return;

  let text = `🎯 HACKATHON TEAMS ASSIGNMENT SUMMARY\n`;
  text += `Generated by AI Hackathon Team Matcher\n`;
  text += `Total Participants: ${state.participants.length} | Total Teams: ${state.teams.length}\n\n`;

  state.teams.forEach(t => {
    text += formatTeamDetailsText(t);
    text += `\n----------------------------------------\n\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied all teams summary to clipboard!', 'success');
  }).catch(() => {
    fallbackCopyToClipboard(text);
    showToast('Copied all teams summary!', 'success');
  });
}

function downloadAllTeamsReport() {
  if (state.teams.length === 0) return;

  let text = `🎯 COMPLETE HACKATHON TEAMS ROSTER REPORT\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `AI Hackathon Team Matcher (Simulated Heuristic Engine)\n`;
  text += `Total Participants: ${state.participants.length} | Formed Squads: ${state.teams.length}\n\n`;

  state.teams.forEach(t => {
    text += formatTeamDetailsText(t);
    text += `\n------------------------------------------------------------\n\n`;
  });

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const filename = `all-hackathon-teams-report.txt`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Downloaded full teams report!`, 'success');
}

function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// ==============================================================================
// 10. PERSONALIZED EMAIL GENERATOR (mailto:)
// ==============================================================================

/**
 * Builds personalized hackathon assignment email text & mailto: link
 */
function buildPersonalizedEmail(participant, team) {
  const subject = `🎯 Your Hackathon Team Has Been Assigned!`;

  // Build members list representation
  const memberLines = team.members.map(m => {
    const isSelf = m.id === participant.id;
    return `• ${m.name}${isSelf ? ' (You)' : ''} — ${m.role} (${m.email})`;
  }).join('\n');

  const body = 
`Hi ${participant.name},

Welcome to the Hackathon! 🚀
Your official hackathon team has been formed and balanced by our AI matching system.

🏆 YOUR ASSIGNED SQUAD: ${team.name}

👥 YOUR TEAMMATES:
${memberLines}

💡 NEXT STEPS & GETTING STARTED:
1. Reach out to your teammates via email or phone to introduce yourself.
2. Schedule a quick intro call to discuss project ideas and hackathon tracks.
3. Review the hackathon rules and judging criteria before opening ceremony.

Best of luck with your build, and have an awesome hackathon experience!

Best regards,
Hackathon Organizing Team
AI Hackathon Team Matcher Platform`;

  // Create clean mailto: url
  const mailtoUrl = `mailto:${encodeURIComponent(participant.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    recipientEmail: participant.email,
    subject,
    body,
    mailtoUrl
  };
}

function findParticipantAndTeam(participantId) {
  for (const team of state.teams) {
    const p = team.members.find(m => m.id === participantId);
    if (p) return { participant: p, team };
  }
  return { participant: null, team: null };
}

function updateEmailModalPreview() {
  const selectedParticipantId = elements.modalParticipantSelect.value;
  const { participant, team } = findParticipantAndTeam(selectedParticipantId);

  if (!participant || !team) {
    elements.previewRecipientEmail.textContent = 'No recipient selected';
    elements.previewEmailBody.textContent = 'Please select a participant from a formed team.';
    elements.mailtoLinkBtn.setAttribute('href', '#');
    return;
  }

  const emailData = buildPersonalizedEmail(participant, team);

  elements.previewRecipientEmail.textContent = emailData.recipientEmail;
  elements.previewSubject.textContent = emailData.subject;
  elements.previewEmailBody.textContent = emailData.body;
  elements.mailtoLinkBtn.setAttribute('href', emailData.mailtoUrl);
}

function openEmailModal(defaultParticipantId = null) {
  if (state.teams.length === 0) {
    showToast('Generate teams first to create assignment emails', 'warning');
    return;
  }

  // Populate recipient dropdown
  const allAssignedParticipants = [];
  state.teams.forEach(team => {
    team.members.forEach(m => {
      allAssignedParticipants.push({
        id: m.id,
        label: `${m.name} (${team.name} — ${m.role})`
      });
    });
  });

  elements.modalParticipantSelect.innerHTML = allAssignedParticipants.map(item => `
    <option value="${item.id}" ${item.id === defaultParticipantId ? 'selected' : ''}>
      ${escapeHtml(item.label)}
    </option>
  `).join('');

  if (!defaultParticipantId && allAssignedParticipants.length > 0) {
    elements.modalParticipantSelect.value = allAssignedParticipants[0].id;
  }

  updateEmailModalPreview();
  elements.emailModal.classList.remove('hidden');
}

function openEmailModalForTeam(teamId) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team || team.members.length === 0) return;
  openEmailModal(team.members[0].id);
}

function closeEmailModal() {
  elements.emailModal.classList.add('hidden');
}

function copyCurrentModalEmail() {
  const selectedParticipantId = elements.modalParticipantSelect.value;
  const { participant, team } = findParticipantAndTeam(selectedParticipantId);
  if (!participant || !team) return;

  const emailData = buildPersonalizedEmail(participant, team);
  const fullText = `To: ${emailData.recipientEmail}\nSubject: ${emailData.subject}\n\n${emailData.body}`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast(`Copied assignment email for ${participant.name}!`, 'success');
  }).catch(() => {
    fallbackCopyToClipboard(fullText);
    showToast(`Copied assignment email for ${participant.name}!`, 'success');
  });
}

// Batch Emails Modal
function openBatchEmailModal() {
  if (state.teams.length === 0) {
    showToast('Generate teams first before viewing batch emails', 'warning');
    return;
  }

  const rows = [];
  state.teams.forEach(team => {
    team.members.forEach(member => {
      const emailData = buildPersonalizedEmail(member, team);
      rows.push(`
        <tr>
          <td><strong>👤 ${escapeHtml(member.name)}</strong></td>
          <td><span class="counter-pill team-pill">${escapeHtml(team.name)}</span></td>
          <td><span class="badge-role ${getRoleCssClass(member.role)}">${member.role}</span></td>
          <td style="font-family: var(--font-mono); font-size: 0.76rem;">${escapeHtml(member.email)}</td>
          <td style="text-align: right;">
            <a href="${emailData.mailtoUrl}" class="btn btn-magic btn-sm" target="_blank" rel="noopener noreferrer" title="Trigger native email client">
              <span>📧</span> Send Email
            </a>
          </td>
        </tr>
      `);
    });
  });

  elements.batchTableBody.innerHTML = rows.join('');
  elements.batchEmailModal.classList.remove('hidden');
}

function closeBatchEmailModal() {
  elements.batchEmailModal.classList.add('hidden');
}

// ==============================================================================
// 11. EVENT LISTENERS & WIRING
// ==============================================================================

function bindEvents() {
  // Form submission
  elements.form.addEventListener('submit', handleFormSubmit);

  // Cancel edit button
  elements.cancelEditBtn.addEventListener('click', resetForm);

  // Quick Chips
  elements.skillChips.addEventListener('click', handleChipClick);
  elements.interestChips.addEventListener('click', handleChipClick);

  // Strategy toggle radios
  elements.modeTeamCountRadio.addEventListener('change', () => {
    state.settings.strategyMode = 'teamCount';
    saveSettings();
    updateSettingsControls();
  });

  elements.modeMaxMembersRadio.addEventListener('change', () => {
    state.settings.strategyMode = 'maxMembers';
    saveSettings();
    updateSettingsControls();
  });

  // Slider change
  elements.rangeSlider.addEventListener('input', (e) => {
    state.settings.value = parseInt(e.target.value, 10);
    elements.settingValueDisplay.textContent = state.settings.value;
    saveSettings();
    updateSettingsControls();
  });

  // Generate Teams Button
  elements.generateTeamsBtn.addEventListener('click', handleGenerateTeams);

  // Search input in roster
  elements.rosterSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderRoster();
  });

  // Role filter in roster
  elements.rosterRoleFilter.addEventListener('change', (e) => {
    state.roleFilter = e.target.value;
    renderRoster();
  });

  // View toggle buttons (Cards vs Table)
  elements.viewCardsBtn.addEventListener('click', () => {
    state.viewMode = 'cards';
    elements.viewCardsBtn.classList.add('active');
    elements.viewTableBtn.classList.remove('active');
    saveViewMode();
    renderRoster();
  });

  elements.viewTableBtn.addEventListener('click', () => {
    state.viewMode = 'table';
    elements.viewTableBtn.classList.add('active');
    elements.viewCardsBtn.classList.remove('active');
    saveViewMode();
    renderRoster();
  });

  // Clear all buttons
  elements.clearParticipantsBtn.addEventListener('click', clearAllParticipants);
  elements.clearAllNavBtn.addEventListener('click', clearAllParticipants);

  // Demo data buttons
  elements.quickDemoBtn.addEventListener('click', loadDemoData);
  elements.emptyStateDemoBtn.addEventListener('click', loadDemoData);

  // Global Teams action buttons
  elements.copyAllTeamsBtn.addEventListener('click', copyAllTeamsSummary);
  elements.downloadAllTeamsBtn.addEventListener('click', downloadAllTeamsReport);
  elements.batchEmailsViewBtn.addEventListener('click', openBatchEmailModal);

  // Email Modal actions
  elements.closeEmailModalBtn.addEventListener('click', closeEmailModal);
  elements.modalParticipantSelect.addEventListener('change', updateEmailModalPreview);
  elements.copyEmailBtn.addEventListener('click', copyCurrentModalEmail);

  // Close modal when clicking on backdrop
  elements.emailModal.addEventListener('click', (e) => {
    if (e.target === elements.emailModal) closeEmailModal();
  });

  // Batch modal close
  elements.closeBatchModalBtn.addEventListener('click', closeBatchEmailModal);
  elements.closeBatchFooterBtn.addEventListener('click', closeBatchEmailModal);
  elements.batchEmailModal.addEventListener('click', (e) => {
    if (e.target === elements.batchEmailModal) closeBatchEmailModal();
  });

  // Confirm dialog actions
  elements.confirmCancelBtn.addEventListener('click', hideConfirmDialog);
  elements.confirmActionBtn.addEventListener('click', () => {
    if (typeof pendingConfirmAction === 'function') {
      pendingConfirmAction();
    }
  });
  elements.confirmModal.addEventListener('click', (e) => {
    if (e.target === elements.confirmModal) hideConfirmDialog();
  });

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEmailModal();
      closeBatchEmailModal();
      hideConfirmDialog();
    }
  });
}

// Utility for safe HTML escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==============================================================================
// 12. APPLICATION BOOTSTRAP
// ==============================================================================

function initApp() {
  loadState();

  // Set active view button
  if (state.viewMode === 'table') {
    elements.viewTableBtn.classList.add('active');
    elements.viewCardsBtn.classList.remove('active');
  } else {
    elements.viewCardsBtn.classList.add('active');
    elements.viewTableBtn.classList.remove('active');
  }

  bindEvents();
  renderRoster();
  renderTeams();
  updateStats();
}

// Launch application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
