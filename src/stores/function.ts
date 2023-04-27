import { proxy } from "valtio";
import { proxyWithPersistEasy } from "@/utils/persistence";

export const currentFunction = proxyWithPersistEasy({
    id:'',
    type:'',
},{
    key:"currenFuction"
})