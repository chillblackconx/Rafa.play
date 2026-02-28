const supabase = window.supabase.createClient(
  "https://svvsvwvaskvyvcxudbdg.supabase.co",
  "sb_publishable_qYyRmfzb-ZUXXuX_90T1Rw_MGmrQ22X"
);

document.addEventListener("DOMContentLoaded", async () => {

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const openUpload = document.getElementById("openUpload");
    const uploadModal = document.getElementById("uploadModal");
    const closeUpload = document.getElementById("closeUpload");
    const publish = document.getElementById("publish");
    const videoGrid = document.getElementById("videoGrid");

    let { data: { user } } = await supabase.auth.getUser();

    function updateUI(){
        if(user){
            loginBtn.style.display="none";
            signupBtn.style.display="none";
            logoutBtn.style.display="block";
        }else{
            loginBtn.style.display="block";
            signupBtn.style.display="block";
            logoutBtn.style.display="none";
        }
    }

    updateUI();

    // SIGNUP
    signupBtn.addEventListener("click", async ()=>{
        const email = prompt("Email:");
        const password = prompt("Password:");
        await supabase.auth.signUp({ email, password });
        alert("Compte créé !");
    });

    // LOGIN
    loginBtn.addEventListener("click", async ()=>{
        const email = prompt("Email:");
        const password = prompt("Password:");
        await supabase.auth.signInWithPassword({ email, password });
        location.reload();
    });

    // LOGOUT
    logoutBtn.addEventListener("click", async ()=>{
        await supabase.auth.signOut();
        location.reload();
    });

    // OPEN UPLOAD
    openUpload.addEventListener("click", ()=>{
        if(!user){
            alert("Tu dois être connecté !");
            return;
        }
        uploadModal.style.display="flex";
    });

    closeUpload.addEventListener("click", ()=>{
        uploadModal.style.display="none";
    });

    // UPLOAD VIDEO
    publish.addEventListener("click", async ()=>{

        const file = document.getElementById("videoFile").files[0];
        const title = document.getElementById("videoTitle").value;

        if(!file || !title){
            alert("Remplis tout");
            return;
        }

        const fileName = Date.now()+"_"+file.name;

        const { error } = await supabase.storage
            .from("videos")
            .upload(fileName,file);

        if(error){
            alert("Erreur upload");
            return;
        }

        const { data } = supabase.storage
            .from("videos")
            .getPublicUrl(fileName);

        await supabase.from("videos").insert({
            title:title,
            video_url:data.publicUrl,
            user_id:user.id
        });

        alert("Vidéo publiée !");
        location.reload();
    });

    // LOAD VIDEOS
    async function loadVideos(){
        const { data } = await supabase
            .from("videos")
            .select("*")
            .order("created_at",{ascending:false});

        if(!data) return;

        videoGrid.innerHTML="";

        data.forEach(video=>{
            const div=document.createElement("div");
            div.className="card";

            div.innerHTML=`
                <video src="${video.video_url}" class="thumb"></video>
                <div class="title">${video.title}</div>
            `;

            videoGrid.appendChild(div);
        });
    }

    loadVideos();

});
