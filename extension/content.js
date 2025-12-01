// 📸 Floating Button Styles
const style = document.createElement('style');
style.textContent = `
  #ai-assistant-floating-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
    border: none;
    cursor: move;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    transition: all 0.3s ease;
    font-weight: bold;
    touch-action: none;
    user-select: none;
  }

  #ai-assistant-floating-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  }

  #ai-assistant-floating-btn:active {
    transform: scale(0.95);
    cursor: grabbing;
  }

  #ai-assistant-floating-btn.dragging {
    opacity: 0.8;
    cursor: grabbing;
  }

  .ai-assistant-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto;
  }

  .ai-assistant-modal {
    background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
    border-radius: 12px;
    padding: 24px;
    color: white;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ai-assistant-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 12px;
  }

  .ai-assistant-modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
  }

  .ai-assistant-close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    transition: all 0.2s;
  }

  .ai-assistant-close-btn:hover {
    color: #fbbf24;
  }

  .ai-assistant-section {
    margin-bottom: 16px;
    background: rgba(0, 0, 0, 0.2);
    padding: 16px;
    border-radius: 8px;
  }

  .ai-assistant-label {
    font-size: 14px;
    color: #d1d5db;
    margin-bottom: 8px;
    display: block;
    font-weight: 500;
  }

  .ai-assistant-textarea,
  .ai-assistant-input {
    width: 100%;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  .ai-assistant-textarea:focus,
  .ai-assistant-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
  }

  .ai-assistant-textarea {
    min-height: 100px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  .ai-assistant-screenshot-preview {
    margin-bottom: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    overflow: hidden;
    max-height: 200px;
  }

  .ai-assistant-screenshot-preview img {
    width: 100%;
    height: auto;
    display: block;
  }

  .ai-assistant-progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 8px;
  }

  .ai-assistant-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .ai-assistant-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .ai-assistant-btn {
    flex: 1;
    min-width: 120px;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ai-assistant-btn-capture {
    background: white;
    color: #9333ea;
  }

  .ai-assistant-btn-capture:hover:not(:disabled) {
    background: #f3f4f6;
    transform: translateY(-2px);
  }

  .ai-assistant-btn-analyze {
    background: #fbbf24;
    color: #7c2d12;
  }

  .ai-assistant-btn-analyze:hover:not(:disabled) {
    background: #fcd34d;
    transform: translateY(-2px);
  }

  .ai-assistant-btn-clear {
    background: rgba(239, 68, 68, 0.8);
    color: white;
  }

  .ai-assistant-btn-clear:hover:not(:disabled) {
    background: #ef4444;
    transform: translateY(-2px);
  }

  .ai-assistant-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ai-assistant-tip {
    font-size: 12px;
    color: #d1d5db;
    margin-top: 12px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    border-left: 3px solid #fbbf24;
  }

  .ai-assistant-status {
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 4px;
    margin-top: 12px;
  }

  .ai-assistant-status.loading {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
  }

  .ai-assistant-status.info {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
  }

  .ai-assistant-status.warning {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
  }
    color: #93c5fd;
  }

  .ai-assistant-status.error {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  .ai-assistant-status.success {
    background: rgba(34, 197, 94, 0.2);
    color: #86efac;
  }
`;

// Safely append styles with null checks
function appendStyles() {
  const head = document.head || document.documentElement;
  if (head) {
    head.appendChild(style);
  }
}

// 🎯 Create Floating Button
function createFloatingButton() {
  const button = document.createElement('button');
  button.id = 'ai-assistant-floating-btn';
  button.innerHTML = '📷';
  button.title = 'Drag to move • Click to capture';
  button.addEventListener('click', openModal);

  // Add drag functionality
  let isDragging = false;
  let startX, startY, currentX = 0, currentY = 0;

  button.addEventListener('mousedown', (e) => {
    if (modal) return; // Don't drag if modal is open
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    button.classList.add('dragging');
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    // Constrain button to viewport
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    button.style.left = currentX + 'px';
    button.style.top = currentY + 'px';
    button.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    button.classList.remove('dragging');
    // Save position to localStorage
    localStorage.setItem('ai-assistant-btn-pos', JSON.stringify({ x: currentX, y: currentY }));
  });

  const body = document.body;
  if (body) {
    body.appendChild(button);

    // Restore saved position
    try {
      const savedPos = localStorage.getItem('ai-assistant-btn-pos');
      if (savedPos) {
        const pos = JSON.parse(savedPos);
        button.style.left = pos.x + 'px';
        button.style.top = pos.y + 'px';
        button.style.right = 'auto';
        currentX = pos.x;
        currentY = pos.y;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

// 🖼️ Open Modal
let modal = null;
let state = {
  capturedImage: null,
  extractedText: '',
  selectedText: '',
  userQuestion: '',
  ocrProgress: 0,
  isCapturing: false,
  isProcessing: false
};

function openModal() {
  if (modal) return;

  const overlay = document.createElement('div');
  overlay.className = 'ai-assistant-modal-overlay';

  modal = document.createElement('div');
  modal.className = 'ai-assistant-modal';

  modal.innerHTML = `
    <div class="ai-assistant-modal-header">
      <h3>📸 Screen Reader AI</h3>
      <button class="ai-assistant-close-btn" id="close-modal-btn">✕</button>
    </div>

    <div class="ai-assistant-section" id="preview-section" style="display: none;">
      <div class="ai-assistant-screenshot-preview">
        <img id="screenshot-preview" alt="Captured screen">
      </div>
    </div>

    <div class="ai-assistant-section" id="ocr-section" style="display: none;">
      <label class="ai-assistant-label">📖 OCR Progress</label>
      <div class="ai-assistant-progress-bar">
        <div class="ai-assistant-progress-fill" id="ocr-progress" style="width: 0%"></div>
      </div>
      <p id="ocr-status" style="font-size: 12px; margin-top: 4px; color: #d1d5db;"></p>
    </div>

    <div class="ai-assistant-section" id="text-section" style="display: none;">
      <label class="ai-assistant-label">📝 Extracted Text (Edit if needed)</label>
      <textarea class="ai-assistant-textarea" id="extracted-text" placeholder="Extracted text will appear here..."></textarea>
    </div>

    <div class="ai-assistant-section" id="question-section" style="display: none;">
      <label class="ai-assistant-label">❓ What would you like to ask about this?</label>
      <textarea class="ai-assistant-textarea" id="user-question" placeholder="Ask your question here..."></textarea>
    </div>

    <div class="ai-assistant-buttons">
      <button class="ai-assistant-btn ai-assistant-btn-capture" id="capture-btn">
        📷 Capture Screen
      </button>
      <button class="ai-assistant-btn ai-assistant-btn-analyze" id="analyze-btn" style="display: none;">
        🤖 Ask AI
      </button>
      <button class="ai-assistant-btn ai-assistant-btn-clear" id="clear-btn" style="display: none;">
        ✕ Clear
      </button>
    </div>

    <div id="status-message"></div>
    <div class="ai-assistant-tip">💡 Capture screen → Edit text → Ask AI question</div>
  `;

  overlay.appendChild(modal);
  const body = document.body;
  if (body) {
    body.appendChild(overlay);
  }

  // Attach event listeners (not inline onclick)
  const closeBtn = document.getElementById('close-modal-btn');
  const captureBtn = document.getElementById('capture-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  const clearBtn = document.getElementById('clear-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (captureBtn) {
    captureBtn.addEventListener('click', captureScreen);
  }
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeWithAI);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', clearModal);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

function closeModal() {
  if (modal && modal.parentElement) {
    modal.parentElement.remove();
    modal = null;
  }
}

// 📸 Capture Screen (using native Canvas API only - no external dependencies)
async function captureScreen() {
  try {
    state.isCapturing = true;
    const button = document.getElementById('capture-btn');
    button.disabled = true;
    button.textContent = '📷 Capturing...';

    console.log('📷 Starting screenshot capture using native Canvas API...');

    // Use only native Canvas API - no external CDN dependencies
    const canvas = await captureViewportNative();

    if (!canvas) {
      throw new Error('Failed to capture screenshot');
    }

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    const url = URL.createObjectURL(blob);

    state.capturedImage = url;

    // Show preview
    document.getElementById('preview-section').style.display = 'block';
    document.getElementById('screenshot-preview').src = url;

    // Extract text from page (without external OCR)
    await extractTextNative();

    button.textContent = '📷 Capture Screen';
    button.disabled = false;
    showStatus('✅ Screenshot captured & text extracted!', 'success');
  } catch (error) {
    console.error('❌ Capture error:', error);
    showStatus('📝 Screenshot captured. Please manually edit the text field below.', 'warning');
    const button = document.getElementById('capture-btn');
    button.textContent = '📷 Capture Screen';
    button.disabled = false;
    // Still show input fields
    document.getElementById('text-section').style.display = 'block';
    document.getElementById('question-section').style.display = 'block';
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    if (analyzeBtn) analyzeBtn.style.display = 'inline-block';
    if (clearBtn) clearBtn.style.display = 'inline-block';
  } finally {
    state.isCapturing = false;
  }
}

// 🎨 Capture viewport using native Canvas API only
async function captureViewportNative() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = window.innerWidth;
    canvas.height = Math.min(window.innerHeight, 1080); // Cap height to avoid memory issues

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw page background color
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw visible text from all elements
    drawPageContent(ctx, canvas);

    return canvas;
  } catch (error) {
    console.error('❌ Native capture failed:', error);
    return null;
  }
}

// 🖌️ Helper function to draw page content on canvas
function drawPageContent(ctx, canvas) {
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial, sans-serif';
  let yPos = 40;

  // Get all visible text elements
  const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, li');
  const maxWidth = canvas.width - 20;

  for (let el of elements) {
    if (yPos > canvas.height - 40) break; // Stop if we've filled the canvas

    // Skip hidden elements
    if (el.offsetHeight === 0 || el.offsetWidth === 0) continue;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    const text = el.textContent?.trim();
    if (!text || text.length === 0) continue;
    if (text.length > 1000) continue; // Skip very long text

    // Determine font size based on element type
    let fontSize = 12;
    if (el.tagName.match(/^H[1-3]$/)) fontSize = 18;
    else if (el.tagName.match(/^H[4-6]$/)) fontSize = 14;
    else if (el.tagName === 'STRONG' || el.tagName === 'B') fontSize = 14;

    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = '#000000';

    // Wrap text to fit canvas width
    const words = text.split(' ');
    let line = '';

    for (let word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, 10, yPos);
        yPos += fontSize + 4;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, 10, yPos);
      yPos += fontSize + 8;
    }
  }

  return yPos;
}

// 📝 Extract text from page (native - no external dependencies)
async function extractTextNative() {
  try {
    state.isProcessing = true;

    document.getElementById('ocr-section').style.display = 'block';
    document.getElementById('text-section').style.display = 'block';
    document.getElementById('question-section').style.display = 'block';

    showStatus('📝 Extracting text from page...', 'info');

    // Extract all visible text from the page
    const allText = extractVisibleText();

    state.extractedText = allText;
    state.selectedText = allText;

    const extractedField = document.getElementById('extracted-text');
    if (extractedField) {
      extractedField.value = allText;
    }

    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    if (analyzeBtn) analyzeBtn.style.display = 'inline-block';
    if (clearBtn) clearBtn.style.display = 'inline-block';

    showStatus('✅ Text extracted successfully! You can edit it if needed.', 'success');
  } catch (error) {
    console.error('❌ Text extraction error:', error);
    showStatus('Unable to extract text. Please manually enter it below.', 'warning');
    document.getElementById('text-section').style.display = 'block';
    document.getElementById('question-section').style.display = 'block';
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    if (analyzeBtn) analyzeBtn.style.display = 'inline-block';
    if (clearBtn) clearBtn.style.display = 'inline-block';
  } finally {
    state.isProcessing = false;
  }
}

// 🔍 Extract all visible text from the page
function extractVisibleText() {
  const textContent = [];
  const maxChars = 5000; // Limit total characters
  let totalChars = 0;

  // Get main content areas first (usually contain important text)
  const mainAreas = document.querySelectorAll('main, article, .content, .main, #content, [role="main"]');

  const elementsToProcess = mainAreas.length > 0 ? mainAreas : [document.body];

  for (let area of elementsToProcess) {
    if (totalChars >= maxChars) break;

    // Get all text nodes and elements
    const walker = document.createTreeWalker(
      area,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (totalChars >= maxChars) break;

      const text = node.textContent?.trim();
      if (!text || text.length === 0) continue;

      // Skip very long single chunks
      if (text.length > 1000) continue;

      // Skip common non-content text
      if (text.match(/^(javascript:|undefined|null|NaN)$/i)) continue;

      textContent.push(text);
      totalChars += text.length;
    }
  }

  // Deduplicate and join
  const uniqueText = [...new Set(textContent)];
  return uniqueText.join('\n\n').substring(0, maxChars);
}

// 🤖 Analyze with AI
async function analyzeWithAI() {
  const question = document.getElementById('user-question').value.trim();
  const text = document.getElementById('extracted-text').value.trim();

  if (!question) {
    alert('Please enter a question');
    return;
  }

  if (!text) {
    alert('Please capture screen first');
    return;
  }

  try {
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🤖 Analyzing...';

    // Send to backend (backend runs on port 8000 by default)
    const backendUrl = 'http://localhost:8000/api/user/asktoassistant-public';

    console.log('📤 Sending request to:', backendUrl);
    console.log('📝 Question:', question);
    console.log('📋 Text length:', text.length);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: `Here is text from screenshot:\n\n${text}\n\nQuestion: ${question}`
      })
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', errorText);
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', data);

    if (data.response) {
      showStatus(`✅ AI Response: ${data.response}`, 'success');
      // Speak response using TTS
      const utterance = new SpeechSynthesisUtterance(data.response);
      window.speechSynthesis.speak(utterance);
    } else {
      showStatus('No response received from AI', 'warning');
    }

    analyzeBtn.textContent = '🤖 Ask AI';
    analyzeBtn.disabled = false;
  } catch (error) {
    console.error('❌ Analysis error:', error);
    console.error('💡 Make sure backend is running: npm run dev (in backend folder)');
    console.error('💡 Backend should be at: http://localhost:8000');
    showStatus(`❌ Error: ${error.message}. Check console for details.`, 'error');
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.textContent = '🤖 Ask AI';
    analyzeBtn.disabled = false;
  }
}

// 🗑️ Clear Modal
function clearModal() {
  document.getElementById('extracted-text').value = '';
  document.getElementById('user-question').value = '';
  document.getElementById('screenshot-preview').src = '';
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('text-section').style.display = 'none';
  document.getElementById('question-section').style.display = 'none';
  document.getElementById('analyze-btn').style.display = 'none';
  document.getElementById('clear-btn').style.display = 'none';
  state = {
    capturedImage: null,
    extractedText: '',
    selectedText: '',
    userQuestion: '',
    ocrProgress: 0,
    isCapturing: false,
    isProcessing: false
  };
}

// 💬 Status Messages
function showStatus(message, type) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.className = `ai-assistant-status ${type}`;
  statusDiv.textContent = message;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 5000);
}

// 🌐 Global Functions for HTML onclick (kept for backward compatibility)
window.closeAIModal = closeModal;
window.captureScreenExtension = captureScreen;
window.analyzeWithAI = analyzeWithAI;
window.clearModal = clearModal;

// 🚀 Initialize on page load
function initializeExtension() {
  try {
    // Append styles first
    appendStyles();
    // Then create floating button
    createFloatingButton();
    console.log('✅ AI Assistant extension loaded! Look for the 📷 button at top-right.');
  } catch (error) {
    console.error('❌ Failed to initialize extension:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  // Use setTimeout to ensure DOM is fully ready
  setTimeout(initializeExtension, 100);
}
