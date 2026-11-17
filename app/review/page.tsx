import Workspace from '../Workspace';
import {JobWorkshop} from '../components/JobWorkshop';
export default function Page(){return <JobWorkshop reviewOnly fallback={<Workspace initialSection="review"/>}/>;}
