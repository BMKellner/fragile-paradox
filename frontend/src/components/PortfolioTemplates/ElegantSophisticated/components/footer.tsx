import styles from "../ElegantSophisticated.module.css";

type FooterProps = {
  fullName: string;
};

export function Footer({ fullName }: FooterProps) {
  return (
    <footer className={styles.footer}>
      © {new Date().getFullYear()} {fullName}. Crafted with intention.
    </footer>
  );
}
