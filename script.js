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
            
            // ファイル内容の表示（テキストファイルの場合）
            readFileContent(file);
        } else {
            selectedFileName.textContent = 'ファイルが選択されていません';
            resultContainer.innerHTML = '';
        }
    });

    // ファイル内容を読み込む関数
    function readFileContent(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            
            // ファイル内容の表示用のHTML要素を作成
            const fileContentDiv = document.createElement('div');
            fileContentDiv.className = 'result-item file-content';
            
            // ファイル内容のヘッダー
            const contentHeader = document.createElement('h3');
            contentHeader.textContent = 'ファイル内容:';
            fileContentDiv.appendChild(contentHeader);
            
            // ファイル内容のテキストエリア
            const contentArea = document.createElement('textarea');
            contentArea.readOnly = true;
            contentArea.style.width = '100%';
            contentArea.style.height = '200px';
            contentArea.style.marginTop = '10px';
            contentArea.value = content;
            fileContentDiv.appendChild(contentArea);
            
            // 結果コンテナに追加
            resultContainer.appendChild(fileContentDiv);
        };
        
        reader.onerror = function() {
            console.error('ファイルの読み込み中にエラーが発生しました。');
        };
        
        // テキストファイルとしての読み込みを試みる
        try {
            reader.readAsText(file);
        } catch (e) {
            console.error('ファイルをテキストとして読み込めません:', e);
            
            // バイナリファイルとして読み込む（データURLとして）
            try {
                reader.readAsDataURL(file);
            } catch (e) {
                console.error('ファイルをバイナリとしても読み込めません:', e);
            }
        }
    }

    // 結果の表示関数
    function displayResult(file) {
        const mimeType = file.type || 'unknown';
        const fileSize = formatFileSize(file.size);
        
        // Fileオブジェクトのすべてのプロパティを取得
        const fileProperties = getAllFileProperties(file);
        
        // MIMEタイプがunknownの場合の診断情報
        let mimeTypeDiagnostic = '';
        if (mimeType === 'unknown' || mimeType === '') {
            mimeTypeDiagnostic = `
                <div class="result-item">
                    <div>
                        <strong>MIMEタイプ診断:</strong>
                        <ul>
                            <li>ファイル拡張子: ${getFileExtension(file.name)}</li>
                            <li>推測される原因: 
                                <ul>
                                    <li>ブラウザがこのファイルタイプを認識できない</li>
                                    <li>ファイルに一般的でない拡張子が使用されている</li>
                                    <li>ファイルの内容が不完全またはMIMEタイプ判別に不十分</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // 基本情報の表示
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
            ${mimeTypeDiagnostic}
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
            <div class="result-item">
                <div>
                    <strong>Fileオブジェクトのすべてのプロパティ:</strong>
                    <pre>${fileProperties}</pre>
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = resultHTML;
    }

    // ファイルのすべてのプロパティを取得する関数
    function getAllFileProperties(file) {
        let properties = {};
        
        // 直接のプロパティを取得
        for (let prop in file) {
            try {
                // 関数でない場合のみ値を取得
                if (typeof file[prop] !== 'function') {
                    // Dateオブジェクトの場合は文字列に変換
                    if (file[prop] instanceof Date) {
                        properties[prop] = file[prop].toLocaleString();
                    } else {
                        properties[prop] = file[prop];
                    }
                } else {
                    properties[prop] = '[Function]';
                }
            } catch (e) {
                properties[prop] = `[Error: ${e.message}]`;
            }
        }
        
        // プロトタイプメソッドも追加
        let proto = Object.getPrototypeOf(file);
        properties['__proto__'] = {};
        
        for (let prop in proto) {
            if (typeof proto[prop] === 'function') {
                properties['__proto__'][prop] = '[Function]';
            } else {
                properties['__proto__'][prop] = proto[prop];
            }
        }
        
        return JSON.stringify(properties, null, 2);
    }

    // ファイル拡張子を取得する関数
    function getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2) || 'なし';
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