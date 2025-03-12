// 开放数据域
const sharedCanvas = wx.getSharedCanvas();
const context = sharedCanvas.getContext('2d');

// 监听主域发送的消息
wx.onMessage(data => {
    if (data.type === 'updateScore') {
        // 更新分数显示
        drawScore(data.score);
    } else if (data.type === 'showRankList') {
        // 显示排行榜
        drawRankList();
    }
});

// 绘制分数
function drawScore(score) {
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    context.fillStyle = '#ffffff';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillText(`分数: ${score}`, sharedCanvas.width / 2, 30);
}

// 绘制排行榜
function drawRankList() {
    // 获取群排行榜
    wx.getFriendCloudStorage({
        keyList: ['score'],
        success: res => {
            // 清空画布
            context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
            
            // 绘制标题
            context.fillStyle = '#ffffff';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('好友排行榜', sharedCanvas.width / 2, 30);

            // 绘制排行榜列表
            const list = res.data.sort((a, b) => b.KVDataList[0].value - a.KVDataList[0].value);
            list.forEach((item, index) => {
                if (index < 10) {  // 只显示前10名
                    context.textAlign = 'left';
                    context.fillText(
                        `${index + 1}. ${item.nickname}: ${item.KVDataList[0].value}`,
                        30,
                        70 + index * 30
                    );
                }
            });
        }
    });
} 