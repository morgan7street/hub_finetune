from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import os
import json
import uuid
import logging
import shutil
from datetime import datetime
import subprocess
import sys

# Import des modules personnalisés
from hardware_detection import get_hardware_info
from data_preprocessing import DataPreprocessor
from model_export import ModelExporter
from model_evaluation import ModelEvaluator

# Initialisation de l'application FastAPI
app = FastAPI(title="Unsloth Fine-tuning API", description="API pour la plateforme de fine-tuning Unsloth")

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # URLs de votre frontend Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("unsloth-api")

# Modèles de données
class FineTuningConfig(BaseModel):
    model_name: str
    learning_rate: float
    batch_size: int
    epochs: int
    max_seq_length: int = 2048
    lora_r: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.05
    weight_decay: float = 0.01
    warmup_steps: int = 50
    gradient_accumulation: int = 1

class JobStatus(BaseModel):
    job_id: str
    status: str  # "pending", "running", "completed", "failed"
    progress: float  # 0.0 to 1.0
    metrics: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str
    updated_at: str

# Stockage en mémoire des jobs et tâches (à remplacer par une base de données dans un environnement de production)
jobs = {}
preprocessing_tasks = {}
export_tasks = {}
evaluation_tasks = {}

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Unsloth Fine-tuning"}

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Endpoint pour télécharger un fichier de dataset"""
    try:
        # Créer le dossier datasets s'il n'existe pas
        os.makedirs("datasets", exist_ok=True)

        # Générer un nom de fichier unique
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join("datasets", unique_filename)

        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        return {
            "filename": file.filename,
            "stored_filename": unique_filename,
            "file_path": file_path,
            "size": os.path.getsize(file_path)
        }
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement du fichier: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/finetune/start")
async def start_finetune(config: FineTuningConfig, background_tasks: BackgroundTasks):
    """Endpoint pour démarrer un job de fine-tuning"""
    try:
        # Générer un ID unique pour le job
        job_id = str(uuid.uuid4())

        # Créer un enregistrement pour le job
        now = datetime.now().isoformat()
        jobs[job_id] = {
            "job_id": job_id,
            "status": "pending",
            "progress": 0.0,
            "config": config.dict(),
            "metrics": {},
            "created_at": now,
            "updated_at": now
        }

        # Lancer le fine-tuning en arrière-plan
        background_tasks.add_task(run_finetune_job, job_id, config)

        return {"job_id": job_id, "status": "pending"}
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du fine-tuning: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/finetune/{job_id}/status")
async def get_finetune_status(job_id: str):
    """Endpoint pour obtenir le statut d'un job de fine-tuning"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job non trouvé")

    return jobs[job_id]

@app.get("/api/finetune/list")
async def list_finetune_jobs():
    """Endpoint pour lister tous les jobs de fine-tuning"""
    return list(jobs.values())

@app.get("/api/hardware/info")
async def get_hardware_information():
    """Endpoint pour obtenir les informations sur le hardware"""
    try:
        hardware_info = get_hardware_info()
        return hardware_info
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des informations hardware: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/install/unsloth")
async def install_unsloth(background_tasks: BackgroundTasks):
    """Endpoint pour installer Unsloth"""
    try:
        # Lancer l'installation en arrière-plan
        background_tasks.add_task(run_unsloth_installation)

        return {"status": "installation_started", "message": "Installation d'Unsloth démarrée en arrière-plan"}
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de l'installation d'Unsloth: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/preprocessing/start")
async def start_preprocessing(
    file_path: str = Form(...),
    output_path: str = Form(...),
    remove_duplicates: bool = Form(True),
    handle_missing: bool = Form(True),
    missing_strategy: str = Form("drop"),
    remove_outliers: bool = Form(False),
    outlier_method: str = Form("zscore"),
    filter_by_length: bool = Form(False),
    text_column: Optional[str] = Form(None),
    min_length: int = Form(0),
    max_length: Optional[int] = Form(None),
    background_tasks: BackgroundTasks = None
):
    """Endpoint pour démarrer le prétraitement des données"""
    try:
        # Créer un ID unique pour la tâche
        task_id = str(uuid.uuid4())

        # Lancer le prétraitement en arrière-plan
        background_tasks.add_task(
            run_preprocessing_task,
            task_id,
            file_path,
            output_path,
            remove_duplicates,
            handle_missing,
            missing_strategy,
            remove_outliers,
            outlier_method,
            filter_by_length,
            text_column,
            min_length,
            max_length
        )

        return {"task_id": task_id, "status": "preprocessing_started"}
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du prétraitement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/preprocessing/{task_id}/status")
async def get_preprocessing_status(task_id: str):
    """Endpoint pour obtenir le statut d'une tâche de prétraitement"""
    if task_id not in preprocessing_tasks:
        raise HTTPException(status_code=404, detail="Tâche de prétraitement non trouvée")

    return preprocessing_tasks[task_id]

@app.post("/api/export/model")
async def export_model(
    model_path: str = Form(...),
    model_name: str = Form(...),
    format: str = Form("gguf"),
    quantization: Optional[str] = Form("q4_k_m"),
    background_tasks: BackgroundTasks = None
):
    """Endpoint pour exporter un modèle"""
    try:
        # Créer un ID unique pour la tâche
        task_id = str(uuid.uuid4())

        # Lancer l'export en arrière-plan
        background_tasks.add_task(
            run_export_task,
            task_id,
            model_path,
            model_name,
            format,
            quantization
        )

        return {"task_id": task_id, "status": "export_started"}
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de l'export: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/{task_id}/status")
async def get_export_status(task_id: str):
    """Endpoint pour obtenir le statut d'une tâche d'export"""
    if task_id not in export_tasks:
        raise HTTPException(status_code=404, detail="Tâche d'export non trouvée")

    return export_tasks[task_id]

@app.post("/api/evaluate/model")
async def evaluate_model(
    model_path: str = Form(...),
    test_file: str = Form(...),
    metrics: List[str] = Form(["perplexity", "accuracy", "bleu"]),
    background_tasks: BackgroundTasks = None
):
    """Endpoint pour évaluer un modèle"""
    try:
        # Créer un ID unique pour la tâche
        task_id = str(uuid.uuid4())

        # Lancer l'évaluation en arrière-plan
        background_tasks.add_task(
            run_evaluation_task,
            task_id,
            model_path,
            test_file,
            metrics
        )

        return {"task_id": task_id, "status": "evaluation_started"}
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de l'évaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/evaluate/{task_id}/status")
async def get_evaluation_status(task_id: str):
    """Endpoint pour obtenir le statut d'une tâche d'évaluation"""
    if task_id not in evaluation_tasks:
        raise HTTPException(status_code=404, detail="Tâche d'évaluation non trouvée")

    return evaluation_tasks[task_id]

@app.post("/api/inference")
async def run_inference(
    model_path: str = Form(...),
    prompt: str = Form(...),
    max_tokens: int = Form(100),
    temperature: float = Form(0.7),
    top_p: float = Form(0.9)
):
    """Endpoint pour exécuter l'inférence sur un modèle"""
    try:
        # Charger le modèle
        if model_path.endswith(".gguf"):
            # Utiliser llama-cpp-python pour les modèles GGUF
            try:
                from llama_cpp import Llama
            except ImportError:
                subprocess.run([sys.executable, "-m", "pip", "install", "llama-cpp-python"], check=True)
                from llama_cpp import Llama

            model = Llama(model_path=model_path, n_ctx=2048)
            response = model(prompt, max_tokens=max_tokens, temperature=temperature, top_p=top_p)
            generated_text = response["choices"][0]["text"]
        else:
            # Utiliser Hugging Face pour les autres modèles
            try:
                from transformers import AutoModelForCausalLM, AutoTokenizer
                import torch
            except ImportError:
                subprocess.run([sys.executable, "-m", "pip", "install", "transformers", "torch"], check=True)
                from transformers import AutoModelForCausalLM, AutoTokenizer
                import torch

            model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.float16, device_map="auto")
            tokenizer = AutoTokenizer.from_pretrained(model_path)

            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
            with torch.no_grad():
                outputs = model.generate(
                    inputs["input_ids"],
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p
                )

            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            generated_text = generated_text.replace(prompt, "")

        return {
            "prompt": prompt,
            "generated_text": generated_text,
            "model_path": model_path
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'inférence: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Fonction pour installer Unsloth en arrière-plan
async def run_unsloth_installation():
    """Fonction qui installe Unsloth et ses dépendances"""
    try:
        # Importer le script d'installation
        import install_unsloth

        # Obtenir les informations sur le hardware
        hardware_info = install_unsloth.get_hardware_info()

        # Déterminer le type d'installation
        use_cuda = hardware_info["cuda"]["available"]
        use_rocm = hardware_info["rocm"]["available"] and not use_cuda

        # Installer Unsloth
        success = install_unsloth.install_unsloth(cuda=use_cuda, rocm=use_rocm)

        if not success:
            logger.error("Échec de l'installation d'Unsloth")
    except Exception as e:
        logger.error(f"Erreur lors de l'installation d'Unsloth: {str(e)}")

# Fonction pour exécuter le prétraitement en arrière-plan
async def run_preprocessing_task(
    task_id: str,
    file_path: str,
    output_path: str,
    remove_duplicates: bool,
    handle_missing: bool,
    missing_strategy: str,
    remove_outliers: bool,
    outlier_method: str,
    filter_by_length: bool,
    text_column: Optional[str],
    min_length: int,
    max_length: Optional[int]
):
    """Fonction qui exécute le prétraitement des données"""
    try:
        # Initialiser la tâche
        preprocessing_tasks[task_id] = {
            "task_id": task_id,
            "status": "running",
            "progress": 0.0,
            "file_path": file_path,
            "output_path": output_path,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        # Créer le préprocesseur
        preprocessor = DataPreprocessor(file_path)

        # Charger les données
        preprocessing_tasks[task_id]["progress"] = 0.1
        preprocessing_tasks[task_id]["status_message"] = "Chargement des données"
        preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

        if not preprocessor.load_data():
            raise Exception("Erreur lors du chargement des données")

        # Supprimer les doublons si demandé
        if remove_duplicates:
            preprocessing_tasks[task_id]["progress"] = 0.3
            preprocessing_tasks[task_id]["status_message"] = "Suppression des doublons"
            preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

            duplicates_removed = preprocessor.remove_duplicates()
            preprocessing_tasks[task_id]["duplicates_removed"] = duplicates_removed

        # Gérer les valeurs manquantes si demandé
        if handle_missing:
            preprocessing_tasks[task_id]["progress"] = 0.5
            preprocessing_tasks[task_id]["status_message"] = "Gestion des valeurs manquantes"
            preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

            missing_values_handled = preprocessor.handle_missing_values(strategy=missing_strategy)
            preprocessing_tasks[task_id]["missing_values_handled"] = missing_values_handled

        # Supprimer les valeurs aberrantes si demandé
        if remove_outliers:
            preprocessing_tasks[task_id]["progress"] = 0.7
            preprocessing_tasks[task_id]["status_message"] = "Suppression des valeurs aberrantes"
            preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

            outliers_removed = preprocessor.remove_outliers(method=outlier_method)
            preprocessing_tasks[task_id]["outliers_removed"] = outliers_removed

        # Filtrer par longueur si demandé
        if filter_by_length and text_column:
            preprocessing_tasks[task_id]["progress"] = 0.8
            preprocessing_tasks[task_id]["status_message"] = "Filtrage par longueur"
            preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

            filtered_count = preprocessor.filter_by_length(text_column, min_length, max_length)
            preprocessing_tasks[task_id]["filtered_by_length"] = filtered_count

        # Sauvegarder les données prétraitées
        preprocessing_tasks[task_id]["progress"] = 0.9
        preprocessing_tasks[task_id]["status_message"] = "Sauvegarde des données prétraitées"
        preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

        if not preprocessor.save_processed_data(output_path):
            raise Exception("Erreur lors de la sauvegarde des données prétraitées")

        # Obtenir les statistiques
        stats = preprocessor.get_stats()

        # Marquer comme terminé
        preprocessing_tasks[task_id]["status"] = "completed"
        preprocessing_tasks[task_id]["progress"] = 1.0
        preprocessing_tasks[task_id]["stats"] = stats
        preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

    except Exception as e:
        logger.error(f"Erreur lors du prétraitement des données: {str(e)}")
        preprocessing_tasks[task_id]["status"] = "failed"
        preprocessing_tasks[task_id]["error"] = str(e)
        preprocessing_tasks[task_id]["updated_at"] = datetime.now().isoformat()

# Fonction pour exécuter l'export de modèle en arrière-plan
async def run_export_task(
    task_id: str,
    model_path: str,
    model_name: str,
    format: str,
    quantization: Optional[str]
):
    """Fonction qui exécute l'export de modèle"""
    try:
        # Initialiser la tâche
        export_tasks[task_id] = {
            "task_id": task_id,
            "status": "running",
            "progress": 0.0,
            "model_path": model_path,
            "model_name": model_name,
            "format": format,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        # Créer l'exportateur
        exporter = ModelExporter(model_path)

        # Exporter le modèle
        export_tasks[task_id]["progress"] = 0.5
        export_tasks[task_id]["status_message"] = "Export du modèle en cours"
        export_tasks[task_id]["updated_at"] = datetime.now().isoformat()

        if format.lower() == "gguf":
            result = exporter.export_to_gguf(model_name, quantization)
        elif format.lower() == "huggingface":
            result = exporter.export_to_huggingface(model_name)
        else:
            raise ValueError(f"Format non pris en charge: {format}")

        if not result["success"]:
            raise Exception(result.get("error", "Erreur inconnue lors de l'export"))

        # Marquer comme terminé
        export_tasks[task_id]["status"] = "completed"
        export_tasks[task_id]["progress"] = 1.0
        export_tasks[task_id]["result"] = result
        export_tasks[task_id]["updated_at"] = datetime.now().isoformat()

    except Exception as e:
        logger.error(f"Erreur lors de l'export du modèle: {str(e)}")
        export_tasks[task_id]["status"] = "failed"
        export_tasks[task_id]["error"] = str(e)
        export_tasks[task_id]["updated_at"] = datetime.now().isoformat()

# Fonction pour exécuter l'évaluation de modèle en arrière-plan
async def run_evaluation_task(
    task_id: str,
    model_path: str,
    test_file: str,
    metrics: List[str]
):
    """Fonction qui exécute l'évaluation de modèle"""
    try:
        # Initialiser la tâche
        evaluation_tasks[task_id] = {
            "task_id": task_id,
            "status": "running",
            "progress": 0.0,
            "model_path": model_path,
            "test_file": test_file,
            "metrics": metrics,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        # Créer l'évaluateur
        evaluator = ModelEvaluator(model_path)

        # Charger le modèle
        evaluation_tasks[task_id]["progress"] = 0.1
        evaluation_tasks[task_id]["status_message"] = "Chargement du modèle"
        evaluation_tasks[task_id]["updated_at"] = datetime.now().isoformat()

        if not evaluator.load_model():
            raise Exception("Erreur lors du chargement du modèle")

        results = {}
        total_metrics = len(metrics)

        # Évaluer chaque métrique demandée
        for i, metric in enumerate(metrics):
            progress = 0.1 + (0.8 * (i / total_metrics))
            evaluation_tasks[task_id]["progress"] = progress
            evaluation_tasks[task_id]["status_message"] = f"Évaluation de la métrique: {metric}"
            evaluation_tasks[task_id]["updated_at"] = datetime.now().isoformat()

            if metric == "perplexity":
                result = evaluator.evaluate_perplexity(test_file)
            elif metric == "accuracy":
                result = evaluator.evaluate_accuracy(test_file)
            elif metric == "bleu":
                result = evaluator.evaluate_bleu(test_file)
            else:
                logger.warning(f"Métrique non prise en charge: {metric}")
                continue

            results[metric] = result

        # Calculer un score global si possible
        if all(results.get(m, {}).get("success", False) for m in ["perplexity", "accuracy", "bleu"]):
            # Normaliser la perplexité (plus basse est meilleure)
            norm_perplexity = 1.0 / (1.0 + results["perplexity"]["value"])

            # Calculer le score global (moyenne pondérée)
            global_score = (
                0.3 * norm_perplexity +
                0.4 * results["accuracy"]["value"] +
                0.3 * results["bleu"]["value"]
            )

            results["global_score"] = global_score

        # Marquer comme terminé
        evaluation_tasks[task_id]["status"] = "completed"
        evaluation_tasks[task_id]["progress"] = 1.0
        evaluation_tasks[task_id]["results"] = results
        evaluation_tasks[task_id]["updated_at"] = datetime.now().isoformat()

    except Exception as e:
        logger.error(f"Erreur lors de l'évaluation du modèle: {str(e)}")
        evaluation_tasks[task_id]["status"] = "failed"
        evaluation_tasks[task_id]["error"] = str(e)
        evaluation_tasks[task_id]["updated_at"] = datetime.now().isoformat()

# Fonction pour exécuter le fine-tuning en arrière-plan
async def run_finetune_job(job_id: str, config: FineTuningConfig):
    """Fonction qui exécute le fine-tuning avec Unsloth"""
    try:
        # Mettre à jour le statut du job
        jobs[job_id]["status"] = "running"
        jobs[job_id]["updated_at"] = datetime.now().isoformat()

        # Intégration avec Unsloth
        try:
            from unsloth import FastLanguageModel
            import torch

            # Initialiser le modèle
            model, tokenizer = FastLanguageModel.from_pretrained(
                model_name=config.model_name,
                max_seq_length=config.max_seq_length,
                dtype=torch.bfloat16,
                load_in_4bit=True,
            )

            # Configurer pour le fine-tuning
            model = FastLanguageModel.get_peft_model(
                model,
                r=config.lora_r,
                target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
                lora_alpha=config.lora_alpha,
                lora_dropout=config.lora_dropout,
                bias="none",
            )

            # Simuler l'entraînement pour l'instant
            # Dans une implémentation réelle, vous chargeriez vos données et lanceriez l'entraînement
            import time
            import random

            total_steps = config.epochs * 10  # Simuler 10 batchs par époque
            for step in range(total_steps):
                # Simuler le travail
                time.sleep(0.5)

                # Mettre à jour la progression
                progress = (step + 1) / total_steps
                jobs[job_id]["progress"] = progress

                # Simuler des métriques
                loss = 2.0 - (1.5 * progress) + random.uniform(-0.1, 0.1)
                jobs[job_id]["metrics"] = {
                    "loss": loss,
                    "step": step + 1,
                    "epoch": (step // 10) + 1
                }

                jobs[job_id]["updated_at"] = datetime.now().isoformat()

        except ImportError:
            # Si Unsloth n'est pas disponible, simuler le processus
            import time
            import random

            total_steps = config.epochs * 10  # Simuler 10 batchs par époque
            for step in range(total_steps):
                # Simuler le travail
                time.sleep(0.5)

                # Mettre à jour la progression
                progress = (step + 1) / total_steps
                jobs[job_id]["progress"] = progress

                # Simuler des métriques
                loss = 2.0 - (1.5 * progress) + random.uniform(-0.1, 0.1)
                jobs[job_id]["metrics"] = {
                    "loss": loss,
                    "step": step + 1,
                    "epoch": (step // 10) + 1
                }

                jobs[job_id]["updated_at"] = datetime.now().isoformat()

        # Marquer comme terminé
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["updated_at"] = datetime.now().isoformat()

    except Exception as e:
        logger.error(f"Erreur lors du fine-tuning du job {job_id}: {str(e)}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["updated_at"] = datetime.now().isoformat()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)