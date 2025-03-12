import { GAME_CONFIG } from '../game.config';

export class AntiAddictionManager {
    constructor(game) {
        this.game = game;
        this.isVerified = false;
        this.userAge = 0;
        this.playTimeToday = 0;
        this.lastPlayDate = null;
        this.warningShown = false;
        this.timer = null;
        
        this.initAntiAddiction();
    }

    async initAntiAddiction() {
        try {
            // 获取实名认证信息
            const realNameInfo = await this.getRealNameInfo();
            if (realNameInfo) {
                this.isVerified = true;
                this.userAge = realNameInfo.age;
                await this.loadPlayTime();
            } else {
                // 未实名认证，提示用户进行认证
                this.promptRealNameVerification();
            }
        } catch (error) {
            console.error('Failed to initialize anti-addiction system:', error);
        }
    }

    // 获取实名认证信息
    async getRealNameInfo() {
        return new Promise((resolve) => {
            wx.getPrivacySettingAsync({
                success: (res) => {
                    if (res.needAuthorization) {
                        // 需要用户授权
                        resolve(null);
                    } else {
                        // 已授权，获取实名信息
                        wx.getFriendCloudStorage({
                            keyList: ['realNameInfo'],
                            success: (res) => {
                                if (res.data && res.data.length > 0) {
                                    resolve(JSON.parse(res.data[0].value));
                                } else {
                                    resolve(null);
                                }
                            },
                            fail: () => resolve(null)
                        });
                    }
                },
                fail: () => resolve(null)
            });
        });
    }

    // 提示用户进行实名认证
    promptRealNameVerification() {
        wx.showModal({
            title: '实名认证提示',
            content: '根据相关规定，首次使用游戏需要进行实名认证。是否现在认证？',
            success: (res) => {
                if (res.confirm) {
                    this.startRealNameVerification();
                } else {
                    // 用户拒绝认证，限制游戏功能
                    this.restrictGameFeatures();
                }
            }
        });
    }

    // 开始实名认证流程
    startRealNameVerification() {
        // 调用微信实名认证接口
        wx.startFacialRecognitionVerify({
            name: '',  // 用户输入的姓名
            idCardNumber: '',  // 用户输入的身份证号
            success: (res) => {
                // 认证成功
                this.handleVerificationSuccess(res);
            },
            fail: (err) => {
                console.error('Real name verification failed:', err);
                this.restrictGameFeatures();
            }
        });
    }

    // 处理认证成功
    async handleVerificationSuccess(verificationResult) {
        // 保存认证信息
        const realNameInfo = {
            verified: true,
            age: this.calculateAge(verificationResult.idCardNumber),
            verificationTime: Date.now()
        };

        try {
            await wx.setFriendCloudStorage({
                KVDataList: [{
                    key: 'realNameInfo',
                    value: JSON.stringify(realNameInfo)
                }]
            });

            this.isVerified = true;
            this.userAge = realNameInfo.age;
            
            // 根据年龄设置限制
            this.setAgeRestrictions();
        } catch (error) {
            console.error('Failed to save verification result:', error);
        }
    }

    // 计算年龄
    calculateAge(idCardNumber) {
        const birthYear = parseInt(idCardNumber.substring(6, 10));
        const birthMonth = parseInt(idCardNumber.substring(10, 12));
        const birthDay = parseInt(idCardNumber.substring(12, 14));
        
        const today = new Date();
        let age = today.getFullYear() - birthYear;
        
        // 检查是否已过生日
        if (today.getMonth() + 1 < birthMonth || 
            (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
            age--;
        }
        
        return age;
    }

    // 设置年龄限制
    setAgeRestrictions() {
        if (this.userAge < 8) {
            // 8岁以下不允许充值，每日限玩1小时
            this.setPlayTimeLimit(60);
            this.disablePayment();
        } else if (this.userAge < 16) {
            // 8-16岁每日限玩2小时，单次充值不超过50元
            this.setPlayTimeLimit(120);
            this.setPaymentLimit(50);
        } else if (this.userAge < 18) {
            // 16-18岁每日限玩3小时，单次充值不超过100元
            this.setPlayTimeLimit(180);
            this.setPaymentLimit(100);
        } else {
            // 成年人无限制
            this.clearRestrictions();
        }
    }

    // 加载今日游戏时长
    async loadPlayTime() {
        try {
            const today = new Date().toDateString();
            const playTimeData = await wx.getStorage({ key: 'playTimeData' });
            const data = JSON.parse(playTimeData.data);
            
            if (data.date === today) {
                this.playTimeToday = data.time;
                this.lastPlayDate = today;
            } else {
                // 新的一天，重置游戏时长
                this.playTimeToday = 0;
                this.lastPlayDate = today;
                await this.savePlayTime();
            }
        } catch (error) {
            // 无数据或出错，初始化数据
            this.playTimeToday = 0;
            this.lastPlayDate = new Date().toDateString();
            await this.savePlayTime();
        }
    }

    // 保存游戏时长
    async savePlayTime() {
        try {
            await wx.setStorage({
                key: 'playTimeData',
                data: JSON.stringify({
                    date: this.lastPlayDate,
                    time: this.playTimeToday
                })
            });
        } catch (error) {
            console.error('Failed to save play time:', error);
        }
    }

    // 开始计时
    startTiming() {
        if (this.timer) return;

        this.timer = setInterval(async () => {
            this.playTimeToday += 1;
            await this.savePlayTime();

            // 检查是否需要提醒或强制下线
            this.checkPlayTime();
        }, 60000); // 每分钟更新一次
    }

    // 停止计时
    stopTiming() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 检查游戏时长
    checkPlayTime() {
        if (!this.isVerified || this.userAge >= 18) return;

        let timeLimit;
        if (this.userAge < 8) {
            timeLimit = 60; // 1小时
        } else if (this.userAge < 16) {
            timeLimit = 120; // 2小时
        } else {
            timeLimit = 180; // 3小时
        }

        // 剩余15分钟时发出提醒
        if (!this.warningShown && this.playTimeToday >= timeLimit - 15) {
            this.showTimeWarning(15);
            this.warningShown = true;
        }

        // 达到限制时长，强制下线
        if (this.playTimeToday >= timeLimit) {
            this.forceOffline();
        }
    }

    // 显示时间警告
    showTimeWarning(remainingMinutes) {
        wx.showModal({
            title: '游戏时间提醒',
            content: `您今日的游戏时间还剩${remainingMinutes}分钟，请注意合理安排时间。`,
            showCancel: false
        });
    }

    // 强制下线
    forceOffline() {
        this.stopTiming();
        wx.showModal({
            title: '游戏时间已到',
            content: '您今日的游戏时间已用完，请合理安排时间，明天再来继续游戏吧！',
            showCancel: false,
            success: () => {
                this.game.end();
                // 可以选择返回主菜单或直接退出游戏
                wx.exitMiniProgram();
            }
        });
    }

    // 设置游戏时间限制
    setPlayTimeLimit(minutes) {
        this.playTimeLimit = minutes;
    }

    // 禁用支付功能
    disablePayment() {
        this.game.disablePayment();
    }

    // 设置支付限额
    setPaymentLimit(amount) {
        this.game.setPaymentLimit(amount);
    }

    // 清除限制
    clearRestrictions() {
        this.playTimeLimit = Infinity;
        this.game.clearPaymentRestrictions();
    }

    // 限制游戏功能
    restrictGameFeatures() {
        // 限制游戏功能，只允许体验模式
        this.game.enableTrialMode();
    }

    // 检查是否可以继续游戏
    canContinuePlay() {
        if (!this.isVerified) return false;
        if (this.userAge >= 18) return true;
        return this.playTimeToday < this.playTimeLimit;
    }

    // 检查是否可以支付
    canMakePayment(amount) {
        if (!this.isVerified) return false;
        if (this.userAge < 8) return false;
        if (this.userAge >= 18) return true;
        return amount <= this.paymentLimit;
    }

    // 清理资源
    dispose() {
        this.stopTiming();
    }
} 