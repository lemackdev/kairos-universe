# Historical Source Manifest

## Archived Source

- **File:** [kairos-original-episodes.pdf](sources/kairos-original-episodes.pdf)
- **Source type:** Immutable historical episode archive
- **Pages:** 189
- **Episodes represented:** 1 through 29
- **SHA-256:** `78a90435ffd9c88ccfad66c2710360e0c1c56dbe69839141a147ec558d238342`
- **Archive status:** Preserved byte-for-byte from the supplied source

The archived PDF must not be edited, normalized, deduplicated, or silently
corrected. Current canon corrections belong in `docs/`, `data/`, and the
[Canon Inconsistency Audit](../docs/retcons/CANON_INCONSISTENCY_AUDIT.md).

## Source Priority

When sources disagree, use this order:

1. Current repository canon.
2. [Canon Inconsistency Audit](../docs/retcons/CANON_INCONSISTENCY_AUDIT.md).
3. This historical PDF.

The historical source remains evidence of what the original episodes said. It
does not override later canon.

## Episode Page Map

| Episode | Historical title | Canonical source pages | Duplicate pages |
| ---: | --- | ---: | --- |
| 1 | O Começo | 1-4 | None |
| 2 | O Primeiro Recruta | 5-9 | None |
| 3 | A Fundação | 10-15 | None |
| 4 | O Homem Certo | 16-22 | None |
| 5 | A Caçada | 23-27 | None |
| 6 | As Primeiras Propostas | 28-34 | None |
| 7 | A Escolha dos Cinco | 35-42 | None |
| 8 | Os Primeiros Cinco | 43-48 | None |
| 9 | Os Primeiros Jogadores da Kairos | 49-55 | None |
| 10 | O Anúncio | 56-62 | None |
| 11 | O Dia da Revelação | 63-69 | None |
| 12 | O Campus | 70-75 | None |
| 13 | O Primeiro Bootcamp | 76-83 | None |
| 14 | O Convite | 84-89 | None |
| 15 | Os Cinco Guardiões | 90-97 | None |
| 16 | Solo Queue | 98-104 | None |
| 17 | A Primeira Scrim | 105-111 | None |
| 18 | O Convite Inesperado | 112-117 | None |
| 19 | A T1 Academy | 118-122 | None |
| 20 | A Última Partida | 123-129 | None |
| 21 | O Convite de Faker | 130-135 | None |
| 22 | De Volta Para Casa | 136-141 | None |
| 23 | Um Novo Começo | 142-148 | None |
| 24 | O Primeiro Scouting | 149-152 | None |
| 25 | O Primeiro Líder | 153-160 | None |
| 26 | Encontrando o General | 161-167 | None |
| 27 | Um Passeio pelo Outro Lado | 168-172 | None |
| 28 | O Relatório de Outubro | 173-178 | 179-184 |
| 29 | Um Nome no Quadro | 185-189 | None |

Page 89 is blank in the source. Pages 179 through 184 are byte-identical
rendered duplicates of pages 173 through 178. Episode 28 has one structured
record and cites pages 173 through 178. The duplicate remains inside the
immutable source PDF but is not treated as a second episode.

## Normalized Episodes 30-56 Source

### Preserved DOCX

- **File:** [KAIROS_EPISODES_030_056_NORMALIZED.docx](episode-sources/KAIROS_EPISODES_030_056_NORMALIZED.docx)
- **Source type:** Supplied normalized episode source
- **Episodes represented:** 30 through 56
- **SHA-256:** `bcff37746ba77d2ff4d90b116889f1944e85b932fdf0a549b8c34ee9d082b5d4`
- **Preservation status:** Preserved byte-for-byte from the supplied file

### Searchable Markdown

- **File:** [KAIROS_EPISODES_030_056_NORMALIZED.md](../docs/episodes/sources/KAIROS_EPISODES_030_056_NORMALIZED.md)
- **Source type:** Searchable normalized transcription
- **Supplied-file SHA-256:** `b676238682073decbbe8f102cf9d6f7ed78d9eef127484474de3c0f20579bba9`
- **Repository SHA-256:** `33cc223df366dcf0e2fe3c63829c615cd81a63065b83f9afddb282213dcee065`
- **Normalization status:** Three residual third-person sentences in Episode 53
  were converted to first person under the explicit source-normalization rule.

### Rendered PDF

- **File:** [KAIROS_EPISODES_030_056_NORMALIZED.pdf](episode-sources/KAIROS_EPISODES_030_056_NORMALIZED.pdf)
- **Source type:** Generated normalized reading copy
- **Pages:** 82
- **SHA-256:** `b41125490d91c7f93033b2c24aa6e1e589ea70112bc11f4813d0ca9c2b9041a3`
- **Derivative status:** Generated from the preserved DOCX with the documented
  Episode 53 first-person corrections applied during rendering

The DOCX is the preserved supplied artifact. The Markdown is the canonical
searchable source used by episode records. The PDF is a generated reading
derivative and must not override either source.

See [Source Normalization 030-056](../docs/episodes/SOURCE_NORMALIZATION_030_056.md)
for the controlled correction log.

## Episodes 57-75 Source

### Preserved DOCX

- **File:** [KAIROS_EPISODES_057_075_SOURCE.docx](episode-sources/KAIROS_EPISODES_057_075_SOURCE.docx)
- **Source type:** Supplied episode source
- **Episodes represented:** 57 through 75
- **SHA-256:** `cbc198e201dd23dd7211679097c94ad94b5c1dd86e72e55beb6da0fd69932c2b`
- **Preservation status:** Preserved byte-for-byte from the supplied file

### Searchable Markdown

- **File:** [KAIROS_EPISODES_057_075_NORMALIZED.md](../docs/episodes/sources/KAIROS_EPISODES_057_075_NORMALIZED.md)
- **Source type:** Searchable current-canon transcription
- **Repository SHA-256:** `def6c10156bc448090a67dcd25f605832d2f9c52486fd0664a5581230fedd26b`
- **Episodes represented:** 57 through 75
- **Normalization status:** Typography, headings, whitespace, dates, and
  documented current-canon conflicts normalized

The DOCX remains the preserved supplied artifact. The Markdown is the
authoritative searchable source cited by Episode 57-75 records. Every material
change is listed in
[Episodes 057-075 Source Normalization](../docs/episodes/EPISODES_057_075_NORMALIZATION.md).

## Preservation Rules

- Never rewrite the historical episode prose.
- Never remove the duplicate pages from the archived source.
- Never use historical names or outdated chronology as current canon when a
  newer repository rule exists.
- Preserve historical aliases and factual errors as documented history.
- Add future source files with a checksum and provenance entry.
- If the archived file hash changes, treat that as an integrity failure.
- Preserve supplied source artifacts before applying documented searchable or
  rendered normalizations.
