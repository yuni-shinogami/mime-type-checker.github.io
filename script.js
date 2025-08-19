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
            
            // MIMEタイプの取得と推測
            let mimeType = file.type || 'unknown';
            let guessedMimeType = '';
            
            // MIMEタイプが不明な場合は拡張子から推測
            if (mimeType === 'unknown' || mimeType === '') {
                guessedMimeType = guessMimeTypeFromExtension(file.name);
                if (guessedMimeType) {
                    console.log(`拡張子から推測したMIMEタイプ: ${guessedMimeType}`);
                } else {
                    // 拡張子からの推測に失敗した場合、拡張子そのものを表示するための準備
                    const extension = getFileExtension(file.name);
                    if (extension && extension !== 'なし') {
                        guessedMimeType = `不明（拡張子: ${extension}）`;
                        console.log(`拡張子 ${extension} は登録されていないため、MIMEタイプ不明`);
                    }
                }
            }
            
            // アラートでMIMEタイプを表示
            if (guessedMimeType) {
                alert(`検出されたMIME Type: ${mimeType}\n【拡張子から推測】MIME Type: ${guessedMimeType}`);
            } else {
                alert(`MIME Type: ${mimeType}`);
            }
            
            // 結果コンテナをクリア
            resultContainer.innerHTML = '';
            
            // デバッグ情報を早めに表示（変数の状態確認のため）
            console.log('File object:', file);
            console.log('Original MIME type:', mimeType);
            console.log('Guessed MIME type:', guessedMimeType);
            
            // 推測されたMIMEタイプがある場合、先にそれを示すバナーを表示
            if (guessedMimeType) {
                displayGuessBanner(file.name, guessedMimeType);
            }
            
            // 結果表示エリアに基本情報を表示
            displayFileInfo(file, guessedMimeType);
            
            // ファイルプロパティを表示
            displayFileProperties(file, guessedMimeType);
            
            // MIMEタイプが不明で、推測したMIMEタイプもない場合の診断情報を表示
            if ((mimeType === 'unknown' || mimeType === '') && !guessedMimeType) {
                displayMimeDiagnostic(file);
            }
            
            // ファイル内容の表示
            readFileContent(file, guessedMimeType);
        } else {
            selectedFileName.textContent = 'ファイルが選択されていません';
            resultContainer.innerHTML = '';
        }
    });

    // 推測バナーを表示する関数
    function displayGuessBanner(fileName, guessedMimeType) {
        const ext = getFileExtension(fileName);
        const bannerDiv = document.createElement('div');
        bannerDiv.className = 'result-item guess-banner';
        bannerDiv.innerHTML = `
            <div>
                <h3>【ファイルタイプの推測結果】</h3>
                <p>このファイルのMIMEタイプはブラウザで自動検出できませんでした。</p>
                <p>ファイル拡張子「<strong>${ext}</strong>」から推測したMIMEタイプ: 
                   <span class="result-mime-guessed">${guessedMimeType}</span>
                </p>
                <p class="guess-note">注意: これは推測値であり、実際のファイル内容と異なる場合があります。</p>
            </div>
        `;
        resultContainer.appendChild(bannerDiv);
    }

    // 拡張子からMIMEタイプを推測する関数
    function guessMimeTypeFromExtension(filename) {
        const extension = getFileExtension(filename).toLowerCase();
        
        // 拡張子がない場合は早期リターン
        if (!extension || extension === 'なし') {
            console.log('ファイル拡張子がないため、MIMEタイプの推測ができません');
            return '';
        }
        
        const mimeMap = {
            // テキスト系
            'txt': 'text/plain',
            'html': 'text/html',
            'htm': 'text/html',
            'css': 'text/css',
            'csv': 'text/csv',
            'md': 'text/markdown',
            'rtf': 'application/rtf',
            
            // スクリプト系
            'js': 'text/javascript',
            'json': 'application/json',
            'xml': 'application/xml',
            'php': 'application/x-php',
            'py': 'text/x-python',
            'java': 'text/x-java',
            'c': 'text/x-c',
            'cpp': 'text/x-c++',
            'cs': 'text/x-csharp',
            'rb': 'text/x-ruby',
            'go': 'text/x-go',
            'ts': 'application/typescript',
            
            // 画像系
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'tif': 'image/tiff',
            'tiff': 'image/tiff',
            'ico': 'image/x-icon',
            
            // Adobe関連ファイル形式
            'psd': 'image/vnd.adobe.photoshop',
            'ai': 'application/pdf',  // AIファイルはPDF互換の場合が多い
            'indd': 'application/x-indesign',
            'xd': 'application/vnd.adobe.xd',
            'pdf': 'application/pdf',
            'eps': 'application/postscript',
            'psb': 'image/vnd.adobe.photoshop',  // 大きなサイズのPhotoshopファイル
            'aep': 'application/vnd.adobe.aftereffects.project',
            'prproj': 'application/vnd.adobe.premiere-project',
            'fla': 'application/vnd.adobe.flash.fla',
            'swf': 'application/x-shockwave-flash',
            'dng': 'image/x-adobe-dng',  // Adobe Digital Negative
            'abr': 'application/vnd.adobe.brush',  // Adobeブラシ
            'ase': 'application/vnd.adobe.ase',    // Adobe Swatch Exchange
            'asl': 'application/vnd.adobe.asl',    // Adobe Style Library
            
            // 文書系
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'odt': 'application/vnd.oasis.opendocument.text',
            'ods': 'application/vnd.oasis.opendocument.spreadsheet',
            'odp': 'application/vnd.oasis.opendocument.presentation',
            
            // オーディオ系
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'm4a': 'audio/mp4',
            
            // ビデオ系
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'webm': 'video/webm',
            'mkv': 'video/x-matroska',
            'flv': 'video/x-flv',
            'm4v': 'video/x-m4v',
            '3gp': 'video/3gpp',
            '3g2': 'video/3gpp2',
            'ogv': 'video/ogg',
            'mpg': 'video/mpeg',
            'mpeg': 'video/mpeg',
            'mts': 'video/mp2t',
            'ts': 'video/mp2t',
            
            // アーカイブ系
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',
            
            // その他
            'exe': 'application/x-msdownload',
            'dll': 'application/x-msdownload',
            'iso': 'application/x-iso9660-image',
            'apk': 'application/vnd.android.package-archive',
            'dmg': 'application/x-apple-diskimage',
            'sql': 'application/x-sql',
            
            // Webフォント
            'woff': 'font/woff',
            'woff2': 'font/woff2',
            'ttf': 'font/ttf',
            'otf': 'font/otf',
            'eot': 'application/vnd.ms-fontobject',
        };
        
        const result = extension && mimeMap[extension] ? mimeMap[extension] : '';
        if (!result) {
            console.log(`拡張子 "${extension}" は登録されていないため、MIMEタイプを推測できません`);
        }
        return result;
    }

    // 基本的なファイル情報を表示する関数
    function displayFileInfo(file, guessedMimeType) {
        const mimeType = file.type || 'unknown';
        const fileSize = formatFileSize(file.size);
        
        // MIMEタイプの表示テキストを作成
        let mimeTypeDisplay = '';
        
        // 検出されたMIMEタイプの表示
        if (mimeType && mimeType !== 'unknown') {
            mimeTypeDisplay += `<div><strong>検出されたMIME Type:</strong> <span class="result-mime">${mimeType}</span></div>`;
        } else {
            mimeTypeDisplay += `<div><strong>検出されたMIME Type:</strong> <span class="result-mime-unknown">不明</span></div>`;
        }
        
        // 推測されたMIMEタイプの表示 - 必ず表示するように修正
        if (guessedMimeType) {
            mimeTypeDisplay += `<div class="guessed-mime-container"><strong>【拡張子から推測】MIME Type:</strong> <span class="result-mime-guessed">${guessedMimeType}</span></div>`;
            console.log('推測MIMEタイプを表示します:', guessedMimeType);
        } else {
            // 推測できなかった場合も表示
            const ext = getFileExtension(file.name);
            if (ext && ext !== 'なし') {
                mimeTypeDisplay += `<div class="guessed-mime-container"><strong>【拡張子から推測】:</strong> <span class="result-mime-unknown">この拡張子 (${ext}) からMIMEタイプを推測できません</span></div>`;
            } else {
                mimeTypeDisplay += `<div class="guessed-mime-container"><strong>【拡張子から推測】:</strong> <span class="result-mime-unknown">拡張子がないため推測できません</span></div>`;
            }
            console.log('推測MIMEタイプがないため、その旨を表示します');
        }
        
        const fileInfoHTML = `
            <div class="result-item">
                <div>
                    <strong>ファイル名:</strong> ${file.name}
                </div>
            </div>
            <div class="result-item file-type-info">
                <div>
                    <strong>ファイルタイプ情報:</strong> 
                    ${mimeTypeDisplay}
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
    function displayFileProperties(file, guessedMimeType) {
        try {
            // Fileオブジェクトのすべてのプロパティを取得
            const fileProperties = getAllFileProperties(file, guessedMimeType);
            
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
        const isAdobeFormat = isAdobeFileFormat(fileExtension);
        
        const diagnosticDiv = document.createElement('div');
        diagnosticDiv.className = 'result-item mime-diagnostic';
        
        let diagnosticHTML = `
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
                    <li>ヒント: 一般的なファイルタイプの場合、拡張子を正しく設定するとMIMEタイプが検出されることがあります。</li>
                </ul>
            </div>
        `;
        
        // Adobeファイル形式の場合は追加情報を表示
        if (isAdobeFormat) {
            const adobeInfo = getAdobeFileInfo(fileExtension);
            diagnosticHTML += `
                <div class="adobe-info">
                    <strong>Adobe形式の詳細情報:</strong>
                    <ul>
                        <li><strong>ファイル形式:</strong> ${adobeInfo.name}</li>
                        <li><strong>アプリケーション:</strong> ${adobeInfo.application}</li>
                        <li><strong>形式の特徴:</strong> ${adobeInfo.description}</li>
                        <li><strong>推奨される取り扱い:</strong> ${adobeInfo.recommendation}</li>
                    </ul>
                </div>
            `;
        }
        
        diagnosticDiv.innerHTML = diagnosticHTML;
        resultContainer.appendChild(diagnosticDiv);
    }
    
    // Adobeファイル形式かどうかをチェックする関数
    function isAdobeFileFormat(extension) {
        if (!extension) return false;
        
        const adobeExtensions = [
            'psd', 'psb', 'ai', 'indd', 'pdf', 'eps', 'xd', 
            'aep', 'prproj', 'fla', 'swf', 'dng', 'abr', 'ase', 'asl'
        ];
        
        return adobeExtensions.includes(extension.toLowerCase());
    }
    
    // Adobe形式の詳細情報を取得する関数
    function getAdobeFileInfo(extension) {
        extension = extension.toLowerCase();
        
        const adobeFileInfo = {
            'psd': {
                name: 'Photoshopドキュメント（.psd）',
                application: 'Adobe Photoshop',
                description: 'レイヤー、調整レイヤー、マスク、テキスト、ベクトル形状などの編集情報を含む画像ファイル形式です。',
                recommendation: 'Photoshopで開くことで、すべてのレイヤーと編集機能を利用できます。Web表示用にはJPGまたはPNG形式への変換をお勧めします。'
            },
            'psb': {
                name: '大きなPhotoshopドキュメント（.psb）',
                application: 'Adobe Photoshop',
                description: '大きなサイズ（2GB以上）のPhotoshopファイル形式です。PSDと同様の機能がありますが、より大きなファイルサイズをサポートします。',
                recommendation: 'Photoshopで開くことをお勧めします。通常のPSDよりもリソースを多く消費する場合があります。'
            },
            'ai': {
                name: 'Illustratorドキュメント（.ai）',
                application: 'Adobe Illustrator',
                description: 'ベクトルグラフィックスを含むIllustratorの標準ファイル形式です。多くの場合、PDF互換の形式で保存されています。',
                recommendation: 'Illustratorで開くことでベクトル編集機能を最大限に活用できます。PDF互換形式の場合はAcrobat Readerでも表示可能です。'
            },
            'indd': {
                name: 'InDesignドキュメント（.indd）',
                application: 'Adobe InDesign',
                description: 'ページレイアウト、テキスト、グラフィックスなどを含む出版向けファイル形式です。',
                recommendation: 'InDesignで開くことをお勧めします。PDFやIDMLに書き出して異なるバージョン間での互換性を確保できます。'
            },
            'pdf': {
                name: 'Portable Document Format（.pdf）',
                application: 'Adobe Acrobat / Reader',
                description: 'プラットフォームに依存しない文書形式で、テキスト、フォント、画像、ベクトルグラフィックスを含みます。',
                recommendation: 'Acrobat ReaderやChrome、Edgeなどのブラウザで表示できます。編集にはAcrobat Pro等が必要です。'
            },
            'eps': {
                name: 'Encapsulated PostScript（.eps）',
                application: 'Adobe Illustrator / Photoshop',
                description: 'ベクトルグラフィックスとビットマップ画像を含む印刷用のファイル形式です。',
                recommendation: 'IllustratorやPhotoshopで開くことができます。主に印刷用途に使用されます。'
            },
            'xd': {
                name: 'Experience Design Document（.xd）',
                application: 'Adobe XD',
                description: 'UIデザイン、プロトタイピング、ワイヤーフレームなどを含むUX/UIデザイン用のファイル形式です。',
                recommendation: 'Adobe XDで開くことをお勧めします。プロトタイプとして共有または書き出すことができます。'
            },
            'aep': {
                name: 'After Effects Project（.aep）',
                application: 'Adobe After Effects',
                description: 'アニメーション、モーショングラフィックス、視覚効果のプロジェクトファイルです。',
                recommendation: 'After Effectsで開く必要があります。最終出力にはMP4、MOVなどの形式への書き出しが推奨されます。'
            },
            'prproj': {
                name: 'Premiere Pro Project（.prproj）',
                application: 'Adobe Premiere Pro',
                description: '映像編集プロジェクトのファイル形式で、タイムライン、クリップ、エフェクト情報などを含みます。',
                recommendation: 'Premiere Proで開く必要があります。最終出力にはMP4、MOVなどの形式への書き出しが推奨されます。'
            },
            'fla': {
                name: 'Flash Animation（.fla）',
                application: 'Adobe Animate（旧Flash Professional）',
                description: 'アニメーション、インタラクティブコンテンツの編集用ファイル形式です。',
                recommendation: 'Adobe Animateで開くことができます。HTML5 Canvasやアニメーションとして書き出すことが推奨されます。'
            },
            'swf': {
                name: 'Shockwave Flash（.swf）',
                application: 'Adobe Flash Player（非推奨）',
                description: 'Flashアニメーションやインタラクティブコンテンツの実行ファイル形式です。多くのブラウザでサポートが終了しています。',
                recommendation: '現在は非推奨の形式です。HTML5ベースの技術への移行が推奨されます。'
            },
            'dng': {
                name: 'Digital Negative（.dng）',
                application: 'Adobe Camera Raw / Lightroom',
                description: 'カメラRAWデータの標準化されたファイル形式です。様々なカメラのRAWファイルをアーカイブするために使用されます。',
                recommendation: 'Lightroom、Photoshop、または対応する写真編集ソフトウェアで開くことができます。'
            },
            'abr': {
                name: 'Photoshopブラシ（.abr）',
                application: 'Adobe Photoshop',
                description: 'Photoshopで使用するブラシプリセットのファイル形式です。',
                recommendation: 'Photoshopのブラシパネルで読み込んで使用します。'
            },
            'ase': {
                name: 'Adobe Swatch Exchange（.ase）',
                application: 'Adobe Creative Cloud アプリケーション',
                description: 'カラースウォッチ（色見本）を保存するためのファイル形式です。',
                recommendation: 'Photoshop、Illustrator、InDesignなどのスウォッチパネルで読み込むことができます。'
            },
            'asl': {
                name: 'Adobe Style Library（.asl）',
                application: 'Adobe Photoshop',
                description: 'Photoshopのレイヤースタイルプリセットを保存するファイル形式です。',
                recommendation: 'Photoshopのスタイルパネルで読み込んで使用します。'
            }
        };
        
        return adobeFileInfo[extension] || {
            name: `Adobe形式 (.${extension})`,
            application: 'Adobe Creative Cloud',
            description: 'Adobe製品に関連するファイル形式です。詳細情報は登録されていません。',
            recommendation: '対応するAdobe製品で開くことをお勧めします。'
        };
    }

    // ファイル内容を読み込む関数
    function readFileContent(file, guessedMimeType) {
        const reader = new FileReader();
        const effectiveMimeType = file.type || guessedMimeType || 'unknown';
        
        reader.onload = function(e) {
            const content = e.target.result;
            
            // ファイル内容の表示用のHTML要素を作成
            const fileContentDiv = document.createElement('div');
            fileContentDiv.className = 'result-item file-content';
            
            // ファイル内容のヘッダー
            const contentHeader = document.createElement('h3');
            contentHeader.textContent = 'ファイル内容:';
            fileContentDiv.appendChild(contentHeader);
            
            // MIMEタイプに基づいた表示方法の選択
            if (effectiveMimeType.startsWith('image/')) {
                // 画像ファイルの場合は画像として表示
                const img = document.createElement('img');
                img.src = content;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '300px';
                img.style.marginTop = '10px';
                img.alt = file.name;
                fileContentDiv.appendChild(img);
                
                const infoText = document.createElement('p');
                if (!file.type && guessedMimeType) {
                    infoText.className = 'guess-info';
                    infoText.innerHTML = `<strong>【拡張子から推測】</strong>: このファイルは画像ファイル（${guessedMimeType}）として表示しています。実際のファイル内容と異なる場合があります。`;
                } else {
                    infoText.textContent = `画像ファイル（${effectiveMimeType}）として表示しています。`;
                }
                infoText.style.marginTop = '10px';
                fileContentDiv.appendChild(infoText);
            } else if (effectiveMimeType.startsWith('video/')) {
                // ビデオファイルの場合はビデオ要素として表示
                const video = document.createElement('video');
                video.src = content;
                video.controls = true;
                video.style.maxWidth = '100%';
                video.style.maxHeight = '400px';
                video.style.marginTop = '10px';
                video.preload = 'metadata';
                fileContentDiv.appendChild(video);
                
                const infoText = document.createElement('p');
                if (!file.type && guessedMimeType) {
                    infoText.className = 'guess-info';
                    infoText.innerHTML = `<strong>【拡張子から推測】</strong>: このファイルはビデオファイル（${guessedMimeType}）として表示しています。実際のファイル内容と異なる場合があります。`;
                } else {
                    infoText.textContent = `ビデオファイル（${effectiveMimeType}）として表示しています。`;
                }
                infoText.style.marginTop = '10px';
                fileContentDiv.appendChild(infoText);
                
                // ビデオの詳細情報を追加
                video.addEventListener('loadedmetadata', function() {
                    try {
                        const duration = video.duration;
                        const width = video.videoWidth;
                        const height = video.videoHeight;
                        
                        // 時間を分:秒形式にフォーマット
                        const formatDuration = (seconds) => {
                            if (isNaN(seconds) || !isFinite(seconds)) return '不明';
                            const minutes = Math.floor(seconds / 60);
                            const secs = Math.floor(seconds % 60);
                            return `${minutes}:${secs.toString().padStart(2, '0')} (${Math.round(seconds)}秒)`;
                        };
                        
                        // アスペクト比を計算
                        const calculateAspectRatio = (w, h) => {
                            if (!w || !h) return '不明';
                            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                            const divisor = gcd(w, h);
                            return `${w / divisor}:${h / divisor}`;
                        };
                        
                        // ビデオ情報コンテナを作成
                        const videoInfoContainer = document.createElement('div');
                        videoInfoContainer.style.marginTop = '10px';
                        videoInfoContainer.style.padding = '10px';
                        videoInfoContainer.style.border = '1px solid #ddd';
                        videoInfoContainer.style.borderRadius = '5px';
                        videoInfoContainer.style.backgroundColor = '#f9f9f9';
                        
                        const videoInfoTitle = document.createElement('h4');
                        videoInfoTitle.textContent = 'ビデオ詳細情報';
                        videoInfoTitle.style.margin = '0 0 10px 0';
                        videoInfoTitle.style.color = '#333';
                        videoInfoContainer.appendChild(videoInfoTitle);
                        
                        const videoInfoList = document.createElement('ul');
                        videoInfoList.style.margin = '0';
                        videoInfoList.style.paddingLeft = '20px';
                        videoInfoList.style.fontSize = '0.9em';
                        
                        // 解像度情報
                        const resolutionItem = document.createElement('li');
                        resolutionItem.innerHTML = `<strong>解像度:</strong> ${width || '不明'} × ${height || '不明'} ピクセル`;
                        videoInfoList.appendChild(resolutionItem);
                        
                        // アスペクト比
                        const aspectRatioItem = document.createElement('li');
                        aspectRatioItem.innerHTML = `<strong>アスペクト比:</strong> ${calculateAspectRatio(width, height)}`;
                        videoInfoList.appendChild(aspectRatioItem);
                        
                        // 再生時間
                        const durationItem = document.createElement('li');
                        durationItem.innerHTML = `<strong>再生時間:</strong> ${formatDuration(duration)}`;
                        videoInfoList.appendChild(durationItem);
                        
                        // ファイルサイズあたりの推定ビットレート
                        const fileSizeKB = file.size / 1024;
                        if (duration && duration > 0) {
                            const estimatedBitrate = Math.round((fileSizeKB * 8) / duration);
                            const bitrateItem = document.createElement('li');
                            bitrateItem.innerHTML = `<strong>推定ビットレート:</strong> ${estimatedBitrate} kbps (ファイルサイズから計算)`;
                            videoInfoList.appendChild(bitrateItem);
                        }
                        
                        // 解像度による品質分類
                        const getQualityCategory = (w, h) => {
                            if (!w || !h) return '不明';
                            const pixels = w * h;
                            if (pixels >= 3840 * 2160) return '4K UHD (2160p)';
                            if (pixels >= 2560 * 1440) return 'QHD (1440p)';
                            if (pixels >= 1920 * 1080) return 'Full HD (1080p)';
                            if (pixels >= 1280 * 720) return 'HD (720p)';
                            if (pixels >= 854 * 480) return 'SD (480p)';
                            if (pixels >= 640 * 360) return '360p';
                            return '低解像度';
                        };
                        
                        const qualityItem = document.createElement('li');
                        qualityItem.innerHTML = `<strong>品質分類:</strong> ${getQualityCategory(width, height)}`;
                        videoInfoList.appendChild(qualityItem);
                        
                        // ビデオ形式の詳細情報
                        const getVideoFormatInfo = (mimeType, fileName) => {
                            const ext = getFileExtension(fileName).toLowerCase();
                            const formatInfo = {
                                'mp4': {
                                    name: 'MP4 (MPEG-4 Part 14)',
                                    description: 'H.264/H.265コーデックを使用する汎用的なビデオ形式。Web配信に最適。',
                                    compatibility: '非常に高い（ほぼ全てのデバイス・ブラウザで再生可能）'
                                },
                                'avi': {
                                    name: 'AVI (Audio Video Interleave)',
                                    description: 'Microsoftが開発した古典的なビデオ形式。様々なコーデックを格納可能。',
                                    compatibility: '高い（多くのメディアプレーヤーで対応）'
                                },
                                'mov': {
                                    name: 'MOV (QuickTime Movie)',
                                    description: 'Apple QuickTimeの標準形式。高品質なビデオ保存に適している。',
                                    compatibility: '限定的（Safari、macOSで良好、Windows ChromeやFirefoxでは再生困難）'
                                },
                                'webm': {
                                    name: 'WebM',
                                    description: 'Google開発のWeb配信用オープンソース形式。VP8/VP9コーデック使用。',
                                    compatibility: '高い（現代的なブラウザで標準サポート）'
                                },
                                'mkv': {
                                    name: 'MKV (Matroska Video)',
                                    description: 'オープンソースのマルチメディアコンテナ。複数の音声・字幕トラックをサポート。',
                                    compatibility: '中程度（VLCなどの対応プレーヤーが必要）'
                                },
                                'flv': {
                                    name: 'FLV (Flash Video)',
                                    description: 'Adobe Flash用ビデオ形式。現在は非推奨。',
                                    compatibility: '低い（Flash Playerサポート終了により再生困難）'
                                },
                                'm4v': {
                                    name: 'M4V (iTunes Video)',
                                    description: 'Apple iTunes用のMP4ベース形式。DRM保護に対応。',
                                    compatibility: '中程度（iTunes、QuickTimeで再生可能）'
                                },
                                '3gp': {
                                    name: '3GP (3rd Generation Partnership Project)',
                                    description: '携帯電話向けのビデオ形式。ファイルサイズが小さい。',
                                    compatibility: '中程度（モバイルデバイス中心）'
                                },
                                'ogv': {
                                    name: 'OGV (Ogg Video)',
                                    description: 'オープンソースのTheora codecを使用する形式。',
                                    compatibility: '中程度（Firefox、VLCなどで対応）'
                                },
                                'mpg': {
                                    name: 'MPG/MPEG (Motion Picture Experts Group)',
                                    description: '初期のデジタルビデオ標準。DVD、放送で広く使用。',
                                    compatibility: '高い（レガシーサポート含め広く対応）'
                                }
                            };
                            
                            return formatInfo[ext] || {
                                name: `${ext.toUpperCase()} ビデオファイル`,
                                description: 'ビデオファイル形式の詳細情報は登録されていません。',
                                compatibility: '不明'
                            };
                        };
                        
                        const formatInfo = getVideoFormatInfo(effectiveMimeType, file.name);
                        const formatItem = document.createElement('li');
                        formatItem.innerHTML = `<strong>ファイル形式:</strong> ${formatInfo.name}`;
                        videoInfoList.appendChild(formatItem);
                        
                        videoInfoContainer.appendChild(videoInfoList);
                        
                        // フォーマット詳細情報を別セクションで表示
                        const formatDetailsContainer = document.createElement('div');
                        formatDetailsContainer.style.marginTop = '8px';
                        formatDetailsContainer.style.paddingTop = '8px';
                        formatDetailsContainer.style.borderTop = '1px solid #ddd';
                        
                        const formatDetailsTitle = document.createElement('h5');
                        formatDetailsTitle.textContent = 'フォーマット詳細';
                        formatDetailsTitle.style.margin = '0 0 5px 0';
                        formatDetailsTitle.style.fontSize = '0.85em';
                        formatDetailsTitle.style.color = '#555';
                        formatDetailsContainer.appendChild(formatDetailsTitle);
                        
                        const formatDescription = document.createElement('p');
                        formatDescription.innerHTML = `<strong>説明:</strong> ${formatInfo.description}`;
                        formatDescription.style.margin = '0 0 5px 0';
                        formatDescription.style.fontSize = '0.8em';
                        formatDescription.style.color = '#666';
                        formatDetailsContainer.appendChild(formatDescription);
                        
                        const formatCompatibility = document.createElement('p');
                        formatCompatibility.innerHTML = `<strong>互換性:</strong> ${formatInfo.compatibility}`;
                        formatCompatibility.style.margin = '0';
                        formatCompatibility.style.fontSize = '0.8em';
                        formatCompatibility.style.color = '#666';
                        formatDetailsContainer.appendChild(formatCompatibility);
                        
                        videoInfoContainer.appendChild(formatDetailsContainer);
                        
                        // 互換性警告を表示（必要な場合）
                        const showCompatibilityWarning = (fileName, mimeType) => {
                            const ext = getFileExtension(fileName).toLowerCase();
                            const userAgent = navigator.userAgent;
                            const isWindows = userAgent.includes('Windows');
                            const isChrome = userAgent.includes('Chrome');
                            const isFirefox = userAgent.includes('Firefox');
                            
                            const warningFormats = ['mov', 'avi', 'mkv', 'flv'];
                            
                            if (warningFormats.includes(ext)) {
                                const warningContainer = document.createElement('div');
                                warningContainer.style.marginTop = '10px';
                                warningContainer.style.padding = '10px';
                                warningContainer.style.border = '2px solid #ff9800';
                                warningContainer.style.borderRadius = '5px';
                                warningContainer.style.backgroundColor = '#fff3e0';
                                
                                const warningTitle = document.createElement('h5');
                                warningTitle.textContent = '⚠️ 互換性に関する注意';
                                warningTitle.style.margin = '0 0 8px 0';
                                warningTitle.style.color = '#e65100';
                                warningContainer.appendChild(warningTitle);
                                
                                let warningText = '';
                                if (ext === 'mov' && isWindows && (isChrome || isFirefox)) {
                                    warningText = 'MOVファイルはWindows版Chrome/Firefoxでは再生できない場合があります。Safariまたはデスクトップアプリケーションの使用を推奨します。';
                                } else if (ext === 'avi') {
                                    warningText = 'AVIファイルはコーデックによって再生できない場合があります。MP4形式への変換を推奨します。';
                                } else if (ext === 'mkv') {
                                    warningText = 'MKVファイルはブラウザでの再生サポートが限定的です。デスクトップアプリケーションでの再生を推奨します。';
                                } else if (ext === 'flv') {
                                    warningText = 'FLVファイルは現在のブラウザではサポートされていません。MP4形式への変換が必要です。';
                                }
                                
                                const warningDescription = document.createElement('p');
                                warningDescription.textContent = warningText;
                                warningDescription.style.margin = '0';
                                warningDescription.style.fontSize = '0.85em';
                                warningDescription.style.color = '#bf360c';
                                warningContainer.appendChild(warningDescription);
                                
                                return warningContainer;
                            }
                            return null;
                        };
                        
                        const warning = showCompatibilityWarning(file.name, effectiveMimeType);
                        if (warning) {
                            fileContentDiv.appendChild(warning);
                        }
                        
                        fileContentDiv.appendChild(videoInfoContainer);
                        
                    } catch (error) {
                        console.error('ビデオメタデータの取得中にエラーが発生しました:', error);
                        const errorInfoText = document.createElement('p');
                        errorInfoText.innerHTML = `<strong>ビデオ情報:</strong> メタデータの読み込みに失敗しました`;
                        errorInfoText.style.marginTop = '10px';
                        errorInfoText.style.color = '#999';
                        fileContentDiv.appendChild(errorInfoText);
                    }
                });
                
                // エラーハンドリング
                video.addEventListener('error', function(e) {
                    console.error('ビデオの読み込みエラー:', e);
                    
                    // エラー詳細情報を取得
                    const getDetailedErrorInfo = (fileName, mimeType) => {
                        const ext = getFileExtension(fileName).toLowerCase();
                        const userAgent = navigator.userAgent;
                        const isWindows = userAgent.includes('Windows');
                        const isChrome = userAgent.includes('Chrome');
                        const isFirefox = userAgent.includes('Firefox');
                        const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
                        
                        const errorInfo = {
                            'mov': {
                                reason: 'MOVファイルは、WindowsのChromeやFirefoxでは標準的にサポートされていません。',
                                solutions: [
                                    'Safariブラウザで再生を試してください（macOSの場合）',
                                    'VLC Media Player、QuickTime Player等のデスクトップアプリケーションを使用してください',
                                    'MP4形式に変換してからアップロードしてください',
                                    'HandBrake、FFmpeg等の無料ツールで変換可能です'
                                ],
                                browserSpecific: isWindows && isChrome ? 
                                    'Windows ChromeではMOVファイルの再生がサポートされていません。' : 
                                    ''
                            },
                            'avi': {
                                reason: 'AVIファイルは使用されているコーデックによってブラウザでの再生が困難な場合があります。',
                                solutions: [
                                    'MP4形式への変換を推奨します',
                                    'VLC Media Player等のデスクトップアプリケーションを使用してください',
                                    'H.264コーデックでエンコードされたAVIファイルであれば再生可能な場合があります'
                                ]
                            },
                            'mkv': {
                                reason: 'MKVファイルはブラウザでの標準サポートが限定的です。',
                                solutions: [
                                    'VLC Media Player、MPC-HC等の対応プレーヤーを使用してください',
                                    'MP4またはWebM形式への変換を推奨します'
                                ]
                            },
                            'flv': {
                                reason: 'FLVファイルはFlash Playerに依存しており、現在のブラウザではサポートされていません。',
                                solutions: [
                                    'MP4形式への変換が必要です',
                                    'Flash Playerサポートは2020年に終了しています'
                                ]
                            }
                        };
                        
                        return errorInfo[ext] || {
                            reason: 'このビデオファイル形式はブラウザでサポートされていないか、ファイルが破損している可能性があります。',
                            solutions: [
                                'ファイルが正常かどうか確認してください',
                                'MP4、WebM等のWeb対応形式への変換を検討してください',
                                'VLC Media Player等のデスクトップアプリケーションで再生を試してください'
                            ]
                        };
                    };
                    
                    const errorInfo = getDetailedErrorInfo(file.name, effectiveMimeType);
                    
                    // エラー情報コンテナを作成
                    const errorContainer = document.createElement('div');
                    errorContainer.style.marginTop = '10px';
                    errorContainer.style.padding = '15px';
                    errorContainer.style.border = '2px solid #d00';
                    errorContainer.style.borderRadius = '5px';
                    errorContainer.style.backgroundColor = '#ffeaea';
                    
                    const errorTitle = document.createElement('h4');
                    errorTitle.textContent = '⚠️ ビデオ再生エラー';
                    errorTitle.style.margin = '0 0 10px 0';
                    errorTitle.style.color = '#d00';
                    errorContainer.appendChild(errorTitle);
                    
                    const errorReason = document.createElement('p');
                    errorReason.innerHTML = `<strong>原因:</strong> ${errorInfo.reason}`;
                    errorReason.style.margin = '0 0 10px 0';
                    errorReason.style.fontSize = '0.9em';
                    errorContainer.appendChild(errorReason);
                    
                    // ブラウザ固有の情報があれば表示
                    if (errorInfo.browserSpecific) {
                        const browserInfo = document.createElement('p');
                        browserInfo.innerHTML = `<strong>ブラウザ情報:</strong> ${errorInfo.browserSpecific}`;
                        browserInfo.style.margin = '0 0 10px 0';
                        browserInfo.style.fontSize = '0.85em';
                        browserInfo.style.color = '#666';
                        errorContainer.appendChild(browserInfo);
                    }
                    
                    const solutionsTitle = document.createElement('p');
                    solutionsTitle.innerHTML = '<strong>解決策:</strong>';
                    solutionsTitle.style.margin = '0 0 5px 0';
                    solutionsTitle.style.fontSize = '0.9em';
                    errorContainer.appendChild(solutionsTitle);
                    
                    const solutionsList = document.createElement('ul');
                    solutionsList.style.margin = '0';
                    solutionsList.style.paddingLeft = '20px';
                    solutionsList.style.fontSize = '0.85em';
                    
                    errorInfo.solutions.forEach(solution => {
                        const listItem = document.createElement('li');
                        listItem.textContent = solution;
                        listItem.style.marginBottom = '3px';
                        solutionsList.appendChild(listItem);
                    });
                    
                    errorContainer.appendChild(solutionsList);
                    fileContentDiv.appendChild(errorContainer);
                });
            } else if (effectiveMimeType.startsWith('audio/')) {
                // オーディオファイルの場合はオーディオ要素として表示
                const audio = document.createElement('audio');
                audio.src = content;
                audio.controls = true;
                audio.style.width = '100%';
                audio.style.marginTop = '10px';
                audio.preload = 'metadata';
                fileContentDiv.appendChild(audio);
                
                const infoText = document.createElement('p');
                if (!file.type && guessedMimeType) {
                    infoText.className = 'guess-info';
                    infoText.innerHTML = `<strong>【拡張子から推測】</strong>: このファイルはオーディオファイル（${guessedMimeType}）として表示しています。実際のファイル内容と異なる場合があります。`;
                } else {
                    infoText.textContent = `オーディオファイル（${effectiveMimeType}）として表示しています。`;
                }
                infoText.style.marginTop = '10px';
                fileContentDiv.appendChild(infoText);
                
                // オーディオの詳細情報を追加
                audio.addEventListener('loadedmetadata', function() {
                    const audioInfoText = document.createElement('p');
                    audioInfoText.innerHTML = `<strong>オーディオ情報:</strong> ${Math.round(audio.duration)}秒`;
                    audioInfoText.style.marginTop = '5px';
                    audioInfoText.style.fontSize = '0.9em';
                    audioInfoText.style.color = '#666';
                    fileContentDiv.appendChild(audioInfoText);
                });
            } else {
                // テキストエリアでファイル内容を表示
                const contentArea = document.createElement('textarea');
                contentArea.readOnly = true;
                contentArea.style.width = '100%';
                contentArea.style.height = '200px';
                contentArea.style.marginTop = '10px';
                contentArea.value = content;
                fileContentDiv.appendChild(contentArea);
                
                if (!file.type && guessedMimeType) {
                    const infoText = document.createElement('p');
                    infoText.className = 'guess-info';
                    infoText.innerHTML = `<strong>【拡張子から推測】</strong>: このファイルは ${guessedMimeType} として表示しています。実際のファイル内容と異なる場合があります。`;
                    infoText.style.marginTop = '10px';
                    fileContentDiv.appendChild(infoText);
                }
            }
            
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
        
        // MIMEタイプによる読み込み方法の決定
        try {
            if (effectiveMimeType.startsWith('image/') || effectiveMimeType.startsWith('video/') || effectiveMimeType.startsWith('audio/')) {
                // 画像、ビデオ、オーディオファイルはData URLとして読み込む
                reader.readAsDataURL(file);
            } else {
                // テキストファイルとしての読み込みを試みる
                reader.readAsText(file);
            }
        } catch (error) {
            console.error('ファイルの読み込み方法の決定中にエラーが発生しました:', error);
            
            // バックアップとしてData URLとして読み込む
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
    function getAllFileProperties(file, guessedMimeType) {
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
        
        // 推測されたMIMEタイプがあれば追加
        if (guessedMimeType) {
            result['【拡張子から推測】MIMEタイプ'] = guessedMimeType;
        }
        
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
        
        // OSとブラウザの情報
        result['OS情報'] = navigator.platform || 'unknown';
        result['ブラウザ情報'] = navigator.userAgent || 'unknown';
        
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