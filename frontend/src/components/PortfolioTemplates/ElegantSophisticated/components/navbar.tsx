"use client";

import { useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "../ElegantSophisticated.module.css";

export type NavItem = {
  id: string;
  label: string;
};

type NavbarProps = {
  brand: string;
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
};

export function Navbar({ brand, items, activeId, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    onNavigate(id);
    setMenuOpen(false);
  };

  const homeId = items[0]?.id;

  return (
    <header className={styles.navWrapper}>
      <div className={styles.navInner}>
        <a
          href={homeId ? `#${homeId}` : "#"}
          className={styles.brand}
          onClick={(event) => {
            if (!homeId) return;
            handleNavigate(event, homeId);
          }}
        >
          {brand}
        </a>

        <nav className={styles.navList} aria-label="Portfolio section links">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(styles.navLink, activeId === item.id && styles.navLinkActive)}
              onClick={(event) => handleNavigate(event, item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={styles.navToggle}
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="es-mobile-nav"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav
        id="es-mobile-nav"
        className={cn(styles.mobilePanel, menuOpen && styles.mobilePanelOpen)}
        aria-label="Mobile portfolio section links"
      >
        {items.map((item) => (
          <a
            key={`mobile-${item.id}`}
            href={`#${item.id}`}
            className={cn(styles.mobileLink, activeId === item.id && styles.navLinkActive)}
            onClick={(event) => handleNavigate(event, item.id)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
