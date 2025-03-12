import { GAME_CONFIG } from '../game.config';

export class AudioManager {
    constructor(game) {
        this.game = game;
        this.bgmContext = null;
        this.soundEffects = new Map();
        this.isMusicEnabled = true;
        this.isSoundEnabled = true;
        this.musicVolume = 0.7;
        this.soundVolume = 1.0;
        
        this.initAudio();
    }

    initAudio() {
        // 初始化背景音乐上下文
        this.bgmContext = wx.createInnerAudioContext({
            useWebAudioImplement: true
        });
        this.bgmContext.loop = true;

        // 预加载音效
        this.preloadSoundEffects();
    }

    preloadSoundEffects() {
        // 预加载常用音效
        const effects = {
            jump: 'audio/effects/jump.mp3',
            land: 'audio/effects/land.mp3',
            attack: 'audio/effects/attack.mp3',
            hit: 'audio/effects/hit.mp3',
            collect: 'audio/effects/collect.mp3',
            button: 'audio/effects/button.mp3',
            victory: 'audio/effects/victory.mp3',
            defeat: 'audio/effects/defeat.mp3'
        };

        for (const [key, path] of Object.entries(effects)) {
            const context = wx.createInnerAudioContext({
                useWebAudioImplement: true
            });
            context.src = path;
            this.soundEffects.set(key, context);
        }
    }

    // 播放背景音乐
    playBGM(musicPath) {
        if (!this.isMusicEnabled) return;

        this.bgmContext.stop();
        this.bgmContext.src = musicPath;
        this.bgmContext.volume = this.musicVolume;
        this.bgmContext.play();
    }

    // 停止背景音乐
    stopBGM() {
        if (this.bgmContext) {
            this.bgmContext.stop();
        }
    }

    // 暂停背景音乐
    pauseBGM() {
        if (this.bgmContext) {
            this.bgmContext.pause();
        }
    }

    // 恢复背景音乐
    resumeBGM() {
        if (this.isMusicEnabled && this.bgmContext) {
            this.bgmContext.play();
        }
    }

    // 播放音效
    playSound(soundName) {
        if (!this.isSoundEnabled) return;

        const sound = this.soundEffects.get(soundName);
        if (sound) {
            sound.volume = this.soundVolume;
            // 重置音效播放位置并播放
            sound.seek(0);
            sound.play();
        }
    }

    // 设置背景音乐音量
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmContext) {
            this.bgmContext.volume = this.musicVolume;
        }
    }

    // 设置音效音量
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.soundEffects.forEach(sound => {
            sound.volume = this.soundVolume;
        });
    }

    // 启用/禁用背景音乐
    toggleMusic(enabled) {
        this.isMusicEnabled = enabled;
        if (enabled) {
            this.resumeBGM();
        } else {
            this.pauseBGM();
        }
    }

    // 启用/禁用音效
    toggleSound(enabled) {
        this.isSoundEnabled = enabled;
    }

    // 加载并播放场景音乐
    playSceneMusic(sceneName) {
        const musicPath = GAME_CONFIG.AUDIO.SCENE_MUSIC[sceneName];
        if (musicPath) {
            this.playBGM(musicPath);
        }
    }

    // 播放UI音效
    playUISound(type) {
        switch (type) {
            case 'button':
                this.playSound('button');
                break;
            case 'success':
                this.playSound('collect');
                break;
            case 'error':
                this.playSound('hit');
                break;
        }
    }

    // 播放游戏结果音效
    playGameResultSound(isVictory) {
        this.playSound(isVictory ? 'victory' : 'defeat');
    }

    // 更新3D音效位置
    updateSoundPosition(soundName, position) {
        const sound = this.soundEffects.get(soundName);
        if (sound && position) {
            // 根据距离计算音量衰减
            const distance = Math.sqrt(
                Math.pow(position.x, 2) +
                Math.pow(position.y, 2) +
                Math.pow(position.z, 2)
            );
            const maxDistance = 50; // 最大可听距离
            const volume = Math.max(0, 1 - (distance / maxDistance));
            sound.volume = this.soundVolume * volume;
        }
    }

    // 清理资源
    dispose() {
        if (this.bgmContext) {
            this.bgmContext.destroy();
        }
        this.soundEffects.forEach(sound => {
            sound.destroy();
        });
        this.soundEffects.clear();
    }
} 