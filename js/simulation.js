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
function processThreadTransitions() {
    // Try to handle blocking/unblocking first
    processBlockedThreads();
    
    // Then handle scheduling
    scheduleThreads();
    
    // Finally update progress for running threads
    updateRunningThreads();
}

// Process blocked threads
function processBlockedThreads() {
    // Unblock threads that have waited long enough
    state.threads.forEach(thread => {
        if (thread.state === ThreadState.BLOCKED) {
            thread.blockedTime++;
            if (thread.blockedTime >= thread.blockDuration) {
                thread.state = ThreadState.READY;
                thread.blockedTime = 0;
                // Generate new block duration for next time
                thread.blockDuration = Math.floor(Math.random() * 10) + 5;
            }
        }
    });
    
    // Randomly block some running threads
    state.threads.forEach(thread => {
        if (thread.state === ThreadState.RUNNING && Math.random() < thread.blockProbability) {
            thread.state = ThreadState.BLOCKED;
            thread.blockedTime = 0;
            
            // Free up the CPU
            const cpu = state.cpus.find(cpu => cpu.threadId === thread.id);
            if (cpu) {
                cpu.threadId = null;
            }
        }
    });
}

// Schedule threads based on the threading model
function scheduleThreads() {
    switch (state.model) {
        case 'many-to-one':
            scheduleManyToOne();
            break;
        case 'one-to-many':
            scheduleOneToMany();
            break;
        case 'many-to-many':
            scheduleManyToMany();
            break;
    }
}

// Schedule for many-to-one model
function scheduleManyToOne() {
    // In many-to-one, we only have one kernel thread that can use one CPU at a time
    
    // Find if the kernel thread is already running on a CPU
    const runningCpu = state.cpus.find(cpu => cpu.threadId !== null);
    
    if (!runningCpu) {
        // Kernel thread is not running - find a ready thread to run
        const readyThread = state.threads.find(thread => thread.state === ThreadState.READY);
        
        if (readyThread) {
            // Schedule the thread on first available CPU
            const availableCpu = state.cpus.find(cpu => cpu.threadId === null);
            if (availableCpu) {
                readyThread.state = ThreadState.RUNNING;
                availableCpu.threadId = readyThread.id;
            }
        }
    } else {
        // Kernel thread is already running - check if we need to preempt
        const runningThread = state.threads.find(thread => thread.id === runningCpu.threadId);
        if (runningThread && runningThread.cpuTime >= state.timeQuantum) {
            // Time quantum expired, preempt the thread
            runningThread.state = ThreadState.READY;
            runningThread.cpuTime = 0;
            runningCpu.threadId = null;
            
            // Try to schedule another thread
            const nextThread = state.threads.find(thread => 
                thread.state === ThreadState.READY && thread.id !== runningThread.id
            );
            
            if (nextThread) {
                nextThread.state = ThreadState.RUNNING;
                runningCpu.threadId = nextThread.id;
            }
        }
    }
}

// Schedule for one-to-many model
function scheduleOneToMany() {
    // In one-to-many, each thread has its own kernel threads and can run on multiple CPUs
    
    // For each CPU, check if it needs a new thread
    state.cpus.forEach(cpu => {
        if (cpu.threadId === null) {
            // Find a ready thread that isn't already running on another CPU
            const readyThread = state.threads.find(thread => 
                thread.state === ThreadState.READY && 
                !state.cpus.some(c => c.threadId === thread.id)
            );
            
            if (readyThread) {
                readyThread.state = ThreadState.RUNNING;
                cpu.threadId = readyThread.id;
            }
        }
    });
    
    // Check for preemption based on time quantum
    state.cpus.forEach(cpu => {
        if (cpu.threadId !== null) {
            const thread = state.threads.find(t => t.id === cpu.threadId);
            if (thread && thread.cpuTime >= state.timeQuantum) {
                // Time quantum expired, preempt the thread
                thread.state = ThreadState.READY;
                thread.cpuTime = 0;
                cpu.threadId = null;
            }
        }
    });
}

// Schedule for many-to-many model
function scheduleManyToMany() {
    // Get unique kernel thread IDs from mapping
    const kernelThreadIds = [...new Set(Object.values(state.threadKernelMapping))];
    
    // Track which kernel threads are already running
    const runningKernelThreads = new Set();
    state.cpus.forEach(cpu => {
        if (cpu.threadId !== null) {
            const thread = state.threads.find(t => t.id === cpu.threadId);
            if (thread) {
                const kernelId = state.threadKernelMapping[thread.id];
                runningKernelThreads.add(kernelId);
            }
        }
    });
    
    // For each available CPU, try to schedule a thread
    state.cpus.forEach(cpu => {
        if (cpu.threadId === null) {
            // Find a kernel thread that's not running yet
            for (const kernelId of kernelThreadIds) {
                if (!runningKernelThreads.has(kernelId)) {
                    // Find a ready thread that maps to this kernel thread
                    const readyThread = state.threads.find(thread => 
                        thread.state === ThreadState.READY && 
                        state.threadKernelMapping[thread.id] === kernelId
                    );
                    
                    if (readyThread) {
                        readyThread.state = ThreadState.RUNNING;
                        cpu.threadId = readyThread.id;
                        runningKernelThreads.add(kernelId);
                        break;
                    }
                }
            }
        }
    });
    
    // Check for preemption based on time quantum
    state.cpus.forEach(cpu => {
        if (cpu.threadId !== null) {
            const thread = state.threads.find(t => t.id === cpu.threadId);
            if (thread && thread.cpuTime >= state.timeQuantum) {
                // Time quantum expired, preempt the thread
                thread.state = ThreadState.READY;
                thread.cpuTime = 0;
                cpu.threadId = null;
            }
        }
    });
}

// Update running threads' progress
function updateRunningThreads() {
    state.threads.forEach(thread => {
        if (thread.state === ThreadState.RUNNING) {
            thread.progress++;
            thread.cpuTime++;
            
            // Mark thread as terminated if it completed all work
            if (thread.progress >= thread.totalWork) {
                thread.state = ThreadState.TERMINATED;
                
                // Free up the CPU
                const cpu = state.cpus.find(cpu => cpu.threadId === thread.id);
                if (cpu) {
                    cpu.threadId = null;
                }
            }
        }
    });
}

// Update CPU states and utilization
function updateCpuStates() {
    state.cpus.forEach(cpu => {
        cpu.totalCycles++;
        if (cpu.threadId !== null) {
            cpu.activeCycles++;
        }
        cpu.utilization = (cpu.activeCycles / cpu.totalCycles) * 100;
    });
}

// Check if simulation is complete
function checkSimulationEnd() {
    const allTerminated = state.threads.every(thread => thread.state === ThreadState.TERMINATED);
    if (allTerminated) {
        // Stop simulation if running
        if (state.isRunning) {
            togglePlaySimulation();
        }
        
        // Show completion message
        showInfoModal('Simulation Complete', `
            <div>
                <p>All threads have completed execution after ${state.clockCycles} clock cycles.</p>
                <h4 style="margin-top: 15px;">CPU Utilization:</h4>
                <ul>
                    ${state.cpus.map(cpu => `
                        <li>CPU ${cpu.id}: ${cpu.utilization.toFixed(1)}%</li>
                    `).join('')}
                </ul>
            </div>
        `);
    }
}
