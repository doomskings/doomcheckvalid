export async function onRequest(context) {

    const url = new URL(context.request.url);
    const target = url.searchParams.get("target");

    if (!target) {
        return Response.json({
            success: false,
            error: "Target domain kosong"
        }, { status: 400 });
    }

    try {

        // Resolve domain -> IP
        const dns = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(target)}&type=A`
        );

        const dnsData = await dns.json();

        if (!dnsData.Answer || dnsData.Answer.length === 0) {

            return Response.json({
                success: false,
                error: "IP tidak ditemukan"
            });

        }

        const ip = dnsData.Answer[0].data;

        // Cari negara berdasarkan IP
        const geo = await fetch(
            `https://ipwho.is/${ip}`
        );

        const geoData = await geo.json();

        return Response.json({

            success: true,

            domain: target,

            ip: ip,

            country: geoData.country || "-",

            country_code: geoData.country_code || "-",

            city: geoData.city || "-"

        });

    } catch (err) {

        return Response.json({

            success: false,

            error: err.message

        });

    }

}
