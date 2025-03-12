// 开放数据域入口文件
const openDataContext = wx.getOpenDataContext();
const sharedCanvas = openDataContext.canvas;

// 监听主域发送的消息
wx.onMessage(data => {
    switch (data.type) {
        case 'updateScore':
            // 更新分数
            updateScore(data.score);
            break;
        case 'showRankList':
            // 显示排行榜
            showRankList();
            break;
        default:
            console.log('未知的消息类型:', data.type);
    }
});

// 更新分数
function updateScore(score) {
    // 调用开放数据域接口更新用户分数
    wx.getUserCloudStorage({
        keyList: ['score'],
        success: res => {
            const oldScore = res.KVDataList.length ? parseInt(res.KVDataList[0].value) : 0;
            if (score > oldScore) {
                wx.setUserCloudStorage({
                    KVDataList: [{
                        key: 'score',
                        value: score.toString()
                    }]
                });
            }
        }
    });
}

// 显示排行榜
function showRankList() {
    // 获取群排行榜
    wx.getFriendCloudStorage({
        keyList: ['score'],
        success: res => {
            // 对数据进行排序
            const rankList = res.data
                .filter(item => item.KVDataList.length > 0)
                .sort((a, b) => {
                    return parseInt(b.KVDataList[0].value) - parseInt(a.KVDataList[0].value);
                });
            
            // 绘制排行榜
            drawRankList(rankList);
        }
    });
}

// 绘制排行榜
function drawRankList(rankList) {
    const ctx = sharedCanvas.getContext('2d');
    ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    
    // 设置绘制样式
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '20px Arial';
    
    // 绘制标题
    ctx.fillText('好友排行榜', 10, 30);
    
    // 绘制排行列表
    rankList.forEach((item, index) => {
        if (index < 10) { // 只显示前10名
            const score = item.KVDataList[0].value;
            const name = item.nickname;
            const y = 70 + index * 40;
            
            // 绘制排名
            ctx.fillText(`${index + 1}.`, 10, y);
            // 绘制名字
            ctx.fillText(name, 50, y);
            // 绘制分数
            ctx.fillText(score, 200, y);
        }
    });
} 