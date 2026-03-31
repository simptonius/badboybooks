(function() {
  const GLB_URL = 'https://simptonius.github.io/badboybooks/book2-v6.glb';

  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.01, 100);
  camera.position.set(0, 0, window.innerWidth <= 768 ? 8 : 5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(1, 3, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xddeeff, 0.3);
  fill.position.set(-4, 1, 2); scene.add(fill);
  const rimLeft = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLeft.position.set(-3, 0, -2); scene.add(rimLeft);
  const rimRight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimRight.position.set(3, 0, -2); scene.add(rimRight);
  const orangeDir = new THREE.DirectionalLight(0xff5500, 1.8);
  orangeDir.position.set(0, -3, 2); scene.add(orangeDir);
  const fireLight = new THREE.PointLight(0xff6600, 4.0, 12);
  fireLight.position.set(0, -2.5, 1.5); scene.add(fireLight);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const loader = new THREE.GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    GLB_URL,
    function(gltf) {
      const mesh = gltf.scene;
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      mesh.position.sub(center);
      mesh.scale.setScalar(2.4 / Math.max(size.x, size.y, size.z));
      mesh.traverse(function(child) {
        if (child.isMesh && child.material) {
          var mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(function(mat) {
            mat.color = new THREE.Color(mat.map ? 0xaaaaaa : 0xffffff);
            mat.metalness = 0.0;
            mat.roughness = 0.7;
          });
        }
      });
      pivot.add(mesh);
      var el = document.getElementById('loading');
      if (el) el.style.display = 'none';
    },
    function(xhr) {
      var el = document.getElementById('loading');
      if (el && xhr.total) el.textContent = 'Loading... ' + Math.round(xhr.loaded/xhr.total*100) + '%';
    },
    function(err) {
      var el = document.getElementById('loading');
      if (el) el.textContent = 'Error loading model';
      console.error(err);
    }
  );

  var drag=false, px=0, py=0, vy=0.0005, vx=0, ry=0.45, rx=-0.05;
  canvas.addEventListener('mousedown', function(e){drag=true;px=e.clientX;py=e.clientY;});
  window.addEventListener('mousemove', function(e){
    if(!drag)return; vy=(e.clientX-px)*.003; vx=(e.clientY-py)*.003;
    ry+=vy; rx+=vx; px=e.clientX; py=e.clientY;
  });
  window.addEventListener('mouseup', function(){drag=false;});
  canvas.addEventListener('touchstart', function(e){drag=true;px=e.touches[0].clientX;py=e.touches[0].clientY;},{passive:true});
  canvas.addEventListener('touchmove', function(e){
    e.preventDefault();
    vy=(e.touches[0].clientX-px)*.003; vx=(e.touches[0].clientY-py)*.003;
    ry+=vy; rx+=vx; px=e.touches[0].clientX; py=e.touches[0].clientY;
  },{passive:false});
  canvas.addEventListener('touchend', function(){drag=false;});
  window.addEventListener('resize', function(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  setTimeout(function(){
    var el = document.getElementById('hint');
    if(el) el.style.opacity=0;
  }, 3000);

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    clock.getDelta();
    if(!drag){vy=vy*.98+.0001;vx*=.98;}
    ry+=vy; rx+=vx;
    rx=Math.max(-Math.PI/3,Math.min(Math.PI/3,rx));
    pivot.rotation.y=ry; pivot.rotation.x=rx;
    var e=clock.getElapsedTime();
    fireLight.intensity=4+Math.sin(e*4.1)*.8+Math.sin(e*9.3)*.4+Math.random()*.2;
    renderer.render(scene,camera);
  }
  animate();
})();
