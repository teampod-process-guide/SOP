document.addEventListener("DOMContentLoaded", function () {
    let jsonData = null;

    fetch('TeamPOD process guide.json')
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            jsonData = data;
            document.getElementById("main-title").textContent = data.guide.title;

            const toc = document.getElementById("toc");
            const guideContent = document.getElementById("guide-content");
            toc.innerHTML = "";
            guideContent.innerHTML = "";

            data.steps
                .filter(step => step.includeInToc)
                .forEach(step => {
                    const section = document.createElement("section");
                    section.id = `step-${step.id}`;

                    const isTopLevel = /^\d+\.$/.test(step.indexString);

                    if (isTopLevel) {
                        const h2 = document.createElement("h2");
                        h2.textContent = `${step.indexString} ${step.title}`;
                        section.appendChild(h2);

                        if (step.description) {
                            const div = document.createElement("div");
                            div.innerHTML = step.description;
                            section.appendChild(div);
                        }
                    } else {
                        if (step.description) {
                            const p = document.createElement("p");
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = step.description;
                            const plainText = tempDiv.textContent || tempDiv.innerText || "";
                            p.textContent = `${step.indexString} ${plainText.trim()}`;
                            section.appendChild(p);
                        }
                    }

                    if (step.screenshotRelativePath) {
                        const img = document.createElement("img");
                        img.src = step.screenshotRelativePath;
                        img.alt = `Screenshot for ${step.title}`;
                        img.style.maxWidth = "100%";
                        img.style.marginTop = "10px";
                        img.style.border = "1px solid var(--border-color)";
                        img.style.borderRadius = "6px";
                        section.appendChild(img);
                    }

                    guideContent.appendChild(section);

                    if (isTopLevel) {
                        const li = document.createElement("li");
                        const a = document.createElement("a");
                        a.href = `#step-${step.id}`;
                        a.innerText = `${step.indexString} ${step.title}`;
                        li.appendChild(a);
                        toc.appendChild(li);
                    }
                });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            document.getElementById("main-title").textContent = "Failed to load guide.";
        });

    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("suggestionsList");
    const searchBox = document.querySelector(".search-box");

    function clearSuggestions() {
        suggestionsList.innerHTML = "";
        searchBox.classList.remove("active");
    }

    function createSuggestionItem(step) {
        const li = document.createElement("li");
        li.textContent = `${step.title}`;
        li.addEventListener("click", () => {
            const target = document.getElementById(`step-${step.id}`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            clearSuggestions();
            searchInput.value = "";
        });
        return li;
    }

    searchInput.addEventListener("input", () => {
        clearSuggestions();
        const query = searchInput.value.trim().toLowerCase();
        if (!query || !jsonData) return;

        const matches = jsonData.steps.filter(step => {
            const isTopLevel = /^\d+\.$/.test(step.indexString);
            if (!isTopLevel) return false;

            const title = step.title.toLowerCase();
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = step.description || "";
            const descText = tempDiv.textContent.toLowerCase();
            return title.includes(query) || descText.includes(query);
        });

        matches.slice(0, 10).forEach(step => {
            const suggestion = createSuggestionItem(step);
            if (suggestion) suggestionsList.appendChild(suggestion);
        });

        if (suggestionsList.children.length > 0) {
            searchBox.classList.add("active");
        }
    });

    document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target)) {
            clearSuggestions();
        }
    });

    const toc = document.getElementById("toc");

    toc.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            document.querySelectorAll(".nav-links a").forEach(link => {
                link.classList.remove("active");
            });
            e.target.classList.add("active");
        }
    });
});
