import { GAME_CONFIG } from '../game.config';

export class AdManager {
    constructor(game) {
        this.game = game;
        this.ads = new Map();
        this.rewardedVideoAd = null;
        this.interstitialAd = null;
        this.bannerAd = null;
        this.initAds();
    }

    initAds() {
        // 初始化激励视频广告
        if (wx.createRewardedVideoAd) {
            this.rewardedVideoAd = wx.createRewardedVideoAd({
                adUnitId: GAME_CONFIG.ADS.VIDEO_AD_UNIT_ID
            });

            this.rewardedVideoAd.onLoad(() => {
                console.log('激励视频广告加载成功');
            });

            this.rewardedVideoAd.onError((err) => {
                console.error('激励视频广告加载失败', err);
            });

            this.rewardedVideoAd.onClose((res) => {
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    this.game.handleAdReward('video', GAME_CONFIG.ADS.VIDEO_REWARD_POINTS);
                } else {
                    // 播放中途退出，不下发游戏奖励
                    console.log('激励视频广告播放中途退出');
                }
            });
        }

        // 初始化插屏广告
        if (wx.createInterstitialAd) {
            this.interstitialAd = wx.createInterstitialAd({
                adUnitId: GAME_CONFIG.ADS.INTERSTITIAL_AD_UNIT_ID
            });

            this.interstitialAd.onLoad(() => {
                console.log('插屏广告加载成功');
            });

            this.interstitialAd.onError((err) => {
                console.error('插屏广告加载失败', err);
            });

            this.interstitialAd.onClose(() => {
                console.log('插屏广告关闭');
            });
        }

        // 初始化Banner广告
        if (wx.createBannerAd) {
            const systemInfo = wx.getSystemInfoSync();
            const bannerWidth = systemInfo.windowWidth;
            const bannerHeight = 80;

            this.bannerAd = wx.createBannerAd({
                adUnitId: GAME_CONFIG.ADS.BANNER_AD_UNIT_ID,
                style: {
                    left: 0,
                    top: systemInfo.windowHeight - bannerHeight,
                    width: bannerWidth
                }
            });

            this.bannerAd.onLoad(() => {
                console.log('Banner广告加载成功');
            });

            this.bannerAd.onError((err) => {
                console.error('Banner广告加载失败', err);
            });

            this.bannerAd.onResize((size) => {
                this.bannerAd.style.top = systemInfo.windowHeight - size.height;
            });
        }
    }

    // 显示激励视频广告
    async showRewardedVideoAd() {
        if (!this.rewardedVideoAd) return false;

        try {
            await this.rewardedVideoAd.load();
            await this.rewardedVideoAd.show();
            return true;
        } catch (err) {
            console.error('激励视频广告显示失败', err);
            return false;
        }
    }

    // 显示插屏广告
    async showInterstitialAd() {
        if (!this.interstitialAd) return false;

        try {
            await this.interstitialAd.load();
            await this.interstitialAd.show();
            return true;
        } catch (err) {
            console.error('插屏广告显示失败', err);
            return false;
        }
    }

    // 显示Banner广告
    showBannerAd() {
        if (this.bannerAd) {
            this.bannerAd.show().catch(err => {
                console.error('Banner广告显示失败', err);
            });
        }
    }

    // 隐藏Banner广告
    hideBannerAd() {
        if (this.bannerAd) {
            this.bannerAd.hide();
        }
    }

    // 更新场景中的广告位
    updateAdSpots(adSpots) {
        this.ads.clear();
        adSpots.forEach(spot => {
            this.ads.set(spot.id, {
                spot,
                lastUpdateTime: 0,
                currentAdIndex: 0
            });
        });
    }

    // 更新广告内容
    updateAds(currentTime) {
        this.ads.forEach((adData, id) => {
            const { spot, lastUpdateTime, currentAdIndex } = adData;
            
            // 检查是否需要更新广告
            if (currentTime - lastUpdateTime >= GAME_CONFIG.ADS.ROTATION_INTERVAL) {
                const availableAds = GAME_CONFIG.ADS.SPOT_ADS;
                const nextAdIndex = (currentAdIndex + 1) % availableAds.length;
                const nextAd = availableAds[nextAdIndex];

                // 通知渲染管理器更新广告内容
                this.game.renderManager.updateAdContent(id, nextAd);

                // 更新广告数据
                this.ads.set(id, {
                    spot,
                    lastUpdateTime: currentTime,
                    currentAdIndex: nextAdIndex
                });
            }
        });
    }

    // 清理资源
    dispose() {
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.destroy();
        }
        if (this.interstitialAd) {
            this.interstitialAd.destroy();
        }
        if (this.bannerAd) {
            this.bannerAd.destroy();
        }
        this.ads.clear();
    }
} 