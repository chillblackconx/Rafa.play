let currentUser = null;

const loginModal = document.getElementById("loginModal");
const uploadModal = document.getElementById("uploadModal");

document.getElementById("accountBtn")
  .addEventListener("click", () => {
    loginModal.style.display = "flex";
  });

document.getElementById("uploadBtn")
  .addEventListener("click", () => {
    if(!currentUser){
      alert("Connecte-toi !");
      return;
    }
    uploadModal.style.display = "flex";
  });

document.getElementById("closeLogin")
  .addEventListener("click", () => {
    loginModal.style.display = "none";
  });

document.getElementById("closeUpload")
  .addEventListener("click", () => {
    uploadModal.style.display = "none";
  });

document.getElementById("createAccount")
  .addEventListener("click", async () => {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const logoFile = document.getElementById("userLogo").files[0];

    if(!username || !password){
        alert("Remplis tout !");
        return;
    }

    let logoUrl = "";

    if(logoFile){
        const { data } = await supabaseClient
            .storage
            .from("logos")
            .upload(username + "_" + Date.now(), logoFile);

        logoUrl = supabaseClient
            .storage
            .from("logos")
            .getPublicUrl(data.path).data.publicUrl;
    }

    const { error } = await supabaseClient
        .from("users")
        .insert([{ id: username, username, password, logo: logoUrl }]);

    if(error){
        alert(error.message);
        return;
    }

    currentUser = { username, logo: logoUrl };
    alert("Compte créé !");
    loginModal.style.display = "none";
});

document.getElementById("publishVideo")
  .addEventListener("click", async () => {

    const title = document.getElementById("titleInput").value;
    const thumbFile = document.getElementById("thumbnailInput").files[0];
    const videoFile = document.getElementById("videoInput").files[0];

    if(!title || !thumbFile || !videoFile){
        alert("Remplis tout !");
        return;
    }

    const id = Math.random().toString(36).substring(2,10);

    const { data: thumbData } = await supabaseClient
        .storage
        .from("videos")
        .upload("thumb_" + id, thumbFile);

    const thumbUrl = supabaseClient
        .storage
        .from("videos")
        .getPublicUrl(thumbData.path).data.publicUrl;

    const { data: videoData } = await supabaseClient
        .storage
        .from("videos")
        .upload("video_" + id, videoFile);

    const videoUrl = supabaseClient
        .storage
        .from("videos")
        .getPublicUrl(videoData.path).data.publicUrl;

    await supabaseClient
        .from("videos")
        .insert([{
            id,
            title,
            thumbnail: thumbUrl,
            video_url: videoUrl,
            channel: currentUser.username,
            views: 0,
            likes: 0
        }]);

    alert("Vidéo publiée !");
    uploadModal.style.display = "none";
    loadVideos();
});

async function loadVideos(){
    const { data } = await supabaseClient
        .from("videos")
        .select("*")
        .order("created_at", { ascending:false });

    const grid = document.getElementById("videoGrid");
    grid.innerHTML = "";

    data.forEach(v => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${v.thumbnail}" class="thumb">
            <div class="title">${v.title}</div>
        `;
        card.addEventListener("click", () => {
            window.location = "watch.html?v=" + v.id;
        });
        grid.appendChild(card);
    });
}

loadVideos();
