/**
 * ルクスキル Web Application Engine
 * Google Gemini 2.0 Flash API Integration & Takumi-san Style Formatter
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const btnSettings = document.getElementById('btn-settings');
  const modalSettings = document.getElementById('modal-settings');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const inputApiKey = document.getElementById('input-api-key');
  const selectModel = document.getElementById('select-model');
  const currentModelDisplay = document.getElementById('current-model-display');

  const tabAudio = document.getElementById('tab-input-audio');
  const tabText = document.getElementById('tab-input-text');
  const areaAudio = document.getElementById('area-audio');
  const areaText = document.getElementById('area-text');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  const textInput = document.getElementById('text-input');

  const btnGenerate = document.getElementById('btn-generate');
  const statusCard = document.getElementById('status-card');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const outputCard = document.getElementById('output-card');

  const titlesContainer = document.getElementById('titles-container');
  const textNote = document.getElementById('text-note');
  const textSubstack = document.getElementById('text-substack');
  const textSpotify = document.getElementById('text-spotify');
  const textCheck = document.getElementById('text-check');

  const btnCopy = document.getElementById('btn-copy');
  const btnDownloadMd = document.getElementById('btn-download-md');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let apiKey = localStorage.getItem('rukuskill_gemini_api_key') || '';
  let selectedModel = localStorage.getItem('rukuskill_gemini_model') || 'gemini-2.0-flash';
  let activeInputType = 'audio'; // 'audio' or 'text'
  let selectedFile = null;
  let activeOutputTab = 'note';
  let generatedData = {
    raw: '',
    titles: [],
    note: '',
    substack: '',
    spotify: '',
    check: ''
  };

  // Init Settings
  inputApiKey.value = apiKey;
  selectModel.value = selectedModel;
  updateModelDisplay();

  // Settings Modal Handlers
  btnSettings.addEventListener('click', () => modalSettings.classList.remove('hidden'));
  btnCloseModal.addEventListener('click', () => modalSettings.classList.add('hidden'));
  btnSaveSettings.addEventListener('click', () => {
    apiKey = inputApiKey.value.trim();
    selectedModel = selectModel.value;
    localStorage.setItem('rukuskill_gemini_api_key', apiKey);
    localStorage.setItem('rukuskill_gemini_model', selectedModel);
    updateModelDisplay();
    modalSettings.classList.add('hidden');
    showToast('設定を保存しました');
  });

  function updateModelDisplay() {
    currentModelDisplay.textContent = `${selectedModel} (${selectedModel.includes('2.0') ? '完全無料・推薦' : '完全無料'})`;
  }

  // Input Tabs Handler
  tabAudio.addEventListener('click', () => {
    activeInputType = 'audio';
    tabAudio.classList.add('active');
    tabText.classList.remove('active');
    areaAudio.classList.remove('hidden');
    areaText.classList.add('hidden');
  });

  tabText.addEventListener('click', () => {
    activeInputType = 'text';
    tabText.classList.add('active');
    tabAudio.classList.remove('active');
    areaText.classList.remove('hidden');
    areaAudio.classList.add('hidden');
  });

  // Drag and Drop Handlers
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.add('hidden');
  });

  function handleFileSelected(file) {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(m4a|mp3|wav|aac|webm|ogg)$/i)) {
      alert('音声ファイル (.m4a, .mp3, .wav, .aac, .webm) を選択してください。');
      return;
    }
    selectedFile = file;
    fileName.textContent = file.name;
    fileInfo.classList.remove('hidden');
  }

  // Output Tabs Handler
  document.querySelectorAll('.output-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      tab.classList.add('active');
      activeOutputTab = tab.dataset.tab;
      document.getElementById(`content-${activeOutputTab}`).classList.remove('hidden');
    });
  });

  // Generate Button Click
  btnGenerate.addEventListener('click', async () => {
    if (!apiKey) {
      modalSettings.classList.remove('hidden');
      alert('先に Google Gemini API キーを設定してください。');
      return;
    }

    if (activeInputType === 'audio' && !selectedFile) {
      alert('ボイスメモ（音声ファイル）を選択するか、テキスト入力に切り替えてください。');
      return;
    }

    if (activeInputType === 'text' && !textInput.value.trim()) {
      alert('文字起こしテキストを入力してください。');
      return;
    }

    // Start Loading UI
    btnGenerate.disabled = true;
    statusCard.classList.remove('hidden');
    outputCard.classList.add('hidden');
    statusTitle.textContent = `${selectedModel} で全媒体記事を一括処理中...`;
    statusDesc.textContent = activeInputType === 'audio' 
      ? '音声データを直接解析し、たくみさんイズムで思考・文章を統合整形しています' 
      : 'テキストを解析し、note・Substack・Spotify用記事とタイトル案を生成しています';

    try {
      let promptParts = [];

      // System Instruction & Master Prompt
      const systemPrompt = `
あなたは「人生の旅人たくみさん」の専属ライターです。
以下の入力データ（音声または文字起こしテキスト）を読み込み、【基本ルール】に従って【出力ステップ1〜4】および【文体・身バレチェック】を一括作成してください。

==================================================
【基本ルール（たくみさんイズム＆文体）】
- 一人称: 必ず「私」（わたし）に統一（「ぼく」等は絶対使用禁止）。
- 冒頭挨拶: 「人生の旅人たくみさんです。」で開始。
- 締め文: 「いってらっしゃい！」で締めくくる。
- 文体と改行リズム（最重要）:
  1文を長く続けず、読点（、）や意味の区切り・節ごとに必ず細かく改行してください（イケハヤ氏風の節切りスタイル）。
  1〜2フレーズごとに改行を入れることで視覚的な余白を作り出し、一言一言を読者に強く印象付けるリズムにしてください。
- 哲学: 泥臭さ、生々しさ、手触り感、目に見えないプロセスを愛する。
- 基本URL（CTA）:
  - Substack: https://substack.com/@okirakukai
  - note: https://note.com/takumisuzuki

==================================================
【出力フォーマット要求】
必ず以下のマークダウンセクションの区切り文字を厳密に含めて出力してください。

<<<SECTION:TITLES>>>
【タイトル案】
1. インパクト重視: [タイトル1]
2. 要約・解説風: [タイトル2]
3. 問いかけ系: [タイトル3]
4. 情緒・マインド系: [タイトル4]

<<<SECTION:NOTE>>>
(ここにnote用記事を生成。1500字前後、「##### ■ 見出し」と「====」節切りを使用、細かな改行、最後にCTA添付)

<<<SECTION:SUBSTACK>>>
(ここにSubstack用記事を生成。1500字前後、親密なトーン、「##### ■ 見出し」と「====」節切りを使用、細かな改行、最後にCTA添付)

<<<SECTION:SPOTIFY>>>
(ここにSpotify概要欄用テキストを生成。800字程度、Markdown記法絶対禁止！【タイトル】【内容概要】【■ 聴きどころ】【文章で読む・発信一覧（URL）】で構成)

<<<SECTION:CHECK>>>
【文体・匿名チェック結果】
- 一人称「私」統一チェック: OK
- 禁止語/AIっぽさチェック: チェック済み
- 身バレ・危険語チェック: [問題なし / 警告項目があれば提示]
`;

      if (activeInputType === 'audio') {
        const base64Audio = await fileToBase64(selectedFile);
        const mimeType = selectedFile.type || 'audio/mp3';
        promptParts = [
          { inlineData: { mimeType: mimeType, data: base64Audio } },
          { text: systemPrompt + '\n\n【入力】上記の音声データを直接読み込み、完璧な記事を生成してください。' }
        ];
      } else {
        promptParts = [
          { text: systemPrompt + '\n\n【入力テキスト】:\n' + textInput.value.trim() }
        ];
      }

      // API Request to Gemini
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: promptParts }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!resultText) {
        throw new Error('APIからの応答が空でした。');
      }

      // Parse Response
      parseAndDisplayResults(resultText);

    } catch (err) {
      alert(`エラーが発生しました: ${err.message}`);
    } finally {
      btnGenerate.disabled = false;
      statusCard.classList.add('hidden');
    }
  });

  // Convert File to Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Parse Sections from Generated Markdown
  function parseAndDisplayResults(rawText) {
    generatedData.raw = rawText;

    const sections = {
      titles: '',
      note: '',
      substack: '',
      spotify: '',
      check: ''
    };

    if (rawText.includes('<<<SECTION:TITLES>>>')) {
      const parts = rawText.split(/<<<SECTION:[A-Z]+>>>/);
      sections.titles = parts[1] || '';
      sections.note = parts[2] || '';
      sections.substack = parts[3] || '';
      sections.spotify = parts[4] || '';
      sections.check = parts[5] || '';
    } else {
      // Fallback simple parsing
      sections.note = rawText;
    }

    // Populate Titles
    titlesContainer.innerHTML = '';
    const titleLines = sections.titles.split('\n').filter(line => line.trim().length > 0);
    const tags = [
      { name: 'インパクト重視', class: 'tag-1' },
      { name: '要約・解説風', class: 'tag-2' },
      { name: '問いかけ系', class: 'tag-3' },
      { name: '情緒・マインド系', class: 'tag-4' }
    ];

    let titleIndex = 0;
    titleLines.forEach(line => {
      const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^【.*?】\s*/, '').trim();
      if (cleaned.length > 3 && titleIndex < 4) {
        const tag = tags[titleIndex];
        const box = document.createElement('div');
        box.className = 'title-box';
        box.innerHTML = `
          <div class="title-box-header">
            <span class="title-tag ${tag.class}">${tag.name}</span>
          </div>
          <p class="title-text">${escapeHtml(cleaned)}</p>
          <button class="btn-copy-sm" data-text="${escapeHtml(cleaned)}">コピー</button>
        `;
        titlesContainer.appendChild(box);
        titleIndex++;
      }
    });

    // Handle Title Copy Buttons
    document.querySelectorAll('.btn-copy-sm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const textToCopy = e.target.getAttribute('data-text');
        navigator.clipboard.writeText(textToCopy);
        showToast('タイトル案をコピーしました！');
      });
    });

    // Populate Tab Contents
    textNote.textContent = sections.note.trim();
    textSubstack.textContent = sections.substack.trim();
    textSpotify.textContent = sections.spotify.trim();
    textCheck.innerHTML = escapeHtml(sections.check.trim()).replace(/\n/g, '<br>');

    generatedData.note = sections.note.trim();
    generatedData.substack = sections.substack.trim();
    generatedData.spotify = sections.spotify.trim();

    // Show Output Card
    outputCard.classList.remove('hidden');
    outputCard.scrollIntoView({ behavior: 'smooth' });
  }

  // Copy Main Article Button
  btnCopy.addEventListener('click', () => {
    let contentToCopy = '';
    if (activeOutputTab === 'note') contentToCopy = generatedData.note;
    else if (activeOutputTab === 'substack') contentToCopy = generatedData.substack;
    else if (activeOutputTab === 'spotify') contentToCopy = generatedData.spotify;
    else if (activeOutputTab === 'check') contentToCopy = textCheck.innerText;

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      showToast(`${activeOutputTab.toUpperCase()} 用テキストをコピーしました！`);
    }
  });

  // Download Markdown File
  btnDownloadMd.addEventListener('click', () => {
    const mdContent = `# 【一括出力】人生の旅人たくみさん 記事原稿

${generatedData.raw}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `たくみさん記事原稿_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('.md ファイルをダウンロードしました！');
  });

  // Toast Helper
  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  }

  // Helper Escape HTML
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
});
