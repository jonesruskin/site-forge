import {
  ActivityIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  BoxIcon,
  CircleIcon,
  CreditCardIcon,
  FileTextIcon,
  FlagIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  type LucideIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

/**
 * Icons addressable by name from site.config.ts (`nav.dashboard[].icon`).
 * Only these are bundled; add names here when you need more.
 */
const icons: Record<string, LucideIcon> = {
  activity: ActivityIcon,
  "bar-chart-3": BarChart3Icon,
  bell: BellIcon,
  "book-open": BookOpenIcon,
  box: BoxIcon,
  "credit-card": CreditCardIcon,
  "file-text": FileTextIcon,
  flag: FlagIcon,
  folder: FolderIcon,
  home: HomeIcon,
  inbox: InboxIcon,
  "key-round": KeyRoundIcon,
  "layout-dashboard": LayoutDashboardIcon,
  "life-buoy": LifeBuoyIcon,
  "message-square": MessageSquareIcon,
  settings: SettingsIcon,
  shield: ShieldIcon,
  "shopping-bag": ShoppingBagIcon,
  sparkles: SparklesIcon,
  upload: UploadIcon,
  user: UserIcon,
  users: UsersIcon,
};

export function NavIcon({ name }: { name?: string }) {
  const Icon = (name && icons[name]) || CircleIcon;
  return <Icon aria-hidden />;
}
