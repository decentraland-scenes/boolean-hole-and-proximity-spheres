

const sphereMask = new Texture("images/circle_clip_rad_blue.png")
const sphereEmissive = sphereMask//new Texture("images/circle_clip_rad_blue.png")
const sphereMaskBump = new Texture("images/circle_clip_rad.png")
const sphereMaskAlbedo = new Texture("images/circle_clip_rad_black.png")

export const ORIG_COLOR = Color3.Black()

export function makeBaseMaterial(){
  const BASE_MATERIAL = new Material()

  //BASE_MATERIAL.albedoColor = Color4.Black()
  //BASE_MATERIAL.emissiveColor = Color3.Black()
  //BASE_MATERIAL.albedoColor = Color4.White()
  BASE_MATERIAL.emissiveColor = ORIG_COLOR
  BASE_MATERIAL.emissiveIntensity = 10 

  //BASE_MATERIAL.reflectivityColor = Color3.White()
  //BASE_MATERIAL.metallic = 1
  //BASE_MATERIAL.roughness = 0

  //BASE_MATERIAL.transparencyMode = 1
  //BASE_MATERIAL.bumpTexture = sphereMaskBump
  
  BASE_MATERIAL.albedoTexture = sphereMaskAlbedo
  BASE_MATERIAL.emissiveTexture = sphereEmissive
  BASE_MATERIAL.alphaTexture = sphereMask
  BASE_MATERIAL.alphaTest = 1

  return BASE_MATERIAL
}

export class MaterialEntity{
  name:string
  material:Material
  alive:boolean = true
  constructor(name:string,material:Material){
    this.name= name
    this.material = material
  }
}

export class MaterialSpawner {
  name:string
  MAX_POOL_SIZE:number
  entityPool: MaterialEntity[]

  constructor(name:string,maxPoolSize:number,initSize:number){
    this.name = name
    this.MAX_POOL_SIZE= maxPoolSize //scene.scale * 24
    this.entityPool = []
    for(let x=0;x<initSize;x++){
      this.getEntityFromPool()
    }
    this.removeAll() 
  }

  removeEntity(materialEntity:MaterialEntity){
    materialEntity.alive = false
    materialEntity.material.emissiveColor = ORIG_COLOR
    //entity.addComponentOrReplace(new Hidden())
  }

  //TODO maybe use generics so can have a common spawnEntity method
  //spawnEntity(x:number, y:number, z:number, rot:number):Entity {
  //  return null
  //}   

  releasePool(){
    //SHOULD WE REMOVE ALL BEFORE EMPTYING POOL?
    this.entityPool = []
  }

  removeAll(){
    for (let i = 0; i < this.entityPool.length; i++) {
      if (this.entityPool[i].alive) {
        this.removeEntity(this.entityPool[i])
      }
    }
  }

  createNewPoolEntity(cnt?:number){
    return new MaterialEntity(this.name+"pool-ent"+cnt, makeBaseMaterial())
  }

  getEntityFromPool(): MaterialEntity | undefined {     
    
      // Check if an existing entity can be used
      for (let i = 0; i < this.entityPool.length; i++) {
        if (!this.entityPool[i].alive) {
          //log("pool return",this.entityPool[i].name)
          this.entityPool[i].alive = true
          return this.entityPool[i]
        }
      } 
      // If none of the existing are available, create a new one, unless the maximum pool size is reached
      if (this.entityPool.length < this.MAX_POOL_SIZE) {
        const instance = this.createNewPoolEntity(this.entityPool.length)
        instance.alive = true
        this.entityPool.push(instance)
        return instance
      }

      log("AbstractSpawner.getEntityFromPool() WARNING",this.name," pool exhausted all ",this.MAX_POOL_SIZE,"objects")
      return undefined
    
     
  }


}
