import * as utils from '@dcl/ecs-scene-utils'
import { animationToggleInBuilding } from './animation'
import { ballsToggleInBuilding, toggleBallsNearScene } from './balls'
import { HoleUpdateSystem, booleanHoleToggleInBuilding, updateHoleActivateDistance, updateHoleDiv } from "./booleanHole"
import { CONFIG } from "./config"
import { RESOURCES } from "./resources"

const INSIDE_ADD_GROUND_OUTLINE = true
const cubeHeight = CONFIG.BUIDING_HEIGHT
const cubeWidth = CONFIG.BUIDING_WIDTH
const nearBuildingWidthOffset = 8
const nearBuildingWidth = cubeWidth + nearBuildingWidthOffset
const inBuildingWidthX = cubeWidth 
const inBuildingWidthZOffset = 3
const inBuildingWidthZ = cubeWidth - inBuildingWidthZOffset + 1
const wallThickness = .1
const frontDoorOffsetWidth = 0//3
const frontDoorOffsetHeight = CONFIG.BOOLEAN_HEIGHT


const emissiveBox = new BoxShape()
emissiveBox.withCollisions = true

const emissiveBoxMat = RESOURCES.materials.emissiveBoxMat


const outerBoxMat = RESOURCES.materials.outerBoxMat



const outerBox = new BoxShape()
outerBox.withCollisions = false

function createBox(shape:Shape,material:Material|BasicMaterial,cubeWidth:number,cubeHeight:number, wallThickness:number, frontDoorOffsetWidth:number,frontDoorOffsetHeight:number,floor:boolean){

    /*
    const emissiveBoxEntity = new Entity()
    engine.addEntity(emissiveBoxEntity)

    emissiveBoxEntity.addComponent(new Transform({
        position: new Vector3(
            CONFIG.sizeX/2,
            cubeHeight/2,
            CONFIG.sizeZ/2),
        scale: new Vector3(cubeWidth, cubeHeight, cubeWidth)
    }))
    emissiveBoxEntity.addComponent( emissiveBox )
    */

    //right
    const emissiveBoxEntityW1 = new Entity()
    engine.addEntity(emissiveBoxEntityW1)

    emissiveBoxEntityW1.addComponent(new Transform({
        position: new Vector3(
            CONFIG.sizeX/2 - (cubeWidth)/2,
            cubeHeight/2,
            CONFIG.sizeZ/2),
        scale: new Vector3(cubeWidth, cubeHeight, wallThickness )
        ,rotation:Quaternion.Euler(0,90,0)
    }))
    emissiveBoxEntityW1.addComponent( shape )

    //floor
     const emissiveBoxEntityFloor = new Entity()
     if(floor){
        engine.addEntity(emissiveBoxEntityFloor)
    
        emissiveBoxEntityFloor.addComponent(new Transform({
            position: new Vector3(
                CONFIG.sizeX/2 ,
                0,
                CONFIG.sizeZ/2),
            scale: new Vector3(cubeWidth, cubeWidth, wallThickness)
            ,rotation:Quaternion.Euler(90,0,270)
        }))
        emissiveBoxEntityFloor.addComponent( shape )
    }

    //roof
     const emissiveBoxEntitySky = new Entity()
     engine.addEntity(emissiveBoxEntitySky)
 
     emissiveBoxEntitySky.addComponent(new Transform({
         position: new Vector3(
             CONFIG.sizeX/2,
             cubeHeight,
             CONFIG.sizeZ/2  ),
         scale: new Vector3(cubeWidth , cubeWidth, wallThickness)
         ,rotation:Quaternion.Euler(90,0,90)
     }))
     emissiveBoxEntitySky.addComponent( shape )
    
    //backwall
    const emissiveBoxEntityW2 = new Entity()
    engine.addEntity(emissiveBoxEntityW2)

    emissiveBoxEntityW2.addComponent(new Transform({
        position: new Vector3(
            CONFIG.sizeX/2 ,
            cubeHeight/2,
            CONFIG.sizeZ/2+ cubeWidth/2),
        scale: new Vector3(cubeWidth, cubeHeight, wallThickness)
        ,rotation:Quaternion.Euler(0,180,0)
    }))
    emissiveBoxEntityW2.addComponent( shape )

    //left
    const emissiveBoxEntityW3 = new Entity()
    engine.addEntity(emissiveBoxEntityW3)

    emissiveBoxEntityW3.addComponent(new Transform({
        position: new Vector3(
            CONFIG.sizeX/2 + cubeWidth/2,
            cubeHeight/2,
            CONFIG.sizeZ/2),
        scale: new Vector3(cubeWidth, cubeHeight, wallThickness)
        ,rotation:Quaternion.Euler(0,270,0)
    }))
    emissiveBoxEntityW3.addComponent( shape )


    //front door
    const emissiveBoxEntityW4 = new Entity()
    engine.addEntity(emissiveBoxEntityW4)

    emissiveBoxEntityW4.addComponent(new Transform({
        position: new Vector3(
            CONFIG.sizeX/2 ,
            (cubeHeight+frontDoorOffsetHeight)/2,
            CONFIG.sizeZ/2- (cubeWidth+frontDoorOffsetWidth)/2),
        scale: new Vector3(cubeWidth, cubeHeight-frontDoorOffsetHeight, wallThickness)
    }))
    emissiveBoxEntityW4.addComponent( shape )

    const emissiveWalls = [emissiveBoxEntityW4,emissiveBoxEntityW1,emissiveBoxEntityW2,emissiveBoxEntityW3,emissiveBoxEntityFloor,emissiveBoxEntitySky]
    
    for(const p in emissiveWalls){
        emissiveWalls[p].addComponent( material )
    }

    return emissiveWalls
}

function show(list:Entity[]|Entity){
    if(list instanceof Entity){
        engine.addEntity(list)
    }else{
        for(const p in list){
            engine.addEntity(list[p])
        }
    }
} 
function hide(list:Entity[]|Entity){
    if(list instanceof Entity){
        engine.removeEntity(list)
    }else{
        for(const p in list){
            engine.removeEntity(list[p])
        }
    } 
} 
const seperationDist = 1
const emissiveInnerWalls = createBox(emissiveBox, emissiveBoxMat, cubeWidth-seperationDist, cubeHeight, wallThickness,(frontDoorOffsetWidth)*-1,frontDoorOffsetHeight,true)
const emissiveInvisibleInnerWalls = createBox(emissiveBox, RESOURCES.materials.transparent, cubeWidth, cubeHeight, wallThickness+.2,(frontDoorOffsetWidth-.75)*-1,frontDoorOffsetHeight,false)
const outerWalls = createBox(outerBox, outerBoxMat, cubeWidth,cubeHeight, wallThickness,frontDoorOffsetWidth,frontDoorOffsetHeight-.1,false)
  
let normalPlaneShape = RESOURCES.models.instances.outerPlaneShape
for(const p in outerWalls){
    outerWalls[p].addComponentOrReplace( normalPlaneShape )
}

function toggleInsideGroundLines(val:boolean){
    if(!INSIDE_ADD_GROUND_OUTLINE) return

    if(val){
        //pink box
        emissiveInnerWalls[emissiveInnerWalls.length - 2].addComponentOrReplace( RESOURCES.materials.emissiveBoxMatOutline )

        //then black box
        const shrinkBox = .7
        const emissiveBoxEntityFloor = new Entity()   
        engine.addEntity(emissiveBoxEntityFloor)
        emissiveBoxEntityFloor.addComponent(new Transform({
            position: new Vector3(
                CONFIG.sizeX/2  ,
                0.05,
                CONFIG.sizeZ/2 + shrinkBox*1.5),
            scale: new Vector3(cubeWidth-shrinkBox*5, cubeHeight-shrinkBox*2, .01)
            ,rotation:Quaternion.Euler(90,0,270)
        }))
        emissiveBoxEntityFloor.addComponent( emissiveBox )
        emissiveBoxEntityFloor.addComponentOrReplace( RESOURCES.materials.emissiveBoxMat )
    }else{
        //pink box
        emissiveInnerWalls[emissiveInnerWalls.length - 2].addComponentOrReplace( RESOURCES.materials.emissiveBoxMat )
        /*
        //then black box
        const shrinkBox = .7
        const emissiveBoxEntityFloor = new Entity()   
        engine.addEntity(emissiveBoxEntityFloor)
        emissiveBoxEntityFloor.addComponent(new Transform({
            position: new Vector3(
                CONFIG.sizeX/2  ,
                0.05,
                CONFIG.sizeZ/2 + shrinkBox*1.5),
            scale: new Vector3(cubeWidth-shrinkBox*5, cubeHeight-shrinkBox*2, .01)
            ,rotation:Quaternion.Euler(90,0,270)
        }))
        emissiveBoxEntityFloor.addComponent( emissiveBox )
        emissiveBoxEntityFloor.addComponentOrReplace( RESOURCES.materials.emissiveBoxMat )*/
    }
}

CONFIG.toggleInsideGroundLines = toggleInsideGroundLines



//hide(emissiveInnerWalls)
//hide(outerWalls[2])
//hide(emissiveInvisibleInnerWalls)
//hide(outerWalls[0])
//hide(outerWalls)
//hide(emissiveInvisibleInnerWalls)
//hide(outerWalls)

//show(emissiveInnerWalls[emissiveInnerWalls.length - 2])

const triggerAreaNearBuilding = new Entity()
triggerAreaNearBuilding.addComponent(new Transform({
    position: new Vector3(
        CONFIG.sizeX/2,
        cubeHeight/2,
        CONFIG.sizeZ/2-nearBuildingWidthOffset/2 ),
    scale: new Vector3(cubeWidth, cubeHeight, cubeWidth)
}))
engine.addEntity(triggerAreaNearBuilding)


const triggerAreaNearScene = new Entity()
triggerAreaNearScene.addComponent(new Transform({
    position: new Vector3(
        CONFIG.sizeX/2,
        cubeHeight/2,
        CONFIG.sizeZ/2 ),
    scale: new Vector3(cubeWidth, cubeHeight, cubeWidth)
}))
engine.addEntity(triggerAreaNearScene)


const triggerAreaInBuilding = new Entity()
triggerAreaInBuilding.addComponent(new Transform({
    position: new Vector3(
        CONFIG.sizeX/2,
        cubeHeight/2,
        CONFIG.sizeZ/2 + inBuildingWidthZOffset/2),
    scale: new Vector3(1, 1, 1)
}))
engine.addEntity(triggerAreaInBuilding)


const triggerAreaInLeaveBuilding = new Entity()
triggerAreaInLeaveBuilding.addComponent(new Transform({
    position: new Vector3(
        CONFIG.sizeX/2,
        cubeHeight/2,
        CONFIG.sizeZ/2 - (cubeWidth/2) + inBuildingWidthZOffset/2 ),
    scale: new Vector3(cubeWidth, cubeHeight, cubeWidth)
}))
engine.addEntity(triggerAreaInLeaveBuilding)


const nearSceneOffset = 13
triggerAreaNearScene.addComponent(new utils.TriggerComponent(
    new utils.TriggerBoxShape( new Vector3( CONFIG.sizeX + nearSceneOffset ,cubeHeight,CONFIG.sizeZ + nearSceneOffset ) ),
    {
        onCameraEnter:()=>{
            log("near scene")
            toggleBallsNearScene(true)
        },
        onCameraExit:()=>{
            log("far from scene")
            toggleBallsNearScene(false)
        },
        enableDebug: false
    }
))

const holeSystem:ISystem = new HoleUpdateSystem()

triggerAreaNearBuilding.addComponent(new utils.TriggerComponent(
    new utils.TriggerBoxShape( new Vector3( nearBuildingWidth ,cubeHeight,nearBuildingWidth ) ),
    {
        onCameraEnter:()=>{
            log("near building")
            if(!holeSystem.active){
                engine.addSystem(holeSystem)
                log("added hole system")
            }
        },
        onCameraExit:()=>{
            log("far from building")
            if(holeSystem.active){
                engine.removeSystem(holeSystem)
                log("removing hole system")
            } 
        },
        enableDebug: false
    }
))



triggerAreaInBuilding.addComponent(new utils.TriggerComponent(
    new utils.TriggerBoxShape( new Vector3( inBuildingWidthX  ,cubeHeight,inBuildingWidthZ - inBuildingWidthZOffset/2 ) ),
    {
        onCameraEnter:()=>{
            log("in building")
            booleanHoleToggleInBuilding(true)
            animationToggleInBuilding(true)
            ballsToggleInBuilding(true) 
            //toggleInsideGroundLines(false)
            //updateHoleDiv( 1.5)    
        },
        onCameraExit:()=>{
            log("left building")
            booleanHoleToggleInBuilding(false)
            animationToggleInBuilding(false)
            ballsToggleInBuilding(false) 
            //toggleInsideGroundLines(true)
            //updateHoleDiv( 3)    
        },
        enableDebug: false
    }
))




triggerAreaInLeaveBuilding.addComponent(new utils.TriggerComponent(
    new utils.TriggerBoxShape( new Vector3( inBuildingWidthX ,cubeHeight,7 ) ),
    {
        onCameraEnter:()=>{
            log("near inner building exit")
             
        },
        onCameraExit:()=>{
           log("far from inner building exit")
           //updateHoleActivateDistance( 10)
             
        },
        enableDebug: false
    }
))


//ground plane
const ground = new Entity()
ground.addComponent(new GLTFShape("models/ground.glb"))
engine.addEntity(ground)