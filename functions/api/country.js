export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const target = cleanDomain(url.searchParams.get("target"));

        if (!target) {
            return jsonResponse(
                {
                    success: false,
                    error: "Target domain belum diisi"
                },
                400
            );
        }

        // Domain -> IPv4 menggunakan Google DNS
        const dnsResponse = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(target)}&type=A`,
            {
                headers: {
                    Accept: "application/dns-json"
                }
            }
        );

        if (!dnsResponse.ok) {
            throw new Error(`DNS gagal: HTTP ${dnsResponse.status}`);
        }

        const dnsData = await dnsResponse.json();

        const ipv4Record = dnsData.Answer?.find((record) => {
            return record.type === 1 && isIPv4(record.data);
        });

        if (!ipv4Record) {
            return jsonResponse(
                {
                    success: false,
                    domain: target,
                    error: "Alamat IPv4 tidak ditemukan"
                },
                404
            );
        }

        const ip = ipv4Record.data;

        // IP -> kode negara
        const countryResponse = await fetch(
            `https://api.country.is/${encodeURIComponent(ip)}`,
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!countryResponse.ok) {
            throw new Error(
                `Country API gagal: HTTP ${countryResponse.status}`
            );
        }

        const countryData = await countryResponse.json();
        const countryCode = countryData.country || null;

        if (!countryCode) {
            throw new Error("Negara tidak ditemukan");
        }

        let countryName = countryCode;

        try {
            const regionNames = new Intl.DisplayNames(
                ["en"],
                { type: "region" }
            );

            countryName =
                regionNames.of(countryCode) || countryCode;
        } catch {
            // Tetap gunakan kode negara jika Intl.DisplayNames gagal.
        }

        return jsonResponse({
            success: true,
            domain: target,
            ip,
            country: countryName,
            country_code: countryCode
        });
    } catch (error) {
        return jsonResponse(
            {
                success: false,
                error: error.message || "Terjadi kesalahan server"
            },
            500
        );
    }
}

function cleanDomain(value) {
    if (!value) {
        return "";
    }

    return value
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]
        .toLowerCase();
}

function isIPv4(value) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "public, max-age=3600"
        }
    });
}
