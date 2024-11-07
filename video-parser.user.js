// ==UserScript==
// @name         VIP视频解析助手
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  支持主流视频网站VIP视频免费观看,支持DPlayer播放
// @author       你的名字
// @match        *://*.youku.com/*
// @match        *://*.iqiyi.com/*
// @match        *://*.iq.com/*
// @match        *://*.le.com/*
// @match        *://v.qq.com/*
// @match        *://m.v.qq.com/*
// @match        *://*.tudou.com/*
// @match        *://*.mgtv.com/*
// @match        *://tv.sohu.com/*
// @match        *://film.sohu.com/*
// @match        *://*.1905.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.pptv.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      *
// @charset      UTF-8
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // 配置信息
    const CONFIG = {
        // 解析接口列表
        parseApis: [
            {name: "线路1", url: "https://jx.jsonplayer.com/player/?url="},
            {name: "线路2", url: "https://jx.xmflv.com/?url="},
            {name: "线路3", url: "https://jx.playerjy.com/?url="},
            {name: "线路4", url: "https://www.ckplayer.vip/jiexi/?url="},
            {name: "线路5", url: "https://www.yemu.xyz/?url="},
            {name: "线路6", url: "https://jx.aidouer.net/?url="},
            {name: "线路7", url: "https://www.8090g.cn/?url="},
            {name: "线路8", url: "https://www.pouyun.com/?url="},
            {name: "DPlayer播放", type: "dplayer", url: "https://jx.xmflv.com/?url="} 
        ],
        
        // DPlayer播放页面地址 - 使用GitHub Pages托管
        playerPage: 'https://yvling7.github.io/vip-video-player.io/player.html',
        
        // 样式
        style: `
            #parse-panel {
                position: fixed;
                top: 150px;
                left: 0;
                z-index: 9999999;
                background: #fff;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                padding: 10px;
            }
            .parse-btn {
                display: block;
                margin: 5px 0;
                padding: 5px 10px;
                border: none;
                background: #1c84c6;
                color: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                width: 100px;
                text-align: center;
            }
            .parse-btn:hover {
                background: #1976D2;
            }
            .parse-btn.selected {
                background: #1976D2;
                border: 1px solid #1c84c6;
            }
            .parse-btn.dplayer {
                background: #ff6b81;
            }
            #parse-panel .panel-head {
                color: #1c84c6;
                font-weight: bold;
                font-size: 14px;
                text-align: center;
                margin-bottom: 10px;
            }
            .parse-tips {
                color: #666;
                font-size: 12px;
                margin: 5px 0;
                padding: 5px;
                border-top: 1px solid #eee;
                text-align: center;
            }
        `
    };

    class VideoParser {
        constructor() {
            this.init();
            this.currentApi = null;
            // 从localStorage恢复上次使用的接口
            const lastApi = GM_getValue('last_api');
            if (lastApi) {
                this.currentApi = CONFIG.parseApis[lastApi];
            }
        }
        
        init() {
            this.addStyle();
            this.createPanel();
            this.bindEvents();
        }
        
        // 添加样式
        addStyle() {
            GM_addStyle(CONFIG.style);
        }
        
        // 改进解析面板
        createPanel() {
            const panel = document.createElement('div');
            panel.id = 'parse-panel';
            
            let html = '<div class="panel-head">VIP视频解析</div>';
            
            // 解析按钮
            CONFIG.parseApis.forEach((api, index) => {
                const className = api.type === 'dplayer' ? 'parse-btn dplayer' : 'parse-btn';
                const selected = this.currentApi && this.currentApi.url === api.url ? 'selected' : '';
                html += `
                    <button class="${className} ${selected}" data-index="${index}">
                        ${api.name}
                    </button>
                `;
            });
            
            // 添加提示
            html += `
                <div class="parse-tips">
                    如果当前线路无法播放<br>请尝试切换其他线路<br>
                    <span style="color: #ff6b81;">红色按钮使用DPlayer播放</span>
                </div>
            `;
            
            panel.innerHTML = html;
            document.body.appendChild(panel);
        }
        
        // 改进视频地址获取
        async getVideoUrl(api, videoUrl) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: api.url + videoUrl,
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Referer': videoUrl
                    },
                    onload: function(response) {
                        try {
                            const html = response.responseText;
                            console.log('解析接口返回:', html); // 添加调试日志
                            
                            // 扩展匹配模式
                            const patterns = [
                                // JSON格式
                                /"url"\s*:\s*"([^"]+)"/i,
                                /player_data\s*=\s*{[^}]*"url"\s*:\s*"([^"]+)"/i,
                                /\"playurl\"\s*:\s*\"([^\"]+)\"/i,
                                
                                // m3u8格式
                                /[\'"](https?:\/\/[^\'"]+?\.m3u8[^\'"]*)['"]/i,
                                /(https?:\/\/[^\"\']+?\.m3u8[^\"\'\s]*)/i,
                                
                                // mp4格式
                                /[\'"](https?:\/\/[^\'"]+?\.mp4[^\'"]*)['"]/i,
                                /(https?:\/\/[^\"\']+?\.mp4[^\"\'\s]*)/i,
                                
                                // 通用视频地址
                                /source\s*[=:]\s*['"]([^'"]+)['"]/i,
                                /video\s*[=:]\s*['"]([^'"]+)['"]/i,
                                /url\s*[=:]\s*['"]([^'"]+)['"]/i,
                                
                                // iframe格式
                                /iframe\s+src="([^"]+)"/i
                            ];

                            for (let pattern of patterns) {
                                const match = html.match(pattern);
                                if (match) {
                                    let url = decodeURIComponent(match[1]);
                                    
                                    // 处理相对路径
                                    if (url.startsWith('//')) {
                                        url = 'https:' + url;
                                    } else if (url.startsWith('/')) {
                                        const parsedUrl = new URL(api.url);
                                        url = parsedUrl.origin + url;
                                    }
                                    
                                    // 验证URL
                                    if (url.startsWith('http') && 
                                        (url.includes('.m3u8') || 
                                         url.includes('.mp4') || 
                                         url.includes('video') || 
                                         url.includes('stream'))) {
                                        console.log('找到视频地址:', url); // 添加调试日志
                                        resolve(url);
                                        return;
                                    }
                                }
                            }
                            
                            // 如果是iframe格式，递归解析
                            const iframeMatch = html.match(/iframe\s+src="([^"]+)"/i);
                            if (iframeMatch) {
                                let iframeUrl = iframeMatch[1];
                                if (iframeUrl.startsWith('//')) {
                                    iframeUrl = 'https:' + iframeUrl;
                                }
                                console.log('找到iframe，递归解析:', iframeUrl); // 添加调试日志
                                return this.getVideoUrl({ url: '' }, iframeUrl)
                                    .then(resolve)
                                    .catch(reject);
                            }
                            
                            reject('未找到视频地址');
                        } catch (error) {
                            console.error('解析错误:', error); // 添加调试日志
                            reject(error);
                        }
                    },
                    onerror: (error) => {
                        console.error('请求错误:', error); // 添加调试日志
                        reject(error);
                    },
                    ontimeout: () => {
                        console.error('请求超时'); // 添加调试日志
                        reject('请求超时');
                    }
                });
            });
        }
        
        // 改进事件绑定
        bindEvents() {
            document.querySelectorAll('.parse-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const index = btn.dataset.index;
                    const api = CONFIG.parseApis[index];
                    
                    // 更新选中状态
                    document.querySelectorAll('.parse-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    
                    // 记住当前使用的接口
                    this.currentApi = api;
                    GM_setValue('last_api', index);
                    
                    if (api.type === 'dplayer') {
                        try {
                            btn.textContent = '解析中...';
                            
                            // 1. 先打开DPlayer播放页面
                            const playerUrl = `${CONFIG.playerPage}?api=${encodeURIComponent(api.url)}&video=${encodeURIComponent(location.href)}`;
                            GM_openInTab(playerUrl, {
                                active: true,
                                insert: true,
                                setParent: true
                            });
                            
                        } catch (error) {
                            console.error('解析失败:', error);
                            alert('解析失败,请尝试其他线路');
                        } finally {
                            btn.textContent = 'DPlayer播放';
                        }
                    } else {
                        // 普通解析接口
                        const url = api.url + location.href;
                        GM_openInTab(url, {
                            active: true,
                            insert: true,
                            setParent: true
                        });
                    }
                });
            });
        }
    }

    // 启动脚本
    new VideoParser();
})(); 
