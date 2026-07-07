import kidneyLogo from "../assets/logo.svg";
import styles from "./TopBar.module.css";

export function TopBar({
  onHome,
  onReko,
  onHistory,
}: {
  onHome: () => void;
  onReko: () => void;
  onHistory: () => void;
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div onClick={onHome} className={styles.brand}>
          <div className={styles.logoBox}>
            <img src={kidneyLogo} alt="" className={styles.logoImg} />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>CekGinjal</div>
            <div className={styles.brandSub}>Skrining CKD</div>
          </div>
        </div>
        <div className={styles.nav}>
          <button onClick={onHome} className={styles.navBtn}>
            Beranda
          </button>
          <button onClick={onReko} className={styles.navBtn}>
            Cek ke Faskes
          </button>
          <button onClick={onHistory} className={styles.historyBtn}>
            Riwayat
          </button>
        </div>
      </div>
    </div>
  );
}
