import { GAME_CONFIG } from '../game.config';
import { Character } from '../models/Character';
import { SceneManager } from './SceneManager';
import { AdManager } from './AdManager';

export class GameManager {
    constructor() {
        this.player = null;
        this.enemy = null;
        this.score = 0;
        this.gameState = 'INIT'; // INIT, PLAYING, FIGHTING, PAUSED, OVER
        this.lastUpdateTime = Date.now();
        
        // 初始化场景管理器
        this.sceneManager = new SceneManager();
        // 初始化广告管理器
        this.adManager = new AdManager();
        
        // 相机配置
        this.camera = {
            position: { ...GAME_CONFIG.SCENE.CAMERA.POSITION },
            rotation: { x: 0, y: 0, z: 0 }
        };
    }

    // 初始化游戏
    async initGame(playerOptions, enemyOptions, sceneType = 'city') {
        this.player = new Character(playerOptions);
        this.enemy = new Character(enemyOptions);
        this.score = 0;
        this.gameState = 'INIT';

        // 初始化场景
        this.sceneManager.initScene(sceneType);
        // 初始化广告
        await this.adManager.init();
    }

    // 开始游戏
    startGame() {
        this.gameState = 'PLAYING';
        this.lastUpdateTime = Date.now();
        this.repositionEnemy();
    }

    // 游戏主循环更新
    async update() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        if (this.gameState === 'PLAYING') {
            this.updateChasePhase(deltaTime);
        } else if (this.gameState === 'FIGHTING') {
            this.updateFightPhase(deltaTime);
        }

        // 更新相机位置
        this.updateCamera();

        // 更新广告
        await this.adManager.refreshAds();
        const activeAds = this.adManager.getActiveAds();
        this.sceneManager.updateAds(activeAds);
    }

    // 更新相机位置
    updateCamera() {
        // 相机跟随玩家，保持在玩家后方
        const distance = 15;
        const height = 10;
        const angle = Math.atan2(
            this.player.position.z - this.enemy.position.z,
            this.player.position.x - this.enemy.position.x
        );

        this.camera.position.x = this.player.position.x - Math.cos(angle) * distance;
        this.camera.position.z = this.player.position.z - Math.sin(angle) * distance;
        this.camera.position.y = height;
        this.camera.rotation.y = angle;
    }

    // 更新追逐阶段
    updateChasePhase(deltaTime) {
        // 更新玩家冲刺能量
        if (this.player.dashEnergy < 100) {
            this.player.addDashEnergy(deltaTime * 10);
        }

        // 检查是否抓住敌人
        const distance = this.getDistanceBetweenCharacters();
        if (distance <= GAME_CONFIG.RULES.CATCH_DISTANCE) {
            this.startFighting();
        }
    }

    // 更新战斗阶段
    updateFightPhase(deltaTime) {
        if (this.player.isAttacking) {
            // 检查连击是否完成或中断
            if (this.player.attackCount >= GAME_CONFIG.CHARACTER.ATTACK_COUNT) {
                this.onFightingComplete(true);
            }
        }
    }

    // 开始战斗
    startFighting() {
        this.gameState = 'FIGHTING';
        this.player.startAttack();
    }

    // 战斗完成
    onFightingComplete(success) {
        if (success) {
            this.addScore(GAME_CONFIG.RULES.SCORE_PER_GAME);
        }
        this.player.stopAttack();
        this.gameState = 'PLAYING';
        this.repositionEnemy();
    }

    // 重新放置敌人位置
    repositionEnemy() {
        // 在场景中随机选择一个建筑物附近的位置
        const buildings = this.sceneManager.buildings;
        if (buildings.length === 0) return;

        const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;

        this.enemy.position.x = randomBuilding.position.x + Math.cos(angle) * distance;
        this.enemy.position.z = randomBuilding.position.z + Math.sin(angle) * distance;
    }

    // 计算角色之间的距离
    getDistanceBetweenCharacters() {
        const dx = this.player.position.x - this.enemy.position.x;
        const dz = this.player.position.z - this.enemy.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    // 添加分数
    addScore(amount) {
        this.score += amount;
    }

    // 处理广告奖励
    async handleAdReward() {
        const result = await this.adManager.playRewardedAd();
        if (result.success) {
            this.addScore(result.reward);
            return true;
        }
        return false;
    }

    // 暂停游戏
    pauseGame() {
        if (this.gameState === 'PLAYING' || this.gameState === 'FIGHTING') {
            this.gameState = 'PAUSED';
        }
    }

    // 恢复游戏
    resumeGame() {
        if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.lastUpdateTime = Date.now();
        }
    }

    // 结束游戏
    endGame() {
        this.gameState = 'OVER';
    }

    // 获取游戏状态数据
    getGameState() {
        return {
            player: this.player,
            enemy: this.enemy,
            score: this.score,
            gameState: this.gameState,
            scene: this.sceneManager.getSceneData(),
            camera: this.camera
        };
    }
} 