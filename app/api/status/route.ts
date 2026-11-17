import {modelConfig} from "@/lib/model-service";
import {knowledgeVersion,knowledgeChunks} from "@/lib/knowledge";
export async function GET(){let configured=false;try{configured=Boolean(modelConfig());}catch{}return Response.json({dialogue:configured?"configured":"rules",knowledge:configured?"generation-configured":"retrieval",knowledgeVersion,knowledgeCount:knowledgeChunks.length,version:"0.3.1-mainline"},{headers:{"Cache-Control":"no-store"}});}
