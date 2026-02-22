// ⚙️ Supabase
const SUPABASE_URL = "https://svvsvwvaskvyvcxudbdg.supabase.co";
const SUPABASE_KEY = "sb_publishable_qYyRmfzb-ZUXXuX_90T1Rw_MGmrQ22X";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// ==== MODAL ====
function openLogin(){ document.getElementById("loginModal").style.display="flex"; }
function closeLogin(){ document.getElementById("loginModal").style.display="none"; }
function openUpload(){
    if(!currentUser){ alert("Connecte-toi !"); return; }
    document.getElementById("uploadModal").style.display="flex";
}
function closeUpload(){ document.getElementById("uploadModal").style.display="none"; }

// ==== REGISTER / LOGIN ====
async function register(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const logoFile = document.getElementById("userLogo").files[0];

    if(!username || !password){ alert("Remplis tous les champs !"); return; }

    // Upload logo sur storage
    let logoUrl = "";
    if(logoFile){
        const { data, error } = await supabase.storage.from("videos").upload("logos/"+username+"_"+Date.now(), logoFile);
        logoUrl = supabase.storage.from("videos").getPublicUrl(data.path).data.publicUrl;
    }

    const { error } = await supabase.from("users").insert([{
        username: username,
        password: password,
        logo: logoUrl
    }]);

    if(error){
        alert("Erreur : "+error.message);
    } else {
        currentUser = {username, logo: logoUrl};
        alert("Compte créé !");
        closeLogin();
    }
}

// ==== UPLOAD VIDEO ====
async function uploadVideo(){
    if(!currentUser){ alert("Connecte-toi !"); return; }

    const title = document.getElementById("title").value;
    const thumbFile = document.getElementById("thumbnail").files[0];
    const videoFile = document.getElementById("videoFile").files[0];

    if(!title || !thumbFile || !videoFile){ alert("Tout remplir !"); return; }

    const id = Math.random().toString(36).substring(2,10);

    // Upload thumbnail
    const { data: thumbData } = await supabase.storage.from("videos").upload("thumb_"+id+"_"+Date.now(), thumbFile);
    const thumbUrl = supabase.storage.from("videos").getPublicUrl(thumbData.path).data.publicUrl;

    // Upload video
    const { data: vidData } = await supabase.storage.from("videos").upload("video_"+id+"_"+Date.now(), videoFile);
    const videoUrl = supabase.storage.from("videos").getPublicUrl(vidData.path).data.publicUrl;

    // Insert en DB
    await supabase.from("videos").insert([{
        id: id,
        title: title,
        thumbnail: thumbUrl,
        video_url: videoUrl,
        channel: currentUser.username,
        views: 0,
        likes: 0
    }]);

    alert("Vidéo upload !");
    closeUpload();
    loadVideos();
}

// ==== LOAD VIDEOS ====
async function loadVideos(){
    const { data } = await supabase.from("videos").select("*").order("created_at",{ascending:false});
    const grid = document.getElementById("videoGrid");
    grid.innerHTML="";
    data.forEach(v=>{
        const card = document.createElement("div");
        card.className="card";
        card.innerHTML=`<img src="${v.thumbnail}" class="thumb"><div class="title">${v.title}</div>`;
        card.onclick = ()=> window.location="watch.html?v="+v.id;
        grid.appendChild(card);
    });
}

// ==== INIT ====
loadVideos();
