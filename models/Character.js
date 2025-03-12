import { GAME_CONFIG } from '../game.config';

export class Character {
    constructor(options = {}) {
        this.id = options.id || Math.random().toString(36).substr(2, 9);
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.speed = GAME_CONFIG.CHARACTER.MOVE_SPEED;
        this.dashEnergy = 0;
        this.isAttacking = false;
        this.attackCount = 0;
        
        // 角色外观配置
        this.appearance = {
            // 面部特征
            face: {
                earrings: options.earrings || null,
                eyebrows: options.eyebrows || 'default',
                nose: options.nose || 'default',
                chin: options.chin || 'default',
                ears: options.ears || 'default',
                mouth: options.mouth || 'default'
            },
            // 装扮
            outfit: {
                hat: options.hat || null,
                top: options.top || 'default',
                bottom: options.bottom || 'default',
                shoes: options.shoes || 'default'
            }
        };

        // 装备
        this.equipment = {
            vehicle: null,
            weapon: null
        };
    }

    // 更新角色位置
    updatePosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    // 更新角色朝向
    updateRotation(x, y, z) {
        this.rotation.x = x;
        this.rotation.y = y;
        this.rotation.z = z;
    }

    // 移动方法
    move(direction) {
        const actualSpeed = this.getActualSpeed();
        this.position.x += direction.x * actualSpeed;
        this.position.z += direction.z * actualSpeed;
    }

    // 获取实际速度（考虑装备加成）
    getActualSpeed() {
        let speed = this.speed;
        if (this.equipment.vehicle) {
            speed *= this.equipment.vehicle.speedBonus;
        }
        return speed;
    }

    // 冲刺能量管理
    addDashEnergy(amount) {
        this.dashEnergy = Math.min(100, this.dashEnergy + amount);
    }

    // 执行冲刺
    dash() {
        if (this.dashEnergy >= 100) {
            this.dashEnergy = 0;
            return true;
        }
        return false;
    }

    // 攻击相关方法
    startAttack() {
        this.isAttacking = true;
        this.attackCount = 0;
    }

    addAttackCount() {
        this.attackCount++;
        return this.attackCount >= GAME_CONFIG.CHARACTER.ATTACK_COUNT;
    }

    stopAttack() {
        this.isAttacking = false;
        this.attackCount = 0;
    }

    // 装备管理
    equipVehicle(vehicle) {
        this.equipment.vehicle = vehicle;
    }

    equipWeapon(weapon) {
        this.equipment.weapon = weapon;
    }

    // 更新外观
    updateAppearance(category, part, value) {
        if (this.appearance[category] && this.appearance[category].hasOwnProperty(part)) {
            this.appearance[category][part] = value;
        }
    }
} 