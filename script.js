const checkBtn = document.getElementById("checkBtn");
const domainsInput = document.getElementById("domains");
const resultBody = document.getElementById("resultBody");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const totalResult = document.getElementById("totalResult");

checkBtn.addEventListener("click", async () => {
    const domains = getUniqueDomains(domainsInput.value);

    if (domains.length === 0) {
        alert("Masukkan minimal satu domain.");
        return;
    }

    resultBody.innerHTML = "";
    totalResult.textContent = `Total: ${domains.length}`;
    progressText.textContent = `Checking 0/${domains.length}...`;
    progressBar.style.width = "0%";

    checkBtn.disabled = true;
    checkBtn.textContent = "Checking...";

    let completed = 0;

    for (const domain of domains) {
        const row = createLoadingRow(domain);
        resultBody.appendChild(row);

        try {
            const dr = await fetchDomainRating(domain);
            renderSuccessRow(row, domain, dr);
        } catch (error) {
            console.error(`Gagal mengecek ${domain}:`, error);
            renderErrorRow(row, domain);
        }

        completed++;

        const percent = Math.round(
            (completed / domains.length) * 100
        );

        progressText.textContent =
            `Checking ${completed}/${domains.length}...`;

        progressBar.style.width = `${percent}%`;
    }

    progressText.textContent =
        `Checking ${domains.length}/${domains.length} (Done).`;

    progressBar.style.width = "100%";

    checkBtn.disabled = false;
    checkBtn.textContent = "Check Metrics";
});

async function fetchDomainRating(domain) {
    const response = await fetch(
        `/api/dr?target=${encodeURIComponent(domain)}`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (
        !data.domain_rating ||
        typeof data.domain_rating.domain_rating !== "number"
    ) {
        throw new Error("Data DR tidak valid");
    }

    return data.domain_rating.domain_rating;
}

function createLoadingRow(domain) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${escapeHtml(domain)}</td>
        <td>...</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>
            <span class="loading">CHECKING</span>
        </td>
    `;

    return row;
}

function renderSuccessRow(row, domain, dr) {
    row.innerHTML = `
        <td>${escapeHtml(domain)}</td>
        <td>${dr}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>
            <span class="ok">OK</span>
        </td>
    `;
}

function renderErrorRow(row, domain) {
    row.innerHTML = `
        <td>${escapeHtml(domain)}</td>
        <td>Error</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>
            <span class="error">ERROR</span>
        </td>
    `;
}

function getUniqueDomains(value) {
    return [
        ...new Set(
            value
                .split("\n")
                .map(cleanDomain)
                .filter(Boolean)
        )
    ];
}

function cleanDomain(value) {
    return value
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]
        .toLowerCase();
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
