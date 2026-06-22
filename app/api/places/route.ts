import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export interface PlaceLead {
  place_id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  user_ratings_total: number;
  types: string[];
  has_website: boolean;
  website?: string;
  google_maps_url: string;
  niche: string;
}

async function searchPlaces(query: string, location: string, pageToken?: string) {
  const params = new URLSearchParams({
    query: `${query} in ${location}`,
    key: GOOGLE_API_KEY,
  });
  if (pageToken) params.set("pagetoken", pageToken);

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get("niche") || "";
  const location = searchParams.get("location") || "";
  const maxResults = Math.min(parseInt(searchParams.get("max") || "20"), 60);

  if (!niche || !location) {
    return NextResponse.json({ error: "niche and location are required" }, { status: 400 });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const leads: PlaceLead[] = [];
    let pageToken: string | undefined;
    let fetched = 0;

    while (fetched < maxResults) {
      const searchData = await searchPlaces(niche, location, pageToken);

      if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
        return NextResponse.json(
          { error: `Places API error: ${searchData.status}` },
          { status: 502 }
        );
      }

      const results: { place_id: string }[] = searchData.results || [];

      const detailPromises = results
        .slice(0, maxResults - fetched)
        .map((r) => getPlaceDetails(r.place_id));

      const details = await Promise.all(detailPromises);

      for (const d of details) {
        if (d.status !== "OK") continue;
        const p = d.result;
        leads.push({
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
        });
      }

      fetched += results.length;
      pageToken = searchData.next_page_token;
      if (!pageToken || fetched >= maxResults) break;
      // Google requires a short delay before using next_page_token
      await new Promise((r) => setTimeout(r, 2000));
    }

    const noWebsite = leads.filter((l) => !l.has_website);
    const withWebsite = leads.filter((l) => l.has_website);

    return NextResponse.json({
      total: leads.length,
      no_website_count: noWebsite.length,
      with_website_count: withWebsite.length,
      leads: noWebsite,
      all_leads: leads,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
