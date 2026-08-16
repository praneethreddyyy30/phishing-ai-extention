import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import xgboost as xgb
import pickle

# Define the path to the data file
current_dir = os.path.dirname(os.path.abspath(__file__))
data_file_path = os.path.join(current_dir, 'DataFiles', '5.urldata.csv')

# Load the dataset
data = pd.read_csv(data_file_path)

# Optional: strip whitespace from column names
data.columns = data.columns.str.strip()

# Extract features and labels
X = data.drop(columns=['Label', 'Domain'])  # Drop 'Domain' because it's string
y = data['Label']

# Encode categorical/string features if any
for col in X.columns:
    if X[col].dtype == 'object':
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train a Tuned Random Forest model
print("Training Tuned Random Forest model...")
rf_model = RandomForestClassifier(n_estimators=500, random_state=42)
rf_model.fit(X_train, y_train)

# Evaluate the Random Forest model
rf_pred = rf_model.predict(X_test)
rf_accuracy = accuracy_score(y_test, rf_pred)
print(f'Random Forest Accuracy: {rf_accuracy * 100:.2f}%')

# Save the Random Forest model to both random_forest_model.pkl and xg_boost.pkl (for backward compatibility)
with open(os.path.join(current_dir, 'random_forest_model.pkl'), 'wb') as file:
    pickle.dump(rf_model, file)
with open(os.path.join(current_dir, 'xg_boost.pkl'), 'wb') as file:
    pickle.dump(rf_model, file)

# Train a real, tuned XGBoost model
print("Training Tuned XGBoost model...")
xgb_model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=8,
    learning_rate=0.02,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='logloss'
)
xgb_model.fit(X_train, y_train)

# Evaluate the XGBoost model
xgb_pred = xgb_model.predict(X_test)
xgb_accuracy = accuracy_score(y_test, xgb_pred)
print(f'XGBoost Accuracy: {xgb_accuracy * 100:.2f}%')

# Save the XGBoost model
with open(os.path.join(current_dir, 'xgboost_model.pkl'), 'wb') as file:
    pickle.dump(xgb_model, file)

