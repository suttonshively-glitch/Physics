import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,PlaneGeometry,CylinderGeometry,
  SessionMode,
  World,
  LocomotionEnvironment,EnvironmentType,
  CanvasTexture
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace,
  PhysicsBody, PhysicsShape, PhysicsShapeType, PhysicsState, PhysicsSystem,
  OneHandGrabbable, DistanceGrabbable,
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1

const assets = { };

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: { locomotion: true, grabbing: true },

}).then((world) => {

  const { camera } = world;

  world.registerSystem(PhysicsSystem).registerComponent(PhysicsBody).registerComponent(PhysicsShape);
  
  // Create a green sphere
  const sphereGeometry = new SphereGeometry(0.25, 32, 32);
  const greenMaterial = new MeshStandardMaterial({ color: "red" });
  const sphere = new Mesh(sphereGeometry, greenMaterial);
  sphere.position.set(0, 5, -3);
  const sphereEntity = world.createTransformEntity(sphere);
  sphereEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto,  density: 0.02,  friction: 0.5,  restitution: 0.9 });
  sphereEntity.addComponent(PhysicsBody, { state: PhysicsState.Dynamic });
  sphereEntity.addComponent(Interactable).addComponent(OneHandGrabbable);


  // create a floor
  const floorMesh = new Mesh(new PlaneGeometry(40, 20), new MeshStandardMaterial({color:"tan"}));
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  floorEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });
  floorEntity.addComponent(PhysicsShape, {shape: PhysicsShapeType.Auto, restitution: 0.9,});

  const cylinderGeometry = new CylinderGeometry(0.1, 0.1, 1, 32);
  const bat = new Mesh(cylinderGeometry, greenMaterial);
  bat.position.set(1, 1, -.5);
  bat.rotation.x = Math.PI / 2;
  const batEntity = world.createTransformEntity(bat);
  batEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto,  density: 0.2,  friction: 0.5,  restitution: 0.9 });
  batEntity.addComponent(PhysicsBody, { state: PhysicsState.Kinematic });
  batEntity.addComponent(Interactable).addComponent(OneHandGrabbable);


  const wallMesh = new Mesh(new PlaneGeometry(600, 10), new MeshStandardMaterial({color:"black"}));
  wallMesh.position.set(0, 5, -30);
  const wallEntity = world.createTransformEntity(wallMesh);
  
  wallEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });
  wallEntity.addComponent(PhysicsShape, {shape: PhysicsShapeType.Auto, restitution: 0.9,});

  console.log('a button pressed!');

  function gameLoop() {
    // code here runs every frame
    if (sphereEntity.position.z < -30) {
        sphereEntity.destroy()
    }

    const leftCtrl = world.input.gamepads.left
    if (leftCtrl?.gamepad.buttons[4].pressed) {
          console.log('x button pressed!');
          // do something like spawn a new object
          sphereEntity.position.set(0, 5, -3);
    }
    const rightCtrl = world.input.gamepads.right
    if (rightCtrl?.gamepad.buttons[4].pressed) {
          console.log('a button pressed!');
          // do something like spawn a new object
          batEntity.position.set(1, 1, -.5);
    }



    requestAnimationFrame(gameLoop);
  }
  gameLoop();













  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }







});
