# Quality Audit, Reference Library, and Closing Principle
Source: Modern Functional Web Design Mega Handbook 2026.

## 82. 100-point quality audit
Score each statement **1** when clearly true, **0.5** when partially true, and **0** when false or unknown. Unknown should not receive the benefit of the doubt.

### Interpretation
|Score|Interpretation|
|---:|---|
|90–100|Excellent foundation; refine craft and edge cases|
|75–89|Good but material gaps remain|
|60–74|Uneven; prioritize core-task and inclusion defects|
|40–59|Significant redesign or technical remediation needed|
|0–39|Experience is not production-ready|

A high total cannot excuse a severe defect. A keyboard trap, data-loss bug, deceptive payment flow, or critical security issue is a release blocker regardless of score.

### A. Purpose and clarity — 10 points
1. The primary audience and task are explicit.
2. The first meaningful view explains what the site is.
3. The primary action is clear and accurately labeled.
4. Content hierarchy matches decision priority.
5. Navigation labels use audience vocabulary.
6. Each page has a distinct purpose.
7. Claims are specific and evidenced.
8. Material limits and conditions are visible.
9. The next step is predictable.
10. Empty/error states explain recovery.

### B. Information architecture and content — 10 points
1. Top tasks are easy to locate.
2. Related content is grouped consistently.
3. Search is available when the content scale requires it.
4. Search/filter state is preserved appropriately.
5. Headings support scanning and structure.
6. Long content offers meaningful summaries or navigation.
7. Links describe destinations.
8. Dates, units, prices, and time zones are explicit.
9. Content ownership and freshness are visible internally.
10. The site avoids duplicate and orphaned pages.

### C. Visual hierarchy and brand — 10 points
1. The first three focal elements match the intended hierarchy.
2. Typography roles are coherent.
3. Body text is comfortable to read.
4. Spacing expresses grouping.
5. Alignment creates a stable composition.
6. Color roles are consistent.
7. Imagery has a coherent art direction.
8. Icons belong to one system.
9. The brand has at least one ownable signature.
10. Decoration does not compete with content.

### D. Interaction and usability — 10 points
1. Buttons and links use correct semantics.
2. Controls communicate state.
3. Feedback appears immediately after action.
4. Loading behavior preserves orientation.
5. Forms minimize effort and recover gracefully.
6. Destructive actions match consequence.
7. Back, refresh, and deep links behave predictably.
8. Mobile touch interaction is comfortable.
9. Search, filters, and tables support real workflows.
10. The core task does not depend on hidden gestures.

### E. Accessibility — 10 points
1. Semantic structure and landmarks are correct.
2. Full keyboard operation works.
3. Focus is visible and managed.
4. Text and UI contrast pass.
5. Information is not conveyed by color alone.
6. Text zoom/reflow works.
7. Target size and spacing are sufficient.
8. Media and images have alternatives.
9. Forms and errors are accessible.
10. Reduced motion, forced colors, and assistive technology are tested.

### F. Responsive and international — 10 points
1. Layout responds to content rather than device labels alone.
2. Narrow, wide, short, and zoomed viewports work.
3. Source order remains logical.
4. Media crops are art-directed where needed.
5. Tables and dense content have a narrow-screen strategy.
6. Text expansion does not break components.
7. Dates, numbers, currency, names, and addresses are locale-aware.
8. RTL/logical properties are supported when required.
9. Theme and input capabilities are handled.
10. Real devices and low-end hardware are tested.

### G. Performance and resilience — 10 points
1. LCP meets the good threshold in representative field data or a credible launch test.
2. INP meets the good threshold.
3. CLS meets the good threshold.
4. Images and fonts are efficiently delivered.
5. Initial JavaScript is justified and budgeted.
6. Third parties are controlled.
7. Expensive media is progressive and pausable.
8. Slow, offline, and partial failures are designed.
9. No critical task loses data on routine failure.
10. Performance regressions are monitored.

### H. Trust, privacy, and ethics — 10 points
1. Ownership and contact are clear.
2. Pricing and recurring terms are transparent.
3. Reviews, metrics, and testimonials are credible.
4. Consent is balanced and reversible.
5. Sensitive data collection is minimized and explained.
6. Security and privacy claims have evidence.
7. Sponsored, personalized, and generated content is identified.
8. Cancellation and account deletion are findable.
9. Urgency and scarcity are genuine.
10. High-impact automation supports review and override.

### I. Discoverability and technical foundation — 10 points
1. Public content is crawlable HTML.
2. Titles, metadata, URLs, and status codes are correct.
3. Mobile content has parity.
4. Structured data is accurate.
5. Internal linking supports important content.
6. Old URLs redirect appropriately.
7. HTML, CSS, and component architecture are maintainable.
8. Design tokens encode semantic decisions.
9. Component states and behavior are documented.
10. Automated, integration, and human tests cover core flows.

### J. Operational quality — 10 points
1. Analytics measure task quality.
2. Error and availability monitoring exist.
3. Accessibility issues have ownership.
4. Content freshness has ownership.
5. Performance has ownership and budgets.
6. The design system has governance.
7. Legal/security/privacy review is integrated.
8. Feature flags or rollback exist for risky changes.
9. Post-launch research informs iteration.
10. Known debt is documented and prioritized.

### Priority formula
After scoring, classify every failed item:

- **P0:** safety, security, legal, data loss, inaccessible core task.
- **P1:** blocks primary task or materially misleads.
- **P2:** major friction, trust, performance, or responsive defect.
- **P3:** craft, consistency, or lower-frequency edge case.
- **P4:** enhancement.

Fix by severity and user impact, not by how visually easy the issue is.

---

## 83. Reference library
This handbook synthesizes standards, browser-platform documentation, mature public design systems, usability research, commerce research, and current design-direction reporting. The following are the strongest starting points.

### Accessibility standards and practices
- [Web Content Accessibility Guidelines (WCAG) overview — W3C WAI](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WCAG 2.2 quick reference — W3C WAI](https://www.w3.org/WAI/WCAG22/quickref/)
- [What’s new in WCAG 2.2 — W3C WAI](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WCAG 2.2 Understanding documents — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Understanding contrast minimum — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- [Understanding target size minimum — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Understanding focus appearance — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Understanding resize text — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [Understanding dragging movements — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [Understanding accessible authentication — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [Understanding content on hover or focus — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA widget patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Developing a keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WAI forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WAI images tutorial](https://www.w3.org/WAI/tutorials/images/)
- [WAI writing tips](https://www.w3.org/WAI/tips/writing/)
- [WAI designing tips](https://www.w3.org/WAI/tips/designing/)
- [WAI developing tips](https://www.w3.org/WAI/tips/developing/)

### Performance and responsive design
- [Web Vitals — web.dev](https://web.dev/articles/vitals)
- [Top Core Web Vitals recommendations — web.dev](https://web.dev/articles/top-cwv)
- [Optimize Largest Contentful Paint — web.dev](https://web.dev/articles/optimize-lcp)
- [Optimize Cumulative Layout Shift — web.dev](https://web.dev/articles/optimize-cls)
- [Fast load times collection — web.dev](https://web.dev/explore/fast)
- [Responsive design introduction — web.dev](https://web.dev/learn/design/intro)
- [The picture element — web.dev](https://web.dev/learn/design/picture-element)
- [High-performance CSS animations — web.dev](https://web.dev/articles/animations-guide)
- [Rendering performance — web.dev](https://web.dev/articles/rendering-performance)
- [Font best practices — web.dev](https://web.dev/articles/font-best-practices)
- [Responsive fluid typography — web.dev](https://web.dev/articles/baseline-in-action-fluid-type)
- [Baseline web-platform status](https://web.dev/baseline)
- [Web performance — MDN](https://developer.mozilla.org/en-US/docs/Web/Performance)

### Modern CSS and platform features
- [Responsive design — MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [Container queries — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [CSS subgrid — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid)
- [Cascade layers — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40layer)
- [CSS nesting — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using)
- [View transitions — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40view-transition)
- [Scroll-driven animations — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [`prefers-reduced-motion` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
- [`forced-colors` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors)
- [`prefers-contrast` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-contrast)
- [`prefers-color-scheme` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-color-scheme)
- [OKLCH — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch)
- [Relative colors — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors)
- [`color-mix()` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix)
- [`light-dark()` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark)
- [Variable fonts — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Fonts/Variable_fonts)
- [WebGL — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [`will-change` — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change)

### Forms and authentication
- [Sign-in form best practices — web.dev](https://web.dev/articles/sign-in-form-best-practices)
- [Sign-up form best practices — web.dev](https://web.dev/articles/sign-up-form-best-practices)
- [Payment and address form best practices — web.dev](https://web.dev/articles/payment-and-address-form-best-practices)
- [Passkey management — web.dev](https://web.dev/articles/passkey-management)
- [`autocomplete` — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete)
- [`inputmode` — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode)
- [HTML constraint validation — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)

### Public design systems
- [Material Design 3](https://m3.material.io/)
- [Material 3 typography](https://m3.material.io/styles/typography/applying-type)
- [Material 3 color roles](https://m3.material.io/styles/color/roles)
- [Material design tokens](https://m3.material.io/foundations/design-tokens)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK patterns](https://design-system.service.gov.uk/patterns/)
- [GOV.UK focus states](https://design-system.service.gov.uk/get-started/focus-states/)
- [U.S. Web Design System](https://designsystem.digital.gov/)
- [USWDS accessibility documentation](https://designsystem.digital.gov/documentation/accessibility/)
- [USWDS form guidance](https://designsystem.digital.gov/components/form/)
- [USWDS typography](https://designsystem.digital.gov/components/typography/)
- [Carbon Design System](https://carbondesignsystem.com/)
- [Carbon data table](https://carbondesignsystem.com/components/data-table/usage/)
- [Carbon data visualization](https://carbondesignsystem.com/data-visualization/chart-types/)
- [Atlassian spacing foundation](https://atlassian.design/foundations/spacing)
- [Atlassian color foundation](https://atlassian.design/foundations/color)
- [Fluent 2 Design System](https://fluent2.microsoft.design/)
- [Apple Human Interface Guidelines: typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple Human Interface Guidelines: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple Human Interface Guidelines: accessibility](https://developer.apple.com/design/Human-Interface-Guidelines/accessibility)
- [Apple Human Interface Guidelines: motion](https://developer.apple.com/design/human-interface-guidelines/motion)

### Information architecture, content, and usability
- [Visual hierarchy in UX — Nielsen Norman Group](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
- [Homepage design principles — Nielsen Norman Group](https://www.nngroup.com/articles/homepage-design-principles/)
- [Menu design checklist — Nielsen Norman Group](https://www.nngroup.com/articles/menu-design/)
- [F-shaped reading pattern — Nielsen Norman Group](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- [Diátaxis documentation framework](https://diataxis.fr/)
- [Google developer documentation style guide](https://developers.google.com/style)
- [Google style guide: headings](https://developers.google.com/style/headings)
- [Google style guide: procedures](https://developers.google.com/style/procedures)

### E-commerce research and guidance
- [Shopify theme best practices](https://shopify.dev/docs/storefronts/themes/best-practices)
- [Shopify accessibility guidance](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility)
- [Shopify theme design guidance](https://shopify.dev/docs/storefronts/themes/best-practices/design)
- [Baymard: current state of checkout UX](https://baymard.com/blog/current-state-of-checkout-ux)
- [Baymard: checkout form fields](https://baymard.com/blog/checkout-flow-average-form-fields)
- [Baymard: product-page UX](https://baymard.com/blog/current-state-ecommerce-product-page-ux)
- [Baymard: mobile commerce](https://baymard.com/blog/mobile-commerce-design)

### Search and discoverability
- [Google Search: page experience](https://developers.google.com/search/docs/appearance/page-experience)
- [Google Search: mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Google Search: structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google Search Essentials and SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google guidance for AI features and search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

### AI interaction guidance
- [Microsoft Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)
- [Microsoft HAX design patterns](https://www.microsoft.com/en-us/haxtoolkit/design-patterns/)
- [Carbon for AI](https://carbondesignsystem.com/guidelines/carbon-for-ai/)
- [Google People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [PAIR: explainability and trust](https://pair.withgoogle.com/chapter/explainability-trust/)
- [Apple Human Interface Guidelines: generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)

### Current visual-direction sources
- [Webflow: web-design trends for 2026](https://webflow.com/blog/web-design-trends-2026)
- [Figma: web-design trends](https://www.figma.com/resource-library/web-design-trends/)
- [Framer: web-design trends](https://www.framer.com/blog/web-design-trends/)
- [Awwwards](https://www.awwwards.com/) — useful as a visual reference stream; evaluate showcased work separately for accessibility, performance, and task fit.

---

# Closing principle
A visually stunning website is not the one with the most visible design. It is the one where every visible decision feels inevitable: the hierarchy matches the task, the type fits the voice, the imagery earns its weight, the motion explains rather than delays, and the interface keeps working for people outside the ideal demo.

Build the durable experience first. Add one strong expressive idea. Measure what it costs. Refine the details people touch repeatedly. That combination ages better than a stack of trends.
