# Asset Cleanup Notes

## Original Material and Method

Ten supplied PNGs were found: two logos and eight jersey references. Both logos were preserved unchanged. All eight jerseys had inconsistent board framing; backs included a neighboring garment at the left, while fronts had clipped outer sleeve edges. Cropping alone would risk losing the intended jersey.

All eight were reconstructed with the image generator using their corresponding approved reference. This is generative reconstruction, not pixel-identical retouching: fabric microtexture and tiny label details can differ. Color, silhouette, Greek motif family and principal brand positions remain the approved design. No original archive or episode source was modified.

Original jersey references are retained byte-for-byte under assets/uniforms/2027/references. Metadata records include their SHA-256 hashes. Original crop dimensions are listed below. No image was fixed by cropping alone. All eight underwent generative reconstruction, followed by transparent-margin normalization using Sharp.

The generator returned 1254 x 1254 RGBA images, despite the requested 2048px canvas. Native artwork was NOT enlarged. Transparent borders were trimmed and the unchanged artwork centered on 1400 x 1400 transparent canvases. This exceeds the recommended 1200px minimum but not the preferred 1600px. Canvas size is not claimed as additional image detail. Actual garment height is 75.6-83.5% of the final image.

## Per-Asset Report

| Asset | Original dimensions | Original issue | Correction | Final dimensions | Garment height |
| --- | --- | --- | --- | --- | --- |
| [black front](../../assets/uniforms/2027/kairos/black/front.png) | 1141 x 1200 | Clipped outer sleeve; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 83.5% |
| [black back](../../assets/uniforms/2027/kairos/black/back.png) | 1165 x 1200 | Neighboring left garment; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 82.6% |
| [blue front](../../assets/uniforms/2027/kairos/blue/front.png) | 1133 x 1200 | Clipped outer sleeve; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 78.0% |
| [blue back](../../assets/uniforms/2027/kairos/blue/back.png) | 1174 x 1200 | Neighboring left garment; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 75.6% |
| [white front](../../assets/uniforms/2027/kairos/white/front.png) | 1170 x 1200 | Clipped outer sleeve; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 82.4% |
| [white back](../../assets/uniforms/2027/kairos/white/back.png) | 1194 x 1200 | Neighboring left garment; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 78.1% |
| [green front](../../assets/uniforms/2027/kairos/green/front.png) | 1161 x 1200 | Clipped outer sleeve; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 80.2% |
| [green back](../../assets/uniforms/2027/kairos/green/back.png) | 1203 x 1200 | Neighboring left garment; board edge; uneven margins | Reference-guided regeneration, complete garment reconstruction, transparent padding | 1400 x 1400 | 79.7% |
| [Kairos logo](../../assets/branding/kairos/kairos-esports-logo.png) | 877 x 887 | None requiring change | Unchanged original | 877 x 887 | Not applicable |
| [Asterion logo](../../assets/branding/asterion/asterion-intelligence-logo.png) | 877 x 887 | None requiring change | Unchanged original | 877 x 887 | Not applicable |

## Review Criteria

Each generated render was individually viewed: one full jersey, no adjacent sleeves or torsos, one collar, complete hem, correct color and orientation, no concept-board border/footer. Fronts preserve NB viewer-left, Kairos viewer-right and centered Asterion; backs preserve KAIROS and tonal column motifs. Alpha edges and the final on-page appearance are reviewed on the shared dark display surface.

The logos retain original transparency and glow. They were not merged, redrawn or sharpened.

[Asset metadata](../../index/visual-assets.json) is authoritative for paths, dimensions, hashes, import date, classification and original-reference provenance. [Uniform assignments](2027_UNIFORM_SYSTEM.md) are separate from narrative sponsorship status.

