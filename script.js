import { supabase } from "./supabase/supabase.js";

let videos = [];
let currentUser = null;

function generateID(){
    return Math.random().toString(36).substring(2,10);
}

window.goHome = () => window.location = "index.html";

window.toggleAuth = async () => {
    if(currentUser){
        await supabase.auth.signOut();
        location.reload();
        return;
    }

    const email = prompt("Email:");
    const password = prompt("Mot de passe:");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if(error){
        await supabase.auth.signUp({ email, password });
        alert("Compte créé !");
    }else{
        currentUser = data.user;
        alert("Connecté !");
        location.reload();
    }
};

async function fetchVideos(){
    const { data } = await supabase.from("videos").select("*").order("created_at",{ascending:false});
    videos = data || [];
    loadVideos();
    loadShorts();
}

function loadVideos(){
    const grid = document.getElementById("videoGrid");
    if(!grid) return;
    grid.innerHTML = "";

    videos.forEach(v=>{
        const card = document.createElement("div");
        card.className="video-card";
        card.innerHTML=`
            <img class="thumbnail" src="${v.thumbnail || 'https://via.placeholder.com/300x150'}">
            <div class="video-info">
                <h3>${v.title}</h3>
                <p>${v.channel}</p>
                <p>👁 ${v.views} vues • ❤️ ${v.likes}</p>
            </div>`;
        card.onclick=()=>window.location=`watch.html?v=${v.id}`;
        grid.appendChild(card);
    });
}

window.uploadVideo = async ()=>{
    if(!currentUser){ alert("Connecte-toi !"); return; }

    const title = document.getElementById("title").value;
    const thumbnail = document.getElementById("thumbnail").value;
    const url = document.getElementById("videoUrl").value;

    if(!title || !url) return alert("Champs manquants");

    await supabase.from("videos").insert([{
        id:generateID(),
        title,
        thumbnail,
        url,
        views:0,
        likes:0,
        channel:currentUser.email
    }]);

    closeUpload();
    fetchVideos();
};

window.likeVideo = async ()=>{
    const id = new URLSearchParams(window.location.search).get("v");
    const video = videos.find(v=>v.id===id);
    await supabase.from("videos").update({likes:video.likes+1}).eq("id",id);
    location.reload();
};

window.searchVideos = ()=>{
    const q = document.getElementById("searchInput").value.toLowerCase();
    const filtered = videos.filter(v=>v.title.toLowerCase().includes(q));
    const grid = document.getElementById("videoGrid");
    grid.innerHTML="";
    filtered.forEach(v=>{
        const card=document.createElement("div");
        card.className="video-card";
        card.innerHTML=`<img class="thumbnail" src="${v.thumbnail}">
        <div class="video-info"><h3>${v.title}</h3></div>`;
        card.onclick=()=>window.location=`watch.html?v=${v.id}`;
        grid.appendChild(card);
    });
};

window.openUpload=()=>document.getElementById("uploadModal").style.display="flex";
window.closeUpload=()=>document.getElementById("uploadModal").style.display="none";

async function loadWatch(){
    const player=document.getElementById("player");
    if(!player) return;
    const id=new URLSearchParams(window.location.search).get("v");
    const { data }=await supabase.from("videos").select("*").eq("id",id).single();
    if(!data) return;
    player.src=data.url;
    document.getElementById("videoTitle").textContent=data.title;
    document.getElementById("views").textContent=data.views+" vues";
    document.getElementById("likes").textContent=data.likes;
    await supabase.from("videos").update({views:data.views+1}).eq("id",id);
}

function loadShorts(){
    const container=document.getElementById("shortsContainer");
    if(!container) return;
    container.innerHTML="";
    videos.forEach(v=>{
        const vid=document.createElement("video");
        vid.src=v.url;
        vid.controls=true;
        vid.className="shorts-video";
        container.appendChild(vid);
    });
}

async function init(){
    const { data }=await supabase.auth.getUser();
    currentUser=data.user;
    await fetchVideos();
    await loadWatch();
}

init();
