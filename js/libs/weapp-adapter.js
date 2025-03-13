// 微信小游戏适配器
export default class WeappAdapter {
    constructor() {
        // 初始化 window 对象
        if (!GameGlobal.window) {
            GameGlobal.window = GameGlobal;
        }
        
        if (!GameGlobal.document) {
            GameGlobal.document = {
                createElement(tagName) {
                    if (tagName === 'canvas') {
                        return wx.createCanvas();
                    }
                    return null;
                }
            };
        }

        // 初始化其他必要的全局对象
        if (!GameGlobal.navigator) {
            GameGlobal.navigator = {
                userAgent: `WeChat/${wx.getSystemInfoSync().version}`,
                platform: wx.getSystemInfoSync().platform,
                language: wx.getSystemInfoSync().language
            };
        }

        // 初始化 HTMLImageElement
        if (!GameGlobal.Image) {
            GameGlobal.Image = function() {
                return wx.createImage();
            };
        }

        // 初始化 HTMLAudioElement
        if (!GameGlobal.Audio) {
            GameGlobal.Audio = function() {
                return wx.createInnerAudioContext();
            };
        }

        // 初始化 XMLHttpRequest
        if (!GameGlobal.XMLHttpRequest) {
            GameGlobal.XMLHttpRequest = class XMLHttpRequest {
                constructor() {
                    this.timeout = 0;
                    this._readyState = 0;
                    this._status = 0;
                    this._response = null;
                }

                open(method, url) {
                    this._method = method;
                    this._url = url;
                    this._readyState = 1;
                    this.onreadystatechange && this.onreadystatechange();
                }

                send(data) {
                    wx.request({
                        url: this._url,
                        data: data,
                        method: this._method,
                        success: res => {
                            this._status = res.statusCode;
                            this._response = res.data;
                            this._readyState = 4;
                            this.onreadystatechange && this.onreadystatechange();
                        },
                        fail: () => {
                            this._readyState = 4;
                            this._status = 0;
                            this.onreadystatechange && this.onreadystatechange();
                        }
                    });
                }

                get readyState() {
                    return this._readyState;
                }

                get status() {
                    return this._status;
                }

                get response() {
                    return this._response;
                }
            };
        }

        // 初始化 requestAnimationFrame
        if (!GameGlobal.requestAnimationFrame) {
            GameGlobal.requestAnimationFrame = callback => {
                return setTimeout(callback, 1000 / 60);
            };
        }

        if (!GameGlobal.cancelAnimationFrame) {
            GameGlobal.cancelAnimationFrame = id => {
                clearTimeout(id);
            };
        }
    }
}

// 自动初始化适配器
new WeappAdapter(); 