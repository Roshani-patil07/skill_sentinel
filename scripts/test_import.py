import sys
import os
sys.path.insert(0, os.path.abspath("."))

try:
    import backend.app.main
    print("Backend loaded successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()
