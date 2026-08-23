import type { Booking, Inquiry, Property, Review, User } from "./types";

const u = (id: string) => `https://image.qwenlm.ai/generated-images/${id}/_result.png`;

export const IMG = {
  hero: u("f1d7ce8c-7aef-4e54-b739-eda2ce45a515"),
  living: u("8e1177b1-3258-4b39-bdf8-8b85364ecc2e"),
  townhouse: u("ae05b1d5-b46f-41d5-ac99-206850e1d290"),
  kitchen: u("af457a13-45ec-4030-8edb-ea75cda6403f"),
  adobe: u("80ccb073-1b53-4629-815f-ef62fa61f250"),
  cabin: u("2e141467-8f77-46d7-8b1c-aff71e170ed2"),
  cityview: u("a30441e3-5645-41c1-8b01-1fcf052f3a40"),
  bedroom: u("43d1a319-582c-465b-86ae-97d4e305f41f"),
  pool: u("4e8eea3a-dff7-484b-91ee-90cdc26d5c8b"),
  loft: u("1baa214d-8ef6-495a-8a3f-f05206decbae"),
};

export const ALL_IMAGES: { src: string; label: string }[] = [
  { src: IMG.hero, label: "Larchmont dusk exterior" },
  { src: IMG.living, label: "Oak & linen living room" },
  { src: IMG.townhouse, label: "Brick townhouse facade" },
  { src: IMG.kitchen, label: "Green chef's kitchen" },
  { src: IMG.adobe, label: "Desert courtyard" },
  { src: IMG.cabin, label: "Lakeside A-frame" },
  { src: IMG.cityview, label: "Skyline terrace" },
  { src: IMG.bedroom, label: "Arched primary suite" },
  { src: IMG.pool, label: "Mid-century pool court" },
  { src: IMG.loft, label: "Timber-beam loft" },
];

export const SEED_USERS: User[] = [
  {
    id: "u-admin",
    name: "Amara Chen",
    email: "admin@atrium.est",
    password: "demo1234",
    role: "ADMIN",
    phone: "(415) 555-0134",
    title: "Platform Director",
    joinedOn: "2024-03-02",
  },
  {
    id: "u-agent1",
    name: "Daniel Reyes",
    email: "daniel@atrium.est",
    password: "demo1234",
    role: "AGENT",
    phone: "(512) 555-0177",
    title: "Senior Listing Agent",
    bio: "Twelve years selling architecture with a story — from Zilker moderns to Eastside adobes.",
    rating: 4.9,
    deals: 143,
    joinedOn: "2024-06-11",
  },
  {
    id: "u-agent2",
    name: "Priya Nair",
    email: "priya@atrium.est",
    password: "demo1234",
    role: "AGENT",
    phone: "(206) 555-0142",
    title: "Broker, Urban Homes",
    bio: "Lofts, flats and sky-high views. I answer within the hour, seven days a week.",
    rating: 4.8,
    deals: 118,
    joinedOn: "2024-09-23",
  },
  {
    id: "u-buyer",
    name: "Sofia Bennett",
    email: "sofia@mail.com",
    password: "demo1234",
    role: "BUYER",
    phone: "(303) 555-0119",
    joinedOn: "2025-08-14",
  },
  {
    id: "u-buyer2",
    name: "Marcus Webb",
    email: "marcus@mail.com",
    password: "demo1234",
    role: "BUYER",
    phone: "(773) 555-0163",
    joinedOn: "2025-11-02",
  },
];

const P = (p: Property) => p;

export const SEED_PROPERTIES: Property[] = [
  P({
    id: "p-01", title: "The Larchmont House", description:
      "A gabled modern residence wrapped in dark timber and glass, sited on a double lot in Zilker. The great room opens through 20-foot sliders to a reflecting lawn, and the primary wing sits quiet under a cedar soffit. Minutes from Barton Springs, it is the rare new build that feels like it has always belonged.",
    price: 1285000, type: "house", status: "available", beds: 4, baths: 3, area: 3120,
    address: "1804 Larchmont Trail", city: "Austin", state: "TX", district: "Zilker",
    lat: 30.2602, lng: -97.7711, mapX: 20, mapY: 66,
    images: [IMG.hero, IMG.living, IMG.kitchen], amenities: ["Garage", "Smart Home", "EV Charger", "Garden", "Home Office", "Solar Panels"],
    agentId: "u-agent1", yearBuilt: 2023, featured: true, listedOn: "2026-01-18", views: 1834,
  }),
  P({
    id: "p-02", title: "Meridian Sky Loft", description:
      "Corner loft on the 21st floor with a wrap terrace over the river. Exposed concrete, blackened-steel windows and a chef's kitchen in green lacquer. Deeded parking and a 24-hour doorman round out one of River North's best floor plans.",
    price: 875000, type: "loft", status: "available", beds: 2, baths: 2, area: 1640,
    address: "435 W Hubbard St, #2104", city: "Chicago", state: "IL", district: "River North",
    lat: 41.8899, lng: -87.6382, mapX: 58, mapY: 18,
    images: [IMG.loft, IMG.living, IMG.cityview], amenities: ["Doorman", "Gym", "Rooftop Deck", "Balcony", "Garage", "Smart Home"],
    agentId: "u-agent2", yearBuilt: 2019, featured: true, listedOn: "2026-02-02", views: 1287,
  }),
  P({
    id: "p-03", title: "Magnolia Row Townhouse", description:
      "Restored 1890s brick townhouse south of Broad with original heart-pine floors, three working fireplaces and a walled garden courtyard. The steel-and-glass kitchen addition reads as a lantern at night. A storied address, impeccably modernized.",
    price: 998000, type: "townhouse", status: "available", beds: 3, baths: 3, area: 2210,
    address: "27 Magnolia Row", city: "Charleston", state: "SC", district: "South of Broad",
    lat: 32.7693, lng: -79.9311, mapX: 82, mapY: 62,
    images: [IMG.townhouse, IMG.kitchen, IMG.bedroom], amenities: ["Fireplace", "Garden", "Wine Cellar", "Home Office"],
    agentId: "u-agent1", yearBuilt: 1893, featured: true, listedOn: "2026-01-05", views: 2210,
  }),
  P({
    id: "p-04", title: "Culver Green House", description:
      "A craftsman reimagined around its kitchen: deep-green cabinetry, honed marble, and a pantry wall in quarter-sawn oak. The backyard studio is wired for remote work; the front porch faces Alberta's best coffee. Thoughtful, not precious.",
    price: 749000, type: "house", status: "available", beds: 3, baths: 2, area: 1980,
    address: "2216 NE Culver Ave", city: "Portland", state: "OR", district: "Alberta Arts",
    lat: 45.5589, lng: -122.6422, mapX: 12, mapY: 22,
    images: [IMG.kitchen, IMG.living, IMG.bedroom], amenities: ["Garden", "Home Office", "EV Charger", "Solar Panels", "Garage"],
    agentId: "u-agent2", yearBuilt: 1926, listedOn: "2026-01-27", views: 964,
  }),
  P({
    id: "p-05", title: "Casa Sombrita", description:
      "Walled Eastside compound in the true adobe tradition — thick plaster, heavy timber, and shade courts that stay ten degrees cool in July. The guest casita and sculpted pool make it equally suited to quiet mornings and long-table evenings.",
    price: 1595000, type: "villa", status: "available", beds: 4, baths: 4, area: 3480,
    address: "611 Camino Sombrita", city: "Santa Fe", state: "NM", district: "Eastside",
    lat: 35.6721, lng: -105.9106, mapX: 38, mapY: 44,
    images: [IMG.adobe, IMG.bedroom, IMG.pool], amenities: ["Pool", "Fireplace", "Garden", "Mountain View", "Wine Cellar", "Garage"],
    agentId: "u-agent1", yearBuilt: 1978, featured: true, listedOn: "2025-12-12", views: 2540,
  }),
  P({
    id: "p-06", title: "Pinewood A-Frame", description:
      "The classic Tahoe triangle, rebuilt to code with triple glazing and a steel spine. Morning fog rolls across the lake from the loft bedroom; the dock conveys. Sold over asking in nine days — join the waitlist for the sister lot.",
    price: 689000, type: "cabin", status: "sold", beds: 2, baths: 1, area: 1120,
    address: "8760 Emerald Bay Spur", city: "Lake Tahoe", state: "CA", district: "Tahoma",
    lat: 39.0566, lng: -120.1311, mapX: 8, mapY: 48,
    images: [IMG.cabin, IMG.living, IMG.bedroom], amenities: ["Fireplace", "Waterfront", "Mountain View", "Sauna"],
    agentId: "u-agent2", yearBuilt: 1971, listedOn: "2025-11-20", views: 3120,
  }),
  P({
    id: "p-07", title: "Aurora Terrace Penthouse", description:
      "A full-floor residence above South Lake Union with a 600 sq ft terrace aimed at the Sound. White oak, fluted glass, and a kitchen that would make a chef negotiate. Two side-by-side parking stalls and a private elevator landing.",
    price: 1120000, type: "apartment", status: "available", beds: 2, baths: 2, area: 1510,
    address: "1201 Aurora Terrace N, PH2", city: "Seattle", state: "WA", district: "South Lake Union",
    lat: 47.6335, lng: -122.3386, mapX: 14, mapY: 8,
    images: [IMG.cityview, IMG.bedroom, IMG.living], amenities: ["Balcony", "Doorman", "Gym", "Smart Home", "Garage"],
    agentId: "u-agent1", yearBuilt: 2021, featured: true, listedOn: "2026-02-10", views: 1490,
  }),
  P({
    id: "p-08", title: "The Wexford Suite", description:
      "A pied-à-terre done right: arched morning light, lime-washed walls, and a kitchen in green lacquer with unlacquered brass. One block from the park and two from the best breakfast counter in Capitol Hill. Pieds-à-terre don't get sweeter.",
    price: 465000, type: "apartment", status: "available", beds: 1, baths: 1, area: 860,
    address: "1509 Wexford Pl, #3B", city: "Denver", state: "CO", district: "Capitol Hill",
    lat: 39.7339, lng: -104.9783, mapX: 46, mapY: 34,
    images: [IMG.bedroom, IMG.kitchen, IMG.living], amenities: ["Home Office", "Garden", "Smart Home"],
    agentId: "u-agent2", yearBuilt: 1948, listedOn: "2026-02-14", views: 742,
  }),
  P({
    id: "p-09", title: "Bougainvillea Courtyard", description:
      "Mid-century courtyard villa in Vista Las Palmas: breeze-block light, a 40-foot pool, and palms older than the house. Walls of walnut glass slide fully away, so the whole home lives outdoors eight months a year. Desert modernism at its most livable.",
    price: 1340000, type: "villa", status: "available", beds: 3, baths: 3, area: 2350,
    address: "742 N Bougainvillea Cir", city: "Palm Springs", state: "CA", district: "Vista Las Palmas",
    lat: 33.8366, lng: -116.5453, mapX: 10, mapY: 80,
    images: [IMG.pool, IMG.living, IMG.kitchen], amenities: ["Pool", "Garden", "Solar Panels", "Garage", "EV Charger"],
    agentId: "u-agent1", yearBuilt: 1962, featured: true, listedOn: "2026-01-30", views: 1976,
  }),
  P({
    id: "p-10", title: "Foundry Loft No. 9", description:
      "One of nine lofts in a converted 1908 ironworks. Fourteen-foot timber trusses, painted brick, and factory windows that pour north light all day. The corner study and walnut library ladder convey; the roof rights are shared and glorious.",
    price: 1475000, type: "loft", status: "available", beds: 2, baths: 2, area: 1890,
    address: "96 Kent Foundry, Loft 9", city: "Brooklyn", state: "NY", district: "Williamsburg",
    lat: 40.7215, lng: -73.9616, mapX: 88, mapY: 28,
    images: [IMG.loft, IMG.cityview, IMG.living], amenities: ["Rooftop Deck", "Home Office", "Gym", "Doorman"],
    agentId: "u-agent1", yearBuilt: 1908, listedOn: "2025-12-28", views: 1663,
  }),
  P({
    id: "p-11", title: "Cedar Hollow Cottage", description:
      "A shingled cottage under old cedars, ten minutes from downtown Asheville. Recently re-plumbed, re-wired and re-insulated, with a reading loft and a screened porch made for mountain rain. Currently tenant-occupied with below-market rent in place.",
    price: 529000, type: "cabin", status: "rented", beds: 2, baths: 2, area: 1310,
    address: "58 Cedar Hollow Rd", city: "Asheville", state: "NC", district: "West End",
    lat: 35.5704, lng: -82.5698, mapX: 72, mapY: 46,
    images: [IMG.cabin, IMG.bedroom, IMG.living], amenities: ["Fireplace", "Garden", "Mountain View", "Home Office"],
    agentId: "u-agent2", yearBuilt: 1938, listedOn: "2025-10-05", views: 1108,
  }),
  P({
    id: "p-12", title: "The Glasshouse on 5th", description:
      "Sleek two-bedroom in The Gulch with a wall of glass over the city and a kitchen that hosts twelve without breaking conversation. Building gym, lap pool, and valet included. The kind of flat you buy for the view and keep for the block.",
    price: 612000, type: "apartment", status: "available", beds: 2, baths: 2, area: 1240,
    address: "701 5th Ave S, #1408", city: "Nashville", state: "TN", district: "The Gulch",
    lat: 36.1513, lng: -86.7892, mapX: 64, mapY: 58,
    images: [IMG.cityview, IMG.living, IMG.bedroom], amenities: ["Gym", "Pool", "Doorman", "Balcony", "Smart Home"],
    agentId: "u-agent2", yearBuilt: 2017, listedOn: "2026-02-18", views: 531,
  }),
  P({
    id: "p-13", title: "Sombrita Guest Casita", description:
      "The guest casita of a landmark Eastside compound, offered separately for the first time. Two bedrooms around a private shaded patio, original kiva fireplace, and shared access to the compound orchard. Awaiting final photography approval.",
    price: 715000, type: "villa", status: "pending", beds: 2, baths: 2, area: 1450,
    address: "611B Camino Sombrita", city: "Santa Fe", state: "NM", district: "Eastside",
    lat: 35.6725, lng: -105.9101, mapX: 40, mapY: 47,
    images: [IMG.adobe, IMG.kitchen, IMG.bedroom], amenities: ["Fireplace", "Garden", "Mountain View"],
    agentId: "u-agent1", yearBuilt: 1978, listedOn: "2026-02-20", views: 0,
  }),
  P({
    id: "p-14", title: "Beacon Wharf Flat", description:
      "Light-filled corner flat above the harbor with a galley kitchen in sage green and a Juliet balcony over the masts. Deeded storage and a resident sail loft in the basement. Pending editorial review before public launch.",
    price: 935000, type: "apartment", status: "pending", beds: 2, baths: 2, area: 1180,
    address: "42 Beacon Wharf, #5C", city: "Boston", state: "MA", district: "Seaport",
    lat: 42.3519, lng: -71.0445, mapX: 90, mapY: 12,
    images: [IMG.cityview, IMG.bedroom, IMG.kitchen], amenities: ["Balcony", "Waterfront", "Gym", "Doorman"],
    agentId: "u-agent2", yearBuilt: 2015, listedOn: "2026-02-21", views: 0,
  }),
];

export const SEED_REVIEWS: Review[] = [
  { id: "r-01", propertyId: "p-01", name: "Hannah & Luis M.", rating: 5, comment: "Toured at dusk and the light in that great room sold us before we saw the bedrooms.", date: "2026-02-06" },
  { id: "r-02", propertyId: "p-01", name: "Tom Aldridge", rating: 5, comment: "Build quality is well above spec. Daniel walked every system with us personally.", date: "2026-01-29" },
  { id: "r-03", propertyId: "p-03", name: "Elise Fontaine", rating: 5, comment: "The restoration is museum-grade but the house lives casually. Rare combination.", date: "2026-02-11" },
  { id: "r-04", propertyId: "p-03", name: "R. Vandermeer", rating: 4, comment: "Gorgeous, though South of Broad parking is what it is — the deeded stall is gold.", date: "2026-01-15" },
  { id: "r-05", propertyId: "p-05", name: "Gabi Ochoa", rating: 5, comment: "Spent a July afternoon in the shade court and understood the price immediately.", date: "2026-01-02" },
  { id: "r-06", propertyId: "p-05", name: "Neil & Sara P.", rating: 5, comment: "The casita alone is worth it. Priya's comps book was the most thorough we've seen.", date: "2025-12-30" },
  { id: "r-07", propertyId: "p-02", name: "Jae Park", rating: 5, comment: "Corner light all day. The terrace is bigger than my old living room.", date: "2026-02-15" },
  { id: "r-08", propertyId: "p-07", name: "Monique D.", rating: 5, comment: "Watched the ferries from the terrace during our tour. That was it, we were done looking.", date: "2026-02-16" },
  { id: "r-09", propertyId: "p-09", name: "C. Beaumont", rating: 4, comment: "Breeze-block shadows at 5pm are a religious experience. Pool needs resurfacing soon — priced accordingly.", date: "2026-02-08" },
  { id: "r-10", propertyId: "p-10", name: "Ada Kowalski", rating: 5, comment: "The trusses and north light are unreal for making. Live-work done properly.", date: "2026-01-22" },
  { id: "r-11", propertyId: "p-04", name: "Ben & Ivy", rating: 5, comment: "That kitchen. That porch. We wrote the offer from the coffee shop across the street.", date: "2026-02-12" },
  { id: "r-12", propertyId: "p-06", name: "K. Yamada", rating: 5, comment: "Bought in nine days, no regrets. The dock alone is worth the asking price.", date: "2025-12-01" },
];

export const SEED_INQUIRIES: Inquiry[] = [
  { id: "i-01", propertyId: "p-01", userId: "u-buyer", name: "Sofia Bennett", email: "sofia@mail.com", message: "Is the reflecting lawn irrigated with reclaimed water? We'd love a Saturday tour.", createdAt: "2026-02-18T15:24:00Z" },
  { id: "i-02", propertyId: "p-05", userId: "u-buyer2", name: "Marcus Webb", email: "marcus@mail.com", message: "Does the casita have separate utilities? Considering it as a two-home compound.", createdAt: "2026-02-17T19:02:00Z" },
  { id: "i-03", propertyId: "p-02", name: "Dana Whitfield", email: "dana.w@inbox.com", message: "What are the current HOA dues and is the doorman 24/7?", createdAt: "2026-02-19T13:41:00Z" },
  { id: "i-04", propertyId: "p-09", name: "Felix Arnaud", email: "felix@arnaud.co", message: "Interested in a lease-to-own structure for the Bougainvillea house. Open to a call?", createdAt: "2026-02-16T10:05:00Z" },
  { id: "i-05", propertyId: "p-03", userId: "u-buyer", name: "Sofia Bennett", email: "sofia@mail.com", message: "Could we see the garden lighting plan and the 1998 roof survey?", createdAt: "2026-02-14T17:55:00Z" },
];

export const SEED_BOOKINGS: Booking[] = [
  { id: "b-01", propertyId: "p-01", userId: "u-buyer", name: "Sofia Bennett", email: "sofia@mail.com", date: "2026-03-07", time: "11:00", status: "CONFIRMED", createdAt: "2026-02-18T15:30:00Z" },
  { id: "b-02", propertyId: "p-07", name: "Owen Castillo", email: "owen.c@inbox.com", date: "2026-03-02", time: "16:30", status: "PENDING", createdAt: "2026-02-20T09:12:00Z" },
  { id: "b-03", propertyId: "p-05", userId: "u-buyer2", name: "Marcus Webb", email: "marcus@mail.com", date: "2026-03-12", time: "10:00", status: "PENDING", createdAt: "2026-02-19T20:44:00Z" },
  { id: "b-04", propertyId: "p-02", name: "Dana Whitfield", email: "dana.w@inbox.com", date: "2026-02-25", time: "13:00", status: "CANCELLED", createdAt: "2026-02-15T11:00:00Z" },
];

export const RECENT_SALES = [
  { title: "Pinewood A-Frame", price: 712000, city: "Lake Tahoe" },
  { title: "Harborline Flat", price: 901000, city: "Boston" },
  { title: "Juniper Court", price: 1150000, city: "Austin" },
  { title: "The Albion Suite", price: 540000, city: "Denver" },
  { title: "Willow Bend Farmhouse", price: 823000, city: "Nashville" },
  { title: "Foxglove Cottage", price: 499000, city: "Asheville" },
  { title: "Ironworks Loft 4", price: 1389000, city: "Brooklyn" },
  { title: "Solana Casita", price: 688000, city: "Santa Fe" },
];

export const TESTIMONIALS = [
  {
    quote: "We toured eleven homes with Atrium and never felt sold to. Daniel flagged a foundation issue on the house we loved — then found us the better one.",
    name: "Hannah & Luis Mora",
    detail: "Bought in Zilker, Austin",
  },
  {
    quote: "The agent dashboard is the first one that treats listings like a craft. My approval-to-live time went from days to an afternoon.",
    name: "Priya Nair",
    detail: "Broker, 118 closings",
  },
  {
    quote: "I scheduled a visit at 11pm on my phone, confirmed by 9am the next day, and closed six weeks later. It simply worked.",
    name: "Marcus Webb",
    detail: "Bought in Santa Fe",
  },
];

export const OFFICES = [
  { city: "Austin", address: "1200 S Congress Ave, Suite 4", phone: "(512) 555-0100", hours: "Mon–Sat · 9a–7p" },
  { city: "Charleston", address: "71 Queen St", phone: "(843) 555-0148", hours: "Mon–Sat · 9a–6p" },
  { city: "Santa Fe", address: "320 Canyon Rd", phone: "(505) 555-0126", hours: "Tue–Sun · 10a–6p" },
];

export const DEMO_ACCOUNTS = [
  { role: "Buyer", email: "sofia@mail.com", password: "demo1234" },
  { role: "Agent", email: "daniel@atrium.est", password: "demo1234" },
  { role: "Admin", email: "admin@atrium.est", password: "demo1234" },
];
