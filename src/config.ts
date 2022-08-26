const ParcelCountX:number = 3
const ParcelCountZ:number = 3
export class Config{
  sizeX!:number
  sizeY!:number
  sizeZ!:number

  BUIDING_HEIGHT = 16
  BOOLEAN_HEIGHT = 4
  BUIDING_WIDTH = 16

  center!:Vector3
  centerGround!:Vector3
  size!:Vector3

  //cyclic deps workaround
  toggleInsideGroundLines!:(val:boolean)=>void
  
  init(){
    this.sizeX = ParcelCountX*16
    this.sizeZ = ParcelCountZ*16 
    this.sizeY = (Math.log((ParcelCountX*ParcelCountZ) + 1) * Math.LOG2E) * 20// log2(n+1) x 20 //Math.log2( ParcelScale + 1 ) * 20
    this.size = new Vector3(this.sizeX,this.sizeY,this.sizeZ)
    this.center = new Vector3(this.sizeX/2,this.sizeY/2,this.sizeZ/2)
    this.centerGround = new Vector3(this.sizeX/2,0,this.sizeZ/2)
  }
}

export const CONFIG = new Config()
CONFIG.init()