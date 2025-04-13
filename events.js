function bindEventListeners() {
    elements.newSimBtn.addEventListener('click', showConfigPanel);
    elements.emptyStateNewBtn.addEventListener('click', showConfigPanel);
    elements.closeConfigBtn.addEventListener('click', hideConfigPanel);
    elements.timeQuantum.addEventListener('input', updateTimeQuantumValue);
    elements.startSimBtn.addEventListener('click', startSimulation);
    
    elements.stepBtn.addEventListener('click', stepSimulation);
    elements.playBtn.addEventListener('click', togglePlaySimulation);
    elements.resetBtn.addEventListener('click', resetSimulation);
  
    elements.closeModalBtn.addEventListener('click', hideInfoModal);
    elements.helpBtn.addEventListener('click', showHelpModal);
    elements.closeHelpBtn.addEventListener('click', hideHelpModal);
    

    elements.themeToggleBtn.addEventListener('click', toggleTheme);
}


function showConfigPanel() {
    elements.configPanel.classList.add('show');
}


function hideConfigPanel() {
    elements.configPanel.classList.remove('show');
}


function updateTimeQuantumValue() {
    elements.timeQuantumValue.textContent = elements.timeQuantum.value;
}


function startSimulation() {
    state.model = elements.modelSelect.value;
    state.threadCount = parseInt(elements.threadCount.value);
    state.cpuCount = parseInt(elements.cpuCount.value);
    state.timeQuantum = parseInt(elements.timeQuantum.value);
    
    
    initializeSimulation();
    

    hideConfigPanel();
    elements.noSimulation.style.display = 'none';
    elements.dashboard.style.display = 'block';
    

    enableControls();
    

    updateUI();
}


function stepSimulation() {
    state.clockCycles++;
    processThreadTransitions();
    updateCpuStates();
    updateUI();
    
    checkSimulationEnd();
}

function togglePlaySimulation() {
    if (state.isRunning) {
        // Stop simulation
        clearInterval(state.interval);
        state.isRunning = false;
        elements.playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    } else {
        // Start simulation
        state.interval = setInterval(stepSimulation, 500);
        state.isRunning = true;
        elements.playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

function resetSimulation() {
    if (state.isRunning) {
        clearInterval(state.interval);
        state.isRunning = false;
        elements.playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
    
    showConfigPanel();

    elements.dashboard.style.display = 'none';
    elements.noSimulation.style.display = 'flex';
    
    disableControls();
}


function enableControls() {
    elements.stepBtn.disabled = false;
    elements.playBtn.disabled = false;
    elements.resetBtn.disabled = false;
}


function disableControls() {
    elements.stepBtn.disabled = true;
    elements.playBtn.disabled = true;
    elements.resetBtn.disabled = true;
}


function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = elements.themeToggleBtn.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}
