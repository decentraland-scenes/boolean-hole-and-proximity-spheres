import { CONFIG } from "./config"
import { getAndSetUserData } from "./userData"

const avatarModeArea = new AvatarModifierArea({
    area: {
      //x,z of size 8 grows beyond crane base size
      box: CONFIG.size.clone().subtract(new Vector3(1,1,1))
    }, 
    modifiers: [AvatarModifiers.HIDE_AVATARS], 
    excludeIds: []
  })

  executeTask(async () => {
    let player = await getAndSetUserData()
    if(player !== null && player !== undefined){
        log("adding current player to area hide modifier exclude list",player?.userId)
        avatarModeArea.excludeIds?.push(player?.userId)
    }else{
        log("WARNING!!! unable to add player to area hide modifier exclude list",player)
    }
  })


const modArea = new Entity("entireScene.hideAvatar")
engine.addEntity(modArea)
modArea.addComponent(
    avatarModeArea
  ) 
  const modAreaPos =  new Vector3().copyFrom(CONFIG.centerGround)
  //modAreaPos.y = (SceneData.raceElevationStartRange)
  modArea.addComponent(
    new Transform({ 
      position: modAreaPos
    })
  )
  

