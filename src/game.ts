import * as utils from '@dcl/ecs-scene-utils'
import { animationToggleInBuilding } from './animation'
import { CONFIG } from './config'
import { SceneActiveUtil } from './sceneActiveUtil'
import { getAndSetUserDataIfNullNoWait, getUserDataFromLocal } from './userData'

let sceneStartd = false
function sceneActiveCallback(val:boolean){
    log("startScene",val,"sceneStartd",sceneStartd)
    if(val){
        if(!sceneStartd){
            sceneStartd = true
            //start playing outside music (assume spawn/start outside)
            animationToggleInBuilding(false)
        }else{
            //already started
        } 
    }  
} 

const sceneActiveUtil = new SceneActiveUtil( sceneActiveCallback )
sceneActiveUtil.init()