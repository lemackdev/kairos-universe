import styles from "./PrizeCards.module.css";

export interface PrizeCard {
  place: string;
  prize: string | null;
  teamName: string | null;
}

// One card per team slot: the winner and runner-up are larger, every other placement shares a four-column grid.
export function PrizeCards({ prizes }: { prizes: PrizeCard[] }) {
  const countOf = (place: string) => prizes.filter((prize) => prize.place === place).length;
  // Four columns: the first two cards take half a row each; a placement shared by two teams splits the row in half, and larger groups use one column per card so no row is left partly empty.
  const spanOf = (place: string, index: number) => (index < 2 ? 2 : countOf(place) === 2 ? 2 : 1);
  return <div className={styles.grid}>
    {prizes.map((prize, index) => <div key={index} className={`${styles.card} ${index < 2 ? styles.top : ""}`} style={{ gridColumn: `span ${spanOf(prize.place, index)}` }}>
      <div className={styles.team}>
        <span className={styles.mark} aria-hidden="true">?</span>
        <strong className={prize.teamName ? undefined : styles.tbd}>{prize.teamName ?? "TBD"}</strong>
      </div>
      <div className={styles.place}>{prize.place}</div>
      <div className={styles.prize}>{prize.prize ?? "TBD"}</div>
    </div>)}
  </div>;
}
