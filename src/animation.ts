import * as utils from '@dcl/ecs-scene-utils'
import { CONFIG } from "./config";
import { RESOURCES } from './resources';
import { ShowEntityModel } from "./showEntity/showEntityModel";



//HOPFULLY ALL THE FLAGS YOU NEED TO ADJUST
const audioClipOutsidePath = 'sounds/ABrighterHeart.mp3'//ABrighterHeart.mp3
const audioClipInsidePath = 'sounds/blobMusic.mp3'
const AUDIO_VOLUME = .3 //0-1
const FRONT_DOOR_OFFSET_Z = 1 //move it a little because the boolean hole is thick

const resetAnim = true
const looping = true 
const speed = 1
//in seconds
const duration:number|undefined = 33 //how long animation should play (seconds) to match music
const interval:number|undefined = undefined
const DELAY_SHOW_START = 1 * 1000 //milliseconds
const animationModelPath = 'models/blobMusic.glb'//'models/shark.glb'
const activateAnimation = "Animation"//"swim"
const idleAnimation = "Idle"//"bite"
const MODEL_HEIGHT = 2.5



const animationSoundClip = new AudioClip(audioClipInsidePath)
export const animationSoundSource = new AudioSource(animationSoundClip)

const outsideSoundClip = new AudioClip(audioClipOutsidePath)
export const outsideSoundSource = new AudioSource(outsideSoundClip)

const animationSoundEntity = createEntitySound("animationSoundEntity",animationSoundSource,AUDIO_VOLUME)
const outsideSoundEntity = createEntitySound("outsideSoundEntity",outsideSoundSource,AUDIO_VOLUME)

function createEntitySound(name:string,audioClip:AudioClip|AudioSource,volume?:number){
    const entSound = new Entity(name)
    entSound.addComponent(new Transform())
    if(audioClip instanceof AudioClip ){
        entSound.addComponent(new AudioSource(audioClip))
    }else{
        entSound.addComponent(audioClip)
    }
    entSound.getComponent(AudioSource).volume = volume !== undefined ? volume : 0.5
    entSound.getComponent(AudioSource).loop = false
    engine.addEntity(entSound)
    entSound.setParent(Attachable.AVATAR)

    return entSound
}

const cameraModeModArea = new Entity()
cameraModeModArea.addComponent(
  new CameraModeArea({
    area: { box: new Vector3(CONFIG.BUIDING_WIDTH, 4, CONFIG.BUIDING_WIDTH) },
    cameraMode: CameraMode.FirstPerson,
  })
)
cameraModeModArea.addComponent(
  new Transform({
    position: CONFIG.centerGround.clone().addInPlace(new Vector3(0,MODEL_HEIGHT,0)),
  })
)
engine.addEntity(cameraModeModArea)

const playAgainEnt = new Entity()
playAgainEnt.addComponent( new BoxShape() )
playAgainEnt.addComponent(
  new Transform({
    position: CONFIG.centerGround.clone().addInPlace(new Vector3(0,MODEL_HEIGHT,FRONT_DOOR_OFFSET_Z)),
    scale: Vector3.One().scale(2)
  })
)
playAgainEnt.addComponent(RESOURCES.materials.transparent)
playAgainEnt.addComponent(new OnPointerDown(()=>{
    animationToggleInBuilding(true)
},{
    hoverText:"Activate"
}))
engine.addEntity(playAgainEnt)

const animationModel = new GLTFShape(animationModelPath)
const animationModelInst = new ShowEntityModel("ballanimation",animationModel,
    { 
        startInvisible: false,
        idleAnim:idleAnimation, 
        transform:new Transform({
        position: CONFIG.centerGround.clone().addInPlace(new Vector3(0,MODEL_HEIGHT,FRONT_DOOR_OFFSET_Z)),
        rotation: Quaternion.Euler(0, 180, 0),
        scale: new Vector3(1, 1, 1),
        })
  })

  animationModelInst.onPlayDurationStart = ()=>{
    log("onPlayDurationStart")
    

  }
  animationModelInst.onPlayDurationEnd = ()=>{
    log("onPlayDurationEnd")
    
    engine.addEntity(playAgainEnt)
    CONFIG.toggleInsideGroundLines(true)
  }

//always face player
//animationModelInst.entity.addComponent(new Billboard())


let playingShow = false
let timerActive = false

const timerEntity = new Entity()
engine.addEntity(timerEntity)

//const countDownEntity = new Entity()
//engine.addEntity(countDownEntity)

const soundFaderEntity = new Entity()
engine.addEntity(soundFaderEntity)
//timerEntity.addComponent(ut)

function toggleTimer(val:boolean,delay?:number,callback?:()=>void){
    if(val){
        const delayTime = delay ? delay : 0
        timerEntity.addComponentOrReplace(new utils.Delay(delayTime,callback))
        timerActive = true
    }else{
        if(timerEntity.hasComponent(utils.Delay)) timerEntity.removeComponent(utils.Delay)
        timerActive = false
    }
}
 //const fadeOutInSeconds = 3 //how many seconds till faded
 const faderDec = .05
 const faderInterval = 100 //ms
function fadeSound(audioSource:AudioSource){
    soundFaderEntity.addComponentOrReplace(new utils.Interval(faderInterval,()=>{
        audioSource.volume = Math.max(0,audioSource.volume - faderDec)
        //fading down
        if(audioSource.volume == 0){
            if(!playingShow){
                log("animationSoundSource volume zeroed, stoppping",audioSource.volume)
                audioSource.playing = false

                soundFaderEntity.removeComponent(utils.Interval)
            }  
        }
    }))
}
export function animationToggleInBuilding(val:boolean){
    log("animationToggleInBuilding",val)
    if(val){
        

        CONFIG.toggleInsideGroundLines(false)
        fadeSound(outsideSoundSource)

        animationModelInst.stop()
        animationSoundSource.playing = false
        animationSoundSource.volume = AUDIO_VOLUME
        
        //engine.addEntity(cameraModeModArea)

        toggleTimer(true,DELAY_SHOW_START,()=>{
            //animationModelInst
            animationModelInst.playAnimation( activateAnimation,!looping,duration,interval,speed,resetAnim )
            playingShow = true
            animationSoundSource.playOnce()
            outsideSoundSource.playing = false //stop it if still playing
        })

        //playAgainEnt.getComponent( OnPointerDown ).hoverText = "Play Again"

        engine.removeEntity(playAgainEnt)
    }else{
        CONFIG.toggleInsideGroundLines(true)
        //stop the show
        toggleTimer(false)
        playingShow = false
        animationModelInst.play()

        //engine.removeEntity(cameraModeModArea)//

        fadeSound(animationSoundSource)
        outsideSoundSource.volume = AUDIO_VOLUME
        outsideSoundSource.loop = true
        outsideSoundSource.playing = true

        engine.addEntity(playAgainEnt)
        
    }
}

