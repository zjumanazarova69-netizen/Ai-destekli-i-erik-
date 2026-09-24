const $ = (selector) => document.querySelector(selector);
const storageKey = "studio-flow-projects";
const dateInput = $("#content-date");
dateInput.value = new Date().toISOString().slice(0, 10);

const samples = [
  { id: "sample-1", name: "Sonbahar Lansmanı", brand: "Mori", contents: [{ type: "Reels", description: "Koleksiyonun ilk bakışı", date: "2026-10-03" }, { type: "Görsel", description: "Detay çekimleri", date: "2026-10-08" }] },
  { id: "sample-2", name: "Günlük Ritüeller", brand: "Luna Care", contents: [{ type: "UCS", description: "Sabah bakım rutini", date: "2026-10-11" }] }
];
let projects = JSON.parse(localStorage.getItem(storageKey) || "null") || samples;
const save = () => localStorage.setItem(storageKey, JSON.stringify(projects));
const formatDate = (date) => new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));

function renderProjects() {
  const list = $("#project-list");
  list.innerHTML = projects.length ? projects.map((project) => `<button class="project-card" data-project="${project.id}"><span class="project-icon">✦</span><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.brand)}</p><span class="card-meta">${project.contents.length} içerik · İçerikleri gör →</span></button>`).join("") : '<div class="empty-card">Henüz proje yok. İlk içeriğini yukarıdaki alandan ekleyebilirsin.</div>';
  list.querySelectorAll("[data-project]").forEach((card) => card.addEventListener("click", () => openProject(card.dataset.project)));
  const options = projects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("") || "<option>Önce bir proje oluştur</option>";
  $("#idea-project").innerHTML = options; $("#script-project").innerHTML = options;
}
function renderCalendar() {
  const entries = projects.flatMap((project) => project.contents.map((content) => ({ ...content, project: project.name }))).sort((a,b) => a.date.localeCompare(b.date));
  $("#calendar-list").innerHTML = entries.length ? entries.map((item) => `<article class="calendar-item"><div class="date-box">${formatDate(item.date)}</div><div><h3>${escapeHtml(item.project)}</h3><p>${escapeHtml(item.description)}</p></div><span class="type-pill">${item.type}</span></article>`).join("") : '<div class="empty-card">Takvimine içerik eklediğinde burada göreceksin.</div>';
}
function openProject(id) {
  const project = projects.find((item) => item.id === id); if (!project) return;
  $("#dialog-title").textContent = project.name; $("#dialog-brand").textContent = project.brand;
  $("#dialog-content").innerHTML = project.contents.map((content) => `<article class="dialog-entry"><h3>${content.type} · ${formatDate(content.date)}</h3><p>${escapeHtml(content.description)}</p></article>`).join("");
  $("#project-dialog").showModal();
}
function escapeHtml(value) { const element = document.createElement("div"); element.textContent = value; return element.innerHTML; }
function toast(message) { const node = $("#toast"); node.textContent = message; node.classList.add("visible"); setTimeout(() => node.classList.remove("visible"), 2800); }

$("#content-form").addEventListener("submit", (event) => {
  event.preventDefault(); const data = new FormData(event.currentTarget); const name = data.get("projectName").trim();
  let project = projects.find((item) => item.name.toLocaleLowerCase("tr") === name.toLocaleLowerCase("tr"));
  if (!project) { project = { id: crypto.randomUUID(), name, brand: data.get("brand").trim(), contents: [] }; projects.unshift(project); }
  project.contents.push({ type: data.get("contentType"), description: data.get("description").trim(), date: data.get("date") });
  save(); renderProjects(); renderCalendar(); event.currentTarget.reset(); dateInput.value = new Date().toISOString().slice(0,10); toast("İçeriğin kaydedildi.");
});
$("#close-dialog").addEventListener("click", () => $("#project-dialog").close());
$("#generate-idea").addEventListener("click", () => {
  const project = projects.find((item) => item.id === $("#idea-project").value); const topic = $("#idea-prompt").value.trim() || "ürünün günlük hayattaki yeri";
  const result = $("#idea-result"); result.hidden = false; result.innerHTML = `<strong>${project?.name || "Projen"} için fikir</strong>“${escapeHtml(topic)}” temasını önce merak uyandıran bir yakın planla aç. Ardından kısa bir deneyim anı göster ve izleyiciyi kendi rutinini paylaşmaya davet et.`;
});
$("#generate-script").addEventListener("click", () => {
  const project = projects.find((item) => item.id === $("#script-project").value); const topic = $("#script-prompt").value.trim() || "ürünü ilk kez denemek";
  const result = $("#script-result"); result.hidden = false; result.innerHTML = `<strong>${project?.name || "Projen"} · 15 saniyelik akış</strong><b>0–3 sn:</b> “${escapeHtml(topic)}” anını göster. <b>4–10 sn:</b> Ürünün en sevilen detayına yakından bak. <b>11–15 sn:</b> Sonucu ve kısa çağrını ekle.`;
});
renderProjects(); renderCalendar();
