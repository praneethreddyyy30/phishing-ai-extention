// Function to extract basic features from the URL
function extractFeatures(url) {
  return {
    Have_IP: /\d+\.\d+\.\d+\.\d+/.test(url) ? 1 : 0,
    Have_At: url.includes('@') ? 1 : 0,
    URL_Length: url.length,
    URL_Depth: url.split('/').length - 1,
    Redirection: (url.match(/\/\//g) || []).length - 1 > 0 ? 1 : 0,
    https_Domain: url.startsWith("https") ? 1 : 0,
    TinyURL: /(bit\.ly|tinyurl\.com|goo\.gl)/.test(url) ? 1 : 0,
    "Prefix/Suffix": url.includes('-') ? 1 : 0,
    DNS_Record: 1,
    Web_Traffic: 1,
    Domain_Age: 5,
    Domain_End: 1,
    iFrame: 0,
    Mouse_Over: 0,
    Right_Click: 1,
    Web_Forwards: 0
  };
}

document.getElementById('checkBtn').addEventListener('click', async () => {
  try {
    // Get current tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // API Call 

    // IMPORTANT: When deploying to Render, change this URL to your Render deployment URL
    // Example: 'https://phishing-detection-api-xxxxx.onrender.com/predict'
    const API_URL = 'http://127.0.0.1:5000/predict'; 

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });


    const data = await response.json();

    // Show result in popup
    document.getElementById('result').textContent =
      data.prediction === 1 ? "Phishing URL 🚨" : "Legitimate URL ✅";

  } catch (error) {
    document.getElementById('result').textContent = 'Error connecting to server';
    console.error(error);
  }
});
