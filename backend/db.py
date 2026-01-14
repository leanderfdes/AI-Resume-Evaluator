from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from config import MONGODB_URI, DB_NAME

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

users_col = db["users"]
runs_col = db["resume_runs"]  # ✅ NEW

def ensure_indexes():
    try:
        client.admin.command("ping")
        users_col.create_index("email", unique=True)

        # ✅ NEW indexes for runs
        runs_col.create_index([("user_id", 1), ("created_at", -1)])
        print("✅ MongoDB connected + indexes ensured")
    except Exception as e:
        print(f"⚠️ MongoDB not reachable at startup. Skipping indexes. Reason: {e}")
