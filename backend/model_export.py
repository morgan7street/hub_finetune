import os
import json
import subprocess
import logging
import shutil
from datetime import datetime
from typing import Dict, Any, Optional, List
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("model_export.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("model-export")

class ModelExporter:
    def __init__(self, model_path: str, output_dir: str = "exported_models"):
        """
        Initialise l'exportateur de modèles.
        
        Args:
            model_path: Chemin vers le modèle à exporter
            output_dir: Répertoire de sortie pour les modèles exportés
        """
        self.model_path = model_path
        self.output_dir = output_dir
        
        # Créer le répertoire de sortie s'il n'existe pas
        os.makedirs(output_dir, exist_ok=True)
    
    def export_to_gguf(self, model_name: str, quantization: str = "q4_k_m") -> Dict[str, Any]:
        """
        Exporte le modèle au format GGUF.
        
        Args:
            model_name: Nom du modèle exporté
            quantization: Niveau de quantification (q4_0, q4_k_m, q5_k_m, q8_0, etc.)
        
        Returns:
            Dict[str, Any]: Informations sur le modèle exporté
        """
        try:
            # Générer un nom de fichier avec timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"{model_name}_{timestamp}"
            output_path = os.path.join(self.output_dir, f"{output_name}.gguf")
            
            # Vérifier si llama.cpp est installé
            llama_cpp_path = shutil.which("llama-convert")
            if llama_cpp_path is None:
                logger.warning("llama.cpp n'est pas installé. Installation en cours...")
                self._install_llama_cpp()
                llama_cpp_path = shutil.which("llama-convert")
                if llama_cpp_path is None:
                    raise Exception("Impossible d'installer llama.cpp")
            
            # Construire la commande de conversion
            cmd = [
                "llama-convert",
                "--outtype", "f16",
                "--outfile", output_path,
                self.model_path
            ]
            
            # Exécuter la commande
            logger.info(f"Exécution de la commande: {' '.join(cmd)}")
            process = subprocess.run(cmd, capture_output=True, text=True)
            
            if process.returncode != 0:
                logger.error(f"Erreur lors de la conversion: {process.stderr}")
                raise Exception(f"Erreur lors de la conversion: {process.stderr}")
            
            # Quantifier le modèle si nécessaire
            if quantization:
                quantized_path = os.path.join(self.output_dir, f"{output_name}_{quantization}.gguf")
                quant_cmd = [
                    "llama-quantize",
                    "--model", output_path,
                    "--outfile", quantized_path,
                    "--type", quantization
                ]
                
                logger.info(f"Exécution de la commande: {' '.join(quant_cmd)}")
                quant_process = subprocess.run(quant_cmd, capture_output=True, text=True)
                
                if quant_process.returncode != 0:
                    logger.error(f"Erreur lors de la quantification: {quant_process.stderr}")
                    raise Exception(f"Erreur lors de la quantification: {quant_process.stderr}")
                
                # Supprimer le fichier intermédiaire
                os.remove(output_path)
                output_path = quantized_path
            
            # Obtenir la taille du fichier
            file_size = os.path.getsize(output_path)
            
            result = {
                "success": True,
                "model_name": model_name,
                "format": "GGUF",
                "quantization": quantization,
                "file_path": output_path,
                "file_size": file_size,
                "timestamp": timestamp
            }
            
            # Enregistrer les métadonnées
            metadata_path = os.path.join(self.output_dir, f"{output_name}_metadata.json")
            with open(metadata_path, "w") as f:
                json.dump(result, f, indent=2)
            
            logger.info(f"Modèle exporté avec succès: {output_path}")
            return result
        except Exception as e:
            logger.error(f"Erreur lors de l'export au format GGUF: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def export_to_huggingface(self, model_name: str, push_to_hub: bool = False, hub_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Exporte le modèle au format Hugging Face.
        
        Args:
            model_name: Nom du modèle exporté
            push_to_hub: Si True, pousse le modèle sur Hugging Face Hub
            hub_token: Token d'accès Hugging Face (requis si push_to_hub=True)
        
        Returns:
            Dict[str, Any]: Informations sur le modèle exporté
        """
        try:
            # Générer un nom de fichier avec timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"{model_name}_{timestamp}"
            output_path = os.path.join(self.output_dir, output_name)
            
            # Créer le répertoire de sortie
            os.makedirs(output_path, exist_ok=True)
            
            # Importer les bibliothèques nécessaires
            try:
                from transformers import AutoModelForCausalLM, AutoTokenizer
            except ImportError:
                logger.warning("transformers n'est pas installé. Installation en cours...")
                subprocess.run(["pip", "install", "transformers"], check=True)
                from transformers import AutoModelForCausalLM, AutoTokenizer
            
            # Charger le modèle et le tokenizer
            logger.info(f"Chargement du modèle depuis {self.model_path}")
            model = AutoModelForCausalLM.from_pretrained(self.model_path)
            tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            # Sauvegarder le modèle et le tokenizer
            logger.info(f"Sauvegarde du modèle dans {output_path}")
            model.save_pretrained(output_path)
            tokenizer.save_pretrained(output_path)
            
            result = {
                "success": True,
                "model_name": model_name,
                "format": "Hugging Face",
                "file_path": output_path,
                "timestamp": timestamp
            }
            
            # Pousser sur Hugging Face Hub si demandé
            if push_to_hub:
                if hub_token is None:
                    raise ValueError("hub_token est requis pour pousser sur Hugging Face Hub")
                
                try:
                    from huggingface_hub import HfApi
                except ImportError:
                    logger.warning("huggingface_hub n'est pas installé. Installation en cours...")
                    subprocess.run(["pip", "install", "huggingface_hub"], check=True)
                    from huggingface_hub import HfApi
                
                # Se connecter à l'API Hugging Face
                api = HfApi(token=hub_token)
                
                # Pousser le modèle
                logger.info(f"Poussée du modèle sur Hugging Face Hub: {model_name}")
                api.upload_folder(
                    folder_path=output_path,
                    repo_id=model_name,
                    repo_type="model"
                )
                
                result["hub_url"] = f"https://huggingface.co/{model_name}"
            
            # Enregistrer les métadonnées
            metadata_path = os.path.join(self.output_dir, f"{output_name}_metadata.json")
            with open(metadata_path, "w") as f:
                json.dump(result, f, indent=2)
            
            logger.info(f"Modèle exporté avec succès: {output_path}")
            return result
        except Exception as e:
            logger.error(f"Erreur lors de l'export au format Hugging Face: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_exported_models(self) -> List[Dict[str, Any]]:
        """
        Liste tous les modèles exportés.
        
        Returns:
            List[Dict[str, Any]]: Liste des modèles exportés
        """
        try:
            models = []
            
            # Parcourir les fichiers de métadonnées
            for file in os.listdir(self.output_dir):
                if file.endswith("_metadata.json"):
                    metadata_path = os.path.join(self.output_dir, file)
                    with open(metadata_path, "r") as f:
                        metadata = json.load(f)
                    
                    # Vérifier si le fichier existe toujours
                    if "file_path" in metadata and os.path.exists(metadata["file_path"]):
                        models.append(metadata)
            
            return models
        except Exception as e:
            logger.error(f"Erreur lors de la liste des modèles exportés: {str(e)}")
            return []
    
    def _install_llama_cpp(self) -> bool:
        """
        Installe llama.cpp.
        
        Returns:
            bool: True si l'installation a réussi, False sinon
        """
        try:
            # Cloner le dépôt
            subprocess.run(["git", "clone", "https://github.com/ggerganov/llama.cpp.git"], check=True)
            
            # Compiler
            os.chdir("llama.cpp")
            subprocess.run(["make"], check=True)
            
            # Installer
            subprocess.run(["sudo", "make", "install"], check=True)
            
            # Revenir au répertoire précédent
            os.chdir("..")
            
            return True
        except Exception as e:
            logger.error(f"Erreur lors de l'installation de llama.cpp: {str(e)}")
            return False
