import {workerData,parentPort} from 'node:worker_threads';
import {reserve} from '../lib/ai-budget.ts';
import {sqliteD1} from './budget-sqlite.mjs';
const {db,sql}=sqliteD1(workerData.file,false);
parentPort.postMessage(await reserve(db,workerData.user,'dialogue','test',workerData.policy,workerData.now));
sql.close();
