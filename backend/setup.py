#!/usr/bin/env python3
import os
import sys
import subprocess
import logging
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("setup.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("setup")

def create_directories():
    """Crée les répertoires nécessaires"""
    directories = [
        "datasets",
        "processed_datasets",
        "models",
        "exported_models",
        "evaluation_results"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Répertoire créé: {directory}")

def install_dependencies():
    """Installe les dépendances Python"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("Dépendances installées avec succès")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Erreur lors de l'installation des dépendances: {str(e)}")
        return False

def setup_database():
    """Configure la base de données (SQLite pour l'instant)"""
    try:
        import sqlite3
        
        # Créer la base de données
        conn = sqlite3.connect("unsloth.db")
        cursor = conn.cursor()
        
        # Créer les tables
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            status TEXT,
            progress REAL,
            config TEXT,
            metrics TEXT,
            error TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            dataset_id TEXT PRIMARY KEY,
            name TEXT,
            file_path TEXT,
            format TEXT,
            size INTEGER,
            processed BOOLEAN,
            created_at TEXT
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS models (
            model_id TEXT PRIMARY KEY,
            name TEXT,
            base_model TEXT,
            file_path TEXT,
            format TEXT,
            size INTEGER,
            created_at TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
        
        logger.info("Base de données configurée avec succès")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la configuration de la base de données: {str(e)}")
        return False

def main():
    """Fonction principale"""
    logger.info("Démarrage de l'installation...")
    
    # Créer les répertoires
    create_directories()
    
    # Installer les dépendances
    if not install_dependencies():
        logger.error("Échec de l'installation des dépendances")
        return False
    
    # Configurer la base de données
    if not setup_database():
        logger.error("Échec de la configuration de la base de données")
        return False
    
    logger.info("Installation terminée avec succès")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
