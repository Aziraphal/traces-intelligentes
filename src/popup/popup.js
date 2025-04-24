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
        this.loadingDiv = document.getElementById('loading');
        this.protectedSitesSpan = document.getElementById('protectedSites');
        this.cleanedTracesSpan = document.getElementById('cleanedTraces');
    }

    // Attache les écouteurs d'événements
    attachEventListeners() {
        this.cleanButton.addEventListener('click', () => this.handleClean());
        this.statsButton.addEventListener('click', () => this.handleViewStats());
        if (this.settingsButton) {
            this.settingsButton.addEventListener('click', () => this.handleSettings());
        }
    }

    // Charge les statistiques depuis le stockage
    async loadStats() {
        try {
            const stats = await chrome.storage.local.get('stats');
            if (stats && stats.stats) {
                this.updateStatsDisplay(stats.stats);
            } else {
                const defaultStats = { protectedSites: 0, cleanedTraces: 0 };
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
        this.protectedSitesSpan.textContent = stats.protectedSites || 0;
        this.cleanedTracesSpan.textContent = stats.cleanedTraces || 0;
    }

    // Gère le nettoyage avec gestion des erreurs
    async handleClean() {
        try {
            this.cleanButton.disabled = true;
            this.loadingDiv.style.display = "block"; // Afficher l'indicateur de chargement
            this.showStatus('Nettoyage en cours...', 'info');

            let timeout = setTimeout(() => {
                this.loadingDiv.style.display = "none";
                this.showStatus("Le nettoyage prend plus de temps que prévu...", "warning");
            }, 5000); // Timeout après 5 secondes

            // Envoi de la requête au background
            const result = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'cleanTraces' }, resolve);
            });

            clearTimeout(timeout); // Annuler le timeout

            this.loadingDiv.style.display = "none"; // Masquer l'indicateur de chargement

            if (result && result.success) {
                this.showStatus(`Nettoyage terminé ! Traces nettoyées : ${result.cleanedTraces}`, 'success');
                await this.loadStats(); // Mettre à jour l'affichage des stats
            } else {
                throw new Error(result ? result.error : 'Erreur inconnue');
            }
        } catch (error) {
            this.showStatus(`Erreur lors du nettoyage : ${error.message}`, 'warning');
        } finally {
            this.cleanButton.disabled = false;
        }
    }

    // Gère l'affichage des statistiques détaillées
    async handleViewStats() {
        try {
            const result = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'getDetailedStats' }, resolve);
            });

            if (result) {
                this.statusDiv.innerHTML = `
                    <div class="stats-detail">
                        <p>Cookies supprimés : ${result.cookiesRemoved || 0}</p>
                        <p>Cache nettoyé : ${result.cacheCleared || 0}</p>
                        <p>Sites analysés : ${result.sitesAnalyzed || 0}</p>
                        ${result.lastCleanup ? `<p>Dernier nettoyage : ${new Date(result.lastCleanup).toLocaleString()}</p>` : ''}
                    </div>
                `;
                this.statusDiv.className = 'status info';
                this.statusDiv.style.display = "block";
            } else {
                throw new Error('Pas de statistiques disponibles');
            }
        } catch (error) {
            this.showStatus(`Erreur : ${error.message}`, 'warning');
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
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status ${type}`;
        this.statusDiv.style.display = "block";

        if (type === 'success') {
            setTimeout(() => {
                this.statusDiv.textContent = '';
                this.statusDiv.className = 'status';
                this.statusDiv.style.display = "none";
            }, 3000);
        }
    }
}

// Initialise le gestionnaire au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});