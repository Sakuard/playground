const { resolve } = require('path');

(async () => {
    // const PQueue = require('p-queue').default;
    const PQueue = (await import('p-queue')).default;
    const queue = new PQueue({concurrency: 4});
    const https = require('https');
    const axios = require('axios');

    const $axios = axios.create({
        // baseURL: 'https://192.168.7.24:11000',
        baseURL: 'http://192.168.7.24:3333',
        withCredentials: false,
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false  // 忽略 SSL 驗證
        })
    });

    let taskPromises = []
    const taskGenerator = (numberOfTasks, taskPromises) => {
        for (let i = 0; i<numberOfTasks; i++) {
            const task = () => new Promise(async (resolve, reject) => {
                console.log('task: ',i+1);
                let starttime = new Date().toISOString();
                let endtime = await $axios.get('/sainode/sys/gettime')
                console.log(`\ntask${i+1}: start ${starttime}\nresolve:\n`,endtime.data);
                resolve();
            })
            taskPromises.push(task)
        }
    }
    taskGenerator(10, taskPromises);
    
    async function runTasks(taskPromises) {
        console.log('Start running tasks');
        taskPromises.forEach(task => {
            queue.add(task);
        })
        await queue.onIdle();
        console.log('All tasks are done');
    }
    
    runTasks(taskPromises);
})();