# 火柴人大冒险

一个基于微信小游戏平台的3D火柴人跑酷游戏。

## 项目结构

```
wx-game-demo/
├── game/               # 游戏核心逻辑
│   └── Game.js        # 主游戏类
├── managers/          # 游戏管理器
│   ├── AdManager.js   # 广告管理
│   ├── AudioManager.js # 音频管理
│   ├── UIManager.js   # 界面管理
│   ├── StorageManager.js # 存储管理
│   ├── ShareManager.js # 分享管理
│   ├── AntiAddictionManager.js # 防沉迷系统
│   └── PerformanceManager.js # 性能优化
├── models/           # 3D模型
│   ├── StickFigure.js # 火柴人模型
│   ├── Building.js   # 建筑物模型
│   └── Billboard.js  # 广告牌模型
├── styles/          # 样式文件
│   └── game.css     # 游戏样式
├── audio/           # 音频资源
│   ├── music/      # 背景音乐
│   └── effects/    # 音效
├── images/         # 图片资源
│   ├── share/      # 分享图片
│   └── shop/       # 商店图片
└── game.config.js  # 游戏配置文件
```

## 功能特性

1. 3D渲染系统
   - 使用Three.js进行3D渲染
   - 支持LOD（细节层次）优化
   - 动态阴影和后处理效果

2. 游戏UI系统
   - 虚拟摇杆控制
   - 动作按钮（冲刺、攻击）
   - 状态显示（分数、能量）
   - 菜单系统
   - 商店界面
   - 角色定制界面

3. 游戏逻辑系统
   - 角色管理
   - 场景管理
   - 广告管理
   - 游戏状态管理

4. 微信小游戏功能
   - 广告系统（激励视频、插屏、Banner）
   - 分享功能
   - 防沉迷系统
   - 数据存储

5. 性能优化
   - 自适应渲染质量
   - 动态资源加载
   - 场景对象优化

## 开发环境配置

1. 安装依赖
```bash
npm install
```

2. 配置微信开发者工具
- 导入项目
- 在project.config.json中填写你的小程序AppID

3. 开发调试
- 使用微信开发者工具进行调试
- 真机预览测试

## 发布部署

1. 构建发布版本
```bash
npm run build
```

2. 上传代码
- 在微信开发者工具中上传代码
- 在小程序管理后台发布

## 注意事项

1. 资源文件
- 音频文件需要是合适的格式（推荐使用.mp3）
- 图片资源建议进行压缩优化

2. 性能优化
- 合理使用LOD系统
- 控制场景中的对象数量
- 优化资源加载策略

3. 微信平台限制
- 注意游戏包体积限制
- 遵守防沉迷系统要求
- 广告展示频率限制

## 许可证

MIT License 