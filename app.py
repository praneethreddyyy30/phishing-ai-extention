from flask import Flask, request, jsonify
from flask_cors import CORS  
import pickle
import pandas as pd
from urllib.parse import urlparse
from sklearn.preprocessing import LabelEncoder
from URLFeatureExtraction import featureExtraction

app = Flask(__name__)
CORS(app)  # <-- enable cross-origin requests

# Load your trained model
with open('xg_boost.pkl', 'rb') as file:
    model = pickle.load(file)

# Trusted domain whitelist to prevent false positives on highly popular domains
TRUSTED_DOMAINS = {
    'google.com', 'github.com', 'youtube.com', 'wikipedia.org', 
    'microsoft.com', 'apple.com', 'amazon.com', 'gmail.com', 
    'facebook.com', 'twitter.com', 'linkedin.com', 'netflix.com',
    'google.co.in', 'yahoo.com', 'bing.com', 'duckduckgo.com'
}

@app.route('/', methods=['GET'])
def home():
    return jsonify({'status': 'API is running. Send a POST request to /predict to use the model.'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        if data and 'url' in data:
            url = data['url']
            
            # Check if domain is whitelisted
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            # Remove port if any (e.g. localhost:5000)
            domain = domain.split(':')[0]
            # Remove www. prefix if present for uniform check
            if domain.startswith('www.'):
                domain = domain[4:]
                
            if domain in TRUSTED_DOMAINS or any(domain.endswith('.' + td) for td in TRUSTED_DOMAINS):
                return jsonify({'prediction': 0})
                
            # Server-side feature extraction
            features = featureExtraction(url)
            df = pd.DataFrame([features], columns=[
                'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection', 
                'https_Domain', 'TinyURL', 'Prefix/Suffix', 'DNS_Record', 'Web_Traffic', 
                'Domain_Age', 'Domain_End', 'iFrame', 'Mouse_Over', 'Right_Click', 'Web_Forwards'
            ])

        else:
            # Fallback to client-side features if provided
            df = pd.DataFrame([data])
            # Encode categorical columns if needed
            for col in df.columns:
                if df[col].dtype == 'object':
                    le = LabelEncoder()
                    df[col] = le.fit_transform(df[col])

        prediction = model.predict(df)[0]
        return jsonify({'prediction': int(prediction)})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)

