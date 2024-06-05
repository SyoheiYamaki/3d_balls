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

  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
  const wallGeometry = new THREE.PlaneGeometry(window.innerWidth / 100, window.innerHeight / 100);

  let positions = [
    { x: -window.innerWidth / 200, y: 0, z: 0, rotation: { x: 0, y: Math.PI / 2, z: 0 } },
    { x: window.innerWidth / 200, y: 0, z: 0, rotation: { x: 0, y: -Math.PI / 2, z: 0 } },
    { x: 0, y: window.innerHeight / 200, z: 0, rotation: { x: -Math.PI / 2, y: 0, z: 0 } },
    { x: 0, y: -window.innerHeight / 200, z: 0, rotation: { x: Math.PI / 2, y: 0, z: 0 } },
    { x: 0, y: 0, z: -5, rotation: { x: 0, y: 0, z: 0 } },
    { x: 0, y: 0, z: 5, rotation: { x: Math.PI, y: 0, z: 0 } }
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
    ball.velocity = new THREE.Vector3(0, 0, 0);
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
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

function handleOrientation(event) {
  const beta = event.beta ? event.beta : 0;
  const gamma = event.gamma ? event.gamma : 0;

  const x = gamma / 45; // X-axis
  const y = beta / 45;  // Y-axis

  gravity = new THREE.Vector3(x, y, 0);

  light.position.set(-gamma / 9, -beta / 9, 10).normalize();
}

function animate() {
  requestAnimationFrame(animate);

  balls.forEach(ball => {
    ball.velocity.add(gravity.clone().multiplyScalar(0.01));
    ball.position.add(ball.velocity);

    // Collision detection with box walls
    if (ball.position.x > window.innerWidth / 200 - 0.5 || ball.position.x < -window.innerWidth / 200 + 0.5) {
      ball.velocity.x *= -1;
      ball.position.x = Math.max(Math.min(ball.position.x, window.innerWidth / 200 - 0.5), -window.innerWidth / 200 + 0.5);
    }
    if (ball.position.y > window.innerHeight / 200 - 0.5 || ball.position.y < -window.innerHeight / 200 + 0.5) {
      ball.velocity.y *= -1;
      ball.position.y = Math.max(Math.min(ball.position.y, window.innerHeight / 200 - 0.5), -window.innerHeight / 200 + 0.5);
    }
    if (ball.position.z > 5 - 0.5 || ball.position.z < -5 + 0.5) {
      ball.velocity.z *= -1;
      ball.position.z = Math.max(Math.min(ball.position.z, 5 - 0.5), -5 + 0.5);
    }

    // Ball-to-ball collision detection
    balls.forEach(otherBall => {
      if (ball !== otherBall) {
        const distance = ball.position.distanceTo(otherBall.position);
        if (distance < 1) {
          const direction = ball.position.clone().sub(otherBall.position).normalize();
          ball.velocity.add(direction.clone().multiplyScalar(0.05));
          otherBall.velocity.add(direction.clone().multiplyScalar(-0.05));
        }
      }
    });

    ball.geometry.vertices.forEach(vertex => {
      vertex.add(new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01));
    });
    ball.geometry.verticesNeedUpdate = true;
  });

  renderer.render(scene, camera);
}
