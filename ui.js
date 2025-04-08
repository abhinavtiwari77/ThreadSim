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
