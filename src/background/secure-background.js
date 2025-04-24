// Ce n'est pas le fichier complet mais uniquement la méthode handleMessage à vérifier

async handleMessage(message, sender, sendResponse) {
    try {
        switch (message.action) {
            case 'cleanTraces':
                console.log("Action reçue : Nettoyage");
                const result = await this.cleanTraces('manual');
                sendResponse(result);
                break;

            // Il n'y a pas de gestionnaire pour 'cleanNow', donc il faut utiliser 'cleanTraces'
            // dans vos appels de popup.js et popup.html

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