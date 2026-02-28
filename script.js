const supabase = window.supabase.createClient(
  "https://svvsvwvaskvyvcxudbdg.supabase.co",
  "sb_publishable_qYyRmfzb-ZUXXuX_90T1Rw_MGmrQ22X"
);

document.addEventListener("DOMContentLoaded", async () => {

  /* =========================
     VARIABLES
  ========================== */

  const pages = {
    home: document.getElementById("pageHome"),
    login: document.getElementById("pageLogin"),
    upload: document.getElementById("pageUpload")
  };

  const navHome = document.getElementById("navHome");
  const navLogin = document.getElementById("navLogin");
  const navUpload = document.getElementById("navUpload");

  const videoGrid = document.getElementById("videoGrid");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const doLogin = document.getElementById("doLogin");
  const doUpload = document.getElementById("doUpload");

  let { data: { user } } = await supabase.auth.getUser();

  /* =========================
     PAGE ANIMATION SYSTEM
  ========================== */

  function showPage(pageName) {
    Object.values(pages).forEach(page => {
      page.style.opacity = "0";
      page.style.transform = "translateY(20px)";
      setTimeout(() => page.style.display = "none", 200);
    });

    setTimeout(() => {
      pages[pageName].style.display = "block";
      setTimeout(() => {
        pages[pageName].style.opacity = "1";
        pages[pageName].style.transform = "translateY(0)";
      }, 10);
    }, 200);
  }

  /* =========================
     NAVIGATION
  ========================== */

  navHome.addEventListener("click", () => showPage("home"));

  navLogin.addEventListener("click", () => showPage("login"));

  navUpload.addEventListener("click", () => {
    if (!user) {
      alert("Tu dois être connecté !");
      showPage("login");
      return;
    }
    showPage("upload");
  });

  /* =========================
     AUTH SYSTEM
  ========================== */

  doLogin.addEventListener("click", async () => {

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Remplis tout !");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Si pas de compte → signup auto
      await supabase.auth.signUp({ email, password });
      alert("Compte créé !");
    } else {
      alert("Connecté !");
    }

    location.reload();
  });

  /* =========================
     UPLOAD VIDEO
  ========================== */

  doUpload.addEventListener("click", async () => {

    const title = document.getElementById("videoTitle").value;
    const file = document.getElementById("videoFile").files[0];

    if (!title || !file) {
      alert("Remplis tout !");
      return;
    }

    const fileName = Date.now() + "_" + file.name;

    const { error } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (error) {
      alert("Erreur upload !");
      return;
    }

    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    await supabase.from("videos").insert({
      title: title,
      video_url: data.publicUrl,
      user_id: user.id
    });

    alert("Vidéo publiée !");
    showPage("home");
    loadVideos();
  });

  /* =========================
     LOAD VIDEOS WITH ANIMATION
  ========================== */

  async function loadVideos() {

    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    videoGrid.innerHTML = "";

    data.forEach((video, index) => {

      const card = document.createElement("div");
      card.className = "card";
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";

      card.innerHTML = `
        <video src="${video.video_url}" class="thumb"></video>
        <div class="title">${video.title}</div>
      `;

      videoGrid.appendChild(card);

      // Animation apparition
      setTimeout(() => {
        card.style.transition = "0.4s";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);

    });
  }

  /* =========================
     INITIAL
  ========================== */

  showPage("home");
  loadVideos();

});
