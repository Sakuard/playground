const express = require('express');
const app = express();
app.use(express.json());

// 簡單的 Fibonacci 計算函數（遞迴）
function fibonacci(n) {
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/sys/status', (req, res) => {
    const memory = process.memoryUsage();
    let response = {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
    }
    res.send({ status: 'OK', memory: response})
})
app.get('/sainode/sys/gettime', (req, res) => {
    let timeout = Math.floor(Math.random() * 15000); // 隨機等待時間
    let fiboInput = Math.floor(Math.random() * 20) + 30; // 生成一個10到29的隨機數作為 Fibonacci 函數的輸入

    let now = new Date();
    let nowISO = now.toISOString();
    let fiboResult = fibonacci(fiboInput); // 計算 Fibonacci 數列
    let done = new Date();
    let doneISO = done.toISOString();
    res.send(`${nowISO}, time: ${timeout/1000}s, fibo(${fiboInput}): time-process: ${(done-now)/1000}s`)
})

app.listen(3333, () => {
    console.log(`Server Happily Running on 3333!`)
})
