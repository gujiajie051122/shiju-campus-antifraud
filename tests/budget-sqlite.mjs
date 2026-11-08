import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function sqliteD1(file=':memory:',initialize=true){
 const sql=new DatabaseSync(file);sql.exec('PRAGMA busy_timeout=10000');
 if(initialize)sql.exec(readFileSync(new URL('../drizzle/0000_lucky_hammerhead.sql',import.meta.url),'utf8'));
 const db={prepare(query){return {bind(...values){const statement=sql.prepare(query);const args=Object.fromEntries(values.map((v,i)=>['?'+(i+1),v]));return {async run(){return {meta:{changes:Number(statement.run(args).changes)}};},async first(){return statement.get(args)??null;}};}};}};
 return {db,sql};
}
