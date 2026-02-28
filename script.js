const supabase = window.supabase.createClient(
  "https://svvsvwvaskvyvcxudbdg.supabase.co",
  "sb_publishable_qYyRmfzb-ZUXXuX_90T1Rw_MGmrQ22X"
);

document.addEventListener("DOMContentLoaded", async () => {

  const authArea = document.getElementById("authArea");
  const uploadBtn = document.getElementById("openUpload");
  const uploadModal = document.getElementById("uploadModal");
  const publish = document.getElementById("publish");
  const videoGrid = document.getElementById("videoGrid");

  let { data: { user } } = await supabase.auth.getUser();

  // ===== AUTH UI =====
  function renderAuth() {
    if (user) {
      authArea.innerHTML = `
        ${user.email}
        <button id="logout" class="button">Logout</button>
      `;

      document.getElementById("logout").addEventListener("click", async () => {
        await supabase.auth.signOut();
        location.reload();
      });

    } else {
      authArea.innerHTML = `
        <button id="login" class="button">Login</button>
      `;

      document.getElementById("login").addEventListener("click", async () => {
        const email = prompt("Email:");
        const password = prompt("Password:");

        await supabase.auth.signInWithPassword({ email, password });
        location.reload();
      });
    }
  }

  renderAuth();

  // ===== OPEN UPLOAD =====
  uploadBtn.addEventListener("click", () => {

    if (!user) {
      alert("Tu dois être connecté !");
      return;
    }

    uploadModal.style.display = "flex";
  });

  // ===== UPLOAD VIDEO =====
  publish.addEventListener("click", async () => {

    const file = document.getElementById("videoFile").files[0];
    const title = document.getElementById("videoTitle").value;

    if (!file || !title) {
      alert("Remplis tout");
      return;
    }

    const fileName = Date.now() + "_" + file.name;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Erreur upload");
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
    location.reload();
  });

  // ===== LOAD VIDEOS =====
  async function loadVideos() {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    videoGrid.innerHTML = "";

    data.forEach(video => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <video src="${video.video_url}" class="thumb"></video>
        <div class="title">${video.title}</div>
      `;

      videoGrid.appendChild(div);
    });
  }

  loadVideos();

});
