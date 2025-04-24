document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    const resultContainer = document.getElementById('resultContainer');

    // ファイル選択ボタンのクリックイベント
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // ファイルが選択されたときのイベント
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        
        if (file) {
            // ファイル名を表示
            selectedFileName.textContent = `選択されたファイル: ${file.name}`;
            
            // MIMEタイプの取得
            const mimeType = file.type || 'unknown';
            
            // アラートでMIMEタイプを表示
            alert(`MIME Type: ${mimeType}`);
            
            // 結果表示エリアにも表示
            displayResult(file);
        } else {
            selectedFileName.textContent = 'ファイルが選択されていません';
            resultContainer.innerHTML = '';
        }
    });

    // 結果の表示関数
    function displayResult(file) {
        const mimeType = file.type || 'unknown';
        const fileSize = formatFileSize(file.size);
        
        const resultHTML = `
            <div class="result-item">
                <div>
                    <strong>ファイル名:</strong> ${file.name}
                </div>
            </div>
            <div class="result-item">
                <div>
                    <strong>MIME Type:</strong> 
                    <span class="result-mime">${mimeType}</span>
                </div>
            </div>
            <div class="result-item">
                <div>
                    <strong>ファイルサイズ:</strong> ${fileSize}
                </div>
            </div>
            <div class="result-item">
                <div>
                    <strong>最終更新日:</strong> ${new Date(file.lastModified).toLocaleString()}
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = resultHTML;
    }

    // ファイルサイズのフォーマット関数
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 