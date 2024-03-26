// workers.js
const { parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');

function generateFile(size, dir, filename, content) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, filename);
        fs.writeFile(filePath, content.repeat(size), (err) => {
            if (err) reject(err);
            else resolve(`File created: ${filePath}`);
        });
    });
}

parentPort.on('message', async ({ size, dir, filename }) => {
    try {
        // 为简化示例，我们使用 "0" 作为文件内容
        const content = "0";
        const message = await generateFile(size, dir, filename, content);
        parentPort.postMessage({ status: "success", message });
    } catch (error) {
        parentPort.postMessage({ status: "error", message: error.message });
    }
});
