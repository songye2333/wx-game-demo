import { GAME_CONFIG } from '../game.config';

export class SceneManager {
    constructor() {
        this.currentScene = null;
        this.buildings = [];
        this.adSpots = [];
        this.activeAds = new Map();
    }

    // 初始化场景
    initScene(sceneType) {
        const sceneConfig = GAME_CONFIG.SCENE.TYPES.find(type => type.id === sceneType);
        if (!sceneConfig) {
            throw new Error(`Scene type ${sceneType} not found`);
        }

        this.currentScene = sceneConfig;
        this.generateBuildings();
        this.generateAdSpots();
    }

    // 生成建筑物
    generateBuildings() {
        this.buildings = [];
        const { buildingCount, buildingSpacing, maxBuildingHeight, minBuildingHeight } = this.currentScene;

        // 计算网格布局
        const gridSize = Math.ceil(Math.sqrt(buildingCount));
        const offset = (gridSize * buildingSpacing) / 2;

        for (let i = 0; i < buildingCount; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            const building = {
                id: `building_${i}`,
                position: {
                    x: col * buildingSpacing - offset,
                    y: 0,
                    z: row * buildingSpacing - offset
                },
                size: {
                    width: buildingSpacing * 0.8,
                    height: minBuildingHeight + Math.random() * (maxBuildingHeight - minBuildingHeight),
                    depth: buildingSpacing * 0.8
                },
                rotation: { x: 0, y: 0, z: 0 },
                adSpots: []  // 广告位置点
            };

            this.buildings.push(building);
        }
    }

    // 生成广告位
    generateAdSpots() {
        this.adSpots = [];
        const { adPositions, adSize } = this.currentScene;

        // 在建筑物上随机选择位置放置广告位
        const availableBuildings = [...this.buildings];
        for (let i = 0; i < adPositions; i++) {
            if (availableBuildings.length === 0) break;

            // 随机选择一个建筑
            const buildingIndex = Math.floor(Math.random() * availableBuildings.length);
            const building = availableBuildings[buildingIndex];
            availableBuildings.splice(buildingIndex, 1);

            // 在建筑物上创建广告位
            const adSpot = {
                id: `ad_spot_${i}`,
                buildingId: building.id,
                position: {
                    x: building.position.x,
                    y: building.size.height * 0.7, // 在建筑物高度70%处
                    z: building.position.z
                },
                size: adSize,
                rotation: { x: 0, y: 0, z: 0 },
                currentAd: null
            };

            // 根据建筑物位置调整广告牌方向
            if (Math.abs(adSpot.position.x) > Math.abs(adSpot.position.z)) {
                adSpot.rotation.y = adSpot.position.x > 0 ? -Math.PI / 2 : Math.PI / 2;
            } else {
                adSpot.rotation.y = adSpot.position.z > 0 ? Math.PI : 0;
            }

            this.adSpots.push(adSpot);
            building.adSpots.push(adSpot.id);
        }
    }

    // 更新广告
    updateAds(ads) {
        // 清除过期广告
        for (const [adId, ad] of this.activeAds.entries()) {
            if (Date.now() - ad.startTime >= GAME_CONFIG.ADS.MIN_DISPLAY_TIME * 1000) {
                this.activeAds.delete(adId);
            }
        }

        // 添加新广告
        for (const ad of ads) {
            if (this.activeAds.size >= GAME_CONFIG.ADS.MAX_ADS) break;

            // 找到一个空闲的广告位
            const availableSpot = this.adSpots.find(spot => !this.activeAds.has(spot.id));
            if (availableSpot) {
                this.activeAds.set(availableSpot.id, {
                    ...ad,
                    spotId: availableSpot.id,
                    startTime: Date.now()
                });
            }
        }
    }

    // 获取场景数据
    getSceneData() {
        return {
            type: this.currentScene,
            buildings: this.buildings,
            adSpots: this.adSpots,
            activeAds: Array.from(this.activeAds.values())
        };
    }

    // 检查广告是否在视野内
    isAdVisible(adSpotId, cameraPosition, cameraRotation) {
        const adSpot = this.adSpots.find(spot => spot.id === adSpotId);
        if (!adSpot) return false;

        // 计算广告位到相机的向量
        const dx = adSpot.position.x - cameraPosition.x;
        const dy = adSpot.position.y - cameraPosition.y;
        const dz = adSpot.position.z - cameraPosition.z;
        
        // 计算距离
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance > GAME_CONFIG.SCENE.CAMERA.FAR) return false;

        // 计算广告位是否在视锥体内
        const angleToAd = Math.atan2(dz, dx) - cameraRotation.y;
        const normalizedAngle = ((angleToAd + Math.PI) % (2 * Math.PI)) - Math.PI;
        
        return Math.abs(normalizedAngle) <= (GAME_CONFIG.SCENE.CAMERA.FOV / 2) * (Math.PI / 180);
    }
} 