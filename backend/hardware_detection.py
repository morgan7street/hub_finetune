import os
import platform
import subprocess
import json
from typing import Dict, Any, List, Optional

def get_cpu_info() -> Dict[str, Any]:
    """Récupère les informations sur le CPU."""
    cpu_info = {
        "processor": platform.processor(),
        "cpu_count": os.cpu_count()
    }
    
    # Obtenir plus d'informations sur le CPU selon le système d'exploitation
    if platform.system() == "Linux":
        try:
            with open("/proc/cpuinfo", "r") as f:
                for line in f:
                    if "model name" in line:
                        cpu_info["model_name"] = line.split(":")[1].strip()
                        break
        except Exception:
            pass
    elif platform.system() == "Windows":
        try:
            result = subprocess.run(["wmic", "cpu", "get", "name"], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")
                if len(lines) > 1:
                    cpu_info["model_name"] = lines[1].strip()
        except Exception:
            pass
    
    return cpu_info

def get_memory_info() -> Dict[str, Any]:
    """Récupère les informations sur la mémoire RAM."""
    memory_info = {}
    
    try:
        import psutil
        memory = psutil.virtual_memory()
        memory_info["total"] = memory.total
        memory_info["available"] = memory.available
        memory_info["used"] = memory.used
        memory_info["percent"] = memory.percent
    except ImportError:
        # Fallback si psutil n'est pas disponible
        if platform.system() == "Linux":
            try:
                with open("/proc/meminfo", "r") as f:
                    for line in f:
                        if "MemTotal" in line:
                            memory_info["total"] = int(line.split()[1]) * 1024
                        elif "MemAvailable" in line:
                            memory_info["available"] = int(line.split()[1]) * 1024
                        if "total" in memory_info and "available" in memory_info:
                            break
            except Exception:
                pass
    
    return memory_info

def get_disk_info() -> Dict[str, Any]:
    """Récupère les informations sur le stockage disque."""
    disk_info = {}
    
    try:
        import psutil
        disk = psutil.disk_usage("/")
        disk_info["total"] = disk.total
        disk_info["used"] = disk.used
        disk_info["free"] = disk.free
        disk_info["percent"] = disk.percent
    except ImportError:
        # Fallback si psutil n'est pas disponible
        if platform.system() == "Linux":
            try:
                result = subprocess.run(["df", "-h", "/"], capture_output=True, text=True)
                if result.returncode == 0:
                    lines = result.stdout.strip().split("\n")
                    if len(lines) > 1:
                        parts = lines[1].split()
                        if len(parts) >= 5:
                            disk_info["total"] = parts[1]
                            disk_info["used"] = parts[2]
                            disk_info["free"] = parts[3]
                            disk_info["percent"] = parts[4]
            except Exception:
                pass
    
    return disk_info

def get_gpu_info() -> Dict[str, Any]:
    """Récupère les informations sur les GPU (NVIDIA et AMD)."""
    gpu_info = {
        "nvidia": {
            "available": False,
            "devices": []
        },
        "amd": {
            "available": False,
            "devices": []
        }
    }
    
    # Vérifier les GPU NVIDIA
    try:
        result = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu", "--format=csv,noheader,nounits"], capture_output=True, text=True)
        if result.returncode == 0:
            gpu_info["nvidia"]["available"] = True
            lines = result.stdout.strip().split("\n")
            for i, line in enumerate(lines):
                if line.strip():
                    parts = [part.strip() for part in line.split(",")]
                    if len(parts) >= 6:
                        device_info = {
                            "id": i,
                            "name": parts[0],
                            "memory_total": parts[1],
                            "memory_used": parts[2],
                            "memory_free": parts[3],
                            "temperature": parts[4],
                            "utilization": parts[5]
                        }
                        gpu_info["nvidia"]["devices"].append(device_info)
    except Exception:
        pass
    
    # Vérifier les GPU AMD
    try:
        result = subprocess.run(["rocm-smi", "--json"], capture_output=True, text=True)
        if result.returncode == 0:
            gpu_info["amd"]["available"] = True
            data = json.loads(result.stdout)
            for device_id, device_data in data.items():
                if device_id.isdigit():
                    device_info = {
                        "id": int(device_id),
                        "name": device_data.get("Card Series", "Unknown"),
                        "memory_total": device_data.get("GPU memory", {}).get("total", "Unknown"),
                        "memory_used": device_data.get("GPU memory", {}).get("used", "Unknown"),
                        "temperature": device_data.get("Temperature", {}).get("Edge", "Unknown")
                    }
                    gpu_info["amd"]["devices"].append(device_info)
    except Exception:
        pass
    
    # Fallback avec PyTorch si disponible
    if not gpu_info["nvidia"]["available"] and not gpu_info["amd"]["available"]:
        try:
            import torch
            if torch.cuda.is_available():
                gpu_info["nvidia"]["available"] = True
                for i in range(torch.cuda.device_count()):
                    device_info = {
                        "id": i,
                        "name": torch.cuda.get_device_name(i),
                        "memory_total": torch.cuda.get_device_properties(i).total_memory,
                        "memory_allocated": torch.cuda.memory_allocated(i),
                        "memory_reserved": torch.cuda.memory_reserved(i)
                    }
                    gpu_info["nvidia"]["devices"].append(device_info)
        except ImportError:
            pass
    
    return gpu_info

def get_hardware_info() -> Dict[str, Any]:
    """Récupère toutes les informations sur le hardware."""
    hardware_info = {
        "system": {
            "os": platform.system(),
            "os_version": platform.version(),
            "architecture": platform.machine(),
            "python_version": platform.python_version()
        },
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "gpu": get_gpu_info()
    }
    
    return hardware_info

if __name__ == "__main__":
    # Test de la fonction
    hardware_info = get_hardware_info()
    print(json.dumps(hardware_info, indent=2))
