import React, { useState, useEffect, useRef } from 'react';

const UbuntuTerminal = () => {
  const [commands, setCommands] = useState([
    { input: 'ls -la', output: 'total 8\ndrwxr-xr-x 2 user user 4096 Jan 15 10:30 .\ndrwxr-xr-x 3 user user 4096 Jan 15 10:30 ..\n-rw-r--r-- 1 user user  220 Jan 15 10:30 .bash_logout\n-rw-r--r-- 1 user user 3771 Jan 15 10:30 .bashrc\n-rw-r--r-- 1 user user  807 Jan 15 10:30 .profile', type: 'command' },
    { input: 'pwd', output: '/home/user', type: 'command' },
    { input: 'whoami', output: 'user', type: 'command' },
    { input: 'echo "Welcome to CodeCohort!"', output: 'Welcome to CodeCohort!', type: 'command' },
    { input: 'cat /etc/os-release', output: 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 22.04.3 LTS"\nVERSION_ID="22.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\nPRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\nVERSION_CODENAME=jammy\nUBUNTU_CODENAME=jammy', type: 'command' },
    { input: 'neofetch', output: '                    -`                    user@ubuntu\n                   .o+`                   --------\n                  `ooo/                   OS: Ubuntu 22.04.3 LTS x86_64\n                 `+oooo:                  Host: VirtualBox 1.2\n                `+oooooo:                 Kernel: 5.15.0-88-generic\n                -+oooooo+:                Uptime: 2 hours, 15 mins\n              `/:-:++oooo+:               Packages: 1234 (dpkg)\n             `/++++/+++++++:              Shell: bash 5.1.16\n            `/++++++++++++++:             CPU: Intel i7-8700K (8) @ 3.700GHz\n           `/+++ooooooooooooo/`          GPU: VMware SVGA 3D\n          ./ooosssso++osssssso+`         Memory: 2048MiB / 8192MiB\n         .oossssso-````/ossssss+`\n        -osssssso.      :ssssssso.\n       :osssssss/        osssso+++.\n      /ossssssss/        +ssssooo/-\n    `/ossssso+/:-        -:/+osssso+-\n   `+sso+:-`                 `.-/+oso:\n  `++:.                           `-/+/\n .`                                 `/\n', type: 'command' },
    { input: 'echo "Ready for next command..."', output: 'Ready for next command...', type: 'command' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      const newCommand = {
        input: currentCommand,
        output: `Command not found: ${currentCommand}`,
        type: 'command'
      };
      setCommands([...commands, newCommand]);
      setCurrentCommand('');
    }
  };

  return (
    <div className="ubuntu-terminal-container">
      {/* Terminal Window */}
      <div className="ubuntu-terminal">
        {/* Window Title Bar */}
        <div className="terminal-title-bar">
          <div className="terminal-buttons">
            <div className="terminal-button close"></div>
            <div className="terminal-button minimize"></div>
            <div className="terminal-button maximize"></div>
          </div>
          <div className="terminal-title">user@ubuntu: ~</div>
        </div>
        
        {/* Terminal Content */}
        <div className="terminal-content" ref={terminalRef}>
          <div className="terminal-header">
            <span className="prompt-user">user</span>
            <span className="prompt-at">@</span>
            <span className="prompt-host">ubuntu</span>
            <span className="prompt-colon">:</span>
            <span className="prompt-path">~</span>
            <span className="prompt-dollar">$</span>
          </div>
          
          {commands.map((cmd, index) => (
            <div key={index} className="command-block">
              <div className="command-input">
                <span className="prompt-user">user</span>
                <span className="prompt-at">@</span>
                <span className="prompt-host">ubuntu</span>
                <span className="prompt-colon">:</span>
                <span className="prompt-path">~</span>
                <span className="prompt-dollar">$</span>
                <span className="command-text">{cmd.input}</span>
              </div>
              <div className="command-output">
                <pre>{cmd.output}</pre>
              </div>
            </div>
          ))}
          
          {/* Current Command Line */}
          <div className="command-input current">
            <span className="prompt-user">user</span>
            <span className="prompt-at">@</span>
            <span className="prompt-host">ubuntu</span>
            <span className="prompt-colon">:</span>
            <span className="prompt-path">~</span>
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
    </div>
  );
};

export default UbuntuTerminal; 