# Plateforme Unsloth Intégrée (Finetuning-as-a-Service)

Une plateforme complète pour l'affinage de modèles de langage avec Unsloth, offrant une expérience utilisateur fluide du traitement des données à l'inférence.

## Fonctionnalités

- **Installation automatisée** d'Unsloth et de ses dépendances
- **Détection automatique du hardware** (GPU/CPU, RAM, stockage)
- **Ingestion de données** depuis différentes sources (CSV, JSON, TXT)
- **Prétraitement des données** (nettoyage, tokenisation, structuration)
- **Orchestration du finetuning** avec Unsloth
- **Export de modèles** au format GGUF
- **Évaluation des performances** (perplexité, précision, BLEU)
- **Interface d'inférence** pour tester les modèles affinés

## Architecture

### Backend
- **FastAPI** : API REST pour l'orchestration
- **Unsloth** : Moteur de fine-tuning optimisé
- **SQLite** : Stockage des métadonnées

### Frontend
- **React** : Interface utilisateur
- **Tailwind CSS** : Styling
- **Chart.js** : Visualisation des métriques

## Prérequis

- Python 3.8+
- Node.js 16+
- GPU NVIDIA avec CUDA (recommandé) ou CPU puissant

## Installation

### Backend

1. Accédez au répertoire du backend :
   ```bash
   cd backend
   ```

2. Exécutez le script d'installation :
   ```bash
   python setup.py
   ```

3. Lancez le serveur :
   ```bash
   python run.py
   ```

### Frontend

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Utilisation

1. **Accédez à l'interface** : Ouvrez votre navigateur à l'adresse `http://localhost:5173`

2. **Configuration initiale** : Suivez l'assistant pour configurer Unsloth

3. **Ingestion de données** : Importez vos données depuis différentes sources

4. **Prétraitement** : Nettoyez et préparez vos données pour le fine-tuning

5. **Fine-tuning** : Configurez et lancez le processus d'affinage

6. **Évaluation** : Analysez les performances de votre modèle affiné

7. **Inférence** : Testez votre modèle avec différentes entrées

## Flux de travail

```
Upload données → Nettoyage → Formatage → Fine-tuning (Unsloth) → Export modèle → Évaluation → Inférence
```

## Structure du projet

```
project/
├── backend/                # Backend FastAPI
│   ├── app.py              # Application principale
│   ├── hardware_detection.py # Détection du hardware
│   ├── data_preprocessing.py # Prétraitement des données
│   ├── model_export.py     # Export de modèles
│   ├── model_evaluation.py # Évaluation de modèles
│   ├── install_unsloth.py  # Installation d'Unsloth
│   ├── setup.py            # Script d'installation
│   └── run.py              # Script de lancement
├── src/                    # Frontend React
│   ├── components/         # Composants React
│   ├── contexts/           # Contextes React
│   ├── pages/              # Pages de l'application
│   └── services/           # Services API
└── public/                 # Fichiers statiques
```

## Licence

MIT

## Contributeurs

- Votre nom ici

## Remerciements

- [Unsloth](https://github.com/unslothai/unsloth) pour leur excellent outil d'optimisation de fine-tuning
