// 首先导入适配器
import './js/libs/weapp-adapter';
import './js/libs/symbol';

// 然后导入游戏主类
import { Game } from './game/Game';

// 初始化 Canvas
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 设置画布尺寸
const { windowWidth, windowHeight } = wx.getSystemInfoSync();
canvas.width = windowWidth;
canvas.height = windowHeight;

// 初始化游戏
const game = new Game(canvas, ctx);

// 启动游戏
game.start();

// 注册游戏生命周期函数
wx.onShow(() => {
    game.resume();
});

wx.onHide(() => {
    game.pause();
});

// 处理触摸事件
wx.onTouchStart((e) => {
    game.onTouchStart(e);
});

wx.onTouchMove((e) => {
    game.onTouchMove(e);
});

wx.onTouchEnd((e) => {
    game.onTouchEnd(e);
});

// 处理加速度计
wx.startAccelerometer({
    interval: 'game'
});

wx.onAccelerometerChange((e) => {
    game.onAccelerometerChange(e);
});

// 错误监控
wx.onError(error => {
    console.error('游戏错误:', error);
});

// 导出游戏实例供其他模块使用
export default game; 