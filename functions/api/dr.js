export async function onRequestGet(context) {
    try {
        const requestUrl = new URL(context.request.url);
        const target = requestUrl.searchParams.get("target");

        if (!target) {
            return Response.json(
                {
                    success: false,
                    error: "Target domain belum diisi"
                },
                { status: 400 }
            );
        }

        const cleanTarget = target
            .trim()
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .split("/")[0];

        if (!cleanTarget) {
            return Response.json(
                {
                    success: false,
                    error: "Domain tidak valid"
                },
                { status: 400 }
            );
        }

        const apiUrl = new URL(
            "https://api.ahrefs.com/v3/public/domain-rating-free"
        );

        apiUrl.searchParams.set("target", cleanTarget);
        apiUrl.searchParams.set("output", "json");

        const response = await fetch(apiUrl, {
            headers: {
                Accept: "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return Response.json(
                {
                    success: false,
                    error: "Ahrefs API gagal merespons",
                    details: data
                },
                { status: response.status }
            );
        }

        return Response.json({
            success: true,
            domain: cleanTarget,
            dr: data.domain_rating?.domain_rating ?? null,
            source: "Ahrefs"
        });

    } catch (error) {
        return Response.json(
            {
                success: false,
                error: "Terjadi kesalahan server"
            },
            { status: 500 }
        );
    }
}
