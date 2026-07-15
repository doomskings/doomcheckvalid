const checkBtn = document.getElementById("checkBtn");
const domainsInput = document.getElementById("domains");
const resultBody = document.getElementById("resultBody");

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
    checkBtn.disabled = true;
    checkBtn.textContent = "Checking...";

    for (const domain of domains) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(domain)}</td>
            <td class="dr-value">Checking...</td>
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
    }

    checkBtn.disabled = false;
    checkBtn.textContent = "Check Metrics";
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
