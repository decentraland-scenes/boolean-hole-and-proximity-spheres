import * as utils from '@dcl/ecs-scene-utils'
import { CONFIG } from "./config"
import { IntervalUtil } from "./interval-util"
import { RESOURCES } from "./resources"

let holeShape = new GLTFShape('models/hole_plane.glb')
let normalPlaneShape = RESOURCES.models.instances.outerPlaneShape

//let physicsCast = PhysicsCast.instance
let camera = Camera.instance

const tube_red = new GLTFShape('models/tube_red.glb')
const tube_green = new GLTFShape('models/tube_green.glb')
const tube_blue = new GLTFShape('models/tube_blue.glb')
const tube_yellow =new GLTFShape('models/tube_yellow.glb')

//player position only updates every 100ms anyway
const updatePlanesInterval = new IntervalUtil(1000/30)

export type CutPlaneArgs={
  fullHeight:number
  fullWidth:number
  pos:Vector3
  rotation:Quaternion
}

class CutPlane {
  tubeShapes:GLTFShape[]
  colliderPlane:Entity
  holePlane:Entity
  holeTube:Entity
  basePos:Vector3
  fullHeight:number
  fullWidth:number
  upperRowHeight:number = 1
  midRowHeight:number = 1
  bottomRowHeight:number = 1
  leftColWidth:number = 1
  centerColWidth:number = 1
  rightColWidth:number = 1
  leftBorderX:number = 1
  upperRowY:number
  midRowY:number
  bottomRowY:number = 1
  leftColX:number = 1
  centerColX:number = 1
  rightColX:number = 1

  lastRadius:number= -1

  //top row
  plane1:Entity
  plane2:Entity
  plane3:Entity

  //mid row
  plane4:Entity
  plane6:Entity

  //bottom row
  plane7:Entity
  plane8:Entity
  plane9:Entity

  planes:Entity[] = []


  constructor(args:CutPlaneArgs){

    this.fullHeight = args.fullHeight
    this.fullWidth = args.fullWidth

    const pos = args.pos
    const rotation = args.rotation
    
    this.tubeShapes = []
    this.tubeShapes.push(tube_red)
    this.tubeShapes.push(tube_green)
    this.tubeShapes.push(tube_blue)
    this.tubeShapes.push(tube_yellow)

    this.upperRowY = this.fullHeight/3
    this.midRowY = this.fullHeight/4
    
    this.basePos = new Vector3(pos.x,pos.y, pos.z)

    //top left
    this.plane1 = new Entity()
    this.plane1.addComponent(new Transform({
      position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
      ,rotation: rotation
    }))
    this.plane1.addComponent(normalPlaneShape)
    engine.addEntity(this.plane1)

    //top center
    this.plane2 = new Entity()
    this.plane2.addComponent(new Transform({
      position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
      ,rotation: rotation
    }))
    this.plane2.addComponent(normalPlaneShape)
    engine.addEntity(this.plane2)

    //top right
    this.plane3 = new Entity()
    this.plane3.addComponent(new Transform({
      position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
      ,rotation: rotation
    }))
    this.plane3.addComponent(normalPlaneShape)
    engine.addEntity(this.plane3)

    //mid left
    this.plane4 = new Entity()
    this.plane4.addComponent(new Transform({
      position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
    }))
    this.plane4.addComponent(normalPlaneShape)
    engine.addEntity(this.plane4)

    //mid right
    this.plane6 = new Entity()
    this.plane6.addComponent(new Transform({
      position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
      ,rotation: rotation
    }))
    this.plane6.addComponent(normalPlaneShape)
    engine.addEntity(this.plane6)

     //bottom left
     this.plane7 = new Entity()
     this.plane7.addComponent(new Transform({
       position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
       ,rotation: rotation
     }))
     this.plane7.addComponent(normalPlaneShape)
     engine.addEntity(this.plane7)
 
     //bottom center
     this.plane8 = new Entity()
     this.plane8.addComponent(new Transform({
       position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
       ,rotation: rotation
     }))
     this.plane8.addComponent(normalPlaneShape)
     engine.addEntity(this.plane8)
 
     //bottom right
     this.plane9 = new Entity()
     this.plane9.addComponent(new Transform({
       position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z)
       ,rotation: rotation
     }))
     this.plane9.addComponent(normalPlaneShape)
     engine.addEntity(this.plane9)

    
    this.colliderPlane = new Entity()
    this.colliderPlane.addComponent(new Transform({
      position: new Vector3(this.basePos.x, this.basePos.y, this.basePos.z),
      scale: new Vector3(8, 4.5, 1)
      ,rotation: rotation
    }))
    this.colliderPlane.addComponent(new PlaneShape()).visible = false
    //engine.addEntity(this.colliderPlane)

    this.holePlane = new Entity()
    this.holePlane.addComponent(new Transform({
      position: new Vector3(8,2,7.8),
      scale: new Vector3(0,0, 0)//init zeroed out
      ,rotation: rotation
    }))
    this.holePlane.addComponent(holeShape)
    engine.addEntity(this.holePlane)

    this.holeTube = new Entity()
    this.holeTube.addComponent(new Transform({
      position: new Vector3(0,0,0)
      ,rotation: rotation,//rotation: Quaternion.Euler(0,0,0),
      scale: new Vector3(1, 1, 1)//scale: new Vector3(0,0, 0)//init zeroed out to remove color rings //
    }))
    let idx = Math.floor(Math.random()*this.tubeShapes.length)
    this.holeTube.addComponent(this.tubeShapes[idx])
    
    this.holeTube.setParent(this.holePlane)

    this.planes.push(this.plane1)
    this.planes.push(this.plane2)
    this.planes.push(this.plane3)
    this.planes.push(this.plane4)
    //this.planes.push(this.plane5)
    this.planes.push(this.plane6)
    this.planes.push(this.plane7)
    this.planes.push(this.plane8)
    this.planes.push(this.plane9) 

    //this.hide(this.planes)
    for(const p in this.planes){
      //make then all tiny to start
      this.planes[p].getComponent(Transform).scale.scale(0)
  }
  }

  
  show(list:Entity[]|Entity){
    if(list instanceof Entity){
        engine.addEntity(list)
    }else{
        for(const p in list){
            engine.addEntity(list[p])
        }
    }
  } 
  hide(list:Entity[]|Entity){
    if(list instanceof Entity){
        engine.removeEntity(list)
    }else{
        for(const p in list){
            engine.removeEntity(list[p])
        }
    } 
  } 
  setMaterial(material:Material|BasicMaterial){
    for (let obj of this.planes){
      obj.addComponentOrReplace(material)
    }
  }

  setShape(shape?:Shape){
    for (let obj of this.planes){
      if(shape !== undefined){
        obj.addComponentOrReplace(shape)
      }else{
        if(obj.hasComponent(GLTFShape)) obj.removeComponent(GLTFShape)
      }
    }
  }
  
  updateHolePosition(pos:ReadOnlyVector3, radius:number,force?:boolean){

    const forceIt = force !== undefined && force
    if (radius < 0){
      radius = 0
    }

    if(!forceIt && this.lastRadius == radius){
      //log("no change")
      return
    }
    this.lastRadius = radius



    this.holePlane.getComponent(Transform).position = new Vector3(pos.x, pos.y, this.basePos.z)
    this.holePlane.getComponent(Transform).scale.set(radius*2, radius*2,1)

    this.midRowY = pos.y 
    this.centerColX = pos.x
    
    const p1T = this.plane1.getComponent(Transform)
    const p2T = this.plane2.getComponent(Transform)
    const p3T = this.plane3.getComponent(Transform)
    const p4T = this.plane4.getComponent(Transform)
    const p6T = this.plane6.getComponent(Transform)
    const p7T = this.plane7.getComponent(Transform)
    const p8T = this.plane8.getComponent(Transform)
    const p9T = this.plane9.getComponent(Transform)

    this.leftColX = (this.basePos.x - this.fullWidth/2) + 0.5 * ((pos.x-radius) - (this.basePos.x - this.fullWidth/2))
    this.upperRowY = (this.basePos.y - this.fullHeight/2) + 0.5 * (this.fullHeight + ((pos.y + radius) - (this.basePos.y - this.fullHeight/2)))
    this.upperRowHeight = (this.fullHeight - ((pos.y + radius) - (this.basePos.y - this.fullHeight/2)))
    this.leftColWidth = ((pos.x-radius) - (this.basePos.x - this.fullWidth/2))
    this.centerColWidth = radius*2
    this.rightColWidth = this.fullWidth - (this.centerColWidth + this.leftColWidth)
    this.rightColX = pos.x + radius + this.rightColWidth/2
    this.bottomRowHeight = this.fullHeight - (this.upperRowHeight + radius*2)
    this.bottomRowY = (this.basePos.y - this.fullHeight/2) + this.bottomRowHeight/2
    
    p1T.position.x = this.leftColX
    p1T.position.y = this.upperRowY
    p1T.scale.x = this.leftColWidth
    p1T.scale.y =  this.upperRowHeight

    p2T.position.x = pos.x
    p2T.position.y = this.upperRowY
    p2T.scale.x = this.centerColWidth
    p2T.scale.y = this.upperRowHeight

    p3T.position.x = this.rightColX
    p3T.position.y = this.upperRowY
    p3T.scale.x = this.rightColWidth
    p3T.scale.y = this.upperRowHeight

    p4T.position.x = this.leftColX
    p4T.position.y = pos.y
    p4T.scale.x = this.leftColWidth
    p4T.scale.y = 2*radius

    p6T.position.x = this.rightColX
    p6T.position.y = pos.y
    p6T.scale.x = this.rightColWidth
    p6T.scale.y = 2*radius

    p7T.position.x = this.leftColX
    p7T.position.y = this.bottomRowY
    p7T.scale.x = this.leftColWidth
    p7T.scale.y =  this.bottomRowHeight

    p8T.position.x = pos.x
    p8T.position.y = this.bottomRowY
    p8T.scale.x = this.centerColWidth
    p8T.scale.y = this.bottomRowHeight

    p9T.position.x = this.rightColX
    p9T.position.y = this.bottomRowY
    p9T.scale.x = this.rightColWidth
    p9T.scale.y = this.bottomRowHeight
  }

}

export type CutPlaneTemplateArgs = CutPlaneArgs &{
  spacing:number
  qty:number
}

class PlaneManager {

  activateDistance:number = 20
  updateHoleDiv:number = 3

  planeTemplate:CutPlaneArgs

  cutPlanes:CutPlane[]

  currentPlayerPositionCache:Vector3 = new Vector3()
  currentPositionCache:Vector3 = new Vector3()
  currentLastPositionCache:Vector3 = new Vector3()

  constructor(planeTemplate:CutPlaneTemplateArgs){
    this.cutPlanes = []

    this.planeTemplate = planeTemplate

    for(let i=0; i< planeTemplate.qty; i++){

      this.cutPlanes.push(new CutPlane({
        pos:new Vector3(planeTemplate.pos.x,planeTemplate.pos.y,planeTemplate.pos.z + i*planeTemplate.spacing),
        rotation: Quaternion.Euler(0,0,0),
        fullWidth: planeTemplate.fullWidth,
        fullHeight: planeTemplate.fullHeight
      }))
    }
  }

  updatePlanes(dt:number,force?:boolean,position?:Vector3){
    const forceIt = force !== undefined && force

    if(!forceIt && !updatePlanesInterval.update(dt)){
      //log("updatePlanes skip")
      return
    } 

    if(!forceIt && this.currentPlayerPositionCache.equals(camera.position)){
      //log("updatePlanes player did not move skip")
      return
    }
    if(position !== undefined){
      this.currentPlayerPositionCache.copyFrom(position)
    }else{
      this.currentPlayerPositionCache.copyFrom(camera.position)
    }

    const divBy = 5
    const updateHolDiv = this.updateHoleDiv
    for (let obj of this.cutPlanes){
      const dist = Math.abs(this.currentPlayerPositionCache.z - obj.basePos.z)
      let cameraX = this.currentPlayerPositionCache.x
      //let newPos = new Vector3(obj.basePos.x, obj.basePos.y, obj.basePos.z)
      //this.currentPositionCache.x = obj.basePos.x
      //this.currentPositionCache.y = obj.basePos.y
      //this.currentPositionCache.z = obj.basePos.z
      this.currentPositionCache.copyFrom(obj.basePos)

      const newPos = this.currentPositionCache

      if(cameraX < obj.basePos.x - obj.fullWidth/2 + 2- dist/divBy){
        newPos.x = obj.basePos.x - obj.fullWidth/2 + 2- dist/divBy
      }
      else if(cameraX > obj.basePos.x + obj.fullWidth/2 - (2- dist/divBy)){
        newPos.x = obj.basePos.x + obj.fullWidth/2 - (2- dist/divBy)
      }
      else{
        newPos.x = cameraX
      }
 

      if(dist < this.activateDistance){
        //log(obj,"updateHolePosition",dist)
        obj.updateHolePosition(newPos, 2- dist/updateHolDiv)
      }
      
    }
  }
}

const planeManagerList:PlaneManager[] = []

const QTY=10
const SPACING=.3
const FULL_WIDTH=16
const BOOLEAN_HEIGHT=CONFIG.BOOLEAN_HEIGHT
const FULL_HEIGHT=CONFIG.BUIDING_HEIGHT

const CENTER_OFFSET = 0//((SPACING*QTY)/2)
/*
const planeManager = new PlaneManager(
  {
    pos:CONFIG.center.multiply(new Vector3(1,0,1)).add(new Vector3(0,1.5,8-CENTER_OFFSET)),//
    rotation: Quaternion.Euler(0,0,0),
    fullWidth: FULL_WIDTH,
    fullHeight: FULL_HEIGHT,
    spacing:SPACING,
    qty:QTY 
  })*/

  /*
const planeManager2 = new PlaneManager(
  {
    pos: CONFIG.center.multiply(new Vector3(1,0,1)).subtract(new Vector3(0,0,8+CENTER_OFFSET)).add(new Vector3(0,1.5,0)),//
    rotation: Quaternion.Euler(0,0,0),
    fullWidth: FULL_WIDTH, 
    fullHeight: FULL_HEIGHT,
    spacing:SPACING,
    qty:QTY
  })


//planeManagerList.push(planeManager)
planeManagerList.push(planeManager2)*/

const planeMgr = new PlaneManager(
  {
    pos: CONFIG.center.multiply(new Vector3(1,0,1)).subtract(new Vector3(0,0,8+CENTER_OFFSET)).add(new Vector3(0,BOOLEAN_HEIGHT/2,0)),//
    rotation: Quaternion.Euler(0,0,0),
    fullWidth: FULL_WIDTH, 
    fullHeight: BOOLEAN_HEIGHT,
    spacing:SPACING,
    qty:QTY
  })


export function updateHoleActivateDistance(dist:number){
  for(const obj of planeManagerList) { 
    obj.activateDistance = dist
  }
}

export function updateHoleDiv(dist:number){
  log("updateHoleDiv",dist)
  for(const obj of planeManagerList) { 
    obj.updateHoleDiv = dist
  }
}

export function booleanHoleToggleInBuilding(val:boolean){
  if(val){
    planeMgr.cutPlanes[planeMgr.cutPlanes.length-1].setMaterial(RESOURCES.materials.emissiveBoxMat)
    planeMgr.cutPlanes[planeMgr.cutPlanes.length-1].setShape(new PlaneShape())
  }else{
    planeMgr.cutPlanes[planeMgr.cutPlanes.length-1].setShape(RESOURCES.models.instances.outerPlaneShape)
  }
}

//make interior match
//toggleInBuilding(true)

//planeMgr.cutPlanes[0].setMaterial(RESOURCES.materials.emissiveBoxMat)
//planeMgr.cutPlanes[0].setShape(new PlaneShape())
 
planeManagerList.push(planeMgr) 
 
//FIXME this is a workaround to solve places appearing outside of left boundary when scene starts ???
planeMgr.updatePlanes(0,true,CONFIG.center.clone())
 
 
export class HoleUpdateSystem implements ISystem{  
  
  cameraLookDirection:Vector3 = Vector3.Forward()  

  update(dt: number) { 
    for(const obj of planeManagerList) { 
      obj.updatePlanes(dt)  
    }
  }
}
