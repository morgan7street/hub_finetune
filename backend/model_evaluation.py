import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("model_evaluation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("model-evaluation")

class ModelEvaluator:
    def __init__(self, model_path: str, output_dir: str = "evaluation_results"):
        """
        Initialise l'évaluateur de modèles.
        
        Args:
            model_path: Chemin vers le modèle à évaluer
            output_dir: Répertoire de sortie pour les résultats d'évaluation
        """
        self.model_path = model_path
        self.output_dir = output_dir
        self.model = None
        self.tokenizer = None
        
        # Créer le répertoire de sortie s'il n'existe pas
        os.makedirs(output_dir, exist_ok=True)
    
    def load_model(self) -> bool:
        """
        Charge le modèle et le tokenizer.
        
        Returns:
            bool: True si le chargement a réussi, False sinon
        """
        try:
            # Importer les bibliothèques nécessaires
            try:
                from transformers import AutoModelForCausalLM, AutoTokenizer
                import torch
            except ImportError:
                logger.warning("transformers ou torch n'est pas installé. Installation en cours...")
                import subprocess
                subprocess.run(["pip", "install", "transformers", "torch"], check=True)
                from transformers import AutoModelForCausalLM, AutoTokenizer
                import torch
            
            # Charger le modèle et le tokenizer
            logger.info(f"Chargement du modèle depuis {self.model_path}")
            
            # Déterminer si le modèle est au format GGUF
            if self.model_path.endswith(".gguf"):
                try:
                    from llama_cpp import Llama
                except ImportError:
                    logger.warning("llama-cpp-python n'est pas installé. Installation en cours...")
                    import subprocess
                    subprocess.run(["pip", "install", "llama-cpp-python"], check=True)
                    from llama_cpp import Llama
                
                self.model = Llama(model_path=self.model_path, n_ctx=2048)
                self.tokenizer = None  # Pas de tokenizer séparé pour GGUF
            else:
                # Charger avec Hugging Face
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_path,
                    torch_dtype=torch.float16,
                    device_map="auto"
                )
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            logger.info("Modèle chargé avec succès")
            return True
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {str(e)}")
            return False
    
    def evaluate_perplexity(self, test_file: str) -> Dict[str, Any]:
        """
        Évalue la perplexité du modèle sur un ensemble de test.
        
        Args:
            test_file: Chemin vers le fichier de test
        
        Returns:
            Dict[str, Any]: Résultats de l'évaluation
        """
        if self.model is None:
            if not self.load_model():
                return {"success": False, "error": "Impossible de charger le modèle"}
        
        try:
            # Charger les données de test
            test_data = self._load_test_data(test_file)
            
            # Calculer la perplexité
            if self.model_path.endswith(".gguf"):
                # Méthode pour GGUF
                perplexities = []
                for text in test_data:
                    try:
                        # Utiliser llama_cpp pour calculer la perplexité
                        tokens = self.model.tokenize(text.encode())
                        logits = []
                        
                        for i in range(len(tokens) - 1):
                            output = self.model.eval(tokens[:i+1])
                            next_token_logits = output[tokens[i+1]]
                            logits.append(next_token_logits)
                        
                        # Calculer la perplexité à partir des logits
                        log_likelihood = np.mean(logits)
                        perplexity = np.exp(-log_likelihood)
                        perplexities.append(perplexity)
                    except Exception as e:
                        logger.warning(f"Erreur lors du calcul de la perplexité pour un texte: {str(e)}")
                
                avg_perplexity = np.mean(perplexities) if perplexities else float('inf')
            else:
                # Méthode pour Hugging Face
                import torch
                
                perplexities = []
                for text in test_data:
                    try:
                        inputs = self.tokenizer(text, return_tensors="pt").to(self.model.device)
                        with torch.no_grad():
                            outputs = self.model(**inputs, labels=inputs["input_ids"])
                        
                        loss = outputs.loss.item()
                        perplexity = np.exp(loss)
                        perplexities.append(perplexity)
                    except Exception as e:
                        logger.warning(f"Erreur lors du calcul de la perplexité pour un texte: {str(e)}")
                
                avg_perplexity = np.mean(perplexities) if perplexities else float('inf')
            
            # Enregistrer les résultats
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            result = {
                "success": True,
                "metric": "perplexity",
                "value": float(avg_perplexity),
                "model_path": self.model_path,
                "test_file": test_file,
                "timestamp": timestamp
            }
            
            # Sauvegarder les résultats
            output_path = os.path.join(self.output_dir, f"perplexity_{timestamp}.json")
            with open(output_path, "w") as f:
                json.dump(result, f, indent=2)
            
            logger.info(f"Évaluation de la perplexité terminée: {avg_perplexity}")
            return result
        except Exception as e:
            logger.error(f"Erreur lors de l'évaluation de la perplexité: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def evaluate_accuracy(self, test_file: str) -> Dict[str, Any]:
        """
        Évalue la précision du modèle sur un ensemble de test.
        
        Args:
            test_file: Chemin vers le fichier de test (format: instruction, réponse attendue)
        
        Returns:
            Dict[str, Any]: Résultats de l'évaluation
        """
        if self.model is None:
            if not self.load_model():
                return {"success": False, "error": "Impossible de charger le modèle"}
        
        try:
            # Charger les données de test
            test_data = self._load_test_data(test_file, format_type="qa")
            
            # Évaluer la précision
            correct = 0
            total = len(test_data)
            predictions = []
            
            for item in test_data:
                question = item["question"]
                expected_answer = item["answer"]
                
                # Générer une réponse
                if self.model_path.endswith(".gguf"):
                    # Méthode pour GGUF
                    prompt = f"Question: {question}\nAnswer:"
                    response = self.model(prompt, max_tokens=100)
                    predicted_answer = response["choices"][0]["text"].strip()
                else:
                    # Méthode pour Hugging Face
                    prompt = f"Question: {question}\nAnswer:"
                    inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
                    
                    import torch
                    with torch.no_grad():
                        outputs = self.model.generate(
                            inputs["input_ids"],
                            max_new_tokens=100,
                            temperature=0.7,
                            top_p=0.9
                        )
                    
                    predicted_answer = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                    predicted_answer = predicted_answer.replace(prompt, "").strip()
                
                # Comparer avec la réponse attendue
                is_correct = self._compare_answers(predicted_answer, expected_answer)
                if is_correct:
                    correct += 1
                
                predictions.append({
                    "question": question,
                    "expected_answer": expected_answer,
                    "predicted_answer": predicted_answer,
                    "is_correct": is_correct
                })
            
            accuracy = correct / total if total > 0 else 0
            
            # Enregistrer les résultats
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            result = {
                "success": True,
                "metric": "accuracy",
                "value": accuracy,
                "model_path": self.model_path,
                "test_file": test_file,
                "timestamp": timestamp,
                "details": predictions
            }
            
            # Sauvegarder les résultats
            output_path = os.path.join(self.output_dir, f"accuracy_{timestamp}.json")
            with open(output_path, "w") as f:
                json.dump(result, f, indent=2)
            
            logger.info(f"Évaluation de la précision terminée: {accuracy}")
            return result
        except Exception as e:
            logger.error(f"Erreur lors de l'évaluation de la précision: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def evaluate_bleu(self, test_file: str) -> Dict[str, Any]:
        """
        Évalue le score BLEU du modèle sur un ensemble de test.
        
        Args:
            test_file: Chemin vers le fichier de test (format: instruction, réponse attendue)
        
        Returns:
            Dict[str, Any]: Résultats de l'évaluation
        """
        if self.model is None:
            if not self.load_model():
                return {"success": False, "error": "Impossible de charger le modèle"}
        
        try:
            # Importer les bibliothèques nécessaires
            try:
                from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
            except ImportError:
                logger.warning("nltk n'est pas installé. Installation en cours...")
                import subprocess
                subprocess.run(["pip", "install", "nltk"], check=True)
                import nltk
                nltk.download('punkt')
                from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
            
            # Charger les données de test
            test_data = self._load_test_data(test_file, format_type="qa")
            
            # Évaluer le score BLEU
            bleu_scores = []
            predictions = []
            
            for item in test_data:
                question = item["question"]
                expected_answer = item["answer"]
                
                # Générer une réponse
                if self.model_path.endswith(".gguf"):
                    # Méthode pour GGUF
                    prompt = f"Question: {question}\nAnswer:"
                    response = self.model(prompt, max_tokens=100)
                    predicted_answer = response["choices"][0]["text"].strip()
                else:
                    # Méthode pour Hugging Face
                    prompt = f"Question: {question}\nAnswer:"
                    inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
                    
                    import torch
                    with torch.no_grad():
                        outputs = self.model.generate(
                            inputs["input_ids"],
                            max_new_tokens=100,
                            temperature=0.7,
                            top_p=0.9
                        )
                    
                    predicted_answer = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                    predicted_answer = predicted_answer.replace(prompt, "").strip()
                
                # Calculer le score BLEU
                from nltk.tokenize import word_tokenize
                reference = [word_tokenize(expected_answer.lower())]
                candidate = word_tokenize(predicted_answer.lower())
                
                smoothing = SmoothingFunction().method1
                bleu = sentence_bleu(reference, candidate, smoothing_function=smoothing)
                bleu_scores.append(bleu)
                
                predictions.append({
                    "question": question,
                    "expected_answer": expected_answer,
                    "predicted_answer": predicted_answer,
                    "bleu_score": bleu
                })
            
            avg_bleu = np.mean(bleu_scores) if bleu_scores else 0
            
            # Enregistrer les résultats
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            result = {
                "success": True,
                "metric": "bleu",
                "value": float(avg_bleu),
                "model_path": self.model_path,
                "test_file": test_file,
                "timestamp": timestamp,
                "details": predictions
            }
            
            # Sauvegarder les résultats
            output_path = os.path.join(self.output_dir, f"bleu_{timestamp}.json")
            with open(output_path, "w") as f:
                json.dump(result, f, indent=2)
            
            logger.info(f"Évaluation du score BLEU terminée: {avg_bleu}")
            return result
        except Exception as e:
            logger.error(f"Erreur lors de l'évaluation du score BLEU: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def run_comprehensive_evaluation(self, test_file: str) -> Dict[str, Any]:
        """
        Exécute une évaluation complète du modèle.
        
        Args:
            test_file: Chemin vers le fichier de test
        
        Returns:
            Dict[str, Any]: Résultats de l'évaluation
        """
        results = {}
        
        # Évaluer la perplexité
        perplexity_result = self.evaluate_perplexity(test_file)
        results["perplexity"] = perplexity_result
        
        # Évaluer la précision
        accuracy_result = self.evaluate_accuracy(test_file)
        results["accuracy"] = accuracy_result
        
        # Évaluer le score BLEU
        bleu_result = self.evaluate_bleu(test_file)
        results["bleu"] = bleu_result
        
        # Calculer un score global
        if all(r.get("success", False) for r in [perplexity_result, accuracy_result, bleu_result]):
            # Normaliser la perplexité (plus basse est meilleure)
            norm_perplexity = 1.0 / (1.0 + perplexity_result["value"])
            
            # Calculer le score global (moyenne pondérée)
            global_score = (
                0.3 * norm_perplexity +
                0.4 * accuracy_result["value"] +
                0.3 * bleu_result["value"]
            )
            
            results["global_score"] = global_score
        
        # Enregistrer les résultats
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(self.output_dir, f"comprehensive_evaluation_{timestamp}.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        logger.info("Évaluation complète terminée")
        return results
    
    def _load_test_data(self, test_file: str, format_type: str = "text") -> List[Any]:
        """
        Charge les données de test depuis un fichier.
        
        Args:
            test_file: Chemin vers le fichier de test
            format_type: Type de format ('text' ou 'qa')
        
        Returns:
            List[Any]: Données de test
        """
        file_extension = Path(test_file).suffix.lower()
        
        if format_type == "text":
            # Charger des textes simples
            if file_extension == '.txt':
                with open(test_file, 'r', encoding='utf-8') as f:
                    return [line.strip() for line in f if line.strip()]
            elif file_extension == '.csv':
                df = pd.read_csv(test_file)
                if len(df.columns) > 0:
                    return df.iloc[:, 0].tolist()
                return []
            elif file_extension == '.json':
                with open(test_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if isinstance(data, list):
                    return data
                return []
            else:
                logger.error(f"Format de fichier non pris en charge: {file_extension}")
                return []
        elif format_type == "qa":
            # Charger des paires question-réponse
            if file_extension == '.csv':
                df = pd.read_csv(test_file)
                if len(df.columns) >= 2:
                    return [{"question": q, "answer": a} for q, a in zip(df.iloc[:, 0], df.iloc[:, 1])]
                return []
            elif file_extension == '.json':
                with open(test_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if isinstance(data, list):
                    return data
                return []
            else:
                logger.error(f"Format de fichier non pris en charge pour le format QA: {file_extension}")
                return []
        else:
            logger.error(f"Type de format non pris en charge: {format_type}")
            return []
    
    def _compare_answers(self, predicted: str, expected: str) -> bool:
        """
        Compare la réponse prédite avec la réponse attendue.
        
        Args:
            predicted: Réponse prédite
            expected: Réponse attendue
        
        Returns:
            bool: True si les réponses sont considérées comme équivalentes
        """
        # Normaliser les réponses
        predicted = predicted.lower().strip()
        expected = expected.lower().strip()
        
        # Vérifier l'égalité exacte
        if predicted == expected:
            return True
        
        # Vérifier si la réponse attendue est contenue dans la prédiction
        if expected in predicted:
            return True
        
        # Calculer la similarité de Jaccard
        try:
            from nltk.tokenize import word_tokenize
            
            pred_tokens = set(word_tokenize(predicted))
            exp_tokens = set(word_tokenize(expected))
            
            intersection = len(pred_tokens.intersection(exp_tokens))
            union = len(pred_tokens.union(exp_tokens))
            
            jaccard = intersection / union if union > 0 else 0
            
            # Considérer comme correct si la similarité est supérieure à un seuil
            return jaccard > 0.7
        except Exception:
            # En cas d'erreur, revenir à une comparaison simple
            return False
