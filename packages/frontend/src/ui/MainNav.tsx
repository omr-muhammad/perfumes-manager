import {
  HiOutlineBeaker,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineSparkles,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import NavItem, { type NavItemProps } from './NavItem';
import styles from './main-nav.module.css';
import { HiOutlineUsers } from 'react-icons/hi';
import { IoArrowBack } from 'react-icons/io5';
import { GiDelicatePerfume } from 'react-icons/gi';

const NAV_ITEMS: NavItemProps[] = [
  { to: 'perfumes', label: 'perfumes', icon: <HiOutlineSparkles /> },
  { to: 'companies', label: 'companies', icon: <HiOutlineBuildingOffice2 /> },
  { to: 'compounds', label: 'compounds', icon: <HiOutlineBeaker /> },
  { to: 'shops', label: 'shops', icon: <HiOutlineBuildingStorefront /> },
  { to: 'settings', label: 'settings', icon: <HiOutlineCog6Tooth /> },
];

const SHOP_NAV_ITEM: NavItemProps[] = [
  { to: 'shop-compounds', label: 'shopCompounds', icon: <GiDelicatePerfume /> },
  { to: 'staff', label: 'staff', icon: <HiOutlineUsers /> },
  { to: '/dashboard', label: "back", icon: <IoArrowBack />, end: true }
]
export default function MainNav({ whichNav }: { whichNav?: "shops" }) {
  const items = whichNav ? SHOP_NAV_ITEM : NAV_ITEMS;

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </ul>
    </nav>
  );
}
