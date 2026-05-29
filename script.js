// ─────────────────────────────
// URL PARAMS (safe global)
// ─────────────────────────────
const params = new URLSearchParams(window.location.search);
const groupParam = params.get("group");
const albumId = params.get("id");

// ─────────────────────────────
// 1. HOME PAGE (GROUPS)
// ─────────────────────────────
async function loadGroups() {
  const grid = document.getElementById("group-grid");
  if (!grid) return;

  const res = await fetch("data/groups.json");
  const groups = await res.json();

  grid.innerHTML = "";

  groups
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach(g => {
      const card = document.createElement("a");
      card.href = `group.html?group=${encodeURIComponent(g.name)}`;
      card.className = "card";

      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${g.cover}">
        </div>
        <div class="card-info">
          <span class="album-title">${g.displayName || g.name}</span>
          <span class="album-artist">Group</span>
        </div>
      `;

      grid.appendChild(card);
    });
}

// ─────────────────────────────
// 2. GROUP PAGE (ALBUMS)
// ─────────────────────────────
async function loadGroup() {
  const grid = document.getElementById("album-grid");
  if (!grid || !groupParam) return;

  const res = await fetch(`data/${groupParam.toLowerCase()}.json`);
  if (!res.ok) {
    grid.innerHTML = "<p>Group not found.</p>";
    return;
  }

  const data = await res.json();

  // header uses display name from JSON
  const title = document.querySelector("header h1");
  if (title) title.textContent = data.displayName || data.group;

  grid.innerHTML = "";

  data.albums
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach(album => {
      const card = document.createElement("a");
      card.href = `album.html?group=${encodeURIComponent(groupParam)}&id=${album.id}`;
      card.className = "card";

      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${album.cover}">
        </div>
        <div class="card-info">
          <span class="album-title">${album.title}</span>
          <span class="album-artist">${album.artist}</span>
        </div>
      `;

      grid.appendChild(card);
    });
}

// ─────────────────────────────
// 3. ALBUM PAGE (TRACKLIST)
// ─────────────────────────────
async function loadAlbum() {
  const list = document.getElementById("track-list");
  if (!list || !groupParam || !albumId) return;

  const res = await fetch(`data/${groupParam.toLowerCase()}.json`);
  if (!res.ok) return;

  const data = await res.json();
  const album = data.albums.find(a => String(a.id) === String(albumId));

  if (!album) return;

  document.title = `${album.title} — My Record Shelf`;

  document.getElementById("album-title").textContent = album.title;
  document.getElementById("album-artist").textContent = album.artist;
  document.getElementById("album-cover").src = album.cover;
  document.getElementById("album-year").textContent = album.year;
  document.getElementById("album-format").textContent = album.format;

  // back button
  const backBtn = document.querySelector(".back-btn");
  if (backBtn && groupParam) {
    backBtn.textContent = `← Back to ${data.displayName || groupParam}`;
    backBtn.href = `group.html?group=${encodeURIComponent(groupParam)}`;
  }

  list.innerHTML = "";

  album.tracks.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="track-title">${t.title}</span>
      <span class="track-duration">${t.duration}</span>
    `;
    list.appendChild(li);
  });
}

// ─────────────────────────────
// AUTO RUN
// ─────────────────────────────
loadGroups();
loadGroup();
loadAlbum();