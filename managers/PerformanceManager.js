import { GAME_CONFIG } from '../game.config';
import * as THREE from 'three';

export class PerformanceManager {
    constructor(game) {
        this.game = game;
        this.stats = {
            fps: 0,
            drawCalls: 0,
            triangles: 0,
            points: 0
        };
        this.lastTime = performance.now();
        this.frameCount = 0;
        
        this.initOptimizations();
    }

    initOptimizations() {
        // 设置渲染器优化
        const renderer = this.game.renderer;
        if (renderer) {
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // 根据配置设置阴影质量
            switch (GAME_CONFIG.PERFORMANCE.SHADOW_QUALITY) {
                case 'low':
                    renderer.shadowMap.type = THREE.BasicShadowMap;
                    break;
                case 'medium':
                    renderer.shadowMap.type = THREE.PCFShadowMap;
                    break;
                case 'high':
                    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    break;
            }
        }

        // 设置后处理效果
        if (GAME_CONFIG.PERFORMANCE.ENABLE_POSTPROCESSING) {
            this.setupPostProcessing();
        }
    }

    setupPostProcessing() {
        // 根据设备性能决定是否启用某些后处理效果
        const isHighEndDevice = this.checkDeviceCapability();
        
        if (isHighEndDevice) {
            // 启用完整的后处理效果链
            this.enableFullPostProcessing();
        } else {
            // 只启用基础后处理效果
            this.enableBasicPostProcessing();
        }
    }

    checkDeviceCapability() {
        // 检查设备性能
        const gl = this.game.renderer.getContext();
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        // 检查是否支持某些WebGL特性
        const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxLights = gl.getParameter(gl.MAX_VARYING_VECTORS);
        
        return isWebGL2 && maxTextureSize >= 4096 && maxLights >= GAME_CONFIG.PERFORMANCE.MAX_LIGHTS;
    }

    enableFullPostProcessing() {
        // 实现完整的后处理效果链
        // 这里可以添加更多高级效果
        this.setupBloom();
        this.setupSSAO();
        this.setupDOF();
    }

    enableBasicPostProcessing() {
        // 只启用基础后处理效果
        this.setupBasicEffects();
    }

    setupBloom() {
        // 设置辉光效果
        // 具体实现...
    }

    setupSSAO() {
        // 设置环境光遮蔽
        // 具体实现...
    }

    setupDOF() {
        // 设置景深效果
        // 具体实现...
    }

    setupBasicEffects() {
        // 设置基础效果
        // 具体实现...
    }

    // 优化场景对象
    optimizeSceneObject(object) {
        // 合并几何体
        if (object.geometry) {
            object.geometry.computeBoundingSphere();
            object.geometry.computeBoundingBox();
        }

        // LOD 设置
        if (object.isLOD) {
            const distances = [0, 50, 100];
            const geometries = this.createLODGeometries(object.geometry);
            
            geometries.forEach((geometry, index) => {
                const material = object.material.clone();
                const mesh = new THREE.Mesh(geometry, material);
                object.addLevel(mesh, distances[index]);
            });
        }

        // 设置视锥体剔除
        object.frustumCulled = true;

        // 遍历子对象
        if (object.children) {
            object.children.forEach(child => this.optimizeSceneObject(child));
        }
    }

    createLODGeometries(baseGeometry) {
        // 创建不同细节级别的几何体
        const geometries = [];
        
        // 原始几何体
        geometries.push(baseGeometry);
        
        // 中等细节级别
        const mediumDetail = baseGeometry.clone();
        // 减少顶点数量
        // 具体实现...
        geometries.push(mediumDetail);
        
        // 低细节级别
        const lowDetail = baseGeometry.clone();
        // 进一步减少顶点数量
        // 具体实现...
        geometries.push(lowDetail);
        
        return geometries;
    }

    // 更新性能统计
    update() {
        const currentTime = performance.now();
        this.frameCount++;

        // 每秒更新一次统计数据
        if (currentTime - this.lastTime >= 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;

            // 更新其他统计数据
            this.updateRenderStats();
        }

        // 动态调整渲染质量
        this.adjustRenderQuality();
    }

    updateRenderStats() {
        const renderer = this.game.renderer;
        if (renderer) {
            this.stats.drawCalls = renderer.info.render.calls;
            this.stats.triangles = renderer.info.render.triangles;
            this.stats.points = renderer.info.render.points;
        }
    }

    adjustRenderQuality() {
        // 根据FPS动态调整渲染质量
        if (this.stats.fps < 30) {
            this.reduceShadowQuality();
            this.reduceParticles();
            this.reduceDrawDistance();
        } else if (this.stats.fps > 55) {
            this.increaseShadowQuality();
            this.increaseParticles();
            this.increaseDrawDistance();
        }
    }

    reduceShadowQuality() {
        const renderer = this.game.renderer;
        if (renderer && renderer.shadowMap.type !== THREE.BasicShadowMap) {
            renderer.shadowMap.type = THREE.BasicShadowMap;
            renderer.shadowMap.needsUpdate = true;
        }
    }

    increaseShadowQuality() {
        const renderer = this.game.renderer;
        if (renderer && this.stats.fps > 55) {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.needsUpdate = true;
        }
    }

    reduceParticles() {
        // 减少粒子效果
        this.game.particleSystem?.setMaxParticles(
            Math.floor(GAME_CONFIG.PERFORMANCE.MAX_PARTICLES * 0.5)
        );
    }

    increaseParticles() {
        // 增加粒子效果
        this.game.particleSystem?.setMaxParticles(
            GAME_CONFIG.PERFORMANCE.MAX_PARTICLES
        );
    }

    reduceDrawDistance() {
        // 减少绘制距离
        this.game.camera.far = GAME_CONFIG.PERFORMANCE.DRAW_DISTANCE * 0.7;
        this.game.camera.updateProjectionMatrix();
    }

    increaseDrawDistance() {
        // 增加绘制距离
        this.game.camera.far = GAME_CONFIG.PERFORMANCE.DRAW_DISTANCE;
        this.game.camera.updateProjectionMatrix();
    }

    // 获取性能统计数据
    getStats() {
        return this.stats;
    }

    // 清理资源
    dispose() {
        // 清理后处理效果
        // 具体实现...
    }
} 