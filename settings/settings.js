class Settings {
    constructor() {
        this.settingsKey = 'novaSettings';
        this.defaultSettings = {
            searchAppsEnabled: true
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    loadSettings() {
        const saved = localStorage.getItem(this.settingsKey);
        this.settings = saved ? JSON.parse(saved) : this.defaultSettings;
        
        // Update UI
        document.getElementById('searchAppsToggle').checked = this.settings.searchAppsEnabled;
    }

    saveSettings() {
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    }

    setupEventListeners() {
        // Add event listeners here
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.novaSettings = new Settings();
});