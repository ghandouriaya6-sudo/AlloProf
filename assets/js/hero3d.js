// ===== AlloProf — assets/js/hero3d.js =====
// Fond 3D léger (Three.js) pour les sections .hero qui contiennent un
// <canvas id="hero3d">. Script autonome (pas un module) : ne touche à
// aucun autre fichier, s'auto-désactive proprement si Three.js ou le
// canvas sont absents, et respecte prefers-reduced-motion.
(function () {
  function init() {
    var canvas = document.getElementById("hero3d");
    if (!canvas || typeof THREE === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var section = canvas.closest(".hero") || canvas.parentElement;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 18;

    function resize() {
      var w = section.clientWidth || 1;
      var h = section.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    /* ---- Nuage de particules aux couleurs de la marque (fine poussière) ---- */
    var COUNT = window.innerWidth < 720 ? 420 : 1000;
    var positions = new Float32Array(COUNT * 3);
    var colors = new Float32Array(COUNT * 3);
    var palette = [
      [0.365, 0.647, 1.0],  // bleu clair
      [0.15, 0.39, 0.92],   // bleu marque
      [0.98, 0.58, 0.28],   // orange clair
      [0.98, 0.45, 0.09]    // orange marque
    ];
    for (var i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      var c = palette[(Math.random() * palette.length) | 0];
      colors[i * 3 + 0] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    var mat = new THREE.PointsMaterial({
      size: 0.2, vertexColors: true, transparent: true, opacity: 0.8,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    /* ---- Deuxième couche : "bokeh" au premier plan, plus rares et plus gros ---- */
    var COUNT2 = window.innerWidth < 720 ? 24 : 55;
    var positions2 = new Float32Array(COUNT2 * 3);
    var colors2 = new Float32Array(COUNT2 * 3);
    for (var j = 0; j < COUNT2; j++) {
      positions2[j * 3 + 0] = (Math.random() - 0.5) * 30;
      positions2[j * 3 + 1] = (Math.random() - 0.5) * 16;
      positions2[j * 3 + 2] = (Math.random() - 0.5) * 8 + 4;
      var c2 = palette[(Math.random() * palette.length) | 0];
      colors2[j * 3 + 0] = c2[0];
      colors2[j * 3 + 1] = c2[1];
      colors2[j * 3 + 2] = c2[2];
    }
    var geo2 = new THREE.BufferGeometry();
    geo2.setAttribute("position", new THREE.BufferAttribute(positions2, 3));
    geo2.setAttribute("color", new THREE.BufferAttribute(colors2, 3));
    var mat2 = new THREE.PointsMaterial({
      size: 0.85, vertexColors: true, transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    var bokeh = new THREE.Points(geo2, mat2);
    scene.add(bokeh);

    /* ---- Grande sphère filaire décorative (profondeur) ---- */
    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(7, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 })
    );
    sphere.position.set(6, -2, -8);
    scene.add(sphere);

    /* ---- Parallax léger au mouvement de la souris ---- */
    var mouseX = 0, mouseY = 0;
    section.addEventListener("mousemove", function (e) {
      var r = section.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
    }, { passive: true });

    var running = true;
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
    });

    resize();
    window.addEventListener("resize", resize);

    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!running) return;
      var t = clock.getElapsedTime();
      points.rotation.y = t * 0.03 + mouseX * 0.3;
      points.rotation.x = mouseY * 0.15;
      bokeh.rotation.y = -t * 0.015 + mouseX * 0.15;
      bokeh.position.y = Math.sin(t * 0.4) * 0.6;
      sphere.rotation.y = t * 0.02;
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
