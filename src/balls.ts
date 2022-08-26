import { CONFIG } from "./config"
import { IntervalUtil } from "./interval-util"
import { makeBaseMaterial, MaterialEntity, MaterialSpawner, ORIG_COLOR } from "./spawner"


const sidePaddingX = 0
const sidePaddingZ = 0
const BALL_HEIGHT_OFFSET = .5
const PROXY_RADIUS = 8 // 8
const MOVE_AMPLITUDE = 1
const SCALE = .7

const sphereShape = new SphereShape()
const boxShape = new BoxShape()
const cylinderShape = new CylinderShape()
const coneShape = new ConeShape()
const planeShape = new PlaneShape()
planeShape.withCollisions = false
const billboard = new Billboard(true,true,true)



sphereShape.withCollisions = false

const useCache=true;
const materialSpawner = new MaterialSpawner("materialSpawner",100,50)


const BASE_MATERIAL = makeBaseMaterial()
  
@Component("SphereBlack")
export class SphereBlack {
  originalPos: Vector3
  dir: Vector3
  originalColor: Color3
  glowColor: Color3
  elapsed: number = Math.random()
  multiplier:number = 0
  flying: boolean = false
  materialEntity?: MaterialEntity

  constructor(pos: Vector3, dir: Vector3) {
    this.originalPos = new Vector3(pos.x, pos.y, pos.z)
    this.dir = new Vector3(dir.x, dir.y, dir.z)
    this.originalColor = ORIG_COLOR 
    this.glowColor = Color3.FromHexString("#1188ff")
  }
}

export function realDistance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x
  const b = pos1.y - pos2.y
  const c = pos1.z - pos2.z
  return Math.sqrt(a * a + b * b + c * c)
}

let player = Camera.instance

const materialChangeInterval = new IntervalUtil(1000/10)

const proximitySystemInterval = new IntervalUtil(0)

class ProximitySystem {
  radius: number = PROXY_RADIUS
  amplitude: number = MOVE_AMPLITUDE
  sphereScale: number = SCALE
  group = engine.getComponentGroup(Transform, SphereBlack)
  elapsed: number = 0
  update(dt: number) {
    if(!proximitySystemInterval.update(dt)){
      return;
    }
    let flyingCount = 0
    let total = 0
    //TODO only compute balls I am closer to
    for (let sphere of this.group.entities) {

      const transform = sphere.getComponent(Transform)
      const sphereInfo = sphere.getComponent(SphereBlack)

      let playerDir = sphereInfo.originalPos.subtract(player.position)
      let dist = realDistance(sphereInfo.originalPos, player.position)
      let multiplier = (1 - dist / this.radius) * this.amplitude


      if (dist < this.radius) {
        if (!sphereInfo.flying) {
          sphereInfo.flying = true
 
          //sphere.getComponent(Material).emissiveColor = sphereInfo.originalColor
          //if(sphereInfo.materialEntity != undefined ) materialSpawner.removeEntity(sphereInfo.materialEntity)
          if(useCache){
            sphereInfo.materialEntity = materialSpawner.getEntityFromPool()
            if(sphereInfo.materialEntity !== undefined) sphere.addComponentOrReplace( sphereInfo.materialEntity?.material )
            //sphere.getComponent(Material).emissiveColor = sphereInfo.originalColor
          }
        }



        //transform.position = sphereInfo.originalPos.add(Vector3.Up().multiplyByFloats(multiplier, multiplier, multiplier))
        //log("multiplier",multiplier)
        if(sphereInfo.multiplier != multiplier){
          const newValT = sphereInfo.originalPos.add(playerDir.multiplyByFloats(multiplier, (-4 * multiplier), multiplier))
          newValT.y+=BALL_HEIGHT_OFFSET
          if( !transform.position.equals(newValT) ){
            transform.position = newValT
          }else{
          //log("same val p ") 
          }
        
          sphereInfo.elapsed += dt
          // transform.position.x += Math.sin( sphereInfo.elapsed *10) * multiplier
          // transform.position.y += Math.sin( sphereInfo.elapsed *8)* multiplier
          // transform.position.z += Math.sin( sphereInfo.elapsed *11)* multiplier
          // transform.scale.setAll(this.sphereScale - multiplier * this.sphereScale)
          if(materialChangeInterval.update(dt)){
            const newVal = Color3.Lerp(sphereInfo.originalColor, sphereInfo.glowColor, multiplier)
            const mat = sphere.getComponent(Material)
            if(!mat.emissiveColor?.equals(newVal) ){
              mat.emissiveColor = newVal
            }else{
              //log("same val")
            }
          }

          //don need look at for spheres
          if(sphere.hasComponent(billboard)==false) transform.lookAt(player.position)
        }
      }
      else {
        if (sphereInfo.flying) {
          sphereInfo.flying = false

          
          if(useCache){
            sphere.addComponentOrReplace( BASE_MATERIAL )
            if(sphereInfo.materialEntity != undefined ) materialSpawner.removeEntity(sphereInfo.materialEntity)
          }else{
            const mat = sphere.getComponent(Material)
            mat.emissiveColor = ORIG_COLOR
          }
          
        }
        if(sphereInfo.multiplier != multiplier){
          transform.position.copyFrom(sphereInfo.originalPos)
          if(sphere.hasComponent(PlaneShape)){
            transform.scale.setAll(this.sphereScale*2)
          }else{
            transform.scale.setAll(this.sphereScale)
          }
        }
      }
      
      sphereInfo.multiplier = multiplier

      if(sphereInfo.flying){
        flyingCount++
      }
      total++ 

      //log("total",total,"flying",flyingCount)
    }
    
  }
}
const proxySystem = new ProximitySystem()
// Add a new instance of the system to the engine
engine.addSystem(proxySystem)

export function toggleBallsNearScene(val:boolean){
  if(val && !(proxySystem as ISystem).active){
    engine.addSystem(proxySystem)
    log("added balls system")
  }
  if(!val && (proxySystem as ISystem).active){
    engine.removeSystem(proxySystem)
    log("removed balls system")
  }
}
export function ballsToggleInBuilding(val:boolean){
  log("ballsToggleInBuilding",val)
  if(!val){
    proximitySystemInterval.targetTime = 0
    //engine.addSystem(proxySystem)//need to fix distance to start reacting
  }else{
    proximitySystemInterval.targetTime = (1000/15)/1000 //seconds
    //engine.removeSystem(proxySystem)//need to fix distance to start reacting
  }
}

class SphereController {
  chunks: Entity[]
  center: Vector3
  sideLength: number = CONFIG.sizeX - sidePaddingX * 2 // 4 padding on each side
  rows: number = 24
  cols: number = 5
  spacing: number = this.sideLength / this.rows
  base: Vector3
  borderWidth: number

  constructor(cols: number, rows: number, sideLength: number, base: Vector3, borderWidth: number) {
    this.borderWidth = borderWidth
    this.sideLength = sideLength
    this.rows = rows
    this.cols = cols
    this.spacing = this.sideLength / this.rows
    this.chunks = []
    this.base = base
    this.center = CONFIG.centerGround.clone()//new Vector3(24,0,16)//Vector3.Zero()//
    this.addSpheres()
  }

  addSpheres() {
    let totalCnt = 0
    let sphereCount = 0

    const borderWithColumns = this.borderWidth //+ 1
    const borderWithRows = this.borderWidth //- 1

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if(i==0 || j ==0){
          continue
        }

        if (j > borderWithColumns && j < this.cols - borderWithColumns && i > borderWithRows && i < this.rows - borderWithRows) {
          continue
        }
        let mat = BASE_MATERIAL
        if(!useCache){
           mat = makeBaseMaterial()
        }

        let newPos = new Vector3(
          this.base.x + i * this.spacing,
          this.base.y + BALL_HEIGHT_OFFSET,
          this.base.z + j * this.spacing)

        const obj = new Entity()
        obj.addComponent(new Transform({
          position: new Vector3(
            newPos.x,
            newPos.y,
            newPos.z),
          scale: new Vector3(SCALE, SCALE, SCALE)
        }))
        obj.addComponent(new SphereBlack(
          new Vector3(
            newPos.x,
            newPos.y,
            newPos.z),
          newPos.subtract(this.center)
        ))
        //obj.addComponent(new SphereShape()).withCollisions = false    
        if (false){//totalCnt % 999 == 0) {
          obj.addComponent(boxShape)
          sphereCount++
        } else { 
          
          obj.addComponent(planeShape)
          //obj.addComponent(billboard)

          obj.addComponent(billboard)
          //obj.addComponent(boxShape)

          
        }

        totalCnt++
        obj.addComponent(mat)
        engine.addEntity(obj)
      }

    }

    log("created ", "total:", totalCnt, "spheres:", sphereCount, "")
  }
}
 
const cols = 24//32
const rows = 24//32
 
let sphereControl = new SphereController(rows, cols, CONFIG.sizeX - sidePaddingX, new Vector3(sidePaddingX, 0, sidePaddingZ), 6)
//let sphereControl2 = new SphereController(20,rows,CONFIG.sizeX - sidePaddingX*2,new Vector3(sidePaddingX,0,CONFIG.sizeZ - sidePaddingZ*(rows-1))))