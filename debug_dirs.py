import os

BASE_DIR = os.getcwd()
print(f"BASE_DIR: {BASE_DIR}")

def list_dirs(path):
    try:
        return [
            d for d in os.listdir(path)
            if os.path.isdir(os.path.join(path, d))
        ]
    except Exception as e:
        print(f"Error listing dirs: {e}")
        return []

root_folders = list_dirs(BASE_DIR)
print(f"Root folders found: {root_folders}")

ignore = {"scripts", ".git", "__pycache__"}
sections = [f for f in root_folders if f not in ignore]
print(f"Filtered sections: {sections}")

# check specifically for semester-1
sem1_path = os.path.join(BASE_DIR, "semester-1")
print(f"semester-1 exists: {os.path.exists(sem1_path)}")
print(f"semester-1 is dir: {os.path.isdir(sem1_path)}")
