import * as THREE from 'three';

export class Billboard {
    constructor(options = {}) {
        this.model = new THREE.Group();
        this.options = {
            width: options.width || 6,
            height: options.height || 4,
            elevation: options.elevation || 5,
            angle: options.angle || 0
        };
        this.createModel();
    }

    createModel() {
        // 创建广告牌支柱
        this.createPoles();
        
        // 创建广告牌面板
        this.createPanel();
        
        // 旋转整个广告牌
        this.model.rotation.y = this.options.angle;
    }

    createPoles() {
        const poleMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.2
        });

        // 创建两个支柱
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, this.options.elevation, 8);
        
        // 左支柱
        const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
        leftPole.position.set(
            -this.options.width/2 + 0.2,
            this.options.elevation/2,
            0
        );
        this.model.add(leftPole);

        // 右支柱
        const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
        rightPole.position.set(
            this.options.width/2 - 0.2,
            this.options.elevation/2,
            0
        );
        this.model.add(rightPole);

        // 添加横梁
        const beamGeometry = new THREE.BoxGeometry(
            this.options.width,
            0.4,
            0.4
        );
        const beam = new THREE.Mesh(beamGeometry, poleMaterial);
        beam.position.set(
            0,
            this.options.elevation + this.options.height/2 + 0.2,
            0
        );
        this.model.add(beam);
    }

    createPanel() {
        // 创建广告牌面板框架
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.5
        });

        // 面板框架
        const frameGeometry = new THREE.BoxGeometry(
            this.options.width + 0.4,
            this.options.height + 0.4,
            0.1
        );
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(
            0,
            this.options.elevation + this.options.height/2,
            0
        );
        this.model.add(frame);

        // 创建广告显示面板
        const panelGeometry = new THREE.PlaneGeometry(
            this.options.width,
            this.options.height
        );
        const panelMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        this.panel = new THREE.Mesh(panelGeometry, panelMaterial);
        this.panel.position.set(
            0,
            this.options.elevation + this.options.height/2,
            0.06
        );
        this.model.add(this.panel);

        // 添加背光
        const backlight = new THREE.PointLight(0xffffff, 0.5, 5);
        backlight.position.set(0, 0, -0.5);
        this.panel.add(backlight);
    }

    // 更新广告内容
    updateContent(texture) {
        if (this.panel) {
            this.panel.material.map = texture;
            this.panel.material.needsUpdate = true;
        }
    }

    // 设置广告亮度
    setBrightness(intensity) {
        if (this.panel) {
            const backlight = this.panel.children[0];
            if (backlight && backlight.isPointLight) {
                backlight.intensity = intensity;
            }
        }
    }

    // 昼夜循环效果
    updateDayNightCycle(time) {
        // time 应该是 0-1 之间的值，表示一天中的时间
        const brightness = Math.sin(time * Math.PI) * 0.5 + 0.5; // 0-1
        this.setBrightness(brightness);
    }

    // 添加简单动画效果
    addBlinkingEffect() {
        const backlight = this.panel.children[0];
        if (backlight && backlight.isPointLight) {
            const initialIntensity = backlight.intensity;
            let time = 0;

            const animate = () => {
                time += 0.1;
                backlight.intensity = initialIntensity * (0.8 + Math.sin(time) * 0.2);
                requestAnimationFrame(animate);
            };

            animate();
        }
    }

    getModel() {
        return this.model;
    }
} 