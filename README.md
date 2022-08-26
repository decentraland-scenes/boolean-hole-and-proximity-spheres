# Boolean Hole + Proximity Spheres

![demo](images/screenshot.png)


This example scene demonstrates several objects that react to your proximity.  Simulates a Boolean Hole in a wall, has objects that move over/around you, triggers to activate effects inside or outside the building.  

To conserve polygons it uses a plane + billboard affect to give the illusion of a sphere.

To conserve the amount of materials used it makes use of a object pool to reuse and reduce the amount of materials needed for the +300 spheres.

## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```bash
npm i -g decentraland
```

**Previewing the scene**

Open this folder on the command line, then run:

```
dcl start
```

Any dependencies are installed and then the CLI opens the scene in a new browser tab.

## Deploy to Decentraland

If you own any parcels of land in Decentraland, or have permissions to deploy to someone else's, you can publish this project.

1. Make sure the scene parcels in `scene.json` match those you own or have permissions on.
2. Run `dcl deploy` on the project folder
3. This will open a browser tab to confirm. Metamask will prompt you to sign.
   > Note: Make sure you are using the wallet that owns the parcels or has permissions.

### Deploy to a free server

If you don't own parcels in Decentraland or are not ready to publish your scene to the world, you can share your creations by uploading your scenes to a free hosting service.

See [Upload a preview](https://docs.decentraland.org/development-guide/deploy-to-now/) for instructions on how to do this.

## Resources

Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

Find more example scenes, tutorials and helper libraries in the [Awesome Repository](https://github.com/decentraland-scenes/Awesome-Repository).

If you need any help, join [Decentraland's Discord](https://dcl.gg/discord), where you'll find a vibrant community of other creators who are eager to help. You're sure to find help in the #SDK support channel.

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.

## Acknowledgements

Outside building sound [BrighterHeart.mp3](https://audionautix.com/Music/ABrighterHeart.mp3) is from [https://audionautix.com](https://audionautix.com)
[https://audionautix.com/creative-commons-music](https://audionautix.com/creative-commons-music)


Inside Building Sound [blobMusic.mp3](https://freesound.org/people/deadrobotmusic/sounds/575035/) is from [https://freesound.org](https://freesound.org)
[https://creativecommons.org/publicdomain/zero/1.0/](https://creativecommons.org/publicdomain/zero/1.0/)


