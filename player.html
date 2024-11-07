<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VIP视频播放器</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css">
    <style>
        body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            background: #000;
            overflow: hidden;
        }
        #player-container {
            width: 100%;
            height: 100vh;
            border: none;
        }
        #dplayer {
            width: 100%;
            height: 100vh;
            display: none;
        }
        .loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 16px;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <div class="loading">加载中...</div>
    <iframe id="player-container"></iframe>
    <div id="dplayer"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js"></script>
    <script>
        // 获取URL参数
        const urlParams = new URLSearchParams(window.location.search);
        const videoUrl = urlParams.get('video');
        
        if (!videoUrl) {
            document.querySelector('.loading').textContent = '参数错误';
            throw new Error('Missing parameters');
        }

        // 先加载xmflv解析
        const iframe = document.getElementById('player-container');
        iframe.src = 'https://jx.xmflv.com/?url=' + videoUrl;
        
        // 监听iframe加载完成
        iframe.onload = function() {
            document.querySelector('.loading').textContent = '正在获取视频地址...';
            
            // 等待一段时间让视频加载
            setTimeout(() => {
                try {
                    // 从iframe中获取视频地址
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const videoElement = iframeDoc.querySelector('video');
                    
                    if (videoElement && videoElement.src) {
                        // 获取到视频地址，创建DPlayer
                        createDPlayer(videoElement.src);
                    } else {
                        // 如果没找到视频元素，继续使用iframe播放
                        document.querySelector('.loading').style.display = 'none';
                    }
                } catch (error) {
                    console.error('获取视频地址失败:', error);
                    document.querySelector('.loading').style.display = 'none';
                }
            }, 2000); // 等待2秒
        };

        // 创建DPlayer
        function createDPlayer(url) {
            const dp = new DPlayer({
                container: document.getElementById('dplayer'),
                video: {
                    url: url,
                    type: url.includes('.m3u8') ? 'hls' : 'auto',
                    customType: {
                        hls: function(video, player) {
                            const hls = new Hls({
                                debug: false,
                                maxBufferLength: 60 * 2,
                                maxMaxBufferLength: 60 * 2,
                            });
                            hls.loadSource(video.src);
                            hls.attachMedia(video);
                            hls.on(Hls.Events.ERROR, function (event, data) {
                                if (data.fatal) {
                                    switch(data.type) {
                                        case Hls.ErrorTypes.NETWORK_ERROR:
                                            hls.startLoad();
                                            break;
                                        case Hls.ErrorTypes.MEDIA_ERROR:
                                            hls.recoverMediaError();
                                            break;
                                        default:
                                            hls.destroy();
                                            break;
                                    }
                                }
                            });
                        }
                    }
                },
                autoplay: true,
                theme: '#1c84c6',
                lang: 'zh-cn',
                hotkey: true,
                preload: 'auto',
                volume: 0.7,
                mutex: true,
                screenshot: true,
                playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
                contextmenu: [
                    {
                        text: 'VIP视频解析播放器',
                        link: 'https://github.com/yvling7/vip-video-player.io'
                    }
                ]
            });

            // 播放器创建成功，切换显示
            document.getElementById('player-container').style.display = 'none';
            document.getElementById('dplayer').style.display = 'block';
            document.querySelector('.loading').style.display = 'none';

            // 播放器事件
            dp.on('error', () => {
                // 如果DPlayer播放失败，回退到iframe播放
                document.getElementById('player-container').style.display = 'block';
                document.getElementById('dplayer').style.display = 'none';
            });
        }
    </script>
</body>
</html>
