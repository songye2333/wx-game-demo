import * as THREE from 'three';

export class StickFigure {
    constructor(options = {}) {
        this.model = new THREE.Group();
        this.appearance = options.appearance || {};
        this.createModel();
    }

    createModel() {
        // 材质
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 30
        });

        // 头部
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 32, 32),
            bodyMaterial
        );
        head.position.y = 2;
        this.model.add(head);

        // 身体
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 1, 32),
            bodyMaterial
        );
        body.position.y = 1.25;
        this.model.add(body);

        // 手臂
        const leftArm = this.createLimb(0.6, bodyMaterial);
        leftArm.position.set(-0.3, 1.7, 0);
        leftArm.rotation.z = Math.PI / 4;
        this.model.add(leftArm);

        const rightArm = this.createLimb(0.6, bodyMaterial);
        rightArm.position.set(0.3, 1.7, 0);
        rightArm.rotation.z = -Math.PI / 4;
        this.model.add(rightArm);

        // 腿部
        const leftLeg = this.createLimb(0.8, bodyMaterial);
        leftLeg.position.set(-0.2, 0.8, 0);
        this.model.add(leftLeg);

        const rightLeg = this.createLimb(0.8, bodyMaterial);
        rightLeg.position.set(0.2, 0.8, 0);
        this.model.add(rightLeg);

        // 存储可动部件引用
        this.parts = {
            head,
            body,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg
        };

        // 应用外观设置
        this.updateAppearance();
    }

    createLimb(length, material) {
        const limb = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, length, 32),
            material
        );
        limb.geometry.translate(0, -length/2, 0);
        return limb;
    }

    updateAppearance() {
        if (!this.appearance) return;

        // 更新面部特征
        if (this.appearance.face) {
            Object.entries(this.appearance.face).forEach(([part, value]) => {
                if (value && value !== 'default') {
                    // 添加面部特征贴图
                    const texture = new THREE.TextureLoader().load(`textures/face/${part}/${value}.png`);
                    const facePart = new THREE.Mesh(
                        new THREE.PlaneGeometry(0.2, 0.2),
                        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
                    );
                    // 根据部位设置位置
                    switch(part) {
                        case 'eyebrows':
                            facePart.position.set(0, 2.1, 0.25);
                            break;
                        case 'nose':
                            facePart.position.set(0, 2, 0.25);
                            break;
                        case 'mouth':
                            facePart.position.set(0, 1.9, 0.25);
                            break;
                        // ... 其他面部特征位置
                    }
                    this.parts.head.add(facePart);
                }
            });
        }

        // 更新装扮
        if (this.appearance.outfit) {
            Object.entries(this.appearance.outfit).forEach(([part, value]) => {
                if (value && value !== 'default') {
                    // 添加装扮贴图
                    const texture = new THREE.TextureLoader().load(`textures/outfit/${part}/${value}.png`);
                    let outfitPart;
                    switch(part) {
                        case 'hat':
                            outfitPart = new THREE.Mesh(
                                new THREE.CylinderGeometry(0.3, 0.3, 0.2),
                                new THREE.MeshPhongMaterial({ map: texture })
                            );
                            outfitPart.position.y = 2.3;
                            this.parts.head.add(outfitPart);
                            break;
                        case 'top':
                            this.parts.body.material = new THREE.MeshPhongMaterial({
                                map: texture,
                                shininess: 30
                            });
                            break;
                        // ... 其他装扮部位
                    }
                }
            });
        }
    }

    // 动画相关方法
    walk(time) {
        const speed = 5;
        const amplitude = 0.3;
        
        // 腿部摆动
        this.parts.leftLeg.rotation.x = Math.sin(time * speed) * amplitude;
        this.parts.rightLeg.rotation.x = Math.sin(time * speed + Math.PI) * amplitude;
        
        // 手臂摆动
        this.parts.leftArm.rotation.x = Math.sin(time * speed + Math.PI) * amplitude;
        this.parts.rightArm.rotation.x = Math.sin(time * speed) * amplitude;
    }

    run(time) {
        const speed = 8;
        const amplitude = 0.5;
        
        // 腿部快速摆动
        this.parts.leftLeg.rotation.x = Math.sin(time * speed) * amplitude;
        this.parts.rightLeg.rotation.x = Math.sin(time * speed + Math.PI) * amplitude;
        
        // 手臂快速摆动
        this.parts.leftArm.rotation.x = Math.sin(time * speed + Math.PI) * amplitude;
        this.parts.rightArm.rotation.x = Math.sin(time * speed) * amplitude;
        
        // 身体前倾
        this.model.rotation.x = 0.2;
    }

    attack(time) {
        const speed = 15;
        const amplitude = 1.2;
        
        // 右手臂快速挥动
        this.parts.rightArm.rotation.x = Math.sin(time * speed) * amplitude;
        this.parts.rightArm.rotation.z = -Math.PI / 4 + Math.sin(time * speed) * 0.5;
    }

    idle(time) {
        const speed = 2;
        const amplitude = 0.1;
        
        // 轻微摆动
        this.parts.leftArm.rotation.x = Math.sin(time * speed) * amplitude;
        this.parts.rightArm.rotation.x = Math.sin(time * speed) * amplitude;
        
        // 身体轻微起伏
        this.model.position.y = Math.sin(time * speed) * 0.05;
    }

    getModel() {
        return this.model;
    }
} 