// 微信小游戏适配器
export default class WeappAdapter {
    constructor() {
        // 初始化 window 对象
        if (!global.window) {
            global.window = global;
        }
        
        if (!global.document) {
            global.document = {
                createElement(tagName) {
                    if (tagName === 'canvas') {
                        return wx.createCanvas();
                    }
                    return null;
                }
            };
        }
    }
}

// 自动初始化适配器
new WeappAdapter(); 