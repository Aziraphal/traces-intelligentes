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
 
    async initializeStorage() {
        const stored = await chrome.storage.local.get('stats');
        if (stored.stats) {
            this.stats = stored.stats;
        }
    }
 
    setupListeners() {
        // Stockez les informations des onglets avant leur fermeture
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => this.handleTabClose(tabId, removeInfo));
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => 
            this.handleMessage(message, sender, sendResponse));
        chrome.webNavigation.onCompleted.addListener((details) => 
            this.handleNavigation(details));
    }
 
    async cleanTraces(url) {
        console.log("Début du nettoyage...");
 
        // Si l'URL est null ou undefined, ne pas essayer d'analyser son importance
        const isImportant = url ? this.analyzeImportance(url) : false;
        
        const options = {
            since: Date.now() - (24 * 60 * 60 * 1000),
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
            
            this.stats.cleanedTraces++;
            this.stats.lastCleanup = Date.now();
            await this.updateStats();
 
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Nettoyage terminé',
                message: 'Les traces de navigation ont été nettoyées.'
            });
 
            return { success: true, cleanedTraces: this.stats.cleanedTraces };
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
 
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Erreur de nettoyage',
                message: 'Une erreur est survenue lors du nettoyage.'
            });
 
            return { success: false, error: error.message };
        }
    }
 
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'cleanTraces':
                    console.log("Action reçue : Nettoyage");
                    const result = await this.cleanTraces('manual');
                    sendResponse(result);
                    break;
 
                case 'getDetailedStats':
                    console.log("Action reçue : Récupération des stats");
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
 
    async updateStats() {
        try {
            await chrome.storage.local.set({ stats: this.stats });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des stats:', error);
        }
    }
 
    async getDetailedStats() {
        return {
            cookiesRemoved: this.stats.cleanedTraces,
            cacheCleared: this.stats.cleanedTraces,
            sitesAnalyzed: this.stats.protectedSites,
            lastCleanup: this.stats.lastCleanup
        };
    }
 
    analyzeImportance(url) {
        if (!url) return false;
 
        try {
            const hostname = new URL(url).hostname;
            return ["mail.google.com", "github.com", "banking"].some(domain => hostname.includes(domain));
        } catch (error) {
            console.error('Erreur lors de l\'analyse d\'importance:', error);
            return false;
        }
    }
 
    // Modification ici : utiliser les informations de removeInfo au lieu de chercher l'onglet
    async handleTabClose(tabId, removeInfo) {
        try {
            // Vous n'avez pas besoin d'obtenir des informations sur l'onglet
            // car il est déjà fermé. À la place, effectuez un nettoyage général.
            await this.cleanTraces(null);
            this.stats.protectedSites++;
            await this.updateStats();
        } catch (error) {
            console.error('Erreur lors de la fermeture de l\'onglet:', error);
        }
    }
 
    async handleNavigation(details) {
        if (details.frameId !== 0) return;
 
        try {
            // Ici, on peut obtenir l'onglet car il est encore ouvert
            const tab = await chrome.tabs.get(details.tabId);
            if (tab && tab.url) {
                const isImportant = this.analyzeImportance(tab.url);
                this.stats.protectedSites++;
                await this.updateStats();
 
                if (!isImportant) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: 'Protection active',
                        message: 'Le nettoyage automatique est activé pour ce site.',
                        priority: 0
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la navigation:', error);
        }
    }
 }
 
 const privacyManager = new SecurePrivacyManager();