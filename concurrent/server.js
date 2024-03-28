const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const fs = require('fs');
const path = require('path');
app.use(express.json());

const { Worker } = require('worker_threads');
const WorkerPool = require('./workersPool.js');
const pool = new WorkerPool(4);

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
        rss: `${(memory.rss/1024/1024).toFixed(2)} MB`,
        heapTotal: `${(memory.heapTotal/1024/1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed/1024/1024).toFixed(2)} MB`,
        external: `${(memory.external/1024/1024).toFixed(2)} MB`,
    }
    res.send({ status: 'OK', memory: response})
})
app.get('/sainode/sys/gettime', (req, res) => {
    const worker = new Worker('./workers.js');
    // let fiboInput = Math.floor(Math.random() * 10) + 40; // 生成一個10到29的隨機數作為 Fibonacci 函數的輸入
    let fiboInput = 45; // 生成一個10到29的隨機數作為 Fibonacci 函數的輸入
    worker.on('message', ({param, time}) => {
        res.send({
            param: param,
            time: time
        })
    })

    worker.postMessage(fiboInput);
})
app.get('/sainode/sys/gettime/v2', (req, res) => {
    console.log(`[Get]`)
    let fiboInput = 45
    pool.runTask(fiboInput)
        .then(({param, time}) => {
            res.send({ param, time})
        })
        .catch(err => {
            console.log(`Error: `, err);
            res.status(500).send(err.message)
        });
})
async function generateFile(size, dir, filename, content) {
    // return new Promise((resolve, reject) => {
    //     if (!fs.existsSync(dir)){
    //         fs.mkdirSync(dir, { recursive: true });
    //     }
    //     const filePath = path.join(dir, filename);
    //     fs.writeFile(filePath, content.repeat(size), (err) => {
    //         if (err) reject(err);
    //         else resolve(`File created: ${filePath}`);
    //     });
    // });
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, filename);
    // fs.writeFileSync(filePath, content.repeat(size), (err) => {
    //     if (err) {}
    //     else {
    //         console.log(`Done: ${filePath}`)
    //         return true
    //     };
    // });
    try {
        fs.writeFileSync(filePath, content.repeat(size))
        // console.log(`Done: ${filePath}`)
        return true
    }
    catch (err) {
        console.log(`Err`)
        return false
    }
}
app.get('/sys/iotasks', async (req, res) => {
    // console.log(`hit IO`)
    const task = {
        dir: './output',  // 指定目录
        // dir: 'X:\\2.5 總管理處\\2.5.2 管理部\\2.5.2.4 資管課\\2.5.2.4.0 個人資料夾\\Matt\\測試資料\\output',  // 指定目录
        filename: uuidv4(),  // 文件名
        size: 1024 * 1024 * 100  // 文件大小
    };
    let result = generateFile(task.size, task.dir, task.filename, '0')
    if (result) {
        res.json({ status: 'success' });
    } else {
        console.log(`Err`)
    }
});
app.get('/sys/iotasks/workerpools', async (req, res) => {
    // console.log(`hit IO`)
    const task = {
        taskname: 'genFiles',
        params: {
            dir: './output',  // 指定目录
            filename: uuidv4(),  // 文件名
            size: 1024 * 1024 * 100  // 文件大小
        }
    };
    pool.runTask(task)
        .then(({ success, message }) => {
            if (success) {
                res.json({ status: 'success' });
            } else {
                res.status(500).json({ error: message });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});
app.get('/sys/cputasks', async (req, res) => {
    const task = {
        param: 45
    }
    let result = fibonacci(task.param);
    res.json({ result });
})
app.get('/sys/cputasks/workerpools', async (req, res) => {
    console.log(`hit CPU task`)
    const task = {
        taskname: 'fibonacci',
        params: 45
    };
    pool.runTask(task)
        .then( result => {
            res.json({ result });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
})

app.listen(3333, () => {
    console.log(`Server Happily Running on 3333!`)
})
