const { resolve } = require('path');

(async () => {
    // const PQueue = require('p-queue').default;
    const PQueue = (await import('p-queue')).default;
    const queue = new PQueue({concurrency: 30});
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
    let taskPromises2 = []
    let tasks = 60
    let progress = 0;
    let progress2 = 0;
    const UpdateProgress = () => {
        progress++;
        console.log(`Progress: ${progress}/${tasks}`)
    }
    const UpdateProgress2 = () => {
        progress2++;
        console.log(`Progress2: ${progress2}/${tasks}`)
    }
    let ioTasksPromise = []
    let ioTasksProgress = 0
    const UpdateIoProgress = () => {
        ioTasksProgress++;
        console.log(`IoProgress: ${ioTasksProgress}/${tasks}`)
    }
    let ioTasksPromiseWorkerpools = []
    let ioTasksProgressWorkerpools = 0
    const UpdateIoProgressWorkerPools = () => {
        ioTasksProgressWorkerpools++;
        console.log(`IoProgress: ${ioTasksProgressWorkerpools}/${tasks}`)
    }
    const taskGenerator = (numberOfTasks, taskPromises) => {
        for (let i = 0; i<numberOfTasks; i++) {
            const task = () => new Promise(async (resolve, reject) => {
                // console.log('task: ',i+1);
                let starttime = new Date().toISOString();
                let endtime = await $axios.get('/sainode/sys/gettime')
                // console.log(`\ntask${i+1}: start ${starttime}\nresolve:\n`,endtime.data);
                UpdateProgress();
                resolve();
            })
            taskPromises.push(task)
        }
    }
    taskGenerator(tasks, taskPromises);
    const taskGenerator2 = (numberOfTasks, taskPromises) => {
        for (let i = 0; i<numberOfTasks; i++) {
            const task = () => new Promise(async (resolve, reject) => {
                // console.log('task: ',i+1);
                let starttime = new Date().toISOString();
                let endtime = await $axios.get('/sainode/sys/gettime/v2')
                // console.log(`\ntask${i+1}: start ${starttime}\nresolve:\n`,endtime.data);
                UpdateProgress2();
                resolve();
            })
            taskPromises.push(task)
        }
    }
    taskGenerator2(tasks, taskPromises2);

    const ioTaskGenerator = (numberOfTasks, taskPromises) => {
        for (let  i=0; i<numberOfTasks; i++) {
            const task = () => new Promise(async (resolve, reject) => {
                let starttime = new Date().toISOString();
                await $axios.get('/sys/iotasks')
                    .then(response => {
                        console.log(`get Response`)
                    })
                    .catch(err => {
                        console.log(`Request Err`);
                    })
                UpdateIoProgress();
                resolve();
            })
            taskPromises.push(task)
        }
    }
    ioTaskGenerator(tasks, ioTasksPromise);
    const ioTaskGeneratorWorkerPools = (numberOfTasks, taskPromises) => {
        for (let  i=0; i<numberOfTasks; i++) {
            const task = () => new Promise(async (resolve, reject) => {
                let starttime = new Date().toISOString();
                await $axios.get('/sys/iotasks/workerpools')
                    .then(response => {
                        console.log(`get Response`)
                    })
                    .catch(err => {
                        console.log(`Request Err`);
                    })
                UpdateIoProgressWorkerPools();
                resolve();
            })
            taskPromises.push(task)
        }
    }
    ioTaskGeneratorWorkerPools(tasks, ioTasksPromiseWorkerpools);
    
    async function runTasks(taskPromises, task) {
        let now = new Date();
        console.log('Start running tasks');
        taskPromises.forEach(task => {
            queue.add(task);
        })
        await queue.onIdle();
        let end = new Date();
        console.log(`[Done]:${task} - process time: ${(end-now)/1000}s`);
    }
    
    // runTasks(taskPromises, 1);
    // runTasks(taskPromises2, 2);
    // runTasks(ioTasksPromise, 'IoTasks');
    runTasks(ioTasksPromiseWorkerpools, 'IoTasksWorkerPools');
})();