function updateUI() {
    if (state.model) {
        let modelName = '';
        switch (state.model) {
            case 'many-to-one':
                modelName = 'Many-to-One (M:1)';
                break;
            case 'one-to-many':
                modelName = 'One-to-One (1:1)';
                break;
            case 'many-to-many':
                modelName = 'Many-to-Many (M:N)';
                break;
        }
        elements.modelBadge.textContent = modelName;
    }
    
    // Update clock cycles
    elements.clockCard.textContent = state.clockCycles;
    
    // Update thread state counts
    const counts = {
        ready: 0,
        running: 0,
        blocked: 0,
        terminated: 0
    };
    
    state.threads.forEach(thread => counts[thread.state]++);
    
    const total = state.threads.length;
    elements.readyCount.textContent = counts.ready;
    elements.runningCount.textContent = counts.running;
    elements.blockedCount.textContent = counts.blocked;
    elements.terminatedCount.textContent = counts.terminated;
    
    elements.readyProgress.style.width = `${(counts.ready / total) * 100}%`;
    elements.runningProgress.style.width = `${(counts.running / total) * 100}%`;
    elements.blockedProgress.style.width = `${(counts.blocked / total) * 100}%`;
    elements.terminatedProgress.style.width = `${(counts.terminated / total) * 100}%`;
    
    // Update CPU utilization
    updateCpuUtilizationUI();
    
    // Update CPU visualization
    updateCpuVisualizationUI();
    
    // Update thread visualization
    updateThreadVisualizationUI();
    
    // Update model visualization
    updateModelVisualizationUI();
}

// Update CPU utilization UI
function updateCpuUtilizationUI() {
    if (!state.cpus.length) {
        elements.cpuUtilContainer.innerHTML = '<div class="no-data-message">No active simulation</div>';
        return;
    }
    
    let html = '';
    state.cpus.forEach(cpu => {
        html += `
            <div class="cpu-util-item">
                <div class="cpu-label">CPU ${cpu.id}</div>
                <div class="cpu-util-bar">
                    <div class="cpu-util-progress" style="width: ${cpu.utilization}%"></div>
                </div>
                <div class="cpu-util-text">${cpu.utilization.toFixed(1)}%</div>
            </div>
        `;
    });
    
    elements.cpuUtilContainer.innerHTML = html;
}

// Update CPU visualization UI
function updateCpuVisualizationUI() {
    if (!state.cpus.length) {
        elements.cpuContainer.innerHTML = '<div class="no-data-message">No active simulation</div>';
        return;
    }
    
    let html = '';
    state.cpus.forEach(cpu => {
        const isActive = cpu.threadId !== null;
        const threadInfo = isActive ? state.threads.find(t => t.id === cpu.threadId) : null;
        
        html += `
            <div class="cpu-item">
                <div class="cpu-header">
                    <div class="cpu-title">CPU ${cpu.id}</div>
                    <div class="cpu-status ${isActive ? 'active' : 'idle'}">${isActive ? 'Active' : 'Idle'}</div>
                </div>
                <div class="cpu-body">
                    ${isActive ? 
                        `<div class="cpu-thread">Thread ${cpu.threadId}</div>` : 
                        `<div class="cpu-no-thread">No thread</div>`}
                </div>
                <div class="cpu-info">
                    <div>Util: ${cpu.utilization.toFixed(1)}%</div>
                    ${threadInfo ? `<div>Progress: ${Math.round((threadInfo.progress / threadInfo.totalWork) * 100)}%</div>` : ''}
                </div>
            </div>
        `;
    });
    
    elements.cpuContainer.innerHTML = html;
}

// Update thread visualization UI
function updateThreadVisualizationUI() {
    if (!state.threads.length) {
        elements.threadContainer.innerHTML = '<div class="no-data-message">No active simulation</div>';
        return;
    }
    
    let html = '';
    state.threads.forEach(thread => {
        const progressPercent = (thread.progress / thread.totalWork) * 100;
        const stateClass = `state-${thread.state}`;
        const isRunning = thread.state === ThreadState.RUNNING;
        
        html += `
            <div class="thread-item ${isRunning ? 'thread-running' : ''}" onclick="showThreadInfo(${thread.id})">
                <div class="thread-header">
                    <div class="thread-title">Thread ${thread.id}</div>
                    <div class="thread-state ${stateClass}"></div>
                </div>
                <div class="thread-progress">
                    <div class="thread-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="thread-info">
                    <div>${Math.round(progressPercent)}%</div>
                    <div>${thread.progress}/${thread.totalWork}</div>
                </div>
            </div>
        `;
    });
    
    elements.threadContainer.innerHTML = html;
    
    // Attach click handlers directly since we're using innerHTML
    const threadItems = document.querySelectorAll('.thread-item');
    threadItems.forEach(item => {
        item.addEventListener('click', function() {
            const threadId = parseInt(this.querySelector('.thread-title').textContent.replace('Thread ', ''));
            showThreadInfo(threadId);
        });
    });
}

// Update model visualization UI
function updateModelVisualizationUI() {
    if (!state.model) {
        elements.modelContainer.innerHTML = '<div class="no-data-message">No active simulation</div>';
        return;
    }
    
    switch (state.model) {
        case 'many-to-one':
            renderManyToOneModel();
            break;
        case 'one-to-many':
            renderOneToManyModel();
            break;
        case 'many-to-many':
            renderManyToManyModel();
            break;
    }
}

// Render many-to-one model visualization
function renderManyToOneModel() {
    elements.modelContainer.innerHTML = `
        <div class="model-visualization">
            <div class="thread-pool" style="left: 10%; top: 10%; width: 35%;">
                <div class="pool-title">User Threads</div>
                <div class="pool-items">
                    ${state.threads.map(thread => `
                        <div class="pool-item thread-item-visual" style="background-color: var(--${thread.state}-color);">
                            ${thread.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="kernel-pool" style="left: 55%; top: 30%; width: 15%;">
                <div class="pool-title">Kernel Thread</div>
                <div class="pool-items">
                    <div class="pool-item kernel-item">0</div>
                </div>
            </div>
            
            <div class="cpu-pool" style="left: 80%; top: 10%; width: 15%;">
                <div class="pool-title">CPUs</div>
                <div class="pool-items">
                    ${state.cpus.map(cpu => `
                        <div class="pool-item cpu-item-visual">
                            ${cpu.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="thread-kernel-lines"></div>
            <div class="kernel-cpu-lines"></div>
        </div>
    `;
    
    // Draw connection lines - with a delay to ensure DOM elements are rendered
    setTimeout(() => {
        drawManyToOneConnections();
    }, 50);
}

// Draw connection lines for many-to-one model
function drawManyToOneConnections() {
    const threadItems = document.querySelectorAll('.thread-pool .pool-item');
    const kernelItem = document.querySelector('.kernel-pool .pool-item');
    const cpuItems = document.querySelectorAll('.cpu-pool .pool-item');
    const threadKernelLines = document.querySelector('.thread-kernel-lines');
    const kernelCpuLines = document.querySelector('.kernel-cpu-lines');
    
    // Clear previous lines
    threadKernelLines.innerHTML = '';
    kernelCpuLines.innerHTML = '';
    
    // Draw thread to kernel lines
    if (threadItems.length && kernelItem) {
        const kernelRect = kernelItem.getBoundingClientRect();
        const kernelCenterX = kernelRect.left + kernelRect.width / 2;
        const kernelCenterY = kernelRect.top + kernelRect.height / 2;
        
        threadItems.forEach(threadItem => {
            const threadRect = threadItem.getBoundingClientRect();
            const threadCenterX = threadRect.left + threadRect.width / 2;
            const threadCenterY = threadRect.top + threadRect.height / 2;
            
            // Calculate line properties
            const dx = kernelCenterX - threadCenterX;
            const dy = kernelCenterY - threadCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Create line element
            const line = document.createElement('div');
            line.className = 'connection-line';
            line.style.width = `${distance}px`;
            line.style.left = `${threadCenterX}px`;
            line.style.top = `${threadCenterY}px`;
            line.style.transform = `rotate(${angle}deg)`;
            threadKernelLines.appendChild(line);
        });
    }
    
    // Draw kernel to CPU lines
    if (kernelItem && cpuItems.length) {
        const kernelRect = kernelItem.getBoundingClientRect();
        const kernelCenterX = kernelRect.left + kernelRect.width / 2;
        const kernelCenterY = kernelRect.top + kernelRect.height / 2;
        
        // Only highlight the active CPU if there is one
        const activeCpu = state.cpus.find(cpu => cpu.threadId !== null);
        
        cpuItems.forEach((cpuItem, index) => {
            const cpuRect = cpuItem.getBoundingClientRect();
            const cpuCenterX = cpuRect.left + cpuRect.width / 2;
            const cpuCenterY = cpuRect.top + cpuRect.height / 2;
            
            // Calculate line properties
            const dx = cpuCenterX - kernelCenterX;
            const dy = cpuCenterY - kernelCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Create line element
            const line = document.createElement('div');
            line.className = 'connection-line';
            if (activeCpu && activeCpu.id === index) {
                line.className += ' active-connection';
            }
            line.style.width = `${distance}px`;
            line.style.left = `${kernelCenterX}px`;
            line.style.top = `${kernelCenterY}px`;
            line.style.transform = `rotate(${angle}deg)`;
            kernelCpuLines.appendChild(line);
        });
    }
}
//..............................................
// Render one-to-many model visualization
function renderOneToManyModel() {
    elements.modelContainer.innerHTML = `
        <div class="model-visualization">
            <div class="thread-pool" style="left: 10%; top: 10%; width: 25%;">
                <div class="pool-title">User Threads</div>
                <div class="pool-items">
                    ${state.threads.map(thread => `
                        <div class="pool-item thread-item-visual" style="background-color: var(--${thread.state}-color);">
                            ${thread.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="kernel-pool" style="left: 45%; top: 10%; width: 25%;">
                <div class="pool-title">Kernel Threads</div>
                <div class="pool-items">
                    ${state.threads.map(thread => `
                        <div class="pool-item kernel-item">
                            ${thread.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="cpu-pool" style="left: 80%; top: 10%; width: 15%;">
                <div class="pool-title">CPUs</div>
                <div class="pool-items">
                    ${state.cpus.map(cpu => `
                        <div class="pool-item cpu-item-visual">
                            ${cpu.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="thread-kernel-lines"></div>
            <div class="kernel-cpu-lines"></div>
        </div>
    `;
    
    // Draw connection lines - with a delay to ensure DOM elements are rendered
    setTimeout(() => {
        drawOneToManyConnections();
    }, 50);
}

// Draw connection lines for one-to-many model
function drawOneToManyConnections() {
    const threadItems = document.querySelectorAll('.thread-pool .pool-item');
    const kernelItems = document.querySelectorAll('.kernel-pool .pool-item');
    const cpuItems = document.querySelectorAll('.cpu-pool .pool-item');
    const threadKernelLines = document.querySelector('.thread-kernel-lines');
    const kernelCpuLines = document.querySelector('.kernel-cpu-lines');
    
    // Clear previous lines
    threadKernelLines.innerHTML = '';
    kernelCpuLines.innerHTML = '';
    
    // Draw thread to kernel lines (1:1 mapping)
    if (threadItems.length === kernelItems.length) {
        threadItems.forEach((threadItem, index) => {
            const kernelItem = kernelItems[index];
            
            const threadRect = threadItem.getBoundingClientRect();
            const kernelRect = kernelItem.getBoundingClientRect();
            
            const threadCenterX = threadRect.left + threadRect.width / 2;
            const threadCenterY = threadRect.top + threadRect.height / 2;
            const kernelCenterX = kernelRect.left + kernelRect.width / 2;
            const kernelCenterY = kernelRect.top + kernelRect.height / 2;
            
            // Calculate line properties
            const dx = kernelCenterX - threadCenterX;
            const dy = kernelCenterY - threadCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Create line element
            const line = document.createElement('div');
            line.className = 'connection-line';
            line.style.width = `${distance}px`;
            line.style.left = `${threadCenterX}px`;
            line.style.top = `${threadCenterY}px`;
            line.style.transform = `rotate(${angle}deg)`;
            threadKernelLines.appendChild(line);
        });
    }
    
    // Draw kernel to CPU lines (all kernels can potentially connect to all CPUs)
    if (kernelItems.length && cpuItems.length) {
        // Get active mappings - which kernel thread is running on which CPU
        const activeMappings = {};
        state.cpus.forEach(cpu => {
            if (cpu.threadId !== null) {
                activeMappings[cpu.id] = cpu.threadId;
            }
        });
        
        kernelItems.forEach((kernelItem, kernelIndex) => {
            const kernelRect = kernelItem.getBoundingClientRect();
            const kernelCenterX = kernelRect.left + kernelRect.width / 2;
            const kernelCenterY = kernelRect.top + kernelRect.height / 2;
            
            cpuItems.forEach((cpuItem, cpuIndex) => {
                const cpuRect = cpuItem.getBoundingClientRect();
                const cpuCenterX = cpuRect.left + cpuRect.width / 2;
                const cpuCenterY = cpuRect.top + cpuRect.height / 2;
                
                // Only draw active connections
                const isActive = activeMappings[cpuIndex] === kernelIndex;
                
                if (!isActive) {
                    return; // Skip inactive connections for one-to-many
                }
                
                // Calculate line properties
                const dx = cpuCenterX - kernelCenterX;
                const dy = cpuCenterY - kernelCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                // Create line element
                const line = document.createElement('div');
                line.className = 'connection-line active-connection';
                line.style.width = `${distance}px`;
                line.style.left = `${kernelCenterX}px`;
                line.style.top = `${kernelCenterY}px`;
                line.style.transform = `rotate(${angle}deg)`;
                kernelCpuLines.appendChild(line);
            });
        });
    }
}
//........................................
// Render many-to-many model visualization
function renderManyToManyModel() {
    // Get unique kernel thread IDs from mapping
    const kernelThreadIds = [...new Set(Object.values(state.threadKernelMapping))];
    
    elements.modelContainer.innerHTML = `
        <div class="model-visualization">
            <div class="thread-pool" style="left: 10%; top: 10%; width: 25%;">
                <div class="pool-title">User Threads</div>
                <div class="pool-items">
                    ${state.threads.map(thread => `
                        <div class="pool-item thread-item-visual" style="background-color: var(--${thread.state}-color);">
                            ${thread.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="kernel-pool" style="left: 45%; top: 10%; width: 25%;">
                <div class="pool-title">Kernel Threads</div>
                <div class="pool-items">
                    ${kernelThreadIds.map(id => `
                        <div class="pool-item kernel-item">
                            ${id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="cpu-pool" style="left: 80%; top: 10%; width: 15%;">
                <div class="pool-title">CPUs</div>
                <div class="pool-items">
                    ${state.cpus.map(cpu => `
                        <div class="pool-item cpu-item-visual">
                            ${cpu.id}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="thread-kernel-lines"></div>
            <div class="kernel-cpu-lines"></div>
        </div>
    `;
    
    // Draw connection lines - with a delay to ensure DOM elements are rendered
    setTimeout(() => {
        drawManyToManyConnections();
    }, 50);
}

// Draw connection lines for many-to-many model
function drawManyToManyConnections() {
    const threadItems = document.querySelectorAll('.thread-pool .pool-item');
    const kernelItems = document.querySelectorAll('.kernel-pool .pool-item');
    const cpuItems = document.querySelectorAll('.cpu-pool .pool-item');
    const threadKernelLines = document.querySelector('.thread-kernel-lines');
    const kernelCpuLines = document.querySelector('.kernel-cpu-lines');
    
    // Clear previous lines
    threadKernelLines.innerHTML = '';
    kernelCpuLines.innerHTML = '';
    
    // Get unique kernel thread IDs from mapping
    const kernelThreadIds = [...new Set(Object.values(state.threadKernelMapping))];
    
    // Draw thread to kernel lines (many-to-many mapping)
    if (threadItems.length && kernelItems.length) {
        threadItems.forEach((threadItem, threadIndex) => {
            const kernelId = state.threadKernelMapping[threadIndex];
            const kernelIndex = kernelThreadIds.indexOf(kernelId);
            
            if (kernelIndex >= 0 && kernelIndex < kernelItems.length) {
                const kernelItem = kernelItems[kernelIndex];
                
                const threadRect = threadItem.getBoundingClientRect();
                const kernelRect = kernelItem.getBoundingClientRect();
                
                const threadCenterX = threadRect.left + threadRect.width / 2;
                const threadCenterY = threadRect.top + threadRect.height / 2;
                const kernelCenterX = kernelRect.left + kernelRect.width / 2;
                const kernelCenterY = kernelRect.top + kernelRect.height / 2;
                
                // Calculate line properties
                const dx = kernelCenterX - threadCenterX;
                const dy = kernelCenterY - threadCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                // Create line element
                const line = document.createElement('div');
                line.className = 'connection-line';
                line.style.width = `${distance}px`;
                line.style.left = `${threadCenterX}px`;
                line.style.top = `${threadCenterY}px`;
                line.style.transform = `rotate(${angle}deg)`;
                threadKernelLines.appendChild(line);
            }
        });
    }
    
    // Draw kernel to CPU lines
    if (kernelItems.length && cpuItems.length) {
        // Get active mappings - which kernel thread is running on which CPU
        const activeMappings = {};
        state.cpus.forEach(cpu => {
            if (cpu.threadId !== null) {
                const threadKernelId = state.threadKernelMapping[cpu.threadId];
                if (threadKernelId !== undefined) {
                    activeMappings[cpu.id] = threadKernelId;
                }
            }
        });
        
        kernelItems.forEach((kernelItem, index) => {
            const kernelId = kernelThreadIds[index];
            const kernelRect = kernelItem.getBoundingClientRect();
            const kernelCenterX = kernelRect.left + kernelRect.width / 2;
            const kernelCenterY = kernelRect.top + kernelRect.height / 2;
            
            cpuItems.forEach((cpuItem, cpuIndex) => {
                const cpuRect = cpuItem.getBoundingClientRect();
                const cpuCenterX = cpuRect.left + cpuRect.width / 2;
                const cpuCenterY = cpuRect.top + cpuRect.height / 2;
                
                // Check if this is an active connection
                const isActive = activeMappings[cpuIndex] === kernelId;
                
                // Calculate line properties
                const dx = cpuCenterX - kernelCenterX;
                const dy = cpuCenterY - kernelCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                // Create line element
                const line = document.createElement('div');
                line.className = `connection-line ${isActive ? 'active-connection' : 'potential-connection'}`;
                line.style.width = `${distance}px`;
                line.style.left = `${kernelCenterX}px`;
                line.style.top = `${kernelCenterY}px`;
                line.style.transform = `rotate(${angle}deg)`;
                kernelCpuLines.appendChild(line);
            });
        });
    }
}
// Show thread information modal
function showThreadInfo(threadId) {
    const thread = state.threads.find(t => t.id === threadId);
    if (!thread) return;
    
    elements.modalTitle.textContent = `Thread ${thread.id} Information`;
    
    let stateText = '';
    switch (thread.state) {
        case ThreadState.READY:
            stateText = '<span style="color: var(--ready-color);">Ready</span>';
            break;
        case ThreadState.RUNNING:
            stateText = '<span style="color: var(--running-color);">Running</span>';
            break;
        case ThreadState.BLOCKED:
            stateText = '<span style="color: var(--warning-color);">Blocked</span>';
            break;
        case ThreadState.TERMINATED:
            stateText = '<span style="color: var(--danger-color);">Terminated</span>';
            break;
    }
    
    const kernelThreadId = 
        state.model === 'one-to-many' ? thread.id : 
        state.threadKernelMapping[thread.id];
    
    elements.modalBody.innerHTML = `
        <div>
            <p><strong>State:</strong> ${stateText}</p>
            <p><strong>Progress:</strong> ${thread.progress} / ${thread.totalWork} cycles (${Math.round((thread.progress / thread.totalWork) * 100)}%)</p>
            <p><strong>Current CPU Time:</strong> ${thread.cpuTime} cycles</p>
            <p><strong>Kernel Thread ID:</strong> ${kernelThreadId}</p>
            ${thread.state === ThreadState.BLOCKED ? 
                `<p><strong>Blocked Time:</strong> ${thread.blockedTime} / ${thread.blockDuration} cycles</p>` : 
                ''}
        </div>
    `;
    
    showModal(elements.infoModal);
}

// Show info modal with custom content
function showInfoModal(title, content) {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = content;
    showModal(elements.infoModal);
}

// Show help modal
function showHelpModal() {
    showModal(elements.helpModal);
}

// Show modal
function showModal(modal) {
    modal.classList.add('show');
}

// Hide info modal
function hideInfoModal() {
    elements.infoModal.classList.remove('show');
}

// Hide help modal
function hideHelpModal() {
    elements.helpModal.classList.remove('show');
}
