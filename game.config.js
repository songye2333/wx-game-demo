// 游戏基础配置
export const GAME_CONFIG = {
    // 场景配置
    SCENE: {
        WIDTH: 750,  // 场景宽度
        HEIGHT: 1334, // 场景高度
        GRAVITY: 9.8,  // 重力加速度
        CAMERA: {
            FOV: 60,           // 视场角
            NEAR: 0.1,         // 近裁剪面
            FAR: 1000,         // 远裁剪面
            POSITION: { x: 0, y: 10, z: -15 }  // 相机初始位置
        },
        // 场景类型配置
        TYPES: [
            {
                id: 'city',
                name: '城市',
                description: '高楼大厦的现代都市',
                buildingCount: 20,          // 建筑物数量
                buildingSpacing: 30,        // 建筑物间距
                maxBuildingHeight: 100,     // 最大建筑高度
                minBuildingHeight: 30,      // 最小建筑高度
                adPositions: 8,             // 广告位数量
                adSize: { width: 10, height: 15 }  // 广告牌尺寸
            },
            {
                id: 'suburb',
                name: '郊区',
                description: '低密度住宅区',
                buildingCount: 15,
                buildingSpacing: 40,
                maxBuildingHeight: 40,
                minBuildingHeight: 15,
                adPositions: 5,
                adSize: { width: 8, height: 12 }
            },
            {
                id: 'park',
                name: '公园',
                description: '开放的公园环境',
                buildingCount: 10,
                buildingSpacing: 50,
                maxBuildingHeight: 25,
                minBuildingHeight: 10,
                adPositions: 3,
                adSize: { width: 6, height: 10 }
            }
        ]
    },
    
    // 音频配置
    AUDIO: {
        // 场景背景音乐
        SCENE_MUSIC: {
            menu: 'audio/music/menu.mp3',
            game: 'audio/music/game.mp3',
            shop: 'audio/music/shop.mp3',
            victory: 'audio/music/victory.mp3',
            defeat: 'audio/music/defeat.mp3'
        },
        // 默认音量设置
        DEFAULT_MUSIC_VOLUME: 0.7,
        DEFAULT_SOUND_VOLUME: 1.0
    },

    // 广告配置
    ADS: {
        REFRESH_INTERVAL: 300,  // 广告刷新间隔（秒）
        MAX_ADS: 8,            // 最大同时显示广告数
        MIN_DISPLAY_TIME: 10,  // 最小展示时间（秒）
        REWARD_MULTIPLIER: 1.5, // 看广告获得的积分倍数
        VIDEO_AD_UNIT_ID: 'your_video_ad_unit_id',
        INTERSTITIAL_AD_UNIT_ID: 'your_interstitial_ad_unit_id',
        BANNER_AD_UNIT_ID: 'your_banner_ad_unit_id',
        VIDEO_REWARD_POINTS: 100,
        ROTATION_INTERVAL: 30000, // 广告轮换间隔（毫秒）
        SPOT_ADS: [
            { id: 'ad1', content: 'ad_content_1.png' },
            { id: 'ad2', content: 'ad_content_2.png' },
            { id: 'ad3', content: 'ad_content_3.png' }
        ]
    },
    
    // 角色配置
    CHARACTER: {
        MOVE_SPEED: 5,        // 基础移动速度
        DASH_SPEED: 10,       // 冲刺速度
        DASH_DURATION: 0.5,   // 冲刺持续时间
        DASH_COOLDOWN: 3,     // 冲刺冷却时间
        ATTACK_COUNT: 15,     // 连击所需次数
        JUMP_FORCE: 10,
        MAX_HEALTH: 100,
        ATTACK_RANGE: 2,
        ATTACK_DAMAGE: 20
    },

    // 游戏规则
    RULES: {
        CATCH_DISTANCE: 100,  // 捕获距离
        SCORE_PER_AD: 100,   // 每次观看广告获得的积分
        SCORE_PER_GAME: 10   // 每局游戏基础积分
    },

    // 分享配置
    SHARE: {
        DEFAULT_TITLE: '快来和我一起玩火柴人大冒险！',
        DEFAULT_IMAGE: 'images/share/default.png',
        TIMELINE_TITLE: '好玩的火柴人大冒险',
        TIMELINE_IMAGE: 'images/share/timeline.png',
        SCORE_IMAGE: 'images/share/score.png',
        UNLOCK_IMAGE: 'images/share/unlock.png',
        CHARACTER_IMAGE: 'images/share/character.png',
        LOGO_IMAGE: 'images/share/logo.png',
        QR_CODE: 'images/share/qrcode.png'
    },

    // 游戏参数配置
    GAME: {
        // 相机参数
        CAMERA: {
            FOV: 75,
            NEAR: 0.1,
            FAR: 1000,
            INITIAL_POSITION: { x: 0, y: 5, z: 10 }
        },
        // 物理参数
        PHYSICS: {
            GRAVITY: -9.8,
            TIME_STEP: 1/60
        }
    },

    // 商店配置
    SHOP: {
        VEHICLES: [
            { id: 'skates', name: '滑冰鞋', price: 1000, speedBonus: 1.2 },
            { id: 'horse', name: '马', price: 2000, speedBonus: 1.5 },
            { id: 'motorcycle', name: '摩托车', price: 3000, speedBonus: 1.8 },
            { id: 'car', name: '汽车', price: 5000, speedBonus: 2.0 }
        ],
        WEAPONS: [
            { id: 'fist', name: '拳套', price: 500, damageBonus: 1.2 },
            { id: 'knuckles', name: '指虎', price: 1000, damageBonus: 1.5 },
            { id: 'stick', name: '棍棒', price: 2000, damageBonus: 1.8 }
        ],
        CATEGORIES: ['vehicles', 'weapons', 'outfits'],
        ITEMS: {
            vehicles: [
                { id: 'car1', name: '跑车', price: 1000, image: 'images/shop/car1.png' },
                { id: 'bike1', name: '摩托', price: 800, image: 'images/shop/bike1.png' }
            ],
            weapons: [
                { id: 'sword1', name: '长剑', price: 500, image: 'images/shop/sword1.png' },
                { id: 'axe1', name: '战斧', price: 700, image: 'images/shop/axe1.png' }
            ],
            outfits: [
                { id: 'armor1', name: '铠甲', price: 1200, image: 'images/shop/armor1.png' },
                { id: 'hat1', name: '帽子', price: 300, image: 'images/shop/hat1.png' }
            ]
        }
    },

    // 性能优化配置
    PERFORMANCE: {
        MAX_PARTICLES: 1000,
        DRAW_DISTANCE: 100,
        SHADOW_QUALITY: 'medium', // low, medium, high
        MAX_LIGHTS: 4,
        ENABLE_POSTPROCESSING: true
    }
}; 