// Shared dummy data for Live Events and Live Event detail pages.
// Grounded on prisma schema fields: events, tickets, bookings, booking_items (check-ins), event_venues.

const makeDate = (daysFromToday, hours = 18, minutes = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isTodayWindow = (startDate, endDate, todayStart) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);
  return start <= todayEnd && end >= todayStart;
};

const daysFromToday = (date, todayStart) => {
  const d = startOfDay(date);
  return Math.round((d - todayStart) / (1000 * 60 * 60 * 24));
};

export const getLiveEventSamples = () => {
  const todayStart = startOfDay(new Date());

  const events = [
    {
      id: "EVT-2048",
      title: "Sunset Rooftop Sessions",
      category: "Music",
      subCategory: "House & Techno",
      venue: "Skyline Terrace",
      city: "Mumbai",
      state: "MH",
      startDate: makeDate(0, 18, 30).toISOString(),
      endDate: makeDate(0, 23, 45).toISOString(),
      eventStatus: "ONGOING",
      publishStatus: "PUBLISHED",
      tags: ["Premium", "Rooftop", "Evening"],
      ticketTypes: [
        { id: "T-VIP", name: "VIP Table", type: "TABLE_TICKET", price: 8500, totalQty: 30, soldQty: 26, checkedIn: 19 },
        { id: "T-PREM", name: "Premium Lounge", type: "STANDARD_TICKET", price: 3800, totalQty: 140, soldQty: 122, checkedIn: 94 },
        { id: "T-GL", name: "Guestlist", type: "GUESTLIST", price: 0, totalQty: 60, soldQty: 38, checkedIn: 24 },
      ],
      bookings: { confirmed: 182, pending: 10, cancelled: 6 },
      checkIns: { total: 137, last15m: 22 },
      venueInfo: {
        address: "Skyline Terrace, Lower Parel",
        contact: "+91 98765 22011",
        email: "ops@skyline.com",
      },
      opsNotes: "High demand for premium lounge, keep check-in lanes split by ticket type.",
    },
    {
      id: "EVT-2055",
      title: "Founder Mixer: Web3 x AI",
      category: "Networking",
      subCategory: "Tech Community",
      venue: "Indiranagar Social",
      city: "Bengaluru",
      state: "KA",
      startDate: makeDate(0, 17, 15).toISOString(),
      endDate: makeDate(0, 21, 30).toISOString(),
      eventStatus: "ONGOING",
      publishStatus: "PUBLISHED",
      tags: ["Community", "Panel", "Afterhours"],
      ticketTypes: [
        { id: "T-FOUNDER", name: "Founder Pass", type: "STANDARD_TICKET", price: 2200, totalQty: 120, soldQty: 104, checkedIn: 71 },
        { id: "T-TEAM", name: "Team Bundle", type: "GROUP_TICKET", price: 6000, totalQty: 20, soldQty: 14, checkedIn: 46 },
        { id: "T-GL-START", name: "Guestlist - Startup", type: "GUESTLIST", price: 0, totalQty: 40, soldQty: 22, checkedIn: 15 },
      ],
      bookings: { confirmed: 136, pending: 6, cancelled: 4 },
      checkIns: { total: 132, last15m: 18 },
      venueInfo: {
        address: "Indiranagar Social, 12th Main",
        contact: "+91 98765 11223",
        email: "events@social.in",
      },
      opsNotes: "All panels on track; remind staff to scan group QR codes at the lounge entrance.",
    },
    {
      id: "EVT-2080",
      title: "Wellness Brunch & Breathwork",
      category: "Wellness",
      subCategory: "Brunch",
      venue: "Juhu Seaside Studio",
      city: "Mumbai",
      state: "MH",
      startDate: makeDate(2, 10, 0).toISOString(),
      endDate: makeDate(2, 13, 30).toISOString(),
      eventStatus: "UPCOMING",
      publishStatus: "PUBLISHED",
      tags: ["Mindfulness", "Daytime"],
      ticketTypes: [
        { id: "T-BRUNCH", name: "Brunch Seat", type: "STANDARD_TICKET", price: 1800, totalQty: 90, soldQty: 56, checkedIn: 0 },
        { id: "T-DUO", name: "Duo Pass", type: "COUPLE_ENTRY", price: 3200, totalQty: 30, soldQty: 18, checkedIn: 0 },
      ],
      bookings: { confirmed: 62, pending: 5, cancelled: 1 },
      checkIns: { total: 0, last15m: 0 },
      venueInfo: {
        address: "Juhu Seaside Studio, Mumbai",
        contact: "+91 98200 77889",
        email: "ops@seasidestudio.in",
      },
      opsNotes: "Confirm F&B vendor final counts tomorrow.",
    },
    {
      id: "EVT-2092",
      title: "Night Bazaar & Indie Music",
      category: "Culture",
      subCategory: "Market",
      venue: "Hauz Khas Amphitheatre",
      city: "Delhi",
      state: "DL",
      startDate: makeDate(5, 17, 0).toISOString(),
      endDate: makeDate(5, 23, 0).toISOString(),
      eventStatus: "UPCOMING",
      publishStatus: "PUBLISHED",
      tags: ["Bazaar", "Indie", "Outdoor"],
      ticketTypes: [
        { id: "T-GA", name: "General Admission", type: "STANDARD_TICKET", price: 1200, totalQty: 320, soldQty: 188, checkedIn: 0 },
        { id: "T-VIP-L", name: "Lounge Deck", type: "TABLE_TICKET", price: 4200, totalQty: 40, soldQty: 22, checkedIn: 0 },
      ],
      bookings: { confirmed: 166, pending: 12, cancelled: 3 },
      checkIns: { total: 0, last15m: 0 },
      venueInfo: {
        address: "Hauz Khas Amphitheatre, Delhi",
        contact: "+91 98111 00992",
        email: "ops@nightbazaar.in",
      },
      opsNotes: "Soundcheck with headline band scheduled a day prior.",
    },
  ];

  const liveEvents = events.filter(
    (e) => e.eventStatus === "ONGOING" || isTodayWindow(e.startDate, e.endDate, todayStart)
  );

  const upcomingEvents = events.filter(
    (e) =>
      daysFromToday(e.startDate, todayStart) > 0 &&
      daysFromToday(e.startDate, todayStart) <= 7
  );

  return { events, liveEvents, upcomingEvents, todayStart };
};

export const formatDateTime = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

export const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
