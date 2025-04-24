// Paramètres par défaut
const defaultSettings = {
    autoCleanEnabled: true,
    cleanTypes: {
        cookies: true,
        cache: true,
        history: true,
        localStorage: true
    },
    importantSites: [
        'mail.google.com',
        'outlook.com',
        'github.com',
        'linkedin.com',
        'banking'
    ]
};

// Classe pour gérer les paramètres
class SettingsManager {
    constructor() {
        this.settings = JSON.parse(JSON.stringify(defaultSettings)); // Deep copy
        this.initUI();
        this.loadSettings();
    }

    initUI() {
        // Références aux éléments du DOM
        this.autoCleanCheckbox = document.getElementById('autoCleanEnabled');
        this.cleanCookiesCheckbox = document.getElementById('cleanCookies');
        this.cleanCacheCheckbox = document.getElementById('cleanCache');
        this.cleanHistoryCheckbox = document.getElementById('cleanHistory');
        this.cleanLocalStorageCheckbox = document.getElementById('cleanLocalStorage');
        
        this.importantSitesContainer = document.getElementById('importantSites');
        this.newSiteInput = document.getElementById('newSite');
        this.addSiteButton = document.getElementById('addSite');
        
        this.saveButton = document.getElementById('saveSettings');
        this.statusDiv = document.getElementById('status');
        
        // Attache des événements
        this.saveButton.addEventListener('click', () => this.saveSettings());
        this.addSiteButton.addEventListener('click', () => this.addImportantSite());
    }

    // Charge les paramètres depuis le stockage
    async loadSettings() {
        try {
            const data = await chrome.storage.local.get('settings');
            if (data.settings) {
                this.settings = data.settings;
            }
            this.updateUI();
        } catch (error) {
            this.showStatus('Erreur lors du chargement des paramètres: ' + error.message, 'error');
        }
    }

    // Met à jour l'interface avec les paramètres chargés
    updateUI() {
        this.autoCleanCheckbox.checked = this.settings.autoCleanEnabled;
        this.cleanCookiesCheckbox.checked = this.settings.cleanTypes.cookies;
        this.cleanCacheCheckbox.checked = this.settings.cleanTypes.cache;
        this.cleanHistoryCheckbox.checked = this.settings.cleanTypes.history;
        this.cleanLocalStorageCheckbox.checked = this.settings.cleanTypes.localStorage;
        
        // Mise à jour de la liste des sites importants
        this.importantSitesContainer.innerHTML = '';
        this.settings.importantSites.forEach(site => {
            this.addSiteToUI(site);
        });
    }

    // Ajoute un site à l'interface
    addSiteToUI(site) {
        const siteDiv = document.createElement('div');
        siteDiv.className = 'site-item';
        siteDiv.innerHTML = `
            <span>${site}</span>
            <button class="remove-site" data-site="${site}">✕</button>
        `;
        
        this.importantSitesContainer.appendChild(siteDiv);
        
        // Ajout de l'événement pour supprimer un site
        siteDiv.querySelector('.remove-site').addEventListener('click', (e) => {
            const siteToRemove = e.target.getAttribute('data-site');
            this.removeImportantSite(siteToRemove);
        });
    }

    // Ajoute un nouveau site important
    addImportantSite() {
        const site = this.newSiteInput.value.trim();
        if (site && !this.settings.importantSites.includes(site)) {
            this.settings.importantSites.push(site);
            this.addSiteToUI(site);
            this.newSiteInput.value = '';
        }
    }

    // Supprime un site important
    removeImportantSite(site) {
        this.settings.importantSites = this.settings.importantSites.filter(s => s !== site);
        this.updateUI();
    }

    // Enregistre les paramètres
    async saveSettings() {
        try {
            // Mise à jour des paramètres depuis l'interface
            this.settings.autoCleanEnabled = this.autoCleanCheckbox.checked;
            this.settings.cleanTypes.cookies = this.cleanCookiesCheckbox.checked;
            this.settings.cleanTypes.cache = this.cleanCacheCheckbox.checked;
            this.settings.cleanTypes.history = this.cleanHistoryCheckbox.checked;
            this.settings.cleanTypes.localStorage = this.cleanLocalStorageCheckbox.checked;
            
            // Enregistrement dans le stockage
            await chrome.storage.local.set({ settings: this.settings });
            this.showStatus('Paramètres enregistrés avec succès', 'success');
        } catch (error) {
            this.showStatus('Erreur lors de l\'enregistrement des paramètres: ' + error.message, 'error');
        }
    }

    // Affiche un message de statut
    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status ${type}`;
        
        // Masquer le message après quelques secondes si c'est un succès
        if (type === 'success') {
            setTimeout(() => {
                this.statusDiv.className = 'status';
            }, 3000);
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});