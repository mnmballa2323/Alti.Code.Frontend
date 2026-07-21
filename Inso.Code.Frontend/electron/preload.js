
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Add safe API exposures here
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron,
    },
    // Example IPC wrapper
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ['toMain', 'openwork:hitl-resolve'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ['fromMain', 'openwork:hitl-alert'];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    invoke: (channel, data) => {
        let validChannels = [
            'moltbot:set-key',
            'openwork:execute',
            'openclaw:fetch-skills',
            'openclaw:install-skill'
        ];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    }
});
