import {JOB_RUN_KEY,isJobRun,type JobRun} from './job-workshop.ts';
import {isReflectionRecord,type ReflectionRecord} from './reflection-types.ts';
import {jobReviewInput,jobReviewBasis,jobReflectionContext} from './job-reflection.ts';
import {validateContextSelection} from './reflection-context.ts';
export const JOB_HISTORY_KEY='shiju.job-history.v1';
export type JobStorage=Pick<Storage,'getItem'|'setItem'>;
export function readJobHistory(raw:string|null):JobRun[]{
 if(!raw)return [];
 const value=JSON.parse(raw);
 if(!value||value.version!==1||!Array.isArray(value.runs)||!value.runs.every(isJobRun)||new Set(value.runs.map((r:JobRun)=>r.id)).size!==value.runs.length)throw Error('invalid history');
 return value.runs;
}
export function jobHistoryWithCurrent(runs:JobRun[],current:JobRun|null):JobRun[]{
 return current?[current,...runs.filter(r=>r.id!==current.id)]:runs;
}
// Write history first. If quota/storage fails, never replace the previous current run.
export function persistJobRun(storage:JobStorage,next:JobRun){
 const runs=readJobHistory(storage.getItem(JOB_HISTORY_KEY));
 const raw=storage.getItem(JOB_RUN_KEY);
 const old=raw?JSON.parse(raw):null;
 if(old&&!isJobRun(old))throw Error('invalid current run');
 const merged=jobHistoryWithCurrent(jobHistoryWithCurrent(runs,old),next);
 storage.setItem(JOB_HISTORY_KEY,JSON.stringify({version:1,runs:merged}));
 storage.setItem(JOB_RUN_KEY,JSON.stringify(next));
}
// Reviewing an archived run must not replace the active conversation.
export function persistJobReflection(storage:JobStorage,id:string,reflection:ReflectionRecord):JobRun{
 const runs=readJobHistory(storage.getItem(JOB_HISTORY_KEY)),raw=storage.getItem(JOB_RUN_KEY),current=raw?JSON.parse(raw):null;
 if(current&&!isJobRun(current))throw Error('invalid current run');
 const run:JobRun|undefined=current?.id===id?current:runs.find(r=>r.id===id);
 if(!run?.decision)throw Error('completed run not found');
 const input=jobReviewInput(run);
 if(!isReflectionRecord(reflection)||reflection.basis!==jobReviewBasis(input)||!validateContextSelection(reflection.selection,jobReflectionContext(input)))throw Error('stale or invalid reflection');
 const updated={...run,reflection};
 storage.setItem(JOB_HISTORY_KEY,JSON.stringify({version:1,runs:jobHistoryWithCurrent(jobHistoryWithCurrent(runs,current),updated)}));
 if(current?.id===id)storage.setItem(JOB_RUN_KEY,JSON.stringify(updated));
 return updated;
}
