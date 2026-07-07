import styles from "./shared.module.css";

export const mono = "'IBM Plex Mono',monospace";

export const inputBase = styles.inputBase;
export const labelStyle = styles.labelStyle;

export function seg(active: boolean): string {
  return `${styles.seg} ${active ? styles.segActive : ""}`;
}

export function actCard(active: boolean): string {
  return `${styles.actCard} ${active ? styles.actCardActive : ""}`;
}
