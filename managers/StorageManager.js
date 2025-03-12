export class StorageManager {
    constructor() {
        this.cache = new Map();
    }

    // 保存数据
    async save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            await wx.setStorage({
                key,
                data: jsonData
            });
            this.cache.set(key, data);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    // 加载数据
    async load(key, defaultValue = null) {
        // 先检查缓存
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        try {
            const { data } = await wx.getStorage({ key });
            const parsedData = JSON.parse(data);
            this.cache.set(key, parsedData);
            return parsedData;
        } catch (error) {
            console.log(`No data found for key: ${key}, using default value`);
            return defaultValue;
        }
    }

    // 删除数据
    async remove(key) {
        try {
            await wx.removeStorage({ key });
            this.cache.delete(key);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }

    // 清除所有数据
    async clear() {
        try {
            await wx.clearStorage();
            this.cache.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    // 获取用户游戏数据
    async getUserGameData() {
        return await this.load('gameData', {
            score: 0,
            coins: 0,
            highScore: 0,
            unlockedItems: [],
            characterAppearance: {
                face: {
                    earrings: 'default',
                    eyebrows: 'default',
                    nose: 'default',
                    chin: 'default',
                    ears: 'default',
                    mouth: 'default'
                },
                outfit: {
                    hat: 'default',
                    top: 'default',
                    bottom: 'default',
                    shoes: 'default'
                }
            },
            inventory: {
                vehicles: [],
                weapons: []
            },
            settings: {
                musicVolume: 0.7,
                soundVolume: 1.0,
                vibration: true
            },
            statistics: {
                gamesPlayed: 0,
                totalScore: 0,
                totalCoins: 0,
                totalDistance: 0,
                totalEnemiesDefeated: 0,
                totalAdsWatched: 0
            }
        });
    }

    // 保存用户游戏数据
    async saveUserGameData(gameData) {
        return await this.save('gameData', gameData);
    }

    // 更新部分游戏数据
    async updateGameData(updates) {
        const currentData = await this.getUserGameData();
        const newData = {
            ...currentData,
            ...updates,
            // 确保嵌套对象也被正确合并
            characterAppearance: {
                ...currentData.characterAppearance,
                ...(updates.characterAppearance || {})
            },
            inventory: {
                ...currentData.inventory,
                ...(updates.inventory || {})
            },
            settings: {
                ...currentData.settings,
                ...(updates.settings || {})
            },
            statistics: {
                ...currentData.statistics,
                ...(updates.statistics || {})
            }
        };
        return await this.saveUserGameData(newData);
    }

    // 获取游戏设置
    async getSettings() {
        const gameData = await this.getUserGameData();
        return gameData.settings;
    }

    // 保存游戏设置
    async saveSettings(settings) {
        return await this.updateGameData({ settings });
    }

    // 获取角色外观
    async getCharacterAppearance() {
        const gameData = await this.getUserGameData();
        return gameData.characterAppearance;
    }

    // 保存角色外观
    async saveCharacterAppearance(appearance) {
        return await this.updateGameData({ characterAppearance: appearance });
    }

    // 获取库存
    async getInventory() {
        const gameData = await this.getUserGameData();
        return gameData.inventory;
    }

    // 更新库存
    async updateInventory(inventory) {
        return await this.updateGameData({ inventory });
    }

    // 获取统计数据
    async getStatistics() {
        const gameData = await this.getUserGameData();
        return gameData.statistics;
    }

    // 更新统计数据
    async updateStatistics(statistics) {
        return await this.updateGameData({ statistics });
    }

    // 记录新的游戏分数
    async recordGameScore(score) {
        const gameData = await this.getUserGameData();
        const updates = {
            score,
            highScore: Math.max(score, gameData.highScore),
            statistics: {
                ...gameData.statistics,
                gamesPlayed: gameData.statistics.gamesPlayed + 1,
                totalScore: gameData.statistics.totalScore + score
            }
        };
        return await this.updateGameData(updates);
    }

    // 添加金币
    async addCoins(amount) {
        const gameData = await this.getUserGameData();
        const updates = {
            coins: gameData.coins + amount,
            statistics: {
                ...gameData.statistics,
                totalCoins: gameData.statistics.totalCoins + amount
            }
        };
        return await this.updateGameData(updates);
    }

    // 解锁新物品
    async unlockItem(itemId) {
        const gameData = await this.getUserGameData();
        if (!gameData.unlockedItems.includes(itemId)) {
            const updates = {
                unlockedItems: [...gameData.unlockedItems, itemId]
            };
            return await this.updateGameData(updates);
        }
        return true;
    }
} 