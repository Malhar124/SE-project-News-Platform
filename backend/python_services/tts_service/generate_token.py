import firebase_admin
from firebase_admin import credentials, auth

# Replace with your Firebase service account path
cred = credentials.Certificate("/Users/malharudmale/Desktop/news platform/backend/news-platform-backend-eb75e-firebase-adminsdk-fbsvc-5b37da6380.json")
firebase_admin.initialize_app(cred)

# Create a custom token for testing
custom_token = auth.create_custom_token("test-user")

print(custom_token.decode("utf-8"))