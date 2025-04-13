function updateUI() {
    if (state.model) {
        let modelName = '';
        switch (state.model) {
            case 'many-to-one':
                modelName = 'Many-to-One (M:1)';
                break;
            case 'one-to-many':
                modelName = 'One-to-Many (1:N)';
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

    updateCpuUtilizationUI();
    
    updateCpuVisualizationUI();
    
    updateThreadVisualizationUI();
    
    updateModelVisualizationUI();
}
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
