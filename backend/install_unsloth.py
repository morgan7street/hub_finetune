#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import json
import logging
from typing import Dict, Any, List, Optional

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("install_unsloth.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("unsloth-installer")

def check_python_version() -> bool:
    """Vérifie si la version de Python est compatible."""
    major, minor = sys.version_info[:2]
    if major != 3 or minor < 8:
        logger.error(f"Python 3.8+ est requis. Version actuelle: {major}.{minor}")
        return False
    return True

def check_cuda_availability() -> Dict[str, Any]:
    """Vérifie si CUDA est disponible et retourne les informations."""
    cuda_info = {
        "available": False,
        "version": None,
        "devices": []
    }
    
    try:
        # Essayer d'importer torch pour vérifier CUDA
        import torch
        cuda_info["available"] = torch.cuda.is_available()
        
        if cuda_info["available"]:
            cuda_info["version"] = torch.version.cuda
            cuda_info["device_count"] = torch.cuda.device_count()
            
            for i in range(torch.cuda.device_count()):
                device_info = {
                    "id": i,
                    "name": torch.cuda.get_device_name(i),
                    "memory_total": torch.cuda.get_device_properties(i).total_memory,
                    "memory_allocated": torch.cuda.memory_allocated(i),
                    "memory_reserved": torch.cuda.memory_reserved(i)
                }
                cuda_info["devices"].append(device_info)
        
        return cuda_info
    except ImportError:
        logger.warning("PyTorch n'est pas installé. Impossible de vérifier CUDA.")
        return cuda_info
    except Exception as e:
        logger.error(f"Erreur lors de la vérification de CUDA: {str(e)}")
        return cuda_info

def check_rocm_availability() -> Dict[str, Any]:
    """Vérifie si ROCm est disponible et retourne les informations."""
    rocm_info = {
        "available": False,
        "version": None,
        "devices": []
    }
    
    try:
        # Vérifier si ROCm est installé
        result = subprocess.run(["rocm-smi", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            rocm_info["available"] = True
            rocm_info["version"] = result.stdout.strip()
            
            # Obtenir les informations sur les GPU AMD
            result = subprocess.run(["rocm-smi", "--json"], capture_output=True, text=True)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                for device_id, device_data in data.items():
                    if device_id.isdigit():
                        device_info = {
                            "id": int(device_id),
                            "name": device_data.get("Card Series", "Unknown"),
                            "memory_total": device_data.get("GPU memory", {}).get("total", "Unknown")
                        }
                        rocm_info["devices"].append(device_info)
        
        return rocm_info
    except FileNotFoundError:
        logger.warning("ROCm n'est pas installé.")
        return rocm_info
    except Exception as e:
        logger.error(f"Erreur lors de la vérification de ROCm: {str(e)}")
        return rocm_info

def get_system_info() -> Dict[str, Any]:
    """Récupère les informations système."""
    system_info = {
        "os": platform.system(),
        "os_version": platform.version(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "python_version": platform.python_version(),
        "cpu_count": os.cpu_count()
    }
    
    # Obtenir les informations sur la RAM
    try:
        import psutil
        memory = psutil.virtual_memory()
        system_info["memory_total"] = memory.total
        system_info["memory_available"] = memory.available
    except ImportError:
        logger.warning("psutil n'est pas installé. Impossible d'obtenir les informations sur la RAM.")
    
    return system_info

def install_unsloth(cuda: bool = True, rocm: bool = False) -> bool:
    """Installe Unsloth avec les dépendances appropriées."""
    try:
        # Installer les dépendances de base
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        
        # Installer PyTorch avec CUDA ou ROCm selon la disponibilité
        if cuda:
            logger.info("Installation de PyTorch avec support CUDA...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--index-url", "https://download.pytorch.org/whl/cu118"])
        elif rocm:
            logger.info("Installation de PyTorch avec support ROCm...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--index-url", "https://download.pytorch.org/whl/rocm5.6"])
        else:
            logger.info("Installation de PyTorch sans accélération GPU...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio"])
        
        # Installer Unsloth
        logger.info("Installation d'Unsloth...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "unsloth"])
        
        # Installer les dépendances supplémentaires
        logger.info("Installation des dépendances supplémentaires...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers", "datasets", "accelerate", "peft", "bitsandbytes", "sentencepiece", "safetensors"])
        
        logger.info("Installation d'Unsloth terminée avec succès!")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Erreur lors de l'installation: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}")
        return False

def create_virtual_env(path: str) -> bool:
    """Crée un environnement virtuel Python."""
    try:
        subprocess.check_call([sys.executable, "-m", "venv", path])
        logger.info(f"Environnement virtuel créé avec succès à {path}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Erreur lors de la création de l'environnement virtuel: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}")
        return False

def get_hardware_info() -> Dict[str, Any]:
    """Récupère toutes les informations sur le hardware."""
    hardware_info = {
        "system": get_system_info(),
        "cuda": check_cuda_availability(),
        "rocm": check_rocm_availability()
    }
    
    return hardware_info

if __name__ == "__main__":
    # Vérifier la version de Python
    if not check_python_version():
        sys.exit(1)
    
    # Récupérer les informations sur le hardware
    hardware_info = get_hardware_info()
    print(json.dumps(hardware_info, indent=2))
    
    # Déterminer le type d'installation
    use_cuda = hardware_info["cuda"]["available"]
    use_rocm = hardware_info["rocm"]["available"] and not use_cuda
    
    # Créer un environnement virtuel (optionnel)
    # create_virtual_env("unsloth_env")
    
    # Installer Unsloth
    success = install_unsloth(cuda=use_cuda, rocm=use_rocm)
    sys.exit(0 if success else 1)
