// Global state
const state = {
    model: null,
    threadCount: 0,
    cpuCount: 0,
    timeQuantum: 0,
    clockCycles: 0,
    isRunning: false,
    interval: null,
    threads: [],
    cpus: [],
    threadKernelMapping: {},
    kernelCpuMapping: {}
};

// Thread states
const ThreadState = {
    READY: 'ready',
    RUNNING: 'running',
    BLOCKED: 'blocked',
    TERMINATED: 'terminated'
};
