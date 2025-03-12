import { GAME_CONFIG } from '../game.config';

export class ShareManager {
    constructor(game) {
        this.game = game;
        this.initShare();
    }

    initShare() {
        // 监听显示分享菜单的按钮点击事件
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });

        // 监听用户点击右上角分享
        wx.onShareAppMessage(() => {
            return this.getDefaultShareContent();
        });

        // 监听用户点击右上角分享到朋友圈
        wx.onShareTimeline(() => {
            return this.getTimelineShareContent();
        });
    }

    // 获取默认分享内容
    getDefaultShareContent() {
        return {
            title: GAME_CONFIG.SHARE.DEFAULT_TITLE,
            imageUrl: GAME_CONFIG.SHARE.DEFAULT_IMAGE,
            query: 'source=default'
        };
    }

    // 获取分享到朋友圈的内容
    getTimelineShareContent() {
        return {
            title: GAME_CONFIG.SHARE.TIMELINE_TITLE,
            imageUrl: GAME_CONFIG.SHARE.TIMELINE_IMAGE,
            query: 'source=timeline'
        };
    }

    // 分享游戏成绩
    shareScore(score) {
        return {
            title: `我在火柴人大冒险中获得了${score}分，快来挑战我吧！`,
            imageUrl: GAME_CONFIG.SHARE.SCORE_IMAGE,
            query: `source=score&score=${score}`
        };
    }

    // 分享解锁的物品
    shareUnlock(itemId, itemName) {
        return {
            title: `我在火柴人大冒险中解锁了${itemName}，快来看看吧！`,
            imageUrl: GAME_CONFIG.SHARE.UNLOCK_IMAGE,
            query: `source=unlock&item=${itemId}`
        };
    }

    // 分享自定义角色
    shareCharacter(characterData) {
        return {
            title: '看看我的火柴人角色，快来打扮你的角色吧！',
            imageUrl: GAME_CONFIG.SHARE.CHARACTER_IMAGE,
            query: `source=character&data=${encodeURIComponent(JSON.stringify(characterData))}`
        };
    }

    // 处理分享回调
    handleShareResult(result) {
        if (result.errMsg === 'shareAppMessage:ok') {
            // 分享成功，可以给予奖励
            this.game.handleShareReward();
        }
    }

    // 主动触发分享
    triggerShare(type, data) {
        let shareContent;
        switch (type) {
            case 'score':
                shareContent = this.shareScore(data);
                break;
            case 'unlock':
                shareContent = this.shareUnlock(data.id, data.name);
                break;
            case 'character':
                shareContent = this.shareCharacter(data);
                break;
            default:
                shareContent = this.getDefaultShareContent();
        }

        wx.shareAppMessage({
            ...shareContent,
            success: (res) => {
                this.handleShareResult(res);
            },
            fail: (err) => {
                console.error('Share failed:', err);
            }
        });
    }

    // 处理分享进入
    handleShareEnter(query) {
        const params = new URLSearchParams(query);
        const source = params.get('source');

        switch (source) {
            case 'score':
                const score = parseInt(params.get('score'));
                if (!isNaN(score)) {
                    this.game.handleShareEnterScore(score);
                }
                break;
            case 'unlock':
                const itemId = params.get('item');
                if (itemId) {
                    this.game.handleShareEnterUnlock(itemId);
                }
                break;
            case 'character':
                const characterData = params.get('data');
                if (characterData) {
                    try {
                        const data = JSON.parse(decodeURIComponent(characterData));
                        this.game.handleShareEnterCharacter(data);
                    } catch (error) {
                        console.error('Failed to parse character data:', error);
                    }
                }
                break;
            default:
                this.game.handleShareEnterDefault();
        }
    }

    // 分享到群
    shareToGroup() {
        wx.shareAppMessage({
            ...this.getDefaultShareContent(),
            success: (res) => {
                if (res.shareTickets && res.shareTickets.length > 0) {
                    // 获取群信息
                    wx.getShareInfo({
                        shareTicket: res.shareTickets[0],
                        success: (info) => {
                            // 处理群分享奖励
                            this.game.handleGroupShareReward(info);
                        },
                        fail: (err) => {
                            console.error('Failed to get share info:', err);
                        }
                    });
                }
            }
        });
    }

    // 创建分享卡片
    async createShareCard(type, data) {
        // 创建离屏画布
        const canvas = wx.createOffscreenCanvas({
            type: '2d',
            width: 500,
            height: 400
        });
        const ctx = canvas.getContext('2d');

        // 绘制背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 500, 400);

        // 根据类型绘制不同的内容
        switch (type) {
            case 'score':
                await this.drawScoreCard(ctx, data);
                break;
            case 'unlock':
                await this.drawUnlockCard(ctx, data);
                break;
            case 'character':
                await this.drawCharacterCard(ctx, data);
                break;
        }

        // 转换为图片
        const tempFilePath = await new Promise((resolve, reject) => {
            canvas.toTempFilePath({
                x: 0,
                y: 0,
                width: 500,
                height: 400,
                destWidth: 500,
                destHeight: 400,
                success: (res) => resolve(res.tempFilePath),
                fail: reject
            });
        });

        return tempFilePath;
    }

    // 绘制分数分享卡片
    async drawScoreCard(ctx, score) {
        // 加载并绘制游戏logo
        const logo = await this.loadImage(GAME_CONFIG.SHARE.LOGO_IMAGE);
        ctx.drawImage(logo, 200, 50, 100, 100);

        // 绘制文本
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('火柴人大冒险', 250, 200);

        ctx.font = '24px Arial';
        ctx.fillText(`我获得了 ${score} 分！`, 250, 250);

        ctx.font = '18px Arial';
        ctx.fillText('扫码加入游戏', 250, 300);

        // 加载并绘制二维码
        const qrCode = await this.loadImage(GAME_CONFIG.SHARE.QR_CODE);
        ctx.drawImage(qrCode, 200, 320, 100, 100);
    }

    // 绘制解锁物品分享卡片
    async drawUnlockCard(ctx, data) {
        // 类似的绘制逻辑...
        // 这里根据实际需求实现
    }

    // 绘制角色分享卡片
    async drawCharacterCard(ctx, data) {
        // 类似的绘制逻辑...
        // 这里根据实际需求实现
    }

    // 加载图片
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = canvas.createImage();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
} 