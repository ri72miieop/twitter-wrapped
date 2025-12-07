export function getLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twitter Wrapped 2025 - Generate Your Year in Tweets</title>
  <meta name="description" content="Upload your Twitter archive and see your personalized 2025 Wrapped - your year in tweets, visualized beautifully.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js"></script>
  <style>
    :root {
      --bg-dark: #050508;
      --bg-card: rgba(255, 255, 255, 0.03);
      --cyan: #00f5d4;
      --magenta: #f72585;
      --lime: #b8f83a;
      --gold: #ffd60a;
      --purple: #7b2cbf;
      --text: #ffffff;
      --text-dim: rgba(255,255,255,0.5);
      --text-dimmer: rgba(255,255,255,0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
    }

    .bg-gradient {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2;
      background:
        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(123, 44, 191, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(247, 37, 133, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 50% 60% at 50% 80%, rgba(0, 245, 212, 0.08) 0%, transparent 50%),
        var(--bg-dark);
    }

    .noise {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;
      pointer-events: none; opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-year {
      font-size: clamp(80px, 15vw, 180px);
      font-weight: 900;
      line-height: 0.9;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--cyan) 0%, var(--magenta) 50%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
      margin-bottom: 16px;
    }

    .hero-subtitle {
      text-align: center;
      font-size: 18px;
      color: var(--text-dim);
      margin-bottom: 48px;
    }

    .upload-section {
      background: var(--bg-card);
      border: 2px dashed rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 48px 32px;
      text-align: center;
      transition: all 0.3s;
      cursor: pointer;
    }

    .upload-section:hover, .upload-section.drag-over {
      border-color: var(--cyan);
      background: rgba(0, 245, 212, 0.05);
    }

    .upload-section.processing {
      pointer-events: none;
      border-color: var(--magenta);
    }

    .upload-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .upload-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .upload-desc {
      color: var(--text-dim);
      font-size: 16px;
      margin-bottom: 24px;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: var(--bg-dark);
      font-weight: 600;
      font-size: 16px;
      padding: 14px 32px;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .upload-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 245, 212, 0.3);
    }

    .file-input { display: none; }

    .files-list {
      margin-top: 24px;
      text-align: left;
      max-height: 200px;
      overflow-y: auto;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .file-item.loaded { border-left: 3px solid var(--lime); }
    .file-item.missing { border-left: 3px solid var(--magenta); opacity: 0.5; }

    .file-icon { font-size: 20px; }
    .file-name { flex: 1; }
    .file-status { font-size: 12px; color: var(--text-dim); }

    .generate-btn {
      display: none;
      margin: 32px auto 0;
      background: linear-gradient(135deg, var(--lime), var(--cyan));
      color: var(--bg-dark);
      font-weight: 700;
      font-size: 18px;
      padding: 18px 48px;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .generate-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 32px rgba(184, 248, 58, 0.3);
    }

    .generate-btn.visible { display: inline-block; }
    .generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .progress-section {
      display: none;
      text-align: center;
      padding: 48px 0;
    }

    .progress-section.visible { display: block; }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      overflow: hidden;
      margin: 24px 0;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--cyan), var(--magenta));
      border-radius: 8px;
      transition: width 0.3s;
      width: 0%;
    }

    .progress-text {
      color: var(--text-dim);
      font-size: 16px;
    }

    .instructions {
      margin-top: 48px;
      padding: 32px;
      background: var(--bg-card);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .instructions h3 {
      font-size: 20px;
      margin-bottom: 16px;
      color: var(--cyan);
    }

    .instructions ol {
      padding-left: 24px;
      color: var(--text-dim);
    }

    .instructions li {
      margin-bottom: 12px;
    }

    .instructions a {
      color: var(--cyan);
      text-decoration: none;
    }

    .instructions a:hover {
      text-decoration: underline;
    }

    .instructions code {
      background: rgba(255,255,255,0.1);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
    }

    .privacy-note {
      margin-top: 32px;
      padding: 20px;
      background: rgba(0, 245, 212, 0.05);
      border: 1px solid rgba(0, 245, 212, 0.2);
      border-radius: 12px;
      font-size: 14px;
      color: var(--text-dim);
    }

    .privacy-note strong {
      color: var(--cyan);
    }

    .credits {
      position: fixed;
      bottom: 16px;
      right: 16px;
      font-size: 12px;
      color: var(--text-dimmer);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .credits a {
      color: var(--text-dim);
      text-decoration: none;
      transition: color 0.2s;
    }
    .credits a:hover {
      color: var(--cyan);
    }

    @media (max-width: 640px) {
      .container { padding: 40px 16px; }
      .upload-section { padding: 32px 20px; }
      .instructions { padding: 24px 20px; }
      .credits { font-size: 10px; bottom: 12px; right: 12px; }
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="noise"></div>

  <div class="container">
    <div class="hero-year">2025</div>
    <p class="hero-subtitle">Your Year in Tweets, Wrapped</p>

    <div class="upload-section" id="uploadSection">
      <div class="upload-icon">📁</div>
      <h2 class="upload-title">Upload Your Twitter Archive</h2>
      <p class="upload-desc">Drag and drop your .zip archive or data folder</p>
      <button class="upload-btn" id="selectBtn">
        <span>Select Files</span>
      </button>
      <input type="file" class="file-input" id="fileInput" multiple webkitdirectory directory accept=".js,.zip">

      <div class="files-list" id="filesList"></div>
    </div>

    <button class="generate-btn" id="generateBtn">Generate My Wrapped</button>

    <div class="progress-section" id="progressSection">
      <div class="upload-icon">⏳</div>
      <h2 class="upload-title">Analyzing your tweets...</h2>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <p class="progress-text" id="progressText">Loading files...</p>
    </div>

    <div class="instructions">
      <h3>How to get your Twitter archive:</h3>
      <ol>
        <li>Go to <a href="https://twitter.com/settings/download_your_data" target="_blank">Twitter Settings → Download your data</a></li>
        <li>Request your archive and wait for the email (can take 24-48 hours)</li>
        <li>Download the archive</li>
        <li>Drop the <code>.zip</code> file directly here, or unzip and upload the <code>data</code> folder</li>
      </ol>

      <div class="privacy-note">
        <strong>🔒 Privacy First:</strong> All analysis happens in your browser. We only read these files from your archive: <code>tweets.js</code>, <code>account.js</code>, <code>profile.js</code>, <code>like.js</code>, <code>follower.js</code>, <code>following.js</code>. Your data never leaves your device unless you choose to share your wrapped. We log your username when you generate a wrapped, but none of your tweet content or personal data.
      </div>
    </div>
  </div>

  <div class="credits">
    by <a href="https://twitter.com/aliceisplaying" target="_blank">@aliceisplaying</a>, <a href="https://twitter.com/IaimforGOAT" target="_blank">@IaimforGOAT</a> & <a href="https://claude.ai" target="_blank">Claude</a>
  </div>

  <script src="/analyzer.js"></script>
  <script>
    const uploadSection = document.getElementById('uploadSection');
    const fileInput = document.getElementById('fileInput');
    const selectBtn = document.getElementById('selectBtn');
    const filesList = document.getElementById('filesList');
    const generateBtn = document.getElementById('generateBtn');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const requiredFiles = {
      'tweets.js': null,
      'account.js': null,
      'profile.js': null,
      'like.js': null,
      'follower.js': null,
      'following.js': null,
    };

    // Dynamic storage for file parts (tweets-part1.js, like-part1.js, etc.)
    const tweetParts = {};
    const likeParts = {};
    const followerParts = {};
    const followingParts = {};

    function updateFilesList() {
      filesList.innerHTML = '';
      const allFiles = { ...requiredFiles, ...tweetParts, ...likeParts, ...followerParts, ...followingParts };

      for (const [name, content] of Object.entries(allFiles)) {
        const isRequired = name in requiredFiles;
        const isLoaded = content !== null;

        if (!isRequired && !isLoaded) continue;

        const item = document.createElement('div');
        item.className = 'file-item ' + (isLoaded ? 'loaded' : 'missing');
        item.innerHTML = \`
          <span class="file-icon">\${isLoaded ? '✅' : '⚠️'}</span>
          <span class="file-name">\${name}</span>
          <span class="file-status">\${isLoaded ? 'Loaded' : (isRequired ? 'Required' : 'Optional')}</span>
        \`;
        filesList.appendChild(item);
      }

      // Check if all required files are loaded
      const allRequired = Object.values(requiredFiles).every(v => v !== null);
      generateBtn.classList.toggle('visible', allRequired);
    }

    async function handleFiles(files) {
      for (const file of files) {
        const name = file.name;

        // Handle zip files
        if (name.endsWith('.zip')) {
          try {
            console.log('Reading zip file:', name, 'size:', file.size);

            // Show progress UI
            progressSection.style.display = 'block';
            uploadSection.style.display = 'none';
            progressText.textContent = 'Reading zip file...';
            progressFill.style.width = '5%';

            const arrayBuffer = await file.arrayBuffer();
            console.log('ArrayBuffer size:', arrayBuffer.byteLength);

            progressText.textContent = 'Extracting archive (this may take a moment for large files)...';
            progressFill.style.width = '10%';

            // Create a Web Worker to handle unzipping in a background thread
            const workerCode = \`
              console.log('[Worker] Starting, loading fflate...');
              try {
                importScripts('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js');
                console.log('[Worker] fflate loaded successfully');
              } catch (e) {
                console.error('[Worker] Failed to load fflate:', e);
                self.postMessage({ type: 'error', message: 'Failed to load decompression library: ' + e.message });
              }

              self.onmessage = function(e) {
                console.log('[Worker] Received message, data size:', e.data.byteLength);
                const uint8Array = new Uint8Array(e.data);
                console.log('[Worker] Created Uint8Array, size:', uint8Array.length);
                self.postMessage({ type: 'progress', message: 'Scanning archive...', percent: 15 });

                try {
                  const neededBases = ['tweets', 'account', 'profile', 'like', 'follower', 'following'];
                  const result = {};
                  let filesFound = 0;
                  let dataPrefix = '';

                  // Use streaming Unzip API for memory efficiency
                  const unzipper = new fflate.Unzip((file) => {
                    const path = file.name;
                    const fileName = path.split('/').pop();

                    // Check if this is a file we need
                    let isNeeded = false;
                    for (const base of neededBases) {
                      if (fileName === base + '.js' || new RegExp('^' + base + '-part\\\\d+\\\\.js$').test(fileName)) {
                        isNeeded = true;
                        break;
                      }
                    }

                    if (!isNeeded) return;

                    console.log('[Worker] Extracting:', path);
                    self.postMessage({ type: 'progress', message: 'Extracting: ' + fileName, percent: 20 + filesFound * 5 });

                    // Find data prefix from first matching file
                    if (!dataPrefix) {
                      if (path.includes('/data/')) {
                        dataPrefix = path.substring(0, path.indexOf('/data/') + 6);
                      } else if (path.startsWith('data/')) {
                        dataPrefix = 'data/';
                      }
                    }

                    // Collect chunks for this file
                    const chunks = [];
                    file.ondata = (err, chunk, final) => {
                      if (err) {
                        console.error('[Worker] Error reading file:', err);
                        return;
                      }
                      chunks.push(chunk);
                      if (final) {
                        // Combine chunks and decode
                        const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
                        const combined = new Uint8Array(totalLength);
                        let offset = 0;
                        for (const chunk of chunks) {
                          combined.set(chunk, offset);
                          offset += chunk.length;
                        }
                        // Decode in smaller chunks if needed
                        let content = '';
                        const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB chunks
                        const decoder = new TextDecoder('utf-8');
                        for (let i = 0; i < combined.length; i += CHUNK_SIZE) {
                          const slice = combined.subarray(i, Math.min(i + CHUNK_SIZE, combined.length));
                          content += decoder.decode(slice, { stream: i + CHUNK_SIZE < combined.length });
                        }
                        result[fileName] = content;
                        filesFound++;
                        console.log('[Worker] Extracted:', fileName, 'size:', content.length);
                      }
                    };
                    file.start();
                  });

                  // Register decompression handlers
                  unzipper.register(fflate.UnzipInflate);

                  // Process the zip file in chunks to avoid stack overflow
                  console.log('[Worker] Starting streaming unzip...');
                  const startTime = Date.now();
                  const CHUNK_SIZE = 65536; // 64KB chunks
                  for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
                    const chunk = uint8Array.subarray(i, Math.min(i + CHUNK_SIZE, uint8Array.length));
                    const isLast = i + CHUNK_SIZE >= uint8Array.length;
                    unzipper.push(chunk, isLast);
                    // Update progress periodically
                    if (i % (CHUNK_SIZE * 100) === 0) {
                      const pct = Math.round((i / uint8Array.length) * 100);
                      self.postMessage({ type: 'progress', message: 'Scanning archive... ' + pct + '%', percent: 15 + pct * 0.5 });
                    }
                  }
                  console.log('[Worker] Streaming unzip completed in', Date.now() - startTime, 'ms');

                  if (filesFound === 0) {
                    self.postMessage({ type: 'error', message: 'Could not find data folder in zip. Make sure this is a Twitter archive.' });
                    return;
                  }

                  console.log('[Worker] Done, sending', filesFound, 'files');
                  self.postMessage({ type: 'done', files: result });
                } catch (e) {
                  console.error('[Worker] Exception:', e);
                  self.postMessage({ type: 'error', message: e.message });
                }
              };
            \`;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            const worker = new Worker(workerUrl);

            const extractedFiles = await new Promise((resolve, reject) => {
              worker.onmessage = (e) => {
                const msg = e.data;
                if (msg.type === 'progress') {
                  progressText.textContent = msg.message;
                  progressFill.style.width = msg.percent + '%';
                } else if (msg.type === 'done') {
                  worker.terminate();
                  URL.revokeObjectURL(workerUrl);
                  resolve(msg.files);
                } else if (msg.type === 'error') {
                  worker.terminate();
                  URL.revokeObjectURL(workerUrl);
                  reject(new Error(msg.message));
                }
              };

              worker.onerror = (e) => {
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
                reject(new Error('Worker error: ' + e.message));
              };

              // Send the ArrayBuffer to the worker (transferable)
              worker.postMessage(arrayBuffer, [arrayBuffer]);
            });

            // Process extracted files
            let filesFound = 0;
            for (const [fileName, content] of Object.entries(extractedFiles)) {
              if (fileName in requiredFiles) {
                requiredFiles[fileName] = content;
                filesFound++;
                console.log('Found required file:', fileName);
              } else if (/^tweets-part\\d+\\.js$/.test(fileName)) {
                tweetParts[fileName] = content;
                filesFound++;
                console.log('Found tweet part:', fileName);
              } else if (/^like-part\\d+\\.js$/.test(fileName)) {
                likeParts[fileName] = content;
                filesFound++;
                console.log('Found like part:', fileName);
              } else if (/^follower-part\\d+\\.js$/.test(fileName)) {
                followerParts[fileName] = content;
                filesFound++;
                console.log('Found follower part:', fileName);
              } else if (/^following-part\\d+\\.js$/.test(fileName)) {
                followingParts[fileName] = content;
                filesFound++;
                console.log('Found following part:', fileName);
              }
            }

            console.log('Total files extracted:', filesFound);
            progressFill.style.width = '100%';
            progressText.textContent = 'Done! Found ' + filesFound + ' files.';

            // Hide progress and show upload section again
            await new Promise(r => setTimeout(r, 500));
            progressSection.style.display = 'none';
            uploadSection.style.display = 'block';
            progressFill.style.width = '0%';

          } catch (err) {
            console.error('Error extracting zip:', err);
            progressSection.style.display = 'none';
            uploadSection.style.display = 'block';
            progressFill.style.width = '0%';
            alert('Error reading zip file: ' + err.message + '. Please try extracting it first and uploading the data folder.');
          }
          updateFilesList();
          continue;
        }

        // Handle regular files
        if (name in requiredFiles) {
          const content = await file.text();
          requiredFiles[name] = content;
        } else if (/^tweets-part\\d+\\.js$/.test(name)) {
          const content = await file.text();
          tweetParts[name] = content;
        } else if (/^like-part\\d+\\.js$/.test(name)) {
          const content = await file.text();
          likeParts[name] = content;
        } else if (/^follower-part\\d+\\.js$/.test(name)) {
          const content = await file.text();
          followerParts[name] = content;
        } else if (/^following-part\\d+\\.js$/.test(name)) {
          const content = await file.text();
          followingParts[name] = content;
        }
      }
      updateFilesList();
    }

    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    uploadSection.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    uploadSection.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadSection.classList.add('drag-over');
    });

    uploadSection.addEventListener('dragleave', () => {
      uploadSection.classList.remove('drag-over');
    });

    uploadSection.addEventListener('drop', async (e) => {
      e.preventDefault();
      uploadSection.classList.remove('drag-over');

      const items = e.dataTransfer.items;
      const files = [];

      async function traverseEntry(entry) {
        if (entry.isFile) {
          return new Promise((resolve) => {
            entry.file((file) => {
              files.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          return new Promise((resolve) => {
            reader.readEntries(async (entries) => {
              for (const e of entries) {
                await traverseEntry(e);
              }
              resolve();
            });
          });
        }
      }

      for (const item of items) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await traverseEntry(entry);
        }
      }

      handleFiles(files);
    });

    generateBtn.addEventListener('click', async () => {
      generateBtn.disabled = true;
      uploadSection.style.display = 'none';
      generateBtn.style.display = 'none';
      progressSection.classList.add('visible');

      try {
        progressText.textContent = 'Parsing account data...';
        progressFill.style.width = '10%';

        const data = {
          tweets: requiredFiles['tweets.js'],
          tweetParts: Object.values(tweetParts).filter(Boolean),
          account: requiredFiles['account.js'],
          profile: requiredFiles['profile.js'],
          like: requiredFiles['like.js'],
          likeParts: Object.values(likeParts).filter(Boolean),
          follower: requiredFiles['follower.js'],
          followerParts: Object.values(followerParts).filter(Boolean),
          following: requiredFiles['following.js'],
          followingParts: Object.values(followingParts).filter(Boolean),
        };

        progressText.textContent = 'Analyzing tweets...';
        progressFill.style.width = '30%';

        // Run analysis (from analyzer.js)
        const result = await analyzeTwitterData(data, (progress, message) => {
          progressFill.style.width = (30 + progress * 60) + '%';
          progressText.textContent = message;
        });

        // Log generation event with username
        fetch('/api/generated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: result.account?.username || '' })
        }).catch(() => {});

        progressText.textContent = 'Generating your wrapped...';
        progressFill.style.width = '95%';

        // Store result and redirect to local preview
        sessionStorage.setItem('wrappedData', JSON.stringify(result));

        progressFill.style.width = '100%';
        progressText.textContent = 'Done! Loading your wrapped...';

        // Generate the wrapped page locally
        setTimeout(() => {
          showWrappedPage(result);
        }, 500);

      } catch (error) {
        console.error('Analysis failed:', error);
        progressText.textContent = 'Error: ' + error.message;
        progressFill.style.background = 'var(--magenta)';
      }
    });

    function showWrappedPage(data) {
      // Store data globally for share functionality
      window.WRAPPED_DATA = data;

      // Replace the page with the wrapped view
      document.body.innerHTML = generateWrappedHTML(data);

      // Initialize the wrapped page
      initWrappedPage(data);
    }
  </script>
</body>
</html>`;
}
