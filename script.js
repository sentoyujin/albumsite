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
document.getElementById
// ─────────────────────────────
// 2. GROUP PAGE (ALBUMS)
// ─────────────────────────────
async function loadGroup() {
  const grid = document.getElementById("album-grid");
  if (!grid || !groupParam) return;

  // 1. load ALL groups first
  const resGroups = await fetch("data/groups.json");
  const groupsData = await resGroups.json();

  // 2. find current group
  const groupInfo = groupsData.find(
    g => g.name.toLowerCase() === groupParam.toLowerCase()
  );

  if (!groupInfo) {
    grid.innerHTML = "<p>Group not found.</p>";
    return;
  }

  // 3. set header title
  const title = document.getElementById("group-title");
  if (title) title.textContent = groupInfo.displayName;

  // 4. set subtitle (THIS IS YOUR NEW FEATURE)
  const subtitle = document.querySelector(".subtitle");
  if (subtitle) subtitle.textContent = groupInfo.description;

  // 5. load album file
  const res = await fetch(`data/${groupInfo.file}`);
  const data = await res.json();

  grid.innerHTML = "";

  data.albums
  .sort((a, b) => a.order - b.order)
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
  console.log("groupParam:", groupParam);
  console.log("albumId:", albumId);

  const list = document.getElementById("track-list");
  if (!list || !groupParam || !albumId) return;

  const [albumRes, groupsRes] = await Promise.all([
    fetch(`data/${groupParam.toLowerCase()}.json`),
    fetch("data/groups.json")
  ]);

  console.log("albumRes ok:", albumRes.ok);
  console.log("groupsRes ok:", groupsRes.ok);

  if (!albumRes.ok || !groupsRes.ok) return;

  const data = await albumRes.json();
  const groupsData = await groupsRes.json();

  console.log("album data:", data);
  console.log("groups data:", groupsData);

  const album = data.albums.find(a => String(a.id) === String(albumId));
  console.log("found album:", album);

  if (!album) return;

  const groupInfo = groupsData.find(
    g => g.name.toLowerCase() === groupParam.toLowerCase()
  );
  console.log("found groupInfo:", groupInfo);

  document.title = `${album.title} — My Record Shelf`;
  document.getElementById("album-title").textContent = album.title;
  document.getElementById("album-artist").textContent = album.artist;
  document.getElementById("album-cover").src = album.cover;
  document.getElementById("album-year").textContent = album.year;

  const backBtn = document.querySelector(".back-btn");
  if (backBtn && groupParam) {
    backBtn.textContent = `← Back to ${groupInfo?.displayName || groupParam}`;
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

  const membersSection = document.getElementById("members-section");
  const membersGrid = document.getElementById("members-grid");

  if (
    groupInfo?.members?.length &&
    album.members?.length &&
    membersSection &&
    membersGrid
  ) {
    const participating = groupInfo.members
      .filter(m => album.members.includes(m.number))
      .sort((a, b) => a.number - b.number);

    membersGrid.innerHTML = "";
    participating.forEach(m => {
      const el = document.createElement("div");
      el.className = "member-card";
      el.innerHTML = `
        <div class="member-photo-wrap">
          <img src="${m.photo}" alt="${m.name}" class="member-photo"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="member-photo-fallback" style="display:none;">${m.number}</div>
        </div>
        <span class="member-name">${m.name}</span>
      `;
      membersGrid.appendChild(el);
    });

    membersSection.style.display = "block";
  }
}

// ─────────────────────────────
// AUTO RUN
// ─────────────────────────────
loadGroups();
loadGroup();
loadAlbum();