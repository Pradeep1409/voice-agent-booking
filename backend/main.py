import os
import sys
import site
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- AGGRESSIVE WINDOWS DLL FIX ---
# This ensures we use the correct cuDNN v9 and cuBLAS v12+ libraries 
# to avoid "Could not load symbol cudnnGetLibConfig" (Error 127).
if sys.platform == "win32":
    import site
    import subprocess
    
    # 1. Determine site-packages locations
    search_dirs = list(site.getsitepackages())
    if hasattr(site, 'getusersitepackages'):
        search_dirs.append(site.getusersitepackages())
    
    # Ensure current venv is prioritized
    venv_site = os.path.join(sys.prefix, "Lib", "site-packages")
    if venv_site not in search_dirs:
        search_dirs.append(venv_site)

    # 2. Extract specific BIN folders that MUST be first
    core_dll_paths = []
    for sp in set(search_dirs):
        if not os.path.exists(sp): continue
        targets = [
            os.path.join(sp, "nvidia", "cudnn", "bin"),
            os.path.join(sp, "nvidia", "cublas", "bin"),
            os.path.join(sp, "torch", "lib"),
        ]
        for p in targets:
            if os.path.exists(p) and p not in core_dll_paths:
                core_dll_paths.append(p)

    # 3. Reconstruct PATH with NO system-wide CUDA paths to avoid conflicts
    # We put our venv paths at the VERY BEGINNING
    clean_path = os.pathsep.join(core_dll_paths) + os.pathsep + os.environ.get("PATH", "")
    os.environ["PATH"] = clean_path

    # 4. Use add_dll_directory and MANUAL LOAD via ctypes to lock the version
    if hasattr(os, "add_dll_directory"):
        import ctypes
        for p in core_dll_paths:
            try:
                os.add_dll_directory(p)
                print(f"-> [System] DLL Priority: {p}")
                
                # Specifically force-load cuDNN to prevent Error 127
                cudnn_dll = os.path.join(p, "cudnn64_9.dll")
                if os.path.exists(cudnn_dll):
                    print(f"-> [System] Force-loading: {cudnn_dll}")
                    ctypes.WinDLL(cudnn_dll)
            except Exception as e:
                print(f"-> [System] DLL Load Warning: {e}")
# ----------------------------------

from app.api.routes import voice
from app.config import settings

app = FastAPI(title=settings.APP_NAME)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(voice.router)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    # Set reload=False for stability while debugging DLL issues
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
