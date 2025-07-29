import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Dashboard from './Dashboard';
import UserProfile from './UserProfile';
import Teams from './Teams';

const UbuntuDesktop = () => {
  const [commands, setCommands] = useState([
    { input: 'echo "Welcome to CodeCohort Ubuntu Desktop!"', output: 'Welcome to CodeCohort Ubuntu Desktop!', type: 'command' },
    { input: 'whoami', output: 'user', type: 'command' },
    { input: 'pwd', output: '/home/user/codecohort', type: 'command' },
    { input: 'ls', output: 'dashboard  teams  profile  terminal  logout  help  ls  pwd  whoami  status  about  problems', type: 'command' },
    { input: 'cat /etc/os-release', output: 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 22.04.3 LTS"\nVERSION_ID="22.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\nPRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\nVERSION_CODENAME=jammy\nUBUNTU_CODENAME=jammy', type: 'command' },
    { input: 'help', output: 'Available commands:\n  dashboard    - Navigate to Dashboard\n  teams       - View My Teams\n  profile      - Open User Profile\n  terminal     - Open terminal interface\n  logout       - Sign out of CodeCohort\n  status       - Show system status\n  about        - About CodeCohort\n  problems     - View available problems\n  clear        - Clear terminal\n  help         - Show this help message\n  ls           - List available commands\n  pwd          - Show current directory\n  whoami       - Show current user', type: 'command' },
    { input: 'echo "Type \'help\' to see all available navigation commands"', output: 'Type \'help\' to see all available navigation commands', type: 'command' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [showTerminal, setShowTerminal] = useState(true); // Show terminal by default
  const terminalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/teams') return 'teams';
    if (location.pathname === '/profile') return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();
  
  // Determine if terminal should be considered active
  const isTerminalActive = showTerminal && activeTab === 'dashboard';

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  const handleCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case 'dashboard':
        navigate('/dashboard');
        setShowTerminal(false);
        return 'Navigating to Dashboard...';
      
      case 'teams':
        navigate('/teams');
        setShowTerminal(false);
        return 'Navigating to My Teams...';
      
      case 'profile':
        navigate('/profile');
        setShowTerminal(false);
        return 'Opening User Profile...';
      
      case 'logout':
        logout();
        navigate('/');
        return 'Logging out...';
      
      case 'terminal':
        setShowTerminal(true);
        // If we're not on dashboard, navigate there first
        if (activeTab !== 'dashboard') {
          navigate('/dashboard');
        }
        return 'Opening terminal...';
      
      case 'status':
        return `CodeCohort System Status:\n  ✅ Server: Online\n  ✅ Database: Connected\n  ✅ Authentication: Active\n  ✅ User: ${activeTab}\n  ✅ Terminal: ${showTerminal ? 'Open' : 'Closed'}\n  📊 Active Users: 1,247\n  🚀 System Uptime: 99.9%`;
      
      case 'about':
        return `CodeCohort v1.0.0\n\nA collaborative coding platform designed for developers.\n\nFeatures:\n  • Ubuntu-inspired interface\n  • Terminal-based navigation\n  • Team collaboration tools\n  • Real-time project management\n  • Developer-friendly environment\n\nMade with ❤️ by Shlok Garg & Shashank Rai`;
      
      case 'problems':
        return `Available Problems:\n\n1. E-commerce Analytics Dashboard\n   - React, Node.js, MongoDB, Chart.js\n   - 3/5 members\n\n2. AI-Powered Code Review Tool\n   - Python, TensorFlow, FastAPI, Docker\n   - 2/4 members\n\n3. Real-time Collaboration Platform\n   - Vue.js, Socket.io, Express, Redis\n   - 1/6 members\n\n4. Mobile App Performance Monitor\n   - React Native, Firebase, AWS, GraphQL\n   - 4/5 members\n\n5. Blockchain-based Voting System\n   - Solidity, Web3.js, Ethereum, IPFS\n   - 2/6 members\n\n6. IoT Smart Home Controller\n   - Python, Raspberry Pi, MQTT, TensorFlow\n   - 3/4 members\n\nType 'join <problem_number>' to join a team.`;
      
      case 'clear':
        setCommands([]);
        return '';
      
      case 'help':
        return 'Available commands:\n  dashboard    - Navigate to Dashboard\n  teams       - View My Teams\n  profile      - Open User Profile\n  terminal     - Open terminal interface\n  logout       - Sign out of CodeCohort\n  status       - Show system status\n  about        - About CodeCohort\n  problems     - View available problems\n  clear        - Clear terminal\n  help         - Show this help message\n  ls           - List available commands\n  pwd          - Show current directory\n  whoami       - Show current user';
      
      case 'ls':
        return 'dashboard  teams  profile  terminal  logout  help  ls  pwd  whoami  status  about  problems';
      
      case 'pwd':
        return '/home/user/codecohort';
      
      case 'whoami':
        return 'user';
      
      default:
        if (cmd.startsWith('join ')) {
          const problemNum = cmd.split(' ')[1];
          return `Joining problem ${problemNum}...\n✅ Successfully joined team!\n📧 Check your email for team details.`;
        }
        return `Command not found: ${command}. Type 'help' for available commands.`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      const output = handleCommand(currentCommand);
      const newCommand = {
        input: currentCommand,
        output: output,
        type: 'command'
      };
      setCommands([...commands, newCommand]);
      setCurrentCommand('');
    }
  };

  const handleTabClick = (tab) => {
    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        setShowTerminal(false);
        break;
      case 'teams':
        navigate('/teams');
        setShowTerminal(false);
        break;
      case 'profile':
        navigate('/profile');
        setShowTerminal(false);
        break;
      case 'terminal':
        setShowTerminal(true);
        // If we're not on dashboard, navigate there first
        if (activeTab !== 'dashboard') {
          navigate('/dashboard');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="ubuntu-desktop">
      {/* Left Taskbar */}
      <div className="ubuntu-taskbar">
        <div className="taskbar-header">
          <div className="ubuntu-logo">
            <span className="ubuntu-icon">🐧</span>
            <span className="ubuntu-text">CodeCohort</span>
          </div>
        </div>
        
        <div className="taskbar-items">
          <div 
            className={`taskbar-item ${activeTab === 'dashboard' && !showTerminal ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <span className="taskbar-icon">📊</span>
            <span className="taskbar-label">Dashboard</span>
          </div>
          
          <div 
            className={`taskbar-item ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => handleTabClick('teams')}
          >
            <span className="taskbar-icon">👥</span>
            <span className="taskbar-label">My Teams</span>
          </div>
          
          <div 
            className={`taskbar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabClick('profile')}
          >
            <span className="taskbar-icon">👤</span>
            <span className="taskbar-label">Profile</span>
          </div>
          
          <div 
            className={`taskbar-item ${isTerminalActive ? 'active' : ''}`}
            onClick={() => handleTabClick('terminal')}
          >
            <span className="taskbar-icon">💻</span>
            <span className="taskbar-label">Terminal</span>
          </div>
        </div>
        
        <div className="taskbar-footer">
          <div 
            className="taskbar-item logout"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <span className="taskbar-icon">🚪</span>
            <span className="taskbar-label">Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ubuntu-main-area">
        {showTerminal ? (
          <div className="terminal-window">
            <div className="terminal-title-bar">
              <div className="terminal-buttons">
                <div className="terminal-button close" onClick={() => setShowTerminal(false)}></div>
                <div className="terminal-button minimize"></div>
                <div className="terminal-button maximize"></div>
              </div>
              <div className="terminal-title">
              user@codecohort: {activeTab === 'dashboard' ? '~/dashboard' : activeTab === 'teams' ? '~/teams' : activeTab === 'profile' ? '~/profile' : '~'}
            </div>
            </div>
            
            <div className="terminal-content" ref={terminalRef}>
                          <div className="terminal-header">
              <span className="prompt-user">user</span>
              <span className="prompt-at">@</span>
              <span className="prompt-host">codecohort</span>
              <span className="prompt-colon">:</span>
              <span className="prompt-path">{activeTab === 'dashboard' ? '~/dashboard' : activeTab === 'teams' ? '~/teams' : activeTab === 'profile' ? '~/profile' : '~'}</span>
              <span className="prompt-dollar">$</span>
            </div>
              
              {commands.map((cmd, index) => (
                <div key={index} className="command-block">
                  <div className="command-input">
                    <span className="prompt-user">user</span>
                    <span className="prompt-at">@</span>
                    <span className="prompt-host">codecohort</span>
                    <span className="prompt-colon">:</span>
                    <span className="prompt-path">~</span>
                    <span className="prompt-dollar">$</span>
                    <span className="command-text">{cmd.input}</span>
                  </div>
                  {cmd.output && (
                    <div className="command-output">
                      <pre>{cmd.output}</pre>
                    </div>
                  )}
                </div>
              ))}
              
                          {/* Current Command Line */}
            <div className="command-input current">
              <span className="prompt-user">user</span>
              <span className="prompt-at">@</span>
              <span className="prompt-host">codecohort</span>
              <span className="prompt-colon">:</span>
              <span className="prompt-path">{activeTab === 'dashboard' ? '~/dashboard' : activeTab === 'teams' ? '~/teams' : activeTab === 'profile' ? '~/profile' : '~'}</span>
              <span className="prompt-dollar">$</span>
              <input
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                className="command-input-field"
                placeholder=""
                autoFocus
              />
              <span className="cursor">|</span>
            </div>
            </div>
          </div>
        ) : (
          <div className="content-window">
            <div className="content-title-bar">
              <div className="content-title">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'teams' && 'My Teams'}
                {activeTab === 'profile' && 'User Profile'}
              </div>
            </div>
            
            <div className="content-area">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'teams' && <Teams />}
              {activeTab === 'profile' && <UserProfile />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UbuntuDesktop; 