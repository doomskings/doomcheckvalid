export async function onRequestGet(context) {

    try {

        const url = new URL(context.request.url);

        const target = cleanDomain(
            url.searchParams.get("target")
        );

        if (!target) {

            return json({
                success: false,
                error: "Target domain kosong"
            },400);

        }

        const rdap = await fetch(
            `https://rdap.org/domain/${encodeURIComponent(target)}`
        );

        if(!rdap.ok){

            throw new Error(
                `RDAP HTTP ${rdap.status}`
            );

        }

        const data = await rdap.json();

        const registration = data.events?.find(e=>{

            return (
                e.eventAction==="registration" ||
                e.eventAction==="registered"
            );

        });

        if(!registration){

            return json({
                success:true,
                domain:target,
                age:null
            });

        }

        const created = new Date(
            registration.eventDate
        );

        const now = new Date();

        let years =
            now.getFullYear()-
            created.getFullYear();

        const m =
            now.getMonth()-
            created.getMonth();

        if(
            m<0 ||
            (
                m===0 &&
                now.getDate()<created.getDate()
            )
        ){
            years--;
        }

        return json({

            success:true,

            domain:target,

            created:
                registration.eventDate,

            age:years

        });

    }

    catch(err){

        return json({

            success:false,

            error:err.message

        },500);

    }

}

function cleanDomain(value){

    if(!value) return "";

    return value
        .trim()
        .replace(/^https?:\/\//i,"")
        .replace(/^www\./i,"")
        .split("/")[0]
        .toLowerCase();

}

function json(data,status=200){

    return new Response(
        JSON.stringify(data),
        {
            status,
            headers:{
                "Content-Type":"application/json"
            }
        }
    );

}
