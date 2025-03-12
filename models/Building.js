import * as THREE from 'three';

export class Building {
    constructor(options = {}) {
        this.model = new THREE.Group();
        this.options = {
            width: options.width || 10,
            height: options.height || 30,
            depth: options.depth || 10,
            style: options.style || 'modern',
            color: options.color || 0xcccccc
        };
        this.createModel();
    }

    createModel() {
        switch(this.options.style) {
            case 'modern':
                this.createModernBuilding();
                break;
            case 'classic':
                this.createClassicBuilding();
                break;
            case 'industrial':
                this.createIndustrialBuilding();
                break;
            default:
                this.createModernBuilding();
        }
    }

    createModernBuilding() {
        // 主体结构
        const mainGeometry = new THREE.BoxGeometry(
            this.options.width,
            this.options.height,
            this.options.depth
        );
        
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: this.options.color,
            shininess: 50
        });
        
        const mainBody = new THREE.Mesh(mainGeometry, mainMaterial);
        mainBody.position.y = this.options.height / 2;
        this.model.add(mainBody);

        // 添加窗户
        this.addWindows(mainBody);

        // 添加屋顶结构
        this.addModernRoof();
    }

    createClassicBuilding() {
        // 主体结构（带有纹理的外墙）
        const mainGeometry = new THREE.BoxGeometry(
            this.options.width,
            this.options.height,
            this.options.depth
        );
        
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: this.options.color,
            bumpMap: this.createBrickTexture(),
            bumpScale: 0.1,
            shininess: 30
        });
        
        const mainBody = new THREE.Mesh(mainGeometry, mainMaterial);
        mainBody.position.y = this.options.height / 2;
        this.model.add(mainBody);

        // 添加古典风格的窗户
        this.addClassicWindows(mainBody);

        // 添加古典屋顶
        this.addClassicRoof();
    }

    createIndustrialBuilding() {
        // 主体结构（工业风格）
        const mainGeometry = new THREE.BoxGeometry(
            this.options.width,
            this.options.height * 0.8,
            this.options.depth
        );
        
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: this.options.color,
            roughness: 0.8,
            metalness: 0.5
        });
        
        const mainBody = new THREE.Mesh(mainGeometry, mainMaterial);
        mainBody.position.y = this.options.height * 0.4;
        this.model.add(mainBody);

        // 添加工业风格的窗户
        this.addIndustrialWindows(mainBody);

        // 添加工业屋顶
        this.addIndustrialRoof();
    }

    addWindows(building) {
        const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            shininess: 90,
            opacity: 0.7,
            transparent: true
        });

        const windowRows = Math.floor(this.options.height / 3);
        const windowCols = Math.floor(this.options.width / 2);

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                // 前面的窗户
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(
                    (col * 2) - (this.options.width / 2) + 1,
                    row * 3 + 1.5,
                    this.options.depth / 2 + 0.1
                );
                building.add(frontWindow);

                // 后面的窗户
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(
                    (col * 2) - (this.options.width / 2) + 1,
                    row * 3 + 1.5,
                    -this.options.depth / 2 - 0.1
                );
                backWindow.rotation.y = Math.PI;
                building.add(backWindow);
            }
        }
    }

    addClassicWindows(building) {
        const windowGeometry = new THREE.PlaneGeometry(1, 1.5);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            shininess: 90,
            opacity: 0.7,
            transparent: true
        });

        const windowRows = Math.floor(this.options.height / 4);
        const windowCols = Math.floor(this.options.width / 3);

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                // 创建窗户框架
                const frame = new THREE.Group();

                // 窗户玻璃
                const windowPane = new THREE.Mesh(windowGeometry, windowMaterial);
                frame.add(windowPane);

                // 窗户装饰
                const frameMaterial = new THREE.MeshPhongMaterial({
                    color: 0xdddddd
                });
                const frameTop = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.1, 0.1),
                    frameMaterial
                );
                frameTop.position.y = 0.8;
                frame.add(frameTop);

                // 设置窗户位置
                frame.position.set(
                    (col * 3) - (this.options.width / 2) + 1.5,
                    row * 4 + 2,
                    this.options.depth / 2 + 0.1
                );
                building.add(frame);

                // 后面的窗户
                const backFrame = frame.clone();
                backFrame.position.z = -this.options.depth / 2 - 0.1;
                backFrame.rotation.y = Math.PI;
                building.add(backFrame);
            }
        }
    }

    addIndustrialWindows(building) {
        const windowGeometry = new THREE.PlaneGeometry(2, 1);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            shininess: 90,
            opacity: 0.5,
            transparent: true
        });

        const windowRows = Math.floor(this.options.height / 5);
        const windowCols = Math.floor(this.options.width / 4);

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                // 工业风格窗户（大面积）
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    (col * 4) - (this.options.width / 2) + 2,
                    row * 5 + 2.5,
                    this.options.depth / 2 + 0.1
                );
                building.add(window);

                // 后面的窗户
                const backWindow = window.clone();
                backWindow.position.z = -this.options.depth / 2 - 0.1;
                backWindow.rotation.y = Math.PI;
                building.add(backWindow);
            }
        }
    }

    addModernRoof() {
        // 现代风格屋顶（平顶带玻璃围栏）
        const roofGeometry = new THREE.BoxGeometry(
            this.options.width + 0.5,
            0.5,
            this.options.depth + 0.5
        );
        
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.options.height + 0.25;
        this.model.add(roof);

        // 添加玻璃围栏
        this.addGlassRailing(roof);
    }

    addClassicRoof() {
        // 古典风格屋顶（斜面）
        const roofGeometry = new THREE.ConeGeometry(
            Math.sqrt(Math.pow(this.options.width, 2) + Math.pow(this.options.depth, 2)) / 2,
            this.options.height * 0.2,
            4
        );
        
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0x884422
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.options.height + (this.options.height * 0.1);
        roof.rotation.y = Math.PI / 4;
        this.model.add(roof);
    }

    addIndustrialRoof() {
        // 工业风格屋顶（锯齿形）
        const segments = 4;
        const segmentWidth = this.options.width / segments;
        
        for (let i = 0; i < segments; i++) {
            const roofSegment = new THREE.Group();
            
            // 斜面
            const slopeGeometry = new THREE.PlaneGeometry(
                segmentWidth,
                this.options.height * 0.2
            );
            const slopeMaterial = new THREE.MeshPhongMaterial({
                color: 0x666666,
                side: THREE.DoubleSide
            });
            const slope = new THREE.Mesh(slopeGeometry, slopeMaterial);
            slope.rotation.x = -Math.PI / 4;
            slope.position.set(
                (i * segmentWidth) - (this.options.width / 2) + (segmentWidth / 2),
                this.options.height + (this.options.height * 0.1),
                0
            );
            roofSegment.add(slope);
            
            this.model.add(roofSegment);
        }
    }

    addGlassRailing(roof) {
        const glassGeometry = new THREE.BoxGeometry(0.1, 1, this.options.depth);
        const glassMaterial = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            opacity: 0.3,
            transparent: true
        });

        // 添加四周的玻璃围栏
        const leftRail = new THREE.Mesh(glassGeometry, glassMaterial);
        leftRail.position.set(-this.options.width/2, 0.5, 0);
        roof.add(leftRail);

        const rightRail = new THREE.Mesh(glassGeometry, glassMaterial);
        rightRail.position.set(this.options.width/2, 0.5, 0);
        roof.add(rightRail);

        const frontRail = new THREE.Mesh(
            new THREE.BoxGeometry(this.options.width, 1, 0.1),
            glassMaterial
        );
        frontRail.position.set(0, 0.5, this.options.depth/2);
        roof.add(frontRail);

        const backRail = new THREE.Mesh(
            new THREE.BoxGeometry(this.options.width, 1, 0.1),
            glassMaterial
        );
        backRail.position.set(0, 0.5, -this.options.depth/2);
        roof.add(backRail);
    }

    createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        // 绘制砖块图案
        context.fillStyle = '#555';
        context.fillRect(0, 0, 256, 256);

        context.fillStyle = '#666';
        for (let row = 0; row < 32; row++) {
            for (let col = 0; col < 16; col++) {
                const offsetX = (row % 2) * 8;
                context.fillRect(
                    col * 16 + offsetX,
                    row * 8,
                    14,
                    6
                );
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 8);

        return texture;
    }

    getModel() {
        return this.model;
    }
} 