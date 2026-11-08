# Author Directive: 2027 LPL and CBLOL Rosters, Retirements, and Market Players

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

Backs `data/competitive-world-overrides/lpl-rosters-2027.json` and
`data/competitive-world-overrides/cblol-rosters-2027.json`: the Kairos Universe
2027 LPL and CBLOL starting lineups, thirteen LPL and ten CBLOL retirements, and
nine LPL players available for later Chinese, Korean and PCS market decisions.
The frozen pre-Worlds 2026 reference data is unchanged. LCS, LEC, Counter-Strike
and the internal Kairos rosters are unchanged.

No exact collective announcement date has been approved for these lineups;
`confirmedBy` is `null`, the period is shown as the 2027 season, and former-team
`Left` dates are intentionally unknown. No signing dates, contracts, salaries,
ratings, results, standings or qualifications are established. The earlier
LCS date of 2027-01-27 is not reused.

## LPL lineups

| Team | Top | Jungle | Mid | ADC | Support |
|---|---|---|---|---|---|
| Anyone's Legend | Zika | Tian | Shanks | Hope | Parukia |
| Bilibili Gaming | Bin | Xun | Creme | Assum | ON |
| Invictus Gaming | Breathe | Wei | Knight | Elk | Vampire |
| JD Gaming | ZUIAN | xiaofang | HongQ | JiaQi | Meiko |
| LNG Esports | Xiaoxu | Monki | Nia | GALA | MISSING |
| Top Esports | sheer | Xiaohao | Care | 1xn | Zhuo |
| Weibo Gaming | Flandre | Weiwei | Xiaohu | JackeyLove | Jwei |
| Oh My God | Zdz | Junhao | Tangyuan | Photic | Erha |

## CBLOL lineups

| Team | Top | Jungle | Mid | ADC | Support |
|---|---|---|---|---|---|
| Fluxo W7M | Zothve | Josedeodo | cody | Viciun* | Ackerman |
| FURIA | Xyno | Tatu | Fuuu | Ayu | Ceos |
| Leviatán | Devost | Booki | Enga | Strensh | Shiku |
| LOS | Boal | Curse | Namiru | Duduhh | JoJo |
| LOUD | Guigo | Disamis | Envy* | Rabelo | Telas* |
| paiN Gaming | Yupps* | STEPZ | Tutsz | Brance* | uZent |
| RED Canids | zynts | CarioK | Leleko* | Morttheus | frosty* |
| Keyd Stars | zekas | Sinatra | Grevthar* | Netuno* | scamber |

`*` Overlay identity, not in the frozen scene. `MISSING` (LNG Esports Support)
and `ON` (Bilibili Gaming Support) are literal nicknames, not placeholders.
Brance, Envy (Bruno Farias), frosty, Grevthar and Leleko were matched to
Leaguepedia 2026-08-03 snapshot records by nickname, Brazilian region and role.
ZUIAN (JD Gaming Top) is the existing Top Esports 2026 record
(`external-lol-player-zuian`), confirmed by the author. Viciun, Telas, Yupps and
Netuno exist in neither the frozen scene nor
the snapshot, so they are nickname-only identities: no legal name,
nationality or birth date is invented.

## Retirements

LPL (13): Moham, Karis, About, HOYA, Ycx, Rookie, Tarzan, Jiejie, sinian, Leave,
Heng, Shaoye, Crisp. CBLOL (10): Peach, BAO, Zest, Feisty, Keine, Hena, Mireu,
Jeskla, Kaze, Momochi. Xiaohao, Zdz and Tangyuan are active and not retired.
Retired players keep their historical records, are not auto-assigned as
coaches, and have no invented retirement date or reason.

## Market players

Chinese players without a confirmed destination (Keshi, Feather, fengyue), five
Korean players for later LCK work (Burdol, TheShy, BuLLDoG, Viper, Kael) and
JunJia (PCS, for later LCP work) stay unassigned. Nobody is placed into a
roster slot to reach five, and nobody is retired.

## Cleanup rules applied

- A player who joins an approved team has the previous active 2026 tenure
  superseded (a departure record) and holds one active starting slot only.
- Existing free-agent records that contradicted a confirmed 2027 status are
  removed from `free-agents-2027.json` and kept as `priorStatus` on the new
  record, so the history stays visible.
- Inactive organizations (Team WE, LGD Gaming, EDward Gaming, ThunderTalk
  Gaming, Ninjas in Pyjamas, Ultra Prime) do not return to the LPL.
- Regional membership files are unchanged.
