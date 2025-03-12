export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = new Map();
        
        // 创建UI元素
        this.createUIElements();
    }

    // 创建UI元素
    createUIElements() {
        // 创建虚拟摇杆
        this.createJoystick();
        
        // 创建操作按钮
        this.createActionButtons();
        
        // 创建状态栏
        this.createStatusBar();
        
        // 创建暂停菜单
        this.createPauseMenu();
        
        // 创建商店界面
        this.createShopUI();
        
        // 创建角色定制界面
        this.createCharacterCustomizationUI();
    }

    // 创建虚拟摇杆
    createJoystick() {
        const joystickContainer = document.createElement('div');
        joystickContainer.className = 'joystick-container';
        
        const joystick = document.createElement('div');
        joystick.className = 'joystick';
        
        joystickContainer.appendChild(joystick);
        document.body.appendChild(joystickContainer);
        
        this.elements.set('joystick', {
            container: joystickContainer,
            stick: joystick
        });

        // 添加触摸事件处理
        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        
        joystickContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startPos = {
                x: touch.clientX,
                y: touch.clientY
            };
            joystick.style.transform = 'translate(0, 0)';
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startPos.x;
            const deltaY = touch.clientY - startPos.y;
            
            // 限制摇杆移动范围
            const radius = 50;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const scale = distance > radius ? radius / distance : 1;
            
            const moveX = deltaX * scale;
            const moveY = deltaY * scale;
            
            joystick.style.transform = `translate(${moveX}px, ${moveY}px)`;
            
            // 更新移动方向
            this.game.handleInput('move', {
                x: moveX / radius,
                z: moveY / radius
            });
        });

        document.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            joystick.style.transform = 'translate(0, 0)';
            this.game.handleInput('move', { x: 0, z: 0 });
        });
    }

    // 创建操作按钮
    createActionButtons() {
        // 冲刺按钮
        const dashButton = document.createElement('div');
        dashButton.className = 'action-button dash-button';
        dashButton.textContent = '冲刺';
        document.body.appendChild(dashButton);
        this.elements.set('dashButton', dashButton);

        // 攻击按钮
        const attackButton = document.createElement('div');
        attackButton.className = 'action-button attack-button';
        attackButton.textContent = '攻击';
        document.body.appendChild(attackButton);
        this.elements.set('attackButton', attackButton);

        // 添加事件处理
        dashButton.addEventListener('touchstart', () => {
            this.game.handleInput('dash', true);
        });

        dashButton.addEventListener('touchend', () => {
            this.game.handleInput('dash', false);
        });

        attackButton.addEventListener('touchstart', () => {
            this.game.handleInput('attack', true);
        });

        attackButton.addEventListener('touchend', () => {
            this.game.handleInput('attack', false);
        });
    }

    // 创建状态栏
    createStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.className = 'status-bar';
        
        // 分数显示
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-display';
        scoreDisplay.textContent = '分数: 0';
        statusBar.appendChild(scoreDisplay);
        
        // 冲刺能量条
        const dashEnergy = document.createElement('div');
        dashEnergy.className = 'dash-energy';
        const dashEnergyFill = document.createElement('div');
        dashEnergyFill.className = 'dash-energy-fill';
        dashEnergy.appendChild(dashEnergyFill);
        statusBar.appendChild(dashEnergy);
        
        // 暂停按钮
        const pauseButton = document.createElement('div');
        pauseButton.className = 'pause-button';
        pauseButton.textContent = '暂停';
        statusBar.appendChild(pauseButton);
        
        document.body.appendChild(statusBar);
        this.elements.set('statusBar', {
            container: statusBar,
            scoreDisplay,
            dashEnergyFill,
            pauseButton
        });

        // 添加事件处理
        pauseButton.addEventListener('click', () => {
            this.game.pause();
            this.showPauseMenu();
        });
    }

    // 创建暂停菜单
    createPauseMenu() {
        const pauseMenu = document.createElement('div');
        pauseMenu.className = 'pause-menu hidden';
        
        const menuContent = document.createElement('div');
        menuContent.className = 'menu-content';
        
        const resumeButton = document.createElement('button');
        resumeButton.textContent = '继续游戏';
        
        const shopButton = document.createElement('button');
        shopButton.textContent = '商店';
        
        const customizeButton = document.createElement('button');
        customizeButton.textContent = '角色定制';
        
        const exitButton = document.createElement('button');
        exitButton.textContent = '退出游戏';
        
        menuContent.appendChild(resumeButton);
        menuContent.appendChild(shopButton);
        menuContent.appendChild(customizeButton);
        menuContent.appendChild(exitButton);
        pauseMenu.appendChild(menuContent);
        
        document.body.appendChild(pauseMenu);
        this.elements.set('pauseMenu', {
            container: pauseMenu,
            resumeButton,
            shopButton,
            customizeButton,
            exitButton
        });

        // 添加事件处理
        resumeButton.addEventListener('click', () => {
            this.hidePauseMenu();
            this.game.resume();
        });

        shopButton.addEventListener('click', () => {
            this.showShopUI();
        });

        customizeButton.addEventListener('click', () => {
            this.showCharacterCustomizationUI();
        });

        exitButton.addEventListener('click', () => {
            this.game.end();
            // 返回游戏主菜单或退出
        });
    }

    // 创建商店界面
    createShopUI() {
        const shopUI = document.createElement('div');
        shopUI.className = 'shop-ui hidden';
        
        // 添加商店内容
        const vehiclesSection = this.createShopSection('交通工具', GAME_CONFIG.SHOP.VEHICLES);
        const weaponsSection = this.createShopSection('武器', GAME_CONFIG.SHOP.WEAPONS);
        
        shopUI.appendChild(vehiclesSection);
        shopUI.appendChild(weaponsSection);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = '关闭';
        shopUI.appendChild(closeButton);
        
        document.body.appendChild(shopUI);
        this.elements.set('shopUI', {
            container: shopUI,
            closeButton
        });

        // 添加事件处理
        closeButton.addEventListener('click', () => {
            this.hideShopUI();
        });
    }

    // 创建商店分类部分
    createShopSection(title, items) {
        const section = document.createElement('div');
        section.className = 'shop-section';
        
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'items-container';
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            const itemName = document.createElement('div');
            itemName.textContent = item.name;
            
            const itemPrice = document.createElement('div');
            itemPrice.textContent = `${item.price} 积分`;
            
            const buyButton = document.createElement('button');
            buyButton.textContent = '购买';
            buyButton.addEventListener('click', () => {
                // 处理购买逻辑
            });
            
            itemElement.appendChild(itemName);
            itemElement.appendChild(itemPrice);
            itemElement.appendChild(buyButton);
            itemsContainer.appendChild(itemElement);
        });
        
        section.appendChild(itemsContainer);
        return section;
    }

    // 创建角色定制界面
    createCharacterCustomizationUI() {
        const customizationUI = document.createElement('div');
        customizationUI.className = 'customization-ui hidden';
        
        // 添加面部特征选项
        const faceSection = this.createCustomizationSection('面部特征', [
            'earrings', 'eyebrows', 'nose', 'chin', 'ears', 'mouth'
        ]);
        
        // 添加装扮选项
        const outfitSection = this.createCustomizationSection('装扮', [
            'hat', 'top', 'bottom', 'shoes'
        ]);
        
        customizationUI.appendChild(faceSection);
        customizationUI.appendChild(outfitSection);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = '关闭';
        customizationUI.appendChild(closeButton);
        
        document.body.appendChild(customizationUI);
        this.elements.set('customizationUI', {
            container: customizationUI,
            closeButton
        });

        // 添加事件处理
        closeButton.addEventListener('click', () => {
            this.hideCharacterCustomizationUI();
        });
    }

    // 创建定制选项部分
    createCustomizationSection(title, options) {
        const section = document.createElement('div');
        section.className = 'customization-section';
        
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'customization-option';
            
            const optionName = document.createElement('div');
            optionName.textContent = option;
            
            const prevButton = document.createElement('button');
            prevButton.textContent = '←';
            
            const nextButton = document.createElement('button');
            nextButton.textContent = '→';
            
            optionElement.appendChild(prevButton);
            optionElement.appendChild(optionName);
            optionElement.appendChild(nextButton);
            optionsContainer.appendChild(optionElement);
            
            // 添加事件处理
            prevButton.addEventListener('click', () => {
                // 处理上一个选项
            });
            
            nextButton.addEventListener('click', () => {
                // 处理下一个选项
            });
        });
        
        section.appendChild(optionsContainer);
        return section;
    }

    // 更新UI状态
    updateUI(gameState) {
        // 更新分数显示
        const statusBar = this.elements.get('statusBar');
        if (statusBar) {
            statusBar.scoreDisplay.textContent = `分数: ${gameState.score}`;
            
            // 更新冲刺能量条
            const energyPercentage = (gameState.player.dashEnergy / 100) * 100;
            statusBar.dashEnergyFill.style.width = `${energyPercentage}%`;
        }
    }

    // 显示/隐藏UI元素的方法
    showPauseMenu() {
        const pauseMenu = this.elements.get('pauseMenu');
        if (pauseMenu) {
            pauseMenu.container.classList.remove('hidden');
        }
    }

    hidePauseMenu() {
        const pauseMenu = this.elements.get('pauseMenu');
        if (pauseMenu) {
            pauseMenu.container.classList.add('hidden');
        }
    }

    showShopUI() {
        const shopUI = this.elements.get('shopUI');
        if (shopUI) {
            shopUI.container.classList.remove('hidden');
        }
    }

    hideShopUI() {
        const shopUI = this.elements.get('shopUI');
        if (shopUI) {
            shopUI.container.classList.add('hidden');
        }
    }

    showCharacterCustomizationUI() {
        const customizationUI = this.elements.get('customizationUI');
        if (customizationUI) {
            customizationUI.container.classList.remove('hidden');
        }
    }

    hideCharacterCustomizationUI() {
        const customizationUI = this.elements.get('customizationUI');
        if (customizationUI) {
            customizationUI.container.classList.add('hidden');
        }
    }

    // 清理UI
    dispose() {
        this.elements.forEach(element => {
            if (element.container) {
                element.container.remove();
            } else {
                element.remove();
            }
        });
        this.elements.clear();
    }
} 