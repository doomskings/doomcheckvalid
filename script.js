const progressBar = document.getElementById("progressBar");
const checkBtn = document.getElementById("checkBtn");
const domainsInput = document.getElementById("domains");
const resultBody = document.getElementById("resultBody");
const progressText = document.getElementById("progressText");

checkBtn.addEventListener("click", async () => {
    const domains = domainsInput.value
        .split("\n")
        .map(cleanDomain)
        .filter(Boolean);

    if (domains.length === 0) {
        alert("Masukkan minimal satu domain.");
        return;
    }

    resultBody.innerHTML = "";
    progressText.textContent = `Checking 0/${domains.length}...`;
    progressBar.style.width = "0%";
    
    checkBtn.disabled = true;
    checkBtn.textContent = "Checking...";

    let completed = 0;

    for (const domain of domains) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(domain)}</td>
            <td>Checking...</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>⏳</td>
        `;

        resultBody.appendChild(row);

        try {
            const response = await fetch(
                `/api/dr?target=${encodeURIComponent(domain)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            const dr =
                data.domain_rating?.domain_rating ?? "N/A";

            row.innerHTML = `
                <td>${escapeHtml(domain)}</td>
                <td>${dr}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>✅</td>
            `;
        } catch (error) {
            console.error(`Gagal mengecek ${domain}:`, error);

            row.innerHTML = `
                <td>${escapeHtml(domain)}</td>
                <td>Error</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>❌</td>
            `;
        }

        completed++;
        const percent = (completed / domains.length) * 100;

        progressBar.style.width = percent + "%";
        progressText.textContent =
            `Checking ${completed}/${domains.length}...`;
    }

    progressText.textContent =
        `Checking ${domains.length}/${domains.length} (Done).`;

    checkBtn.disabled = false;
    checkBtn.textContent = "Check Metrics";
    progressBar.style.width = "100%";
});

function cleanDomain(value) {
    return value
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0];
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
