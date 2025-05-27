import os
import json
import csv
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
import logging
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("preprocessing.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("data-preprocessing")

class DataPreprocessor:
    def __init__(self, dataset_path: str):
        """
        Initialise le préprocesseur de données.
        
        Args:
            dataset_path: Chemin vers le fichier de données
        """
        self.dataset_path = dataset_path
        self.data = None
        self.stats = {
            "original_size": 0,
            "current_size": 0,
            "duplicates": 0,
            "outliers": 0,
            "missing_values": 0
        }
    
    def load_data(self) -> bool:
        """
        Charge les données depuis le fichier.
        
        Returns:
            bool: True si le chargement a réussi, False sinon
        """
        try:
            file_extension = Path(self.dataset_path).suffix.lower()
            
            if file_extension == '.csv':
                self.data = pd.read_csv(self.dataset_path)
            elif file_extension == '.json':
                self.data = pd.read_json(self.dataset_path)
            elif file_extension == '.txt':
                # Supposer un format simple avec une ligne par entrée
                with open(self.dataset_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                self.data = pd.DataFrame({"text": [line.strip() for line in lines]})
            elif file_extension == '.xlsx' or file_extension == '.xls':
                self.data = pd.read_excel(self.dataset_path)
            else:
                logger.error(f"Format de fichier non pris en charge: {file_extension}")
                return False
            
            self.stats["original_size"] = len(self.data)
            self.stats["current_size"] = len(self.data)
            return True
        except Exception as e:
            logger.error(f"Erreur lors du chargement des données: {str(e)}")
            return False
    
    def remove_duplicates(self) -> int:
        """
        Supprime les lignes en double.
        
        Returns:
            int: Nombre de doublons supprimés
        """
        if self.data is None:
            logger.error("Aucune donnée chargée")
            return 0
        
        original_size = len(self.data)
        self.data = self.data.drop_duplicates()
        duplicates_removed = original_size - len(self.data)
        
        self.stats["duplicates"] = duplicates_removed
        self.stats["current_size"] = len(self.data)
        
        logger.info(f"Doublons supprimés: {duplicates_removed}")
        return duplicates_removed
    
    def handle_missing_values(self, strategy: str = 'drop') -> int:
        """
        Gère les valeurs manquantes.
        
        Args:
            strategy: Stratégie de gestion ('drop', 'fill_mean', 'fill_median', 'fill_mode')
        
        Returns:
            int: Nombre de valeurs manquantes traitées
        """
        if self.data is None:
            logger.error("Aucune donnée chargée")
            return 0
        
        # Compter les valeurs manquantes
        missing_values = self.data.isna().sum().sum()
        self.stats["missing_values"] = missing_values
        
        if missing_values == 0:
            logger.info("Aucune valeur manquante trouvée")
            return 0
        
        original_size = len(self.data)
        
        if strategy == 'drop':
            self.data = self.data.dropna()
            rows_removed = original_size - len(self.data)
            logger.info(f"Lignes avec valeurs manquantes supprimées: {rows_removed}")
        elif strategy == 'fill_mean':
            self.data = self.data.fillna(self.data.mean(numeric_only=True))
            logger.info(f"Valeurs manquantes remplies avec la moyenne: {missing_values}")
        elif strategy == 'fill_median':
            self.data = self.data.fillna(self.data.median(numeric_only=True))
            logger.info(f"Valeurs manquantes remplies avec la médiane: {missing_values}")
        elif strategy == 'fill_mode':
            for column in self.data.columns:
                if self.data[column].isna().any():
                    mode_value = self.data[column].mode()[0]
                    self.data[column] = self.data[column].fillna(mode_value)
            logger.info(f"Valeurs manquantes remplies avec le mode: {missing_values}")
        
        self.stats["current_size"] = len(self.data)
        return missing_values
    
    def remove_outliers(self, method: str = 'zscore', threshold: float = 3.0) -> int:
        """
        Supprime les valeurs aberrantes.
        
        Args:
            method: Méthode de détection ('zscore', 'iqr')
            threshold: Seuil pour la détection
        
        Returns:
            int: Nombre de valeurs aberrantes supprimées
        """
        if self.data is None:
            logger.error("Aucune donnée chargée")
            return 0
        
        original_size = len(self.data)
        numeric_columns = self.data.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) == 0:
            logger.info("Aucune colonne numérique trouvée pour la détection des valeurs aberrantes")
            return 0
        
        outlier_mask = pd.Series(False, index=self.data.index)
        
        if method == 'zscore':
            for column in numeric_columns:
                z_scores = np.abs((self.data[column] - self.data[column].mean()) / self.data[column].std())
                outlier_mask = outlier_mask | (z_scores > threshold)
        elif method == 'iqr':
            for column in numeric_columns:
                q1 = self.data[column].quantile(0.25)
                q3 = self.data[column].quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - threshold * iqr
                upper_bound = q3 + threshold * iqr
                outlier_mask = outlier_mask | ((self.data[column] < lower_bound) | (self.data[column] > upper_bound))
        
        self.data = self.data[~outlier_mask]
        outliers_removed = original_size - len(self.data)
        
        self.stats["outliers"] = outliers_removed
        self.stats["current_size"] = len(self.data)
        
        logger.info(f"Valeurs aberrantes supprimées: {outliers_removed}")
        return outliers_removed
    
    def filter_by_length(self, column: str, min_length: int = 0, max_length: Optional[int] = None) -> int:
        """
        Filtre les données par longueur de texte.
        
        Args:
            column: Nom de la colonne contenant le texte
            min_length: Longueur minimale
            max_length: Longueur maximale (optionnel)
        
        Returns:
            int: Nombre d'éléments filtrés
        """
        if self.data is None:
            logger.error("Aucune donnée chargée")
            return 0
        
        if column not in self.data.columns:
            logger.error(f"Colonne {column} non trouvée")
            return 0
        
        original_size = len(self.data)
        
        # Calculer la longueur des textes
        self.data['text_length'] = self.data[column].astype(str).apply(len)
        
        # Appliquer les filtres
        if max_length is not None:
            self.data = self.data[(self.data['text_length'] >= min_length) & (self.data['text_length'] <= max_length)]
        else:
            self.data = self.data[self.data['text_length'] >= min_length]
        
        # Supprimer la colonne temporaire
        self.data = self.data.drop('text_length', axis=1)
        
        filtered_count = original_size - len(self.data)
        self.stats["current_size"] = len(self.data)
        
        logger.info(f"Éléments filtrés par longueur: {filtered_count}")
        return filtered_count
    
    def format_for_unsloth(self, instruction_column: str, response_column: str, system_prompt: str = "") -> bool:
        """
        Formate les données pour Unsloth (format d'instruction).
        
        Args:
            instruction_column: Nom de la colonne contenant les instructions
            response_column: Nom de la colonne contenant les réponses
            system_prompt: Prompt système à utiliser (optionnel)
        
        Returns:
            bool: True si le formatage a réussi, False sinon
        """
        if self.data is None:
            logger.error("Aucune donnée chargée")
            return False
        
        if instruction_column not in self.data.columns or response_column not in self.data.columns:
            logger.error(f"Colonnes {instruction_column} ou {response_column} non trouvées")
            return False
        
        try:
            formatted_data = []
            
            for _, row in self.data.iterrows():
                entry = {
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": row[instruction_column]},
                        {"role": "assistant", "content": row[response_column]}
                    ]
                }
                formatted_data.append(entry)
            
            # Créer un nouveau DataFrame
            self.data = pd.DataFrame({"formatted_data": [json.dumps(entry) for entry in formatted_data]})
            
            logger.info(f"Données formatées pour Unsloth: {len(formatted_data)} exemples")
            return True
        except Exception as e:
            logger.error(f"Erreur lors du formatage pour Unsloth: {str(e)}")
            return False
    
    def save_processed_data(self, output_path: str) -> bool:
        """
        Sauvegarde les données prétraitées.
        
        Args:
            output_path: Chemin de sortie
        
        Returns:
            bool: True si la sauvegarde a réussi, False sinon
        """
        if self.data is None:
            logger.error("Aucune donnée chargée")
            return False
        
        try:
            # Créer le répertoire de sortie si nécessaire
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Déterminer le format de sortie
            file_extension = Path(output_path).suffix.lower()
            
            if file_extension == '.csv':
                self.data.to_csv(output_path, index=False)
            elif file_extension == '.json':
                self.data.to_json(output_path, orient='records')
            elif file_extension == '.txt':
                with open(output_path, 'w', encoding='utf-8') as f:
                    for _, row in self.data.iterrows():
                        f.write(str(row[0]) + '\n')
            elif file_extension == '.xlsx':
                self.data.to_excel(output_path, index=False)
            else:
                logger.error(f"Format de fichier non pris en charge: {file_extension}")
                return False
            
            logger.info(f"Données prétraitées sauvegardées dans {output_path}")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde des données: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Retourne les statistiques du prétraitement.
        
        Returns:
            Dict[str, Any]: Statistiques
        """
        return self.stats
    
    def get_data_preview(self, n_rows: int = 5) -> Dict[str, Any]:
        """
        Retourne un aperçu des données.
        
        Args:
            n_rows: Nombre de lignes à afficher
        
        Returns:
            Dict[str, Any]: Aperçu des données
        """
        if self.data is None:
            return {"error": "Aucune donnée chargée"}
        
        try:
            preview = self.data.head(n_rows).to_dict(orient='records')
            columns = list(self.data.columns)
            
            return {
                "columns": columns,
                "preview": preview,
                "total_rows": len(self.data)
            }
        except Exception as e:
            logger.error(f"Erreur lors de la génération de l'aperçu: {str(e)}")
            return {"error": str(e)}
