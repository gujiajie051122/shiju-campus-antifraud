import {modelConfig} from "@/lib/model-service";
import {knowledgeVersion,knowledgeChunks} from "@/lib/knowledge";
export async function GET(){let configured=false;try{configured=Boolean(modelConfig());}catch{}return Response.json({dialogue:configured?"configured":"rules",knowledge:configured?"generation-configured":"retrieval",knowledgeVersion,knowledgeCount:knowledgeChunks.length,avatarConfigured:Boolean(process.env.DID_AGENT_ID&&process.env.DID_CLIENT_KEY),version:"0.2.0"},{headers:{"Cache-Control":"no-store"}});}
