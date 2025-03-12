import * as THREE from 'three';
import { GAME_CONFIG } from '../game.config';

export class RenderManager {
    constructor(canvas) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });

        // 设置渲染器
        this.renderer.setSize(GAME_CONFIG.SCENE.WIDTH, GAME_CONFIG.SCENE.HEIGHT);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            GAME_CONFIG.SCENE.CAMERA.FOV,
            GAME_CONFIG.SCENE.WIDTH / GAME_CONFIG.SCENE.HEIGHT,
            GAME_CONFIG.SCENE.CAMERA.NEAR,
            GAME_CONFIG.SCENE.CAMERA.FAR
        );

        // 设置基础光照
        this.setupLights();

        // 资源加载器
        this.textureLoader = new THREE.TextureLoader();
        this.modelLoader = new THREE.GLTFLoader();

        // 模型缓存
        this.models = new Map();
        this.textures = new Map();

        // 场景对象
        this.buildings = new Map();
        this.adSpots = new Map();
        this.characters = new Map();
    }

    // 设置光照
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 主方向光
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(50, 100, 50);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // 设置阴影参数
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
    }

    // 加载模型
    async loadModels() {
        try {
            // 加载角色模型
            const characterModel = await this.loadModel('character', 'models/character.glb');
            this.models.set('character', characterModel);

            // 加载建筑物模型
            const buildingModels = await Promise.all([
                this.loadModel('building_tall', 'models/building_tall.glb'),
                this.loadModel('building_medium', 'models/building_medium.glb'),
                this.loadModel('building_small', 'models/building_small.glb')
            ]);

            buildingModels.forEach((model, index) => {
                this.models.set(`building_${index}`, model);
            });

            // 加载广告牌模型
            const billboardModel = await this.loadModel('billboard', 'models/billboard.glb');
            this.models.set('billboard', billboardModel);

        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }

    // 加载单个模型
    async loadModel(id, path) {
        return new Promise((resolve, reject) => {
            this.modelLoader.load(
                path,
                (gltf) => resolve(gltf.scene),
                undefined,
                reject
            );
        });
    }

    // 加载纹理
    async loadTexture(id, path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    this.textures.set(id, texture);
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    // 创建角色
    createCharacter(id, options) {
        const characterModel = this.models.get('character').clone();
        
        // 设置角色外观
        this.updateCharacterAppearance(characterModel, options.appearance);
        
        // 设置位置和旋转
        characterModel.position.copy(options.position);
        characterModel.rotation.copy(options.rotation);
        
        // 添加到场景
        this.scene.add(characterModel);
        this.characters.set(id, characterModel);
    }

    // 更新角色外观
    updateCharacterAppearance(model, appearance) {
        // 更新面部特征
        Object.entries(appearance.face).forEach(([part, value]) => {
            const mesh = model.getObjectByName(`face_${part}`);
            if (mesh && value !== 'default') {
                const texture = this.textures.get(`face_${part}_${value}`);
                if (texture) {
                    mesh.material.map = texture;
                    mesh.material.needsUpdate = true;
                }
            }
        });

        // 更新装扮
        Object.entries(appearance.outfit).forEach(([part, value]) => {
            const mesh = model.getObjectByName(`outfit_${part}`);
            if (mesh && value !== 'default') {
                const texture = this.textures.get(`outfit_${part}_${value}`);
                if (texture) {
                    mesh.material.map = texture;
                    mesh.material.needsUpdate = true;
                }
            }
        });
    }

    // 创建建筑物
    createBuilding(building) {
        const height = building.size.height;
        let modelType = 'building_0'; // 默认高楼

        if (height < 40) {
            modelType = 'building_2'; // 矮楼
        } else if (height < 70) {
            modelType = 'building_1'; // 中等高度
        }

        const buildingModel = this.models.get(modelType).clone();
        
        // 设置缩放以匹配指定尺寸
        buildingModel.scale.set(
            building.size.width / 10,
            height / 10,
            building.size.depth / 10
        );

        // 设置位置和旋转
        buildingModel.position.copy(building.position);
        buildingModel.rotation.copy(building.rotation);

        // 添加到场景
        this.scene.add(buildingModel);
        this.buildings.set(building.id, buildingModel);
    }

    // 创建广告位
    createAdSpot(adSpot) {
        const billboardModel = this.models.get('billboard').clone();
        
        // 设置广告牌尺寸
        billboardModel.scale.set(
            adSpot.size.width / 10,
            adSpot.size.height / 10,
            1
        );

        // 设置位置和旋转
        billboardModel.position.copy(adSpot.position);
        billboardModel.rotation.copy(adSpot.rotation);

        // 添加到场景
        this.scene.add(billboardModel);
        this.adSpots.set(adSpot.id, billboardModel);
    }

    // 更新广告内容
    async updateAdContent(adSpotId, adData) {
        const billboard = this.adSpots.get(adSpotId);
        if (!billboard) return;

        try {
            // 加载广告图片作为纹理
            const texture = await this.loadTexture(adData.id, adData.imageUrl);
            
            // 更新广告牌材质
            const material = billboard.getObjectByName('ad_surface').material;
            material.map = texture;
            material.needsUpdate = true;
        } catch (error) {
            console.error('Failed to update ad content:', error);
        }
    }

    // 更新场景
    updateScene(gameState) {
        // 更新相机位置和朝向
        this.camera.position.copy(gameState.camera.position);
        this.camera.rotation.copy(gameState.camera.rotation);

        // 更新角色位置和朝向
        const player = this.characters.get(gameState.player.id);
        if (player) {
            player.position.copy(gameState.player.position);
            player.rotation.copy(gameState.player.rotation);
        }

        const enemy = this.characters.get(gameState.enemy.id);
        if (enemy) {
            enemy.position.copy(gameState.enemy.position);
            enemy.rotation.copy(gameState.enemy.rotation);
        }
    }

    // 渲染场景
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    // 调整大小
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // 清理场景
    dispose() {
        // 清理模型
        this.models.forEach(model => {
            model.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        // 清理纹理
        this.textures.forEach(texture => texture.dispose());

        // 清理场景对象
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        // 清理渲染器
        this.renderer.dispose();
    }
} 