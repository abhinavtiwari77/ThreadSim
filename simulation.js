function initializeSimulation() {
    state.clockCycles = 0;
    state.isRunning = false;
    state.threads = [];
    state.cpus = [];
    state.threadKernelMapping = {};
    state.kernelCpuMapping = {};
    
    // Create threads
    for (let i = 0; i < state.threadCount; i++) {
        state.threads.push({
            id: i,
            state: ThreadState.READY,
            progress: 0,
            totalWork: Math.floor(Math.random() * 50) + 30, 
            cpuTime: 0,
            blockProbability: 0.05, 
            blockDuration: Math.floor(Math.random() * 10) + 5,
            blockedTime: 0,
            kernelThreadId: null
        });
    }
    
    // Create CPU
    for (let i = 0; i < state.cpuCount; i++) {
        state.cpus.push({
            id: i,
            threadId: null,
            utilization: 0,
            totalCycles: 0,
            activeCycles: 0
        });
    }
    
    setupModelMappings();
}

function setupModelMappings() {
    switch (state.model) {
        case 'many-to-one':
            for (let i = 0; i < state.threads.length; i++) {
                state.threadKernelMapping[i] = 0;
            }
            state.kernelCpuMapping[0] = Array.from({ length: state.cpuCount }, (_, i) => i);
            break;
            
        case 'one-to-many':
            for (let i = 0; i < state.threads.length; i++) {
                state.threads[i].kernelThreadId = i;
                state.kernelCpuMapping[i] = Array.from({ length: state.cpuCount }, (_, j) => j);
            }
            break;
            
        case 'many-to-many':
            const kernelThreadCount = Math.max(Math.ceil(state.threadCount / 2), state.cpuCount);
            for (let i = 0; i < state.threads.length; i++) {
                state.threadKernelMapping[i] = i % kernelThreadCount;
            }
            for (let i = 0; i < kernelThreadCount; i++) {
                state.kernelCpuMapping[i] = Array.from({ length: state.cpuCount }, (_, j) => j);
            }
            break;
    }
}
// Process thread transition...
