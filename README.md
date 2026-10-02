# North Atlantic right whales: visual reverse engineering

Course project by Nicole Lu for Data Visualization for Architecture, Urbanism, and the Humanities, Fall 2026. Assignment due October 1, 2026.

## Original visualization

NOAA Northeast Fisheries Science Center, **Right Whale Abundance**, Northeast US Ecosystem Indicator Catalog, first chart (the section labels it “adult, Mid-Atlantic”). Contributors: Daniel Linden, Richard Pace, New England Aquarium.

- Original page: https://noaa-edab.github.io/catalog/narw.html
- Original chart: https://noaa-edab.github.io/catalog/catalog_files/figure-html/plot_narwadultMidAtlantic-1.png
- Local original chart: `assets/original-noaa-chart.png`
- Required browser screenshot: `assets/original-screenshot.png`
- Source page updated July 23, 2026; accessed October 1, 2026.

## Reproduction

The chart is drawn from scratch in JavaScript and SVG. It does not embed the original chart or use an iframe. The original image appears only in the explicitly labeled comparison section.

The recreation preserves the 672 × 480 aspect ratio, white background, black bounding box, Arial-style labels, gray uncertainty ribbon, thin black connecting line, circular marks, sparse decade ticks, dashed horizontal reference, and pale recent-period band. The early blank years remain blank, matching the original axis extent. The plot margins and axis domain were inferred visually from the source image, so tiny rasterization and font differences remain. The source's recent-period background is copied as a visual feature (approximately 2017–2026), not interpreted as evidence of a causal effect.

The original CSV supplies the exact median and interval values. `Value` contains the annual median, `Lower95`/`Upper95` contain the 95% credible bounds, and `hline` is the full-series mean of annual medians (381.628571...). `Mean` is a separate posterior mean column and is not the connected series. Missing estimates in 1980–1989 and 2025 are excluded from marks, never replaced with zero. The chart shows 35 estimates, 1990–2024. The original catalog's region/facet heading does not mean these are counts restricted to the Mid-Atlantic: NOAA describes the indicator as the North Atlantic right whale population.

## Every whale counts — visual extension

An original SVG whale pictogram turns the population estimate into individual marks. Each filled silhouette represents one estimated individual. Stable positions in a 25-column field make changes in quantity easy to see; outlined marks expose the numerical gap below the 2011 median peak of 483. The icons are symbolic, not actual tracked animals, and disappearing marks do not represent documented deaths.

A shared year slider, play/pause timeline, and four milestone buttons synchronize the field with the original line chart. A three-way estimate selector lets viewers see how many symbols separate the lower 95% credible bound, median, and upper bound. This changes only the pictogram; the source reproduction always plots medians. All intervals use the original CSV. Reduced-motion preferences disable mark transitions. Playback is user-initiated, can be paused, stops in background tabs, and ends at 2024.

## Added interactions

1. **Year exploration:** hover/touch the plot or use the keyboard-accessible year slider to inspect the estimate, credible interval, and change in median from the preceding year. A crosshair locates the selected point.
2. **Time-range filter:** focus on all estimates, since 2000, since 2010, or since 2017. The vertical domain and full-series mean stay fixed for comparability.
3. **Layer toggles:** show/hide the uncertainty ribbon and mean line.
4. **Reset:** restores the original extent, visible layers, and clean chart without a crosshair.

All added controls are outside the source plot area. The main chart is responsive, with the controls stacking below it on small screens. The slider and controls have labels and visible keyboard focus; a live text readout makes values accessible without pointer hover.

## Run locally

Open `index.html` in a browser. No installation, build step, network requests, external fonts, libraries, or original website are required. `data/population.js` bundles the plotted data for `file://` compatibility. The source CSVs are also included. Alternatively, run `python3 -m http.server 8000` from this directory and open http://localhost:8000.

## Files

- `index.html`, `style.css`, `script.js`: page, presentation, chart and interactions.
- `data/population.csv`: unmodified plotted population CSV decoded from the NOAA page's download button.
- `data/narw-source.csv`: unmodified complete downloadable source dataset.
- `data/calves.csv`: companion downloadable calf dataset, archived for provenance; not plotted.
- `data/population.js`: numeric serialization of non-missing population rows from `population.csv`.
- `assets/`: original chart, original screenshot, and project preview.

## Data interpretation

The medians peak at 483 in 2011 and reach 384 in 2024, 20.5% below that peak. The 2024 95% credible interval is 375–394. These are model estimates, and differences of medians are descriptive; they are not tests of statistical significance. The graph alone cannot identify why population changes occurred. NOAA identifies vessel strikes and fishing-gear entanglement as primary threats. Historical estimates may be revised as additional sightings become available; this project freezes the downloaded data version.

## Attribution and assistance

Data and original graphic: NOAA Northeast Fisheries Science Center. Educational recreation, not an official NOAA product. AI assistance was used for source research, code implementation, documentation, and testing. The project should be reviewed by its author before submission.

## Submission

Submit the public GitHub Pages URL and the repository URL to Courseworks. See `SUBMISSION.txt` for the final links.
