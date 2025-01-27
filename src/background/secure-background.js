class SecurePrivacyManager {
    constructor() {
        this.initializeStorage();
        this.setupListeners();
        this.stats = {
            protectedSites: 0,
            cleanedTraces: 0,
            lastCleanup: null
        };
    }

    // Initialisation du stockage
    async initializeStorage() {
        const stored = await chrome.storage.local.get('stats');
        if (stored.stats) {
            this.stats = stored.stats;
        }
    }

    // Configuration des écouteurs d'événements
    setupListeners() {
        chrome.tabs.onRemoved.addListener((tabId) => this.handleTabClose(tabId));
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => 
            this.handleMessage(message, sender, sendResponse));
        chrome.webNavigation.onCompleted.addListener((details) => 
            this.handleNavigation(details));
    }

    // Gestion de la fermeture des onglets
    async handleTabClose(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab && tab.url) {
                await this.cleanTraces(tab.url);
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture de l\'onglet:', error);
        }
    }

    // Analyse de l'importance d'un site
    analyzeImportance(url) {
        const hostname = new URL(url).hostname;
        const importantDomains = [
            'mail.google.com',
            'github.com',
            'banking'
        ];
        
        return importantDomains.some(domain => hostname.includes(domain));
    }

    // Nettoyage intelligent des traces
    async cleanTraces(url) {
        const isImportant = this.analyzeImportance(url);
        
        const options = {
            since: Date.now() - (24 * 60 * 60 * 1000), // Dernières 24h
            originTypes: {
                unprotectedWeb: true
            }
        };

        const dataTypes = {
            cache: true,
            cookies: !isImportant,
            downloads: true,
            formData: !isImportant,
            history: !isImportant,
            localStorage: !isImportant
        };

        try {
            await chrome.browsingData.remove(options, dataTypes);
            
            // Mise à jour des statistiques
            this.stats.cleanedTraces++;
            this.stats.lastCleanup = Date.now();
            await this.updateStats();
            
            return { success: true };
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
            return { success: false, error: error.message };
        }
    }

    // Gestion de la navigation
    async handleNavigation(details) {
        if (details.frameId === 0) { // Page principale uniquement
            this.stats.protectedSites++;
            await this.updateStats();
        }
    }

    // Mise à jour des statistiques
    async updateStats() {
        try {
            await chrome.storage.local.set({ stats: this.stats });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des stats:', error);
        }
    }

    // Obtention des statistiques détaillées
    async getDetailedStats() {
        return {
            cookiesRemoved: this.stats.cleanedTraces,
            cacheCleared: this.stats.cleanedTraces,
            sitesAnalyzed: this.stats.protectedSites,
            lastCleanup: this.stats.lastCleanup
        };
    }

    // Gestion des messages de l'interface
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'cleanTraces':
                    const result = await this.cleanTraces('manual');
                    sendResponse(result);
                    break;
                    
                case 'getDetailedStats':
                    const stats = await this.getDetailedStats();
                    sendResponse(stats);
                    break;
                    
                default:
                    sendResponse({ error: 'Action inconnue' });
            }
        } catch (error) {
            sendResponse({ error: error.message });
        }
        return true;
    }
}

// Création et initialisation du gestionnaire
const privacyManager = new SecurePrivacyManager();