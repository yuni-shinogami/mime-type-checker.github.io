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
            
            // 結果コンテナをクリア
            resultContainer.innerHTML = '';
            
            // 結果表示エリアに基本情報を表示
            displayFileInfo(file);
            
            // ファイルプロパティを表示
            displayFileProperties(file);
            
            // MIMEタイプがunknownの場合の診断情報を表示
            if (mimeType === 'unknown' || mimeType === '') {
                displayMimeDiagnostic(file);
            }
            
            // ファイル内容の表示
            readFileContent(file);
            
            // コンソールにデバッグ情報を表示
            console.log('File object:', file);
            console.log('MIME type:', mimeType);
        } else {
            selectedFileName.textContent = 'ファイルが選択されていません';
            resultContainer.innerHTML = '';
        }
    });

    // 基本的なファイル情報を表示する関数
    function displayFileInfo(file) {
        const mimeType = file.type || 'unknown';
        const fileSize = formatFileSize(file.size);
        
        const fileInfoHTML = `
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
        
        // HTMLを追加
        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.innerHTML = fileInfoHTML;
        resultContainer.appendChild(fileInfoDiv);
    }
    
    // ファイルプロパティを表示する関数
    function displayFileProperties(file) {
        try {
            // Fileオブジェクトのすべてのプロパティを取得
            const fileProperties = getAllFileProperties(file);
            
            const propertiesDiv = document.createElement('div');
            propertiesDiv.className = 'result-item';
            propertiesDiv.innerHTML = `
                <div>
                    <strong>Fileオブジェクトのすべてのプロパティ:</strong>
                    <pre>${fileProperties}</pre>
                </div>
            `;
            
            resultContainer.appendChild(propertiesDiv);
        } catch (error) {
            console.error('ファイルプロパティの表示中にエラーが発生しました:', error);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'result-item error';
            errorDiv.innerHTML = `
                <div>
                    <strong>エラー:</strong> ファイルプロパティの取得中にエラーが発生しました。
                    <br>エラー内容: ${error.message}
                </div>
            `;
            
            resultContainer.appendChild(errorDiv);
        }
    }
    
    // MIMEタイプの診断情報を表示する関数
    function displayMimeDiagnostic(file) {
        const fileExtension = getFileExtension(file.name);
        
        const diagnosticDiv = document.createElement('div');
        diagnosticDiv.className = 'result-item mime-diagnostic';
        diagnosticDiv.innerHTML = `
            <div>
                <strong>MIMEタイプ診断:</strong>
                <ul>
                    <li>ファイル拡張子: ${fileExtension}</li>
                    <li>推測される原因: 
                        <ul>
                            <li>ブラウザがこのファイルタイプを認識できない</li>
                            <li>ファイルに一般的でない拡張子が使用されている</li>
                            <li>ファイルの内容が不完全またはMIMEタイプ判別に不十分</li>
                        </ul>
                    </li>
                </ul>
            </div>
        `;
        
        resultContainer.appendChild(diagnosticDiv);
    }

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
        
        reader.onerror = function(error) {
            console.error('ファイルの読み込み中にエラーが発生しました:', error);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'result-item error';
            errorDiv.innerHTML = `
                <div>
                    <strong>エラー:</strong> ファイル内容の読み込み中にエラーが発生しました。
                </div>
            `;
            
            resultContainer.appendChild(errorDiv);
        };
        
        // テキストファイルとしての読み込みを試みる
        try {
            reader.readAsText(file);
        } catch (error) {
            console.error('ファイルをテキストとして読み込めません:', error);
            
            // バイナリファイルとして読み込む（データURLとして）
            try {
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('ファイルをバイナリとしても読み込めません:', error);
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'result-item error';
                errorDiv.innerHTML = `
                    <div>
                        <strong>エラー:</strong> ファイルを読み込めませんでした。
                        <br>エラー内容: ${error.message}
                    </div>
                `;
                
                resultContainer.appendChild(errorDiv);
            }
        }
    }

    // ファイルのすべてのプロパティを取得する関数
    function getAllFileProperties(file) {
        // 安全に表示できるプロパティのリスト
        const safeProps = [
            'name',
            'size',
            'type',
            'lastModified',
            'webkitRelativePath'
        ];
        
        // 結果を格納するオブジェクト
        let result = {};
        
        // 安全なプロパティを収集
        safeProps.forEach(prop => {
            if (prop in file) {
                result[prop] = file[prop];
            }
        });
        
        // その他の基本プロパティ情報の追加（メソッドや複雑なプロパティは除外）
        for (let prop in file) {
            if (!safeProps.includes(prop)) {
                try {
                    const value = file[prop];
                    const type = typeof value;
                    
                    // 基本的な型の値のみを含める
                    if (['string', 'number', 'boolean'].includes(type)) {
                        result[prop] = value;
                    } else if (value === null) {
                        result[prop] = null;
                    } else if (type === 'object') {
                        if (value instanceof Date) {
                            result[prop] = value.toISOString();
                        } else {
                            result[prop] = '[Object]';
                        }
                    } else if (type === 'function') {
                        result[prop] = '[Function]';
                    } else if (type === 'undefined') {
                        result[prop] = undefined;
                    } else {
                        result[prop] = `[${type}]`;
                    }
                } catch (e) {
                    result[prop] = `[アクセスエラー: ${e.message}]`;
                }
            }
        }
        
        // Fileオブジェクトのコンストラクタ名を追加
        try {
            result['constructor'] = file.constructor ? file.constructor.name : 'unknown';
        } catch (e) {
            result['constructor'] = `[アクセスエラー: ${e.message}]`;
        }
        
        // プロトタイプチェーン情報
        try {
            const proto = Object.getPrototypeOf(file);
            if (proto) {
                result['__proto__'] = {
                    constructor: proto.constructor ? proto.constructor.name : 'unknown'
                };
            }
        } catch (e) {
            result['__proto__'] = `[アクセスエラー: ${e.message}]`;
        }
        
        // 追加のファイル情報
        result['ファイル拡張子'] = getFileExtension(file.name);
        result['ヒューマンリーダブルサイズ'] = formatFileSize(file.size);
        result['最終更新日 (フォーマット済み)'] = new Date(file.lastModified).toLocaleString();
        
        return JSON.stringify(result, null, 2);
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