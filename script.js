let scene, camera, renderer, balls = [], gravity, walls = [], light;

document.getElementById('overlay').addEventListener('click', () => {
  document.getElementById('overlay').style.display = 'none';
  init();
  requestOrientationPermission();
});

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 0).normalize();
  scene.add(light);

  // Create walls to define the boundaries of the box
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
  const wallGeometry = new THREE.PlaneGeometry(window.innerWidth / 100, window.innerHeight / 100);

  // Create the walls: left, right, top, bottom, front, back
  let positions = [
    { x: -window.innerWidth / 200, y: 0, z: 0, rotation: { x: 0, y: Math.PI / 2, z: 0 } }, // left
    { x: window.innerWidth / 200, y: 0, z: 0, rotation: { x: 0, y: -Math.PI / 2, z: 0 } }, // right
    { x: 0, y: window.innerHeight / 200, z: 0, rotation: { x: -Math.PI / 2, y: 0, z: 0 } }, // top
    { x: 0, y: -window.innerHeight / 200, z: 0, rotation: { x: Math.PI / 2, y: 0, z: 0 } }, // bottom
    { x: 0, y: 0, z: -5, rotation: { x: 0, y: 0, z: 0 } }, // back
    { x: 0, y: 0, z: 5, rotation: { x: Math.PI, y: 0, z: 0 } } // front
  ];

  positions.forEach(pos => {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(pos.x, pos.y, pos.z);
    wall.rotation.set(pos.rotation.x, pos.rotation.y, pos.rotation.z);
    scene.add(wall);
    walls.push(wall);
  });

  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0x000000, 0xffa500, 0x8a2be2];
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: colors[i] });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2);
    scene.add(ball);
    balls.push(ball);
  }

  animate();
}

function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          alert("Permission denied for device orientation.");
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

function handleOrientation(event) {
  const beta = event.beta ? event.beta : 0; // X-axis rotation in degrees.
  const gamma = event.gamma ? event.gamma : 0; // Y-axis rotation in degrees.

  gravity = new THREE.Vector3(gamma / 90, beta / 90, 0);

  // Adjust light position based on device orientation
  light.position.set(-gamma / 9, -beta / 9, 10).normalize();

  balls.forEach(ball => {
    ball.position.add(gravity);
    ball.geometry.vertices.forEach(vertex => {
      vertex.add(new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1));
    });
    ball.geometry.verticesNeedUpdate = true;

    // Collision detection with box walls
    if (ball.position.x > window.innerWidth / 200 || ball.position.x < -window.innerWidth / 200) ball.position.x *= -1;
    if (ball.position.y > window.innerHeight / 200 || ball.position.y < -window.innerHeight / 200) ball.position.y *= -1;
    if (ball.position.z > 5 || ball.position.z < -5) ball.position.z *= -1;
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
