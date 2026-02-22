// === MODAL ===
function openLogin(){ document.getElementById("loginModal").style.display="flex"; }
function closeLogin(){ document.getElementById("loginModal").style.display="none"; }
function openUpload(){
    if(!currentUser){ alert("Connecte-toi !"); return; }
    document.getElementById("uploadModal").style.display="flex";
}
function closeUpload(){ document.getElementById("uploadModal").style.display="none"; }

// === REGISTER ===
async function register(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const logoFile = document.getElementById("userLogo").files[0];

    if(!username || !password){ alert("Remplis tous les champs !"); return; }

    let logoUrl = "";
    if(logoFile){
        const { data } = await supabase.storage.from("logos").upload(username+"_"+Date.now(), logoFile);
        logoUrl = supabase.storage.from("logos").getPublicUrl(data.path).data.publicUrl;
    }

    const { error } = await supabase.from("users").insert([{id:username,username,password,logo:logoUrl}]);
    if(error){ alert("Erreur: "+error.message); return; }

    currentUser = {username,logo:logoUrl};
    alert("Compte créé !");
    closeLogin();
}

// === UPLOAD VIDEO ===
async function uploadVideo(){
    if(!currentUser){ alert("Connecte-toi !"); return; }

    const title = document.getElementById("title").value;
    const thumbFile = document.getElementById("thumbnail").files[0];
    const videoFile = document.getElementById("videoFile").files[0];
    if(!title||!thumbFile||!videoFile){ alert("Remplis tous les champs !"); return; }

    const id = Math.random().toString(36).substring(2,10);

    const { data: thumbData } = await supabase.storage.from("videos").upload("thumb_"+id+"_"+Date.now(), thumbFile);
    const thumbUrl = supabase.storage.from("videos").getPublicUrl(thumbData.path).data.publicUrl;

    const { data: vidData } = await supabase.storage.from("videos").upload("video_"+id+"_"+Date.now(), videoFile);
    const videoUrl = supabase.storage.from("videos").getPublicUrl(vidData.path).data.publicUrl;

    await supabase.from("videos").insert([{
        id,id,title,thumbnail:thumbUrl,video_url:videoUrl,channel:currentUser.username,views:0,likes:0
    }]);

    alert("Vidéo upload !");
    closeUpload();
    loadVideos();
}

// === LOAD VIDEOS ===
async function loadVideos(){
    const { data } = await supabase.from("videos").select("*").order("created_at",{ascending:false});
    const grid = document.getElementById("videoGrid");
    grid.innerHTML="";
    data.forEach(v=>{
        const card = document.createElement("div");
        card.style.cursor="pointer";
        card.innerHTML=`<img src="${v.thumbnail}" style="width:100%;height:150px;object-fit:cover"><div style="color:white;font-weight:bold;padding:5px">${v.title}</div>`;
        card.onclick = ()=> window.location="watch.html?v="+v.id;
        grid.appendChild(card);
    });
}

loadVideos();
