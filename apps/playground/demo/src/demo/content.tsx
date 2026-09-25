import {
  BarChart3Icon,
  BellIcon,
  CalendarIcon,
  FolderIcon,
  GlobeIcon,
  LayersIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RepeatIcon,
  SettingsIcon,
  UsersIcon,
  WandIcon,
  ZapIcon,
} from "lucide-react";

import type { BentoItem } from "@/components/sections/bento-grid";
import type { DashboardNavGroup } from "@/components/sections/dashboard-shell";
import type { Feature } from "@/components/sections/feature-grid";
import type { FeatureRow } from "@/components/sections/feature-rows";
import type { Logo } from "@/components/sections/logo-cloud";
import type { PricingPlan } from "@/components/sections/pricing-table";
import type { Testimonial } from "@/components/sections/testimonials";

/*
 * Demo content for the playground only. It describes an invented product,
 * "Tidewater", a scheduling tool for small clinics, so the sections read like
 * a real site instead of lorem ipsum.
 */

export const art = (n: number, alt = "Abstract placeholder artwork") => ({ src: `/demo/art-${n}.svg`, alt, width: 1600, height: 1000 });
export const portrait = (n: number, alt: string) => ({ src: `/demo/portrait-${n}.svg`, alt, width: 800, height: 1000 });

export const logos: Logo[] = ["Halcyon", "Tessellate", "Mooring", "Quillon", "Parallax", "Ostrander"].map((name) => ({
  src: `/demo/logo-${name.toLowerCase()}.svg`,
  alt: name,
  width: 40 + name.length * 14,
  height: 40,
}));

export const features: Feature[] = [
  { icon: <CalendarIcon />, title: "Booking that fills gaps", description: "Tidewater offers the slots that keep your day compact instead of the first free hour." },
  { icon: <RepeatIcon />, title: "Recurring visits", description: "Weekly physio or monthly check-ins are one tap, with conflicts flagged before they happen." },
  { icon: <BellIcon />, title: "Reminders people read", description: "Plain-language texts at the right time, and a one-tap reschedule link when plans change." },
  { icon: <LockIcon />, title: "Private by default", description: "Patient notes are encrypted at rest and never leave the region you choose." },
  { icon: <UsersIcon />, title: "Shared calendars", description: "See every practitioner side by side and move appointments by dragging." },
  { icon: <BarChart3Icon />, title: "No-show insights", description: "Spot the weekdays and times that go empty, then open them to new patients." },
];

export const rows: FeatureRow[] = [
  {
    eyebrow: "Front desk",
    title: "A calendar that argues back",
    description: "Double bookings, back-to-back long sessions and missing breaks are flagged as you schedule, not after.",
    bullets: ["Conflict warnings while dragging", "Buffer time per treatment type", "Room and equipment awareness"],
    image: art(2, "Calendar view with color-coded appointments"),
  },
  {
    eyebrow: "Patients",
    title: "Booking in under a minute",
    description: "A booking page your patients can use without an account, on any phone, in their own language.",
    bullets: ["No sign-up required", "Works on slow connections", "Translated into 12 languages"],
    image: art(3, "Phone showing the booking page"),
    actions: [{ label: "See the booking flow", href: "#", variant: "outline" }],
  },
];

export const bento: BentoItem[] = [
  { size: "lg", title: "The whole week at a glance", description: "Every room, practitioner and gap in one view.", media: <div className="bg-muted absolute inset-0" /> },
  { title: "Instant reschedule", description: "One link, zero phone calls.", icon: <ZapIcon /> },
  { title: "Works offline", description: "Your front desk keeps going when the wifi doesn't.", icon: <GlobeIcon /> },
  { size: "wide", inverted: true, title: "Automations", description: "Send intake forms two days before first visits, automatically.", icon: <WandIcon /> },
  { title: "Integrations", description: "Calendars, payments and your EHR.", icon: <LayersIcon /> },
];

export const testimonials: Testimonial[] = [
  { quote: "We cut no-shows by a third in the first month. The reminder texts sound like us, not like a robot.", name: "Maya Okafor", role: "Owner, Harbor Physio", avatar: portrait(1, "Maya Okafor") },
  { quote: "Our receptionist stopped dreading Mondays.", name: "Daniel Frost", role: "Practice manager, Northside Dental" },
  { quote: "Setting up took an afternoon. Moving off our old system took less than a day.", name: "Priya Raman", role: "Director, Lotus Wellness", avatar: portrait(2, "Priya Raman") },
  { quote: "Patients book the gaps we used to leave empty. It pays for itself every week.", name: "Tomás Varga", role: "Chiropractor" },
  { quote: "Finally a scheduling tool that respects that we're a small team.", name: "Hannah Lind", role: "Co-founder, Clearwater Clinic", avatar: portrait(3, "Hannah Lind") },
];

export const plans: PricingPlan[] = [
  {
    id: "solo",
    name: "Solo",
    description: "For one practitioner.",
    price: { monthly: 19, yearly: 190 },
    features: ["1 calendar", "Unlimited bookings", "Text reminders (200/mo)", "Booking page"],
    cta: { label: "Start free trial", href: "#" },
  },
  {
    id: "clinic",
    name: "Clinic",
    description: "For growing teams.",
    price: { monthly: 49, yearly: 490 },
    features: ["Up to 10 calendars", "Rooms and equipment", "Text reminders (2,000/mo)", "Intake forms", "Priority support"],
    cta: { label: "Start free trial", href: "#" },
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "group",
    name: "Group",
    description: "For multi-site practices.",
    price: { monthly: null },
    customPriceLabel: "Let's talk",
    features: ["Unlimited calendars", "Multiple locations", "SSO and audit log", "Dedicated onboarding"],
    cta: { label: "Contact sales", href: "/contact" },
  },
];

export const faqs = [
  { question: "Do patients need an account to book?", answer: "No. They choose a time, enter a name and phone number, and confirm by text." },
  { question: "Can I import my existing appointments?", answer: "Yes. Upload a CSV or connect Google Calendar, and future appointments come across with their notes." },
  { question: "Where is data stored?", answer: "In the EU or US region you pick at sign-up. Data never moves between regions." },
  { question: "What happens after the trial?", answer: "Nothing, unless you add a card. Your data stays available to export for 90 days." },
];

export const stats = [
  { value: "31%", label: "fewer no-shows", description: "median across clinics after 60 days" },
  { value: "4 min", label: "average booking time", description: "from link to confirmation" },
  { value: "1,200+", label: "clinics", description: "in 14 countries" },
  { value: "99.98%", label: "uptime", description: "over the last 12 months" },
];

export const team = [
  { name: "Ines Moreau", role: "Co-founder, product", bio: "Ran a physio practice for eight years before building the tool she wanted.", photo: portrait(1, "Ines Moreau"), links: [{ label: "LinkedIn", href: "https://www.linkedin.com" }] },
  { name: "Kwame Asante", role: "Co-founder, engineering", photo: portrait(2, "Kwame Asante") },
  { name: "Lena Sato", role: "Design", photo: portrait(3, "Lena Sato") },
  { name: "Omar Haddad", role: "Customer success" },
];

export const timeline = [
  { date: "2022", dateTime: "2022", title: "First clinic", description: "A single spreadsheet replaced by a single calendar." },
  { date: "2023", dateTime: "2023", title: "Booking pages", description: "Patients start booking themselves; no-shows drop." },
  { date: "2024", dateTime: "2024", title: "Rooms and equipment", description: "Scheduling that understands the physical space." },
  { date: "2025", dateTime: "2025", title: "1,000 clinics", description: "Across 14 countries, still a team of twelve." },
];

export const posts = [
  { title: "Why reminders sent at 6pm work better than 9am", href: "#", date: "2026-08-14", readingTime: "5 min read", excerpt: "We looked at 2 million reminders. Timing mattered more than wording.", tags: ["Research"], image: art(4, "Chart of reminder open rates") },
  { title: "Designing a booking page for one thumb", href: "#", date: "2026-07-02", readingTime: "7 min read", excerpt: "Every tap we removed and the one we added back.", tags: ["Design"], image: art(5, "Phone mockups") },
  { title: "Moving 1,200 clinics to a new database without downtime", href: "#", date: "2026-05-21", readingTime: "11 min read", excerpt: "Dual writes, shadow reads and a very long checklist.", tags: ["Engineering"], image: art(6, "Diagram of the migration") },
];

export const projects = [
  { title: "Harbor Physio", href: "#", summary: "Booking redesign that halved phone calls.", image: art(1, "Harbor Physio booking page"), year: 2026, tags: ["Product", "Research"], featured: true },
  { title: "Lotus Wellness", href: "#", summary: "Multi-site rollout in six weeks.", image: art(2, "Lotus Wellness calendar"), year: 2025, tags: ["Rollout"] },
  { title: "Clearwater Clinic", href: "#", summary: "Accessibility audit and fixes.", image: art(3, "Clearwater accessibility report"), year: 2025, tags: ["Accessibility"] },
];

export const contactDetails = [
  { label: "Email", value: "hello@tidewater.example", href: "mailto:hello@tidewater.example", icon: <MailIcon /> },
  { label: "Phone", value: "+44 20 7946 0000", href: "tel:+442079460000", icon: <PhoneIcon /> },
  { label: "Office", value: "12 Quay Street, Bristol", icon: <MapPinIcon /> },
];

export const dashboardNav: DashboardNavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/demo/dashboard", icon: <BarChart3Icon />, exact: true },
      { label: "Calendar", href: "/demo/dashboard/calendar", icon: <CalendarIcon /> },
      { label: "Patients", href: "/demo/dashboard/patients", icon: <UsersIcon />, badge: <span className="bg-muted rounded-sm px-1.5 text-xs">12</span> },
      { label: "Files", href: "/demo/dashboard/files", icon: <FolderIcon /> },
    ],
  },
  { title: "Workspace", items: [{ label: "Settings", href: "/demo/dashboard/settings", icon: <SettingsIcon /> }] },
];
