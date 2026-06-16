---
name: interactive-system-design
description: Creates browser-tested, single-file interactive HTML system design drawings with orthogonal connected arrows, labeled parts, foldout detail cards, pan/zoom, filtering, and polished visual hierarchy. Use when the user asks to co-create an interactive system design, elaborate architecture drawing, explorable service map, ortho-connected diagram, foldout-card diagram, or a beautiful single-HTML system visualization.
---

# Interactive System Design
Create an explorable system drawing as one self-contained HTML file. The artifact should feel like a working design surface: orthogonal arrows connect concrete parts, cards fold open to explain responsibilities and trade-offs, and the in-app browser is used to inspect and iterate on the result.

## Output contract
- Write one `.html` file. Default to `.context/architecture/interactive/<slug>.html` unless the user names a path.
- Keep it self-contained: inline CSS, inline SVG, inline JavaScript, no CDN dependencies, no external fonts, no build step.
- Use real HTML and SVG for the main drawing. Do not make the core diagram a raster image, canvas-only surface, or Mermaid embed.
- Include enough structure for later edits: a `nodes` array, an `edges` array, stable ids, and clear sections for layout, rendering, interactions, and content.
- If a source design doc or architecture artifact exists, preserve its terminology. If it does not, create a first draft from the conversation and mark uncertain assumptions in the foldout cards.

## Workflow
1. Gather the minimum useful context. Ask only for information that would materially change the drawing: the system boundary, 5-15 primary parts, the key flows, and the audience. If the user asked for co-creation but left gaps, produce a first pass and make the gaps visible in the artifact.
2. Pick the layout before coding:
   - Left-to-right for request/data flow.
   - Top-to-bottom for pipeline, lifecycle, or command flow.
   - Swimlanes for ownership, trust boundaries, platforms, or runtime tiers.
   - Radial or clustered layouts only when the relationships are genuinely hub-like.
3. Create the HTML artifact. Model the system in JavaScript first, then render from that model so nodes, edges, cards, filters, and inspector state stay consistent.
4. Use Bun to preview the artifact from its directory. Prefer a temporary `Bun.serve` command or an existing project Bun script; do not add dependencies or commit server files just to view one HTML file.
5. Use the Browser plugin when available. Open the Bun-served local URL in the in-app browser, interact with it, check console errors, test a small viewport, and adjust the file until it is readable and usable.
6. Share the file path, local preview URL if the server is still running, and the main design questions the artifact now exposes. For co-creation, ask for the next decision in concrete terms, such as which component to expand, which flow to trace, or which trade-off to compare.

## Drawing structure
Use three layers:

1. **Canvas shell**: toolbar, search, view toggles, zoom controls, and an optional minimap.
2. **Diagram plane**: absolute-positioned node cards with an SVG connector layer behind or above them.
3. **Detail surface**: foldout cards, side inspector, or inline accordions for responsibilities, contracts, data owned, failure modes, and open questions.

Good default controls:
- Search parts and edge labels.
- Toggle by layer, ownership lane, runtime tier, sync vs async, or happy path vs failure path.
- Focus mode on click: highlight connected edges and dim unrelated parts.
- Edge selection: clicking a connector or its label should focus both endpoints and expose the relationship detail.
- Reset, fit-to-view, zoom in/out, and copy/share metadata when useful.

## Orthogonal connectors
Draw every relationship as right-angle SVG paths.

- Use explicit anchor points on node sides: `left`, `right`, `top`, `bottom`.
- Prefer `M x y H midX V y2 H x2` for horizontal flow and `M x y V midY H x2 V y2` for vertical flow.
- Add arrow markers, small labels, and relationship type classes such as `sync`, `async`, `event`, `read`, `write`, `control`, and `external`.
- Route edges around lanes and dense clusters. If crossings become confusing, change the layout or split the view instead of accepting line clutter.
- Keep labels close to the segment they describe. A user should be able to answer what crosses a boundary without opening the card.

## Foldout cards
Every important part should have a compact visible card and a richer expanded state.

Compact card:
- Name, type, owner or boundary, and one responsibility.
- Health or status indicators only when the data is meaningful.
- Small badges for runtime, storage, protocol, or sensitivity.

Expanded card:
- Responsibilities.
- Inputs and outputs.
- Data owned.
- Key dependencies.
- Failure modes and degradation behavior.
- Open questions or disputed assumptions.

Use details/summary, accessible buttons, or a side inspector. Animate height and opacity gently, but keep content measurable and selectable. Expanded content must not push the whole diagram into chaos; prefer an inspector or overlay when many cards can open.

## Visual quality
- Use a restrained but varied palette. Avoid making the whole drawing one hue.
- Give lanes and boundaries quiet background treatments, not heavy boxes around everything.
- Make primary flow arrows visually stronger than secondary relationships.
- Keep card radii modest, spacing consistent, and labels short enough to scan.
- Include real domain language from the system. Generic boxes like "Service", "Handler", or "Processor" are weak unless the source material uses those names.
- Treat mobile as a review surface: it can scroll and inspect, but it still needs readable cards and usable controls.

## Browser verification
Before finishing:
- Serve the artifact with Bun. From the artifact directory, a dependency-free preview can use `bun -e 'const root=process.cwd(); const mime={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml"}; Bun.serve({port:4173, async fetch(req){const url=new URL(req.url); const pathname=url.pathname==="/" ? "/index.html" : decodeURIComponent(url.pathname); const file=Bun.file(root+pathname); if(!(await file.exists())) return new Response("Not found",{status:404}); const ext=pathname.match(/\.[^.]+$/)?.[0] ?? ""; return new Response(file,{headers:{"Content-Type":mime[ext] ?? "application/octet-stream"}})}}); console.log("http://localhost:4173"); await new Promise(()=>{});'`.
- Open the Bun-served local URL with the in-app Browser.
- Click at least three nodes, two edges, search once, toggle at least one view, and open/close foldout content.
- Resize or test a narrow viewport. Check that labels do not overlap controls, cards remain readable, and connectors still meet their nodes.
- Check the browser console. Fix JavaScript errors and missing asset warnings.
- Inspect the HTML for accidental external dependencies with a quick search for `http://`, `https://`, `cdn`, `import`, and `@import`.

## Cross-skill handoffs
- Use `architecture` first when the component model is not clear.
- Use `c4-diagrams` when the user wants a static Mermaid C4 diagram or a docs-friendly architecture diagram.
- Use this skill when the deliverable is an interactive HTML artifact that people can explore, edit, and co-create around.
