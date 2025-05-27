#!/usr/bin/env python3
import os
import sys
import subprocess
import logging
import argparse
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("run.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("run")

def run_setup():
    """Exécute le script d'installation"""
    try:
        import setup
        success = setup.main()
        return success
    except ImportError:
        logger.error("Le script d'installation n'a pas pu être importé")
        return False

def run_server(host="0.0.0.0", port=8000, reload=False):
    """Lance le serveur FastAPI"""
    try:
        import uvicorn
        
        # Construire les arguments
        args = {
            "app": "app:app",
            "host": host,
            "port": port,
            "reload": reload
        }
        
        # Lancer le serveur
        logger.info(f"Démarrage du serveur sur {host}:{port}")
        uvicorn.run(**args)
        
        return True
    except ImportError:
        logger.error("uvicorn n'est pas installé")
        return False
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du serveur: {str(e)}")
        return False

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Lance le serveur FastAPI pour la plateforme Unsloth")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Hôte sur lequel écouter")
    parser.add_argument("--port", type=int, default=8000, help="Port sur lequel écouter")
    parser.add_argument("--reload", action="store_true", help="Activer le rechargement automatique")
    parser.add_argument("--setup", action="store_true", help="Exécuter le script d'installation avant de démarrer")
    
    args = parser.parse_args()
    
    # Exécuter le script d'installation si demandé
    if args.setup:
        logger.info("Exécution du script d'installation...")
        if not run_setup():
            logger.error("Échec de l'installation")
            return False
    
    # Lancer le serveur
    return run_server(args.host, args.port, args.reload)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
