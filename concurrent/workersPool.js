// workerPool.js
const { Worker } = require('worker_threads');
const path = require('path');

class WorkerPool {
    constructor(poolSize) {
        this.poolSize = poolSize;
        this.workers = [];
        this.tasks = [];
        this.init();
    }

    init() {
        for (let i = 0; i < this.poolSize; i++) {
            const worker = new Worker(path.resolve('workers.js'));
            worker.on('message', (result) => {
                this.tasks.shift().resolve(result);
            });
            worker.on('error', (err) => {
                this.tasks.shift().reject(err);
            });
            worker.on('exit', () => {
                console.log(`Worker ${worker.threadId} exited.`);
                this.workers = this.workers.filter(w => w !== worker);
                if (this.tasks.length > 0) {
                    this.addWorker();
                }
            });
            this.workers.push(worker);
        }
    }

    addWorker() {
        const worker = new Worker(path.resolve('workers.js'));
        worker.on('message', (result) => {
            this.tasks.shift().resolve(result);
        });
        worker.on('error', (err) => {
            this.tasks.shift().reject(err);
        });
        worker.on('exit', () => {
            console.log(`Worker ${worker.threadId} exited.`);
            this.workers = this.workers.filter(w => w !== worker);
            if (this.tasks.length > 0) {
                this.addWorker();
            }
        });
        this.workers.push(worker);
    }

    runTask(data) {
        return new Promise((resolve, reject) => {
            this.tasks.push({ resolve, reject });
            const worker = this.workers.shift();
            worker.postMessage(data);
            this.workers.push(worker); // Re-add the worker at the end of the queue
        });
    }
}

module.exports = WorkerPool;
