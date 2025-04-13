// DOM elements
const elements = {
    // Configuration
    configPanel: document.getElementById('configPanel'),
    closeConfigBtn: document.getElementById('closeConfigBtn'),
    modelSelect: document.getElementById('modelSelect'),
    threadCount: document.getElementById('threadCount'),
    cpuCount: document.getElementById('cpuCount'),
    timeQuantum: document.getElementById('timeQuantum'),
    timeQuantumValue: document.getElementById('timeQuantumValue'),
    startSimBtn: document.getElementById('startSimBtn'),
    
    // Dashboard
    dashboard: document.getElementById('dashboard'),
    noSimulation: document.getElementById('noSimulation'),
    modelBadge: document.getElementById('modelBadge'),
    clockCard: document.getElementById('clockCard').querySelector('.big-stat'),
    readyCount: document.getElementById('readyCount'),
    runningCount: document.getElementById('runningCount'),
    blockedCount: document.getElementById('blockedCount'),
    terminatedCount: document.getElementById('terminatedCount'),
    readyProgress: document.getElementById('readyProgress'),
    runningProgress: document.getElementById('runningProgress'),
    blockedProgress: document.getElementById('blockedProgress'),
    terminatedProgress: document.getElementById('terminatedProgress'),
    cpuUtilContainer: document.getElementById('cpuUtilContainer'),
    cpuContainer: document.getElementById('cpuContainer'),
    threadContainer: document.getElementById('threadContainer'),
    modelContainer: document.getElementById('modelContainer'),
    
    // Controls
    newSimBtn: document.getElementById('newSimBtn'),
    emptyStateNewBtn: document.getElementById('emptyStateNewBtn'),
    stepBtn: document.getElementById('stepBtn'),
    playBtn: document.getElementById('playBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Modals
    infoModal: document.getElementById('infoModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    helpModal: document.getElementById('helpModal'),
    helpBtn: document.getElementById('helpBtn'),
    closeHelpBtn: document.getElementById('closeHelpBtn'),
    
    // Theme toggle
    themeToggleBtn: document.getElementById('themeToggleBtn')
};
