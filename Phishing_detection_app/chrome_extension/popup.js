// Feature Extraction Function
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
  const resultContainer = document.getElementById('result-container');
  const resultEl = document.getElementById('result');
  const btn = document.getElementById('checkBtn');
  const urlBox = document.getElementById('urlDisplay');
  const iconContainer = document.getElementById('main-icon');

  try {
    // 🔄 Loading state
    resultContainer.classList.add('show');
    resultEl.textContent = "Scanning securely...";
    resultEl.className = "loading-text";
    
    iconContainer.textContent = "🔍";
    iconContainer.classList.add("loading-icon");
    iconContainer.style.background = "rgba(255, 255, 255, 0.05)";
    iconContainer.style.borderColor = "rgba(255, 255, 255, 0.1)";
    iconContainer.style.boxShadow = "none";

    btn.disabled = true;
    btn.textContent = "Analyzing...";

    // Get current tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // Display URL
    urlBox.textContent = url;

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

    iconContainer.classList.remove("loading-icon");

    // 🎯 Result
    if (data.prediction === 1) {
      resultEl.textContent = "⚠️ Phishing Detected!";
      resultEl.className = "phishing";
      
      iconContainer.textContent = "⚠️";
      iconContainer.style.background = "rgba(239, 68, 68, 0.1)";
      iconContainer.style.borderColor = "rgba(239, 68, 68, 0.3)";
      iconContainer.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.2)";
    } else {
      resultEl.textContent = "✅ Safe Website";
      resultEl.className = "safe";
      
      iconContainer.textContent = "✅";
      iconContainer.style.background = "rgba(16, 185, 129, 0.1)";
      iconContainer.style.borderColor = "rgba(16, 185, 129, 0.3)";
      iconContainer.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.2)";
    }

  } catch (error) {
    iconContainer.classList.remove("loading-icon");
    iconContainer.textContent = "❌";
    iconContainer.style.background = "rgba(239, 68, 68, 0.1)";
    iconContainer.style.borderColor = "rgba(239, 68, 68, 0.3)";
    
    resultEl.textContent = "Connection Error";
    resultEl.className = "phishing";
    console.error("API Fetch Error: ", error);
  }

  // 🔁 Reset button
  btn.disabled = false;
  btn.textContent = "Scan Again";
});