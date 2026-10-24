import styles from "./ChildProfile.module.css";

/** One character atlas: same face, glasses and clothing across all UI states. */
export function TempoCharacter({pose="portrait"}:{pose?:"portrait"|"celebrate"|"encourage"|"book"}) {
  return <span className={styles.character} data-pose={pose} aria-hidden="true"/>;
}
