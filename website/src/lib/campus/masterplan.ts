// Proposed Kairos Campus masterplan. Building functions marked "confirmed" are
// established in canon (episodes, character/organization records); exact
// geography, dimensions, and floor plans are not canonized anywhere and are
// marked "proposed" below. This file is a design proposal, not canon, and is
// safe to revise without touching unrelated code.

export type BuildingStatus = "confirmed-function" | "proposed-layout";

export interface CampusBuilding {
  id: string;
  name: string;
  status: BuildingStatus;
  description: string;
  rooms?: string[];
  teams?: string[];
  episodeRefs?: string[];
}

export interface CampusZone {
  id: string;
  letter: string;
  name: string;
  summary: string;
  buildings: CampusBuilding[];
}

export const campusZones: CampusZone[] = [
  {
    id: "administration",
    letter: "A",
    name: "Main administration and shared operations",
    summary:
      "Front-of-house and organizational functions shared across every Kairos division.",
    buildings: [
      {
        id: "reception",
        name: "Reception",
        status: "proposed-layout",
        description: "Campus entry point and visitor check-in.",
      },
      {
        id: "administration-offices",
        name: "Administration",
        status: "proposed-layout",
        description: "Front-office and organizational-operations staff.",
      },
      {
        id: "adrian-office",
        name: "Adrian's office",
        status: "confirmed-function",
        description:
          "Office of Adrian Vale, founder and CEO of Asterion Intelligence. Exact placement and layout within the administration building are not canonized.",
        teams: ["Asterion Intelligence"],
      },
      {
        id: "meeting-areas",
        name: "Meeting areas",
        status: "proposed-layout",
        description: "Shared conference and meeting space.",
      },
      {
        id: "media-interview",
        name: "Media / interview facilities",
        status: "confirmed-function",
        description:
          "Facilities used for press and interview coverage of Kairos rosters and staff.",
      },
      {
        id: "analytics-review",
        name: "Analytics and review resources",
        status: "proposed-layout",
        description: "Shared analytics and VOD/scrim review infrastructure.",
      },
      {
        id: "health-performance",
        name: "Health and performance support",
        status: "proposed-layout",
        description: "Sports medicine and performance-support staff and resources.",
      },
      {
        id: "gym-recovery",
        name: "Gym and recovery areas",
        status: "proposed-layout",
        description: "Strength, conditioning, and recovery facilities.",
      },
    ],
  },
  {
    id: "league-of-legends",
    letter: "B",
    name: "League of Legends facilities",
    summary: "Dedicated facilities for Kairos's three League of Legends rosters.",
    buildings: [
      {
        id: "lol-main-room",
        name: "Main / Black training room",
        status: "confirmed-function",
        description: "Primary training room for the Kairos LCS roster.",
        teams: ["Kairos Gaming (LCS)"],
      },
      {
        id: "lol-academy-blue-room",
        name: "Academy Blue training room",
        status: "confirmed-function",
        description: "Training room for Kairos Academy Blue.",
        teams: ["Kairos Academy Blue (NACL)"],
      },
      {
        id: "lol-academy-white-room",
        name: "Academy White training room",
        status: "confirmed-function",
        description: "Training room for Kairos Academy White.",
        teams: ["Kairos Academy White"],
      },
      {
        id: "lol-review",
        name: "Review facilities",
        status: "proposed-layout",
        description: "Shared VOD and scrim review space for League of Legends rosters.",
      },
      {
        id: "lol-coaching",
        name: "Coaching and mentoring spaces",
        status: "proposed-layout",
        description: "Coach offices and mentoring rooms for League of Legends staff.",
      },
    ],
  },
  {
    id: "counter-strike",
    letter: "C",
    name: "Counter-Strike facilities",
    summary: "Dedicated facilities for Kairos's Counter-Strike rosters.",
    buildings: [
      {
        id: "cs-main-room",
        name: "Main training room",
        status: "confirmed-function",
        description: "Primary training room for the Kairos Counter-Strike roster.",
        teams: ["Kairos Counter-Strike (Main)"],
      },
      {
        id: "cs-academy-room",
        name: "Academy training room",
        status: "confirmed-function",
        description: "Training room for the Kairos Counter-Strike academy roster.",
        teams: ["Kairos Counter-Strike (Academy)"],
      },
      {
        id: "cs-tactical-review",
        name: "Tactical review room",
        status: "proposed-layout",
        description: "Dedicated tactical-review space for Counter-Strike rosters.",
      },
      {
        id: "cs-coaching",
        name: "Coaching spaces",
        status: "proposed-layout",
        description: "Coach offices for Counter-Strike staff.",
      },
      {
        id: "cs-practice",
        name: "Practice / warmup facilities",
        status: "proposed-layout",
        description: "Warmup and individual-practice space.",
      },
    ],
  },
  {
    id: "dining-social",
    letter: "D",
    name: "Dining and shared social facilities",
    summary: "Shared dining and lounge space used across every division.",
    buildings: [
      { id: "dining-hall", name: "Main dining hall", status: "proposed-layout", description: "Primary campus dining hall." },
      { id: "cafeteria", name: "Cafeteria", status: "proposed-layout", description: "Casual food service." },
      { id: "lounge", name: "General lounge", status: "proposed-layout", description: "Shared lounge space." },
      { id: "gathering-areas", name: "Shared gathering areas", status: "proposed-layout", description: "Informal shared gathering space." },
    ],
  },
  {
    id: "kairos-commons",
    letter: "E",
    name: "Kairos Commons",
    summary: "Established in Episode 100 as a shared, non-competitive creative and community space.",
    buildings: [
      { id: "maker-lab", name: "Maker Lab", status: "confirmed-function", description: "Community maker/workshop space established in Episode 100." },
      { id: "music-room", name: "Music Room", status: "confirmed-function", description: "Shared music room established in Episode 100." },
      { id: "photo-film-room", name: "Photo & Film Room", status: "confirmed-function", description: "Shared photo and film production room established in Episode 100." },
      { id: "kitchen-studio", name: "Kitchen Studio", status: "confirmed-function", description: "Shared kitchen/cooking studio established in Episode 100." },
      { id: "kairos-community-room", name: "Kairos Community room", status: "confirmed-function", description: "Shared community gathering room established in Episode 100." },
    ],
  },
  {
    id: "outdoor-recreation",
    letter: "F",
    name: "Outdoor recreation",
    summary: "Outdoor recreation and landscaped space.",
    buildings: [
      { id: "basketball-court", name: "Basketball", status: "proposed-layout", description: "Outdoor basketball court." },
      { id: "multipurpose-court", name: "Multipurpose court", status: "proposed-layout", description: "Multipurpose outdoor court." },
      { id: "futsal-court", name: "Futsal", status: "proposed-layout", description: "Outdoor futsal court." },
      { id: "skate-area", name: "Skate area", status: "proposed-layout", description: "Outdoor skate area." },
      { id: "outdoor-seating", name: "Outdoor seating", status: "proposed-layout", description: "Landscaped outdoor seating." },
      { id: "walkways", name: "Walkways and landscaped spaces", status: "proposed-layout", description: "Connective landscaped walkways." },
    ],
  },
  {
    id: "residential",
    letter: "G",
    name: "Residential area",
    summary:
      "Player and staff residential facilities. Precise residential arrangements and floor plans, including Arthur Fletcher's, are not published.",
    buildings: [
      { id: "player-residences", name: "Player residential facilities", status: "proposed-layout", description: "Residential facilities for Kairos players." },
      { id: "staff-accommodation", name: "Staff accommodation", status: "proposed-layout", description: "Residential facilities for eligible staff." },
      {
        id: "family-residential",
        name: "Accessible family-residential zone",
        status: "confirmed-function",
        description:
          "Accessible, privacy-conscious residential zone. Arthur Fletcher has relocated to the campus residential area in established canon; no floor plan or precise unit arrangement is published.",
      },
    ],
  },
  {
    id: "future-expansion",
    letter: "H",
    name: "Future expansion",
    summary:
      "Reserved space for possible future organizational growth. No additional division, including Dota, has been launched.",
    buildings: [
      { id: "future-reserve", name: "Reserved expansion space", status: "proposed-layout", description: "Unallocated space reserved for future growth. No new division is confirmed." },
    ],
  },
];

export function allCampusBuildings(): CampusBuilding[] {
  return campusZones.flatMap((zone) => zone.buildings);
}
