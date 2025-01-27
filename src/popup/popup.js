// Gestionnaire d'état et d'interface
class PopupManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadStats();
    }

    // Initialise les références aux éléments du DOM
    initializeElements() {
        this.cleanButton = document.getElementById('cleanNow');
        this.statsButton = document.getElementById('viewStats');
        this.settingsButton = document.getElementById('settings');
        this.statusDiv = document.getElementById('status');
        this.protectedSitesSpan = document.getElementById('protectedSites');
        this.cleanedTracesSpan = document.getElementById('cleanedTraces');
    }

    // Attache les écouteurs d'événements
    attachEventListeners() {
        this.cleanButton.addEventListener('click', () => this.handleClean());
        this.statsButton.addEventListener('click', () => this.handleViewStats());
        this.settingsButton.addEventListener('click', () => this.handleSettings());
    }

    // Charge les statistiques depuis le stockage
    async loadStats() {
        try {
            const stats = await chrome.storage.local.get('stats');
            if (stats && stats.stats) {
                this.updateStatsDisplay(stats.stats);
            } else {
                // Si pas de stats, initialiser avec des valeurs par défaut
                const defaultStats = {
                    protectedSites: 0,
                    cleanedTraces: 0
                };
                await chrome.storage.local.set({ stats: defaultStats });
                this.updateStatsDisplay(defaultStats);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            this.showStatus('Erreur lors du chargement des statistiques', 'warning');
        }
    }

    // Met à jour l'affichage des statistiques
    updateStatsDisplay(stats) {
        if (this.protectedSitesSpan) {
            this.protectedSitesSpan.textContent = stats.protectedSites || 0;
        }
        if (this.cleanedTracesSpan) {
            this.cleanedTracesSpan.textContent = stats.cleanedTraces || 0;
        }
    }

    // Gère le nettoyage
    async handleClean() {
        try {
            this.cleanButton.disabled = true;
            this.showStatus('Nettoyage en cours...', 'info');

            const result = await chrome.runtime.sendMessage({
                action: 'cleanTraces'
            });

            if (result && result.success) {
                this.showStatus('Nettoyage terminé avec succès !', 'success');
                await this.loadStats(); // Recharge les statistiques
            } else {
                throw new Error(result ? result.error : 'Erreur inconnue');
            }
        } catch (error) {
            this.showStatus('Erreur lors du nettoyage : ' + error.message, 'warning');
        } finally {
            this.cleanButton.disabled = false;
        }
    }

    // Gère l'affichage des statistiques détaillées
    async handleViewStats() {
        try {
            const result = await chrome.runtime.sendMessage({
                action: 'getDetailedStats'
            });

            if (result) {
                const statsHtml = `
                    <div class="stats-detail">
                        <p>Cookies supprimés : ${result.cookiesRemoved || 0}</p>
                        <p>Cache nettoyé : ${result.cacheCleared || 0}</p>
                        <p>Sites analysés : ${result.sitesAnalyzed || 0}</p>
                        ${result.lastCleanup ? `<p>Dernier nettoyage : ${new Date(result.lastCleanup).toLocaleString()}</p>` : ''}
                    </div>
                `;
                this.statusDiv.innerHTML = statsHtml;
            } else {
                throw new Error('Pas de statistiques disponibles');
            }
        } catch (error) {
            this.showStatus('Erreur : ' + error.message, 'warning');
        }
    }

    // Gère l'ouverture des paramètres
    handleSettings() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            this.showStatus('Paramètres non disponibles', 'warning');
        }
    }

    // Affiche un message de statut
    showStatus(message, type = 'info') {
        if (this.statusDiv) {
            this.statusDiv.textContent = message;
            this.statusDiv.className = 'status ' + type;
            
            if (type === 'success') {
                setTimeout(() => {
                    if (this.statusDiv) {
                        this.statusDiv.textContent = '';
                        this.statusDiv.className = 'status';
                    }
                }, 3000);
            }
        }
    }
}

// Initialise le gestionnaire au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});