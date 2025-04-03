# CODE STRUCTURE
frontend
|--index.html
|--style.css
|--js/
    ├── element.js
    │   ├── config          # Configuration panel and settings
    │   └── model-mappings  # Model-specific mapping logic
    ├── simulation.js 
    │   |─ scheduler        # Scheduling algorithms
    ├── ui.js
    │   ├── dashboard       # Dashboard UI updates
    │   ├── visualization   # Visualization rendering
    │   ├── modals          # Modal dialogs
    │   └── theme           # Theme management
    ├── event.js
    │── state.js        
    └── main.js 


# Thread Model Simulator
The Thread Model Simulator is an interactive educational tool designed to visualize and demonstrate three fundamental threading models used in operating systems:
- Many-to-One (M:1)
- One-to-Many (1:N)
- Many-to-Many (M:N)

This simulation provides real-time visualization of thread scheduling, execution states, and CPU utilization across these different threading architectures.

# Key Features
Simulation Capabilities
-Configurable number of user threads (1-50)

-Adjustable CPU cores (1-16)

-Customizable time quantum for scheduling

-Real-time clock cycle progression

# Visualization Components
Dynamic thread state tracking (Ready, Running, Blocked, Terminated)
Detailed thread inspection panels

# Download the project files
Open index.html in any supported browser
# download repo
bash
Copy
git clone https://github.com/echoabhinav/thread-model-simulator.git
cd thread-model-simulator

# Usage Instructions
--Configuration Panel
Select threading model from dropdown

Set desired number of threads (1-50)

Configure available CPU cores (1-16)

Adjust time quantum (1-20 clock cycles)

Click "Start Simulation"
