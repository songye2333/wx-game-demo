import * as THREE from 'three';
import { GAME_CONFIG } from '../game.config';
import { AudioManager } from '../managers/AudioManager';
import { UIManager } from '../managers/UIManager';
import { AdManager } from '../managers/AdManager';
import { StorageManager } from '../managers/StorageManager';
import { ShareManager } from '../managers/ShareManager';
import { AntiAddictionManager } from '../managers/AntiAddictionManager';
import { PerformanceManager } from '../managers/PerformanceManager';
import { StickFigure } from '../models/StickFigure';
import { Building } from '../models/Building';
import { Billboard } from '../models/Billboard';

export class Game {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentScene = null;
        this.score = 0;
        
        this.initGame();
    }

    async initGame() {
        // 初始化渲染器
        this.initRenderer();
        
        // 初始化场景
        this.initScene();
        
        // 初始化相机
        this.initCamera();
        
        // 初始化管理器
        await this.initManagers();
        
        // 初始化游戏对象
        this.initGameObjects();
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 开始游戏循环
        this.startGameLoop();
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
    }

    initScene() {
        this.scene = new THREE.Scene();
        
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // 添加平行光（用于阴影）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 50, 0);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    initCamera() {
        const { FOV, NEAR, FAR, INITIAL_POSITION } = GAME_CONFIG.GAME.CAMERA;
        this.camera = new THREE.PerspectiveCamera(
            FOV,
            window.innerWidth / window.innerHeight,
            NEAR,
            FAR
        );
        this.camera.position.set(
            INITIAL_POSITION.x,
            INITIAL_POSITION.y,
            INITIAL_POSITION.z
        );
        this.camera.lookAt(0, 0, 0);
    }

    async initManagers() {
        // 初始化存储管理器
        this.storageManager = new StorageManager();
        
        // 初始化音频管理器
        this.audioManager = new AudioManager(this);
        
        // 初始化UI管理器
        this.uiManager = new UIManager(this);
        
        // 初始化广告管理器
        this.adManager = new AdManager(this);
        
        // 初始化分享管理器
        this.shareManager = new ShareManager(this);
        
        // 初始化防沉迷系统
        this.antiAddictionManager = new AntiAddictionManager(this);
        
        // 初始化性能管理器
        this.performanceManager = new PerformanceManager(this);
        
        // 加载用户数据
        await this.loadUserData();
    }

    async loadUserData() {
        const gameData = await this.storageManager.getUserGameData();
        this.score = gameData.score;
        this.coins = gameData.coins;
        
        // 应用用户设置
        this.audioManager.setMusicVolume(gameData.settings.musicVolume);
        this.audioManager.setSoundVolume(gameData.settings.soundVolume);
        this.audioManager.toggleMusic(gameData.settings.musicEnabled);
        this.audioManager.toggleSound(gameData.settings.soundEnabled);
    }

    initGameObjects() {
        // 创建角色
        this.player = new StickFigure();
        this.scene.add(this.player.getModel());
        
        // 加载当前场景
        this.loadScene('city');
    }

    loadScene(sceneType) {
        // 清除当前场景
        if (this.currentScene) {
            this.scene.remove(this.currentScene);
        }
        
        // 创建新场景
        this.currentScene = new THREE.Group();
        
        // 获取场景配置
        const sceneConfig = GAME_CONFIG.SCENE.TYPES.find(type => type.id === sceneType);
        if (!sceneConfig) return;
        
        // 创建建筑物
        for (let i = 0; i < sceneConfig.buildingCount; i++) {
            const building = new Building({
                width: Math.random() * 10 + 5,
                height: Math.random() * 
                    (sceneConfig.maxBuildingHeight - sceneConfig.minBuildingHeight) + 
                    sceneConfig.minBuildingHeight,
                depth: Math.random() * 10 + 5,
                style: ['modern', 'classic', 'industrial'][Math.floor(Math.random() * 3)]
            });
            
            const x = (i - sceneConfig.buildingCount / 2) * sceneConfig.buildingSpacing;
            building.getModel().position.set(x, 0, Math.random() * 40 - 20);
            this.currentScene.add(building.getModel());
        }
        
        // 创建广告牌
        for (let i = 0; i < sceneConfig.adPositions; i++) {
            const billboard = new Billboard({
                width: sceneConfig.adSize.width,
                height: sceneConfig.adSize.height,
                elevation: Math.random() * 10 + 5,
                angle: Math.random() * Math.PI * 2
            });
            
            const x = (Math.random() - 0.5) * sceneConfig.buildingCount * sceneConfig.buildingSpacing;
            const z = Math.random() * 40 - 20;
            billboard.getModel().position.set(x, 0, z);
            this.currentScene.add(billboard.getModel());
        }
        
        // 添加到场景
        this.scene.add(this.currentScene);
        
        // 播放场景音乐
        this.audioManager.playSceneMusic(sceneType);
    }

    initEventListeners() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 监听游戏状态变化
        wx.onShow(() => {
            if (this.isPaused) {
                this.resume();
            }
        });
        
        wx.onHide(() => {
            if (this.isRunning) {
                this.pause();
            }
        });
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.isPaused) {
            // 更新游戏逻辑
            this.update(deltaTime);
            
            // 更新性能统计
            this.performanceManager.update();
            
            // 渲染场景
            this.renderer.render(this.scene, this.camera);
        }

        requestAnimationFrame(() => this.animate());
    }

    update(deltaTime) {
        // 更新角色动画
        if (this.player.isMoving) {
            this.player.walk(this.lastTime * 0.001);
        } else {
            this.player.idle(this.lastTime * 0.001);
        }
        
        // 更新广告
        this.adManager.updateAds(this.lastTime);
        
        // 更新UI
        this.uiManager.updateUI({
            score: this.score,
            coins: this.coins,
            energy: this.player.energy
        });
    }

    pause() {
        this.isPaused = true;
        this.audioManager.pauseBGM();
    }

    resume() {
        this.isPaused = false;
        this.audioManager.resumeBGM();
    }

    end() {
        this.isRunning = false;
        this.dispose();
    }

    dispose() {
        // 清理资源
        this.audioManager.dispose();
        this.uiManager.dispose();
        this.adManager.dispose();
        this.antiAddictionManager.dispose();
        this.performanceManager.dispose();
        
        // 移除事件监听
        window.removeEventListener('resize', this.handleResize);
        
        // 清理渲染器
        this.renderer.dispose();
        document.body.removeChild(this.renderer.domElement);
    }

    // 游戏状态管理
    handleGameOver(isVictory) {
        this.pause();
        this.audioManager.playGameResultSound(isVictory);
        this.uiManager.showGameOverUI(isVictory, this.score);
    }

    // 广告回调
    handleAdReward(type, points) {
        this.score += points;
        this.audioManager.playSound('collect');
        this.uiManager.showRewardNotification(points);
    }

    // 分享回调
    handleShareReward() {
        this.coins += 100;
        this.audioManager.playSound('collect');
        this.uiManager.showRewardNotification('100 coins');
    }

    // 支付限制
    disablePayment() {
        this.uiManager.disableShopPurchase();
    }

    setPaymentLimit(amount) {
        this.uiManager.setShopPurchaseLimit(amount);
    }

    clearPaymentRestrictions() {
        this.uiManager.enableShopPurchase();
    }

    // 试玩模式
    enableTrialMode() {
        this.uiManager.showTrialModeUI();
    }
} 