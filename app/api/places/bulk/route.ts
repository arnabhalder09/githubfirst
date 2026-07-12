import { NextRequest } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

async function searchPlaces(query: string, location: string) {
  const params = new URLSearchParams({
    query: `${query} in ${location}`,
    key: GOOGLE_API_KEY,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  );
  return res.json();
}

async function getPlaceDetails(placeId: string) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,url",
    key: GOOGLE_API_KEY,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  return res.json();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { niche, cities, perCity = 20 } = body as {
    niche: string;
    cities: string[];
    perCity: number;
  };

  if (!niche || !cities?.length) {
    return new Response(JSON.stringify({ error: "niche and cities are required" }), { status: 400 });
  }

  if (!GOOGLE_API_KEY) {
    return new Response(JSON.stringify({ error: "GOOGLE_PLACES_API_KEY not configured" }), { status: 500 });
  }

  const limit = Math.min(perCity, 20);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      send({ type: "start", total_cities: cities.length });

      const allLeads: object[] = [];
      let cityIndex = 0;

      for (const city of cities) {
        cityIndex++;
        send({ type: "city_start", city, index: cityIndex, total: cities.length });

        try {
          const searchData = await searchPlaces(niche, city);

          if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
            send({ type: "city_error", city, error: searchData.status });
            continue;
          }

          const results: { place_id: string }[] = (searchData.results || []).slice(0, limit);
          const detailPromises = results.map((r) => getPlaceDetails(r.place_id));
          const details = await Promise.all(detailPromises);

          const cityLeads = [];
          for (const d of details) {
            if (d.status !== "OK") continue;
            const p = d.result;
            const lead = {
              place_id: p.place_id || "",
              name: p.name || "",
              address: p.formatted_address || "",
              phone: p.formatted_phone_number || "",
              rating: p.rating || 0,
              user_ratings_total: p.user_ratings_total || 0,
              types: p.types || [],
              has_website: !!p.website,
              website: p.website,
              google_maps_url: p.url || `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
              niche,
              city,
            };
            cityLeads.push(lead);
            if (!lead.has_website) allLeads.push(lead);
          }

          const noWebsiteCount = cityLeads.filter((l) => !l.has_website).length;
          send({
            type: "city_done",
            city,
            index: cityIndex,
            total: cities.length,
            found: cityLeads.length,
            no_website: noWebsiteCount,
            leads: cityLeads.filter((l) => !l.has_website),
          });
        } catch {
          send({ type: "city_error", city, error: "fetch failed" });
        }

        // Small delay between cities to avoid rate limiting
        if (cityIndex < cities.length) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      send({
        type: "complete",
        total_leads: allLeads.length,
        cities_scanned: cities.length,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
