let scene, camera, renderer, sun;
let planets = [], speeds = {}, orbits = {}, running = true;
const planetData = [
  { name: 'Mercury', size: 1, distance: 10, speed: 0.04, color: 0xaaaaaa },
  { name: 'Venus', size: 1.2, distance: 14, speed: 0.03, color: 0xffcc66 },
  { name: 'Earth', size: 1.3, distance: 18, speed: 0.025, color: 0x3399ff },
  { name: 'Mars', size: 1.1, distance: 22, speed: 0.02, color: 0xff3300 },
  { name: 'Jupiter', size: 2.5, distance: 28, speed: 0.01, color: 0xff9966 },
  { name: 'Saturn', size: 2.2, distance: 34, speed: 0.008, color: 0xffcc99 },
  { name: 'Uranus', size: 1.8, distance: 40, speed: 0.006, color: 0x66ccff },
  { name: 'Neptune', size: 1.7, distance: 46, speed: 0.005, color: 0x6666ff },
];

let tooltip = document.getElementById('tooltip');
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 70;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2);
  scene.add(light);

  // Sun
  sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  scene.add(sun);

  // Planets
  planetData.forEach(({ name, size, distance, speed, color }) => {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color });
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    planets.push({ mesh: planet, name, distance });
    speeds[name] = speed;
    orbits[name] = Math.random() * Math.PI * 2;
  });

  // Background stars
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 10000;
  const starPositions = [];

  for (let i = 0; i < starCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starPositions.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  // UI - sliders
  const slidersDiv = document.getElementById('sliders');
  planetData.forEach(({ name, speed }) => {
    const label = document.createElement('label');
    label.textContent = `${name} Speed:`;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0.001;
    slider.max = 0.1;
    slider.step = 0.001;
    slider.value = speed;
    slider.addEventListener('input', () => {
      speeds[name] = parseFloat(slider.value);
    });
    slidersDiv.appendChild(label);
    slidersDiv.appendChild(slider);
  });

  // Pause/Resume
  document.getElementById('pauseBtn').onclick = () => {
    running = !running;
    document.getElementById('pauseBtn').textContent = running ? 'Pause' : 'Resume';
  };

  // Theme toggle
  document.getElementById('themeBtn').onclick = () => {
    const ui = document.getElementById('ui');
    const dark = ui.classList.toggle('dark');
    document.body.style.background = dark ? '#111' : '#fff';
    renderer.setClearColor(dark ? 0x000000 : 0xffffff, 1);
  };

  // Events
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (running) {
    planetData.forEach(({ name }, i) => {
      orbits[name] += speeds[name];
      const planet = planets[i];
      const angle = orbits[name];
      planet.mesh.position.x = planet.distance * Math.cos(angle);
      planet.mesh.position.z = planet.distance * Math.sin(angle);
      planet.mesh.rotation.y += 0.01;
    });
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = planets.find(p => p.mesh === intersects[0].object);
    tooltip.textContent = planet.name;
    tooltip.style.left = event.clientX + 10 + 'px';
    tooltip.style.top = event.clientY + 10 + 'px';
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }

  renderer.render(scene, camera);
}
