export type ResourceSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  intro: string;
  sections: ResourceSection[];
  faqs: { question: string; answer: string }[];
  conclusion: string;
};

export const resources: ResourceArticle[] = [
  {
    slug: "how-to-find-reliable-ev-charging-stations-in-india",
    title: "How to find a reliable EV charging station in India",
    description:
      "A practical checklist for comparing EV charging stations, checking connectors, understanding pricing, and planning a dependable stop.",
    readTime: "7 min read",
    category: "Charging basics",
    intro:
      "Finding a charger is easy when you only need a pin on a map. Finding one that suits your vehicle, route, timing, and budget takes a little more care. Use this checklist before you leave so a charging stop is a useful part of the journey rather than an avoidable detour.",
    sections: [
      {
        heading: "Start with the connector your vehicle uses",
        paragraphs: [
          "Check your vehicle handbook or the charging-port label first. CCS2 is common for many newer electric cars in India, while Type 2 is widely used for AC charging. Two-wheelers may use different connectors or a removable battery setup. A station can have a high headline power rating and still be unsuitable if it does not offer your connector.",
          "On ChargeKaro, use the connector filter on the stations directory, then open the station details to review the listed connector information. If the station has missing details, treat that as a reason to verify before driving there, not as proof that every connector is available.",
        ],
      },
      {
        heading: "Compare charging speed with the time you have",
        paragraphs: [
          "AC charging is often a good fit for longer stops at a hotel, workplace, café, or home. DC fast charging can be more useful on a highway break, but the actual speed depends on the vehicle, battery temperature, state of charge, and the station's power sharing. A 120 kW label does not mean every vehicle will receive 120 kW throughout the session.",
        ],
        bullets: [
          "Use the power rating as an upper limit, not a promise of session speed.",
          "For a short road-trip stop, prioritize a compatible DC connector and a convenient location.",
          "For an overnight or workday stop, facilities and opening hours may matter more than maximum power.",
        ],
      },
      {
        heading: "Check location, hours, and the approach",
        paragraphs: [
          "A charger inside a hotel, office campus, mall, or fuel station may have access rules that are not obvious from the map pin. Read the address, district, operating hours, and any available listing notes. Confirm that the destination is reachable from your side of the road and that parking or entry is practical for your vehicle.",
          "Use the directions link from the station page when you are ready to travel. Keep a second nearby option in mind, especially for long drives or unfamiliar districts. ChargeKaro shows listed station information; it does not guarantee that a charger is free, powered, or accessible at the moment you arrive.",
        ],
      },
      {
        heading: "Treat pricing and availability as information to verify",
        paragraphs: [
          "Charging prices can vary by operator, site, vehicle, time, taxes, or the payment method used at the station. A blank price means the directory does not have a confirmed price, not that charging is free. Similarly, a listing should not be read as live availability unless the source explicitly provides it.",
          "Community updates can add useful context such as a queue, an open port, or an outage report. Because conditions change quickly, use them as recent signals and still confirm with the operator or site staff when the stop is important.",
        ],
      },
      {
        heading: "Build a simple fallback plan",
        paragraphs: [
          "For trips beyond your vehicle's comfortable range, choose a primary stop and one alternative within a reasonable detour. Leave a buffer for traffic, weather, elevation, air-conditioning, and the possibility that a charger is occupied. If your battery is getting low, stop earlier rather than relying on the last possible station.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does ChargeKaro show live charger availability?",
        answer:
          "Some listings may include recent community updates, but a listing or directory status is not a guarantee of live availability. Verify important stops with the operator or location before relying on them.",
      },
      {
        question: "What should I do when a station has missing connector or price details?",
        answer:
          "Use the station's navigation and contact information where available, and verify the details before travelling. Missing data should be treated as unknown rather than assumed.",
      },
    ],
    conclusion:
      "A reliable charging stop is the result of matching the connector, speed, access, and timing to your trip. Search the directory, compare the details, and keep a practical backup so you can drive with less uncertainty.",
  },
  {
    slug: "ev-charging-connectors-and-ac-vs-dc-explained",
    title: "EV charging connectors and AC vs DC charging explained",
    description:
      "Understand the most common EV charging terms in India so you can choose a compatible station with confidence.",
    readTime: "8 min read",
    category: "Charging basics",
    intro:
      "Charging listings can feel technical when they combine connector names, AC or DC labels, and a maximum power figure. The useful question is simple: will this station connect to my vehicle, and is it appropriate for the time I have? This guide explains the terms without assuming an engineering background.",
    sections: [
      {
        heading: "The difference between AC and DC",
        paragraphs: [
          "The electricity stored in an EV battery is direct current (DC). With AC charging, the vehicle's onboard charger converts electricity from alternating current before it reaches the battery. With DC fast charging, the conversion equipment is outside the vehicle, allowing a higher rate in many situations.",
          "AC is commonly suited to longer dwell times. DC is usually chosen when a driver wants to add meaningful range during a shorter stop. The vehicle's own charging limits still apply, so the same station can charge two models at different speeds.",
        ],
      },
      {
        heading: "Common connector terms you may see",
        paragraphs: [
          "CCS2 combines an AC connection with additional DC pins and is widely used by electric cars in India. Type 2 generally refers to an AC connector used by many passenger EVs and charging equipment. CHAdeMO is another DC standard that appears on some vehicles and stations. Bharat AC and Bharat DC are Indian charging standards used in parts of the network, particularly for specific vehicle categories.",
          "Connector naming can vary between a vehicle manufacturer, charging operator, and directory. If you are unsure, confirm the plug shape and vehicle compatibility in the vehicle manual or with the operator before you set out.",
        ],
      },
      {
        heading: "How to read a power rating",
        paragraphs: [
          "A station's maximum power is normally expressed in kilowatts (kW). It describes the equipment's rated ceiling, not a guaranteed rate for every minute. Charging often tapers as the battery fills, and a site may share power between multiple active ports.",
        ],
        bullets: [
          "A higher kW rating can reduce the time needed for a compatible vehicle, but only up to the vehicle's own limit.",
          "Battery temperature and state of charge can reduce the rate during a session.",
          "For comparison, also consider access, queue risk, hours, and price—not only kW.",
        ],
      },
      {
        heading: "Choosing a station for your situation",
        paragraphs: [
          "For an overnight stop, an AC Type 2 charger at a place where you are already staying may be the most convenient choice. For a highway break, a DC CCS2 station may better match your schedule. For a two-wheeler, check both the connector and whether the site supports the vehicle's charging method rather than assuming a car charger will work.",
          "The ChargeKaro stations directory lets you narrow results by connector, charging type, power, region, and other listed attributes. Open the station page before navigating so you can review all available details together.",
        ],
      },
      {
        heading: "Questions to ask when information is incomplete",
        paragraphs: [
          "If a listing does not specify the connector, number of ports, price, or access hours, the safest next step is to verify it. Ask the operator whether the port is compatible, whether an adapter is accepted, how payment works, and whether the site is open to the public. Do not infer these details from the station name alone.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is DC charging always better than AC charging?",
        answer:
          "No. DC is often faster, but AC can be more practical and economical for longer stops. The right choice depends on your vehicle, schedule, access, and the station's terms.",
      },
      {
        question: "Can I use an adapter to solve any connector mismatch?",
        answer:
          "Not necessarily. Compatibility depends on the vehicle, charger, electrical standard, and operator rules. Confirm with the vehicle maker and charging operator before using an adapter.",
      },
    ],
    conclusion:
      "Connector compatibility comes first, then charging type and power. Once those basics are clear, the directory's filters and station details make it easier to compare realistic options for your next stop.",
  },
  {
    slug: "how-to-plan-an-ev-road-trip-with-charging-stops",
    title: "How to plan an EV road trip with charging stops",
    description:
      "A practical trip-planning method for choosing charging stops, leaving a battery buffer, and handling uncertain station conditions.",
    readTime: "9 min read",
    category: "Trip planning",
    intro:
      "An EV road trip becomes much easier when charging is treated as part of the route instead of an emergency task. You do not need a perfect prediction. You need a primary plan, enough battery margin, and a fallback for the parts you cannot control.",
    sections: [
      {
        heading: "Estimate the usable distance conservatively",
        paragraphs: [
          "Start with the range you can use comfortably rather than the maximum figure from a brochure. Highway speed, hills, traffic, heat, rain, luggage, and cabin cooling or heating can all change consumption. Use your recent driving efficiency when you have it, and leave a buffer for the unexpected.",
          "If a route has long stretches with few stations, plan to arrive with more battery than you would need for a short urban trip. A buffer gives you options if the first site is busy or access is delayed.",
        ],
      },
      {
        heading: "Choose a primary stop and a backup",
        paragraphs: [
          "Use the map and directory to identify a station that fits your connector and timing. Then look for another viable station near the route or within a manageable detour. A backup does not have to be the fastest charger; it only needs to keep the trip moving safely.",
        ],
        bullets: [
          "Prefer stops that are actually on your route rather than far inside a city.",
          "Check opening hours and access notes before leaving.",
          "Avoid making the final possible charger your only plan.",
          "Save the station details or directions so they are easy to reopen.",
        ],
      },
      {
        heading: "Match the charging stop to your break",
        paragraphs: [
          "A charging stop is more comfortable when it fits something you already need to do. An AC charger may work well while you sleep, work, eat, or shop. A DC stop may suit a shorter break, but do not plan around the equipment's maximum power without considering your vehicle's charge curve and the possibility of a queue.",
          "Use the station's facilities, pricing, and power details to compare the complete stop—not just the pin on the map. If the listing is missing a critical detail, verify it before committing to the route.",
        ],
      },
      {
        heading: "Plan for the last part of the journey",
        paragraphs: [
          "Many drivers focus on the outbound route and forget the destination. Check whether your hotel, workplace, event venue, or return route has a compatible option. If the destination has no confirmed charging, include enough margin to reach a known station after arrival.",
        ],
      },
      {
        heading: "Use community updates as a signal, not a guarantee",
        paragraphs: [
          "A recent driver note can help you understand queues, ports, or outages. It is still a point-in-time report, and the situation can change after it is posted. Treat updates as one input alongside the station's listed information and direct confirmation when the trip has little margin.",
        ],
      },
    ],
    faqs: [
      {
        question: "How much battery should I keep as a road-trip buffer?",
        answer:
          "There is no single percentage that fits every vehicle or route. Keep a larger buffer where stations are sparse, weather is difficult, or a detour would be costly. Use your vehicle's range estimate together with recent consumption and route conditions.",
      },
      {
        question: "Should I always choose the highest-power charger?",
        answer:
          "No. The best stop also considers compatibility, route position, access, queue risk, price, and how long you plan to stay. A lower-power charger at a convenient longer stop can be the better choice.",
      },
    ],
    conclusion:
      "The most dependable EV road-trip plan is deliberately ordinary: search early, match the connector, leave a buffer, and keep a backup. ChargeKaro helps you compare the available details so the final decision fits your actual journey.",
  },
];

export function getResource(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}
