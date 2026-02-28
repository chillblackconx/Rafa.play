document.addEventListener("DOMContentLoaded", () => {

    const videoGrid = document.getElementById("videoGrid");
    const uploadBtn = document.getElementById("openUpload");
    const uploadModal = document.getElementById("uploadModal");
    const closeUpload = document.getElementById("closeUpload");
    const saveVideo = document.getElementById("saveVideo");

    let videos = JSON.parse(localStorage.getItem("videos")) || [];

    // ===== AFFICHER VIDEOS =====
    function renderVideos() {
        videoGrid.innerHTML = "";

        videos.forEach((video, index) => {

            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <img src="${video.thumbnail}" class="thumb">
                <div class="title">${video.title}</div>
            `;

            card.addEventListener("click", () => {
                window.location.href = "watch.html?v=" + index;
            });

            videoGrid.appendChild(card);
        });
    }

    // ===== OUVRIR MODAL =====
    uploadBtn.addEventListener("click", () => {
        uploadModal.style.display = "flex";
    });

    closeUpload.addEventListener("click", () => {
        uploadModal.style.display = "none";
    });

    // ===== SAVE VIDEO =====
    saveVideo.addEventListener("click", () => {

        const title = document.getElementById("videoTitle").value;
        const thumbnail = document.getElementById("videoThumbnail").value;
        const videoUrl = document.getElementById("videoUrl").value;

        if (!title || !thumbnail || !videoUrl) {
            alert("Remplis tout !");
            return;
        }

        videos.push({
            title: title,
            thumbnail: thumbnail,
            url: videoUrl
        });

        localStorage.setItem("videos", JSON.stringify(videos));

        uploadModal.style.display = "none";
        renderVideos();
    });

    renderVideos();
});
