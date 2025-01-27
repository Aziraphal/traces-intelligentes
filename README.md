# Documentation Traces Intelligentes

## Guide Utilisateur

### Installation et démarrage
1. **Installation depuis le code source**
   - Téléchargez le code depuis GitHub
   - Décompressez le fichier
   - Dans Chrome, allez dans `chrome://extensions/`
   - Activez le mode développeur
   - Cliquez "Charger l'extension non empaquetée"
   - Sélectionnez le dossier décompressé

2. **Configuration initiale**
   - Cliquez sur l'icône de l'extension
   - Configurez vos sites importants
   - Définissez vos préférences de nettoyage

### Utilisation quotidienne

1. **Surveillance automatique**
   - L'extension analyse automatiquement votre navigation
   - Elle identifie les sites fréquents
   - Elle détecte les formulaires importants

2. **Nettoyage intelligent**
   - Automatique à la fermeture des onglets
   - Préserve les données importantes
   - Supprime les traces non essentielles

3. **Statistiques et contrôle**
   - Visualisez vos statistiques de navigation
   - Consultez les sites protégés
   - Effectuez un nettoyage manuel si nécessaire

## Guide du Développeur

### Architecture du projet

```
src/
├── background/
│   ├── analyzer.js    # Analyse de navigation
│   ├── cleaner.js     # Logique de nettoyage
│   └── storage.js     # Gestion du stockage
├── popup/
│   ├── components/    # Composants UI
│   ├── styles/        # Fichiers CSS
│   └── utils/         # Utilitaires
└── shared/           # Code partagé
```

### Installation de l'environnement de développement

1. **Prérequis**
   ```bash
   node -v  # Vérifiez Node.js >= 14
   npm -v   # Vérifiez npm >= 6
   ```

2. **Installation des dépendances**
   ```bash
   npm install
   ```

3. **Lancement en mode développement**
   ```bash
   npm run dev
   ```

### Guide de contribution

1. **Configuration du projet**
   ```bash
   git clone https://github.com/votre-nom/traces-intelligentes.git
   cd traces-intelligentes
   npm install
   ```

2. **Standards de code**
   - Utilisez ESLint pour la cohérence du code
   - Suivez les règles Prettier configurées
   - Commentez le code en français
   - Utilisez JSDoc pour la documentation

3. **Tests**
   ```bash
   # Lancer tous les tests
   npm test
   
   # Lancer les tests d'un composant spécifique
   npm test -- --grep "Nom du test"
   ```

4. **Pull Requests**
   - Créez une branche par fonctionnalité
   - Suivez le template de PR fourni
   - Assurez-vous que les tests passent
   - Attendez la review d'un mainteneur

### API et Hooks

1. **Analyseur de navigation**
   ```javascript
   class NavigationAnalyzer {
     // Analyse une nouvelle visite
     analyzeVisit(url, timestamp) { }
     
     // Vérifie l'importance d'un site
     checkImportance(url) { }
     
     // Récupère les statistiques
     getStats() { }
   }
   ```

2. **Gestionnaire de nettoyage**
   ```javascript
   class CleaningManager {
     // Configure les règles de nettoyage
     setRules(rules) { }
     
     // Effectue un nettoyage intelligent
     smartClean(url) { }
     
     // Force un nettoyage complet
     forceClean() { }
   }
   ```

### Événements et messages

1. **Communication entre les scripts**
   ```javascript
   // Dans background.js
   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
     if (message.type === 'CLEAN_REQUEST') {
       // Traitement du nettoyage
     }
   });
   
   // Dans popup.js
   chrome.runtime.sendMessage({
     type: 'CLEAN_REQUEST',
     data: { /* ... */ }
   });
   ```

2. **Écouteurs d'événements**
   ```javascript
   // Fermeture d'onglet
   chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
     // Logique de nettoyage
   });
   
   // Soumission de formulaire
   chrome.webNavigation.onCompleted.addListener((details) => {
     // Analyse du formulaire
   });
   ```

### Personnalisation

1. **Configuration des sites**
   ```javascript
   const config = {
     sites: {
       "exemple.com": {
         importance: "high",
         keepData: ["cookies", "forms"]
       }
     },
     rules: {
       cleanOnClose: true,
       preserveLogin: true
     }
   };
   ```

2. **Styles personnalisés**
   ```css
   /* Dans styles/custom.css */
   .privacy-monitor {
     /* Vos styles */
   }
   ```

## FAQ Développeurs

### Comment ajouter une nouvelle fonctionnalité ?
1. Créez une issue décrivant la fonctionnalité
2. Discutez de l'implémentation dans l'issue
3. Créez une branche et implémentez
4. Soumettez une PR avec tests

### Comment déboguer l'extension ?
1. Utilisez chrome://extensions
2. Activez "Developer mode"
3. Cliquez "Inspect views: background page"
4. Utilisez les outils de développement Chrome

### Comment publier une mise à jour ?
1. Mettez à jour la version dans manifest.json
2. Créez un tag git
3. Générez le build de production
4. Soumettez au Chrome Web Store

## Sécurité

### Bonnes pratiques
- Validez toutes les entrées utilisateur
- Utilisez HTTPS pour les communications
- Minimisez les permissions requises
- Suivez le principe du moindre privilège

### Audit de sécurité
1. Examinez les dépendances régulièrement
2. Effectuez des tests de pénétration
3. Vérifiez les bonnes pratiques OWASP
4. Documentez les problèmes de sécurité

## Support

### Canaux de communication
- GitHub Issues pour les bugs
- Discussions GitHub pour l'aide
- Wiki pour la documentation
- Email pour le support privé

### Signalement de bugs
1. Vérifiez les issues existantes
2. Utilisez le template de bug
3. Incluez les logs pertinents
4. Décrivez les étapes de reproduction
