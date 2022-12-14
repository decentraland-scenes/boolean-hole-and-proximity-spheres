
export const INVISIBLE_MATERIAL = new BasicMaterial()
const INVISIBLE_MATERIAL_texture = new Texture('images/transparent-texture.png')
INVISIBLE_MATERIAL.texture = INVISIBLE_MATERIAL_texture
INVISIBLE_MATERIAL.alphaTest = 1



const emissiveBoxMat = new BasicMaterial()
emissiveBoxMat.castShadows = false
emissiveBoxMat.texture = new Texture('images/black.png')
/*
emissiveBoxMat.albedoColor = Color4.Black()//Color4.White()
emissiveBoxMat.emissiveColor = Color3.Black()
emissiveBoxMat.emissiveIntensity = 0 
emissiveBoxMat.reflectivityColor = Color3.Black()
emissiveBoxMat.specularIntensity = 0
emissiveBoxMat.metallic = 0
emissiveBoxMat.roughness = 1  */


const emissiveBoxMatOutline = new Material()
emissiveBoxMatOutline.albedoColor = Color4.Purple()//Color4.White()
emissiveBoxMatOutline.emissiveColor = Color3.Purple()
emissiveBoxMatOutline.emissiveIntensity = 10 
emissiveBoxMatOutline.reflectivityColor = Color3.Purple()
emissiveBoxMatOutline.specularIntensity = 0
emissiveBoxMatOutline.metallic = 0
emissiveBoxMatOutline.roughness = 1  



const outerBoxMat = new Material()
outerBoxMat.albedoColor = Color4.Black()
outerBoxMat.emissiveColor = Color3.Black()
outerBoxMat.emissiveIntensity = 10 
outerBoxMat.reflectivityColor = Color3.Black()
outerBoxMat.metallic = 1
outerBoxMat.roughness = 0

let normalPlaneShape = new GLTFShape('models/opaque_plane.glb')


export const RESOURCES = {
        models:{
          names:{
            
          },
          instances:{
            outerPlaneShape:normalPlaneShape
          }
        },
        textures: {
          //sprite_sheet: spriteSheetTexture,
          transparent: INVISIBLE_MATERIAL_texture
        },
        materials: {
          //sprite_sheet: spriteSheetMaterial
          transparent: INVISIBLE_MATERIAL,
          emissiveBoxMat: emissiveBoxMat,
          emissiveBoxMatOutline: emissiveBoxMatOutline,
          outerBoxMat: emissiveBoxMat
        },
        strings:{
           
        },
        images:{
          portrait:{
          }
        }
      }
