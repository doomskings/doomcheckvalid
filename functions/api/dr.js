export async function onRequestGet(context) {

    const url = new URL(context.request.url);
    const target = url.searchParams.get("target");

    if (!target) {
        return Response.json({
            success:false,
            error:"Target domain belum diisi"
        });
    }

    const api =
`https://api.ahrefs.com/v3/public/domain-rating-free?target=${encodeURIComponent(target)}&output=json`;

    const response = await fetch(api,{
        headers:{
            "Accept":"application/json"
        }
    });

    const data = await response.json();

    return Response.json(data);

}
