import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { PARISH_MAP_URL } from '@/lib/parish';
import styles from './parish.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="welcome-title">
      <div className={styles.heroImage}>
        <Image src="/images/church/st-antony-banner.webp" alt="Illustration inspired by St. Antony’s Church in Illuppur, with its cream facade, blue trim, and central bell tower" fill preload sizes="100vw" className="object-cover" />
      </div>
      <div className={styles.heroWash} />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.shortRule} /> OUR PARISH. YOUR HOME.</p>
          <h1 id="welcome-title">St. Antony’s<br /><em>Church</em></h1>
          <p className={styles.heroDescription}>Rooted in faith. Together in love.<br />Welcome to your parish family in Illuppur.</p>
          <div className={styles.heroActions}>
            <a href="#services" className={styles.heroPrimary}>Parish services <ArrowUpRight size={17} /></a>
            <a href={PARISH_MAP_URL} target="_blank" rel="noopener noreferrer" className={styles.heroDirections}><MapPin size={16} /> Visit our church <ArrowUpRight size={14} /></a>
          </div>
        </div>
        <span className={styles.artworkCaption}>Church-inspired illustration</span>
      </div>
    </section>
  );
}
