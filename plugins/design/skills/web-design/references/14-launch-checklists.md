# Launch Checklists
Source: Modern Functional Web Design Mega Handbook 2026.

## 81. Launch checklists
A checklist does not replace judgment. Use it to prevent known omissions, then perform scenario-based testing.

### 81.1 Strategy and scope
- [ ] The primary audience and task are named.
- [ ] Secondary audiences have deliberate routes.
- [ ] The proposition is specific and defensible.
- [ ] Primary and secondary conversions are defined.
- [ ] Success metrics measure completion and quality, not clicks alone.
- [ ] Browser/device support is documented.
- [ ] Accessibility target is documented.
- [ ] Performance budgets are documented.
- [ ] Localization requirements are documented.
- [ ] Privacy, legal, and security owners are involved.
- [ ] Content ownership and review dates exist.
- [ ] High-risk technical or visual ideas were prototyped early.
- [ ] The design ambition matches content and maintenance capacity.
- [ ] Launch scope excludes features that cannot be finished safely.
- [ ] A rollback or feature-disable path exists for risky enhancements.

### 81.2 Information architecture and content
- [ ] Navigation reflects audience vocabulary.
- [ ] Top tasks are reachable through obvious paths.
- [ ] Page titles and headings are unique and descriptive.
- [ ] Every page has one clear purpose.
- [ ] Calls to action describe their consequence.
- [ ] Claims have evidence or are softened appropriately.
- [ ] Dates, currencies, units, time zones, and availability are explicit.
- [ ] Pricing, recurring billing, fees, and cancellation are clear.
- [ ] Error, empty, loading, offline, and success copy exists.
- [ ] Contact and support routes are current.
- [ ] Policies are readable and linked at relevant decision points.
- [ ] Stale and duplicate content has been removed or redirected.
- [ ] Links use meaningful text.
- [ ] Images have purposeful alt text or empty alt.
- [ ] Video has captions and required alternatives.
- [ ] Content survives long strings and missing media.
- [ ] Authors, update dates, and correction paths exist where needed.
- [ ] Search results and zero-results states are written.
- [ ] The 404 page offers useful routes.
- [ ] HTML is preferred to inaccessible document-only publishing.

### 81.3 Visual design and brand
- [ ] The page has a clear first focal point.
- [ ] Primary action is visually distinct without coercion.
- [ ] There is one dominant signature device, not many competing effects.
- [ ] Typography roles are consistent.
- [ ] Body text has comfortable measure and line height.
- [ ] Text and non-text contrast pass.
- [ ] Inline links remain identifiable.
- [ ] Color is not the only status cue.
- [ ] Spacing expresses grouping consistently.
- [ ] Alignment is intentional across templates.
- [ ] Cards are used only for meaningful units.
- [ ] Icon styles are coherent and labels exist where needed.
- [ ] Image crops follow a system.
- [ ] Dark mode, if present, is individually art-directed.
- [ ] High contrast/forced colors remain understandable.
- [ ] Real content has been used in visual QA.
- [ ] The design remains coherent with missing or extreme content.
- [ ] Print styles exist for print-relevant pages.
- [ ] Generated assets have been reviewed and disclosed where needed.
- [ ] Brand expression does not hide standard controls.

### 81.4 Responsive and device behavior
- [ ] Source order is logical without CSS.
- [ ] Navigation works at all widths.
- [ ] No ordinary content causes unintended horizontal page scrolling.
- [ ] Text and controls survive 200% zoom.
- [ ] Layout reflows under enlarged text.
- [ ] Sticky elements do not cover focus or content.
- [ ] Mobile keyboard does not hide active fields or submit.
- [ ] Touch targets are sufficiently large and separated.
- [ ] Hover enhancements have touch and keyboard equivalents.
- [ ] Orientation changes preserve task state.
- [ ] Very short viewport heights are usable.
- [ ] Very wide displays do not create extreme line lengths.
- [ ] Images use appropriate sources and crops.
- [ ] Tables have an intentional narrow-screen strategy.
- [ ] Modals and sheets can scroll internally without trapping the page.
- [ ] Safe-area insets are respected in full-screen layouts.
- [ ] Back navigation restores useful state.
- [ ] Filters and search state are shareable where appropriate.
- [ ] Device testing includes low-end hardware.
- [ ] Embedded contexts and container widths are tested where relevant.

### 81.5 Accessibility
- [ ] Document language is declared.
- [ ] Each page has a unique title.
- [ ] A skip link reaches main content.
- [ ] Heading order communicates structure.
- [ ] Landmarks are correct and not excessive.
- [ ] Native elements are used where possible.
- [ ] Every function is keyboard operable.
- [ ] Focus order follows meaning.
- [ ] Focus is always visible.
- [ ] Dialogs manage and restore focus.
- [ ] No keyboard trap exists.
- [ ] Hover/focus content is dismissible, hoverable, and persistent as needed.
- [ ] Pointer target requirements are met.
- [ ] Dragging has a non-drag alternative.
- [ ] Forms have visible labels and associated help.
- [ ] Errors are identified in text and announced.
- [ ] Authentication allows paste and assistive mechanisms.
- [ ] Time limits are explained and adjustable where required.
- [ ] Status messages are announced without focus theft.
- [ ] Alternative text matches image purpose.
- [ ] Captions, transcripts, and audio description/equivalent are supplied.
- [ ] Moving content can be paused, stopped, or hidden where required.
- [ ] Reduced-motion preference is honored.
- [ ] Content works with user text-spacing overrides.
- [ ] Content reflows under zoom.
- [ ] Forced-colors mode is usable.
- [ ] Automated scans have been manually triaged.
- [ ] A keyboard-only pass is complete.
- [ ] Screen-reader flows for core tasks are complete.
- [ ] Accessibility feedback has an owner and route.

### 81.6 Forms and transactional flows
- [ ] Only necessary information is requested.
- [ ] Guest completion is available where appropriate.
- [ ] Input types, input modes, and autocomplete tokens are correct.
- [ ] Required/optional strategy is consistent.
- [ ] Instructions appear before the action.
- [ ] Validation does not punish incomplete typing.
- [ ] Errors preserve submitted data.
- [ ] Long forms provide progress and save/resume where needed.
- [ ] File uploads state size/type and offer a non-drag path.
- [ ] Submission shows immediate feedback.
- [ ] Duplicate submissions are prevented safely.
- [ ] Retry cannot create duplicate charges or records.
- [ ] Final review shows all material facts.
- [ ] Success state includes durable reference and next steps.
- [ ] Destructive actions match consequence and support undo/recovery.
- [ ] Session expiry warns and preserves work where possible.
- [ ] Password managers and passkeys are supported as applicable.
- [ ] Address forms support relevant countries.
- [ ] Dates and phone numbers are not overvalidated.
- [ ] Payment failure and recovery have been tested.

### 81.7 Performance
- [ ] Field Core Web Vitals or a collection plan exists.
- [ ] LCP, INP, and CLS targets are met on representative templates.
- [ ] LCP resource is discovered and prioritized appropriately.
- [ ] Likely LCP imagery is not lazy-loaded.
- [ ] Images have intrinsic dimensions.
- [ ] Responsive image sources and sizes are correct.
- [ ] Below-the-fold media is lazy-loaded appropriately.
- [ ] Font families, weights, and preloads are limited.
- [ ] Fallback font metrics reduce shift.
- [ ] Initial JavaScript fits the budget.
- [ ] Route and component code splitting is effective.
- [ ] Long tasks and slow interactions have been profiled.
- [ ] Third-party scripts have owners and budgets.
- [ ] Noncritical scripts load after consent/intent where appropriate.
- [ ] Expensive animation pauses off-screen and in hidden tabs.
- [ ] Blur, filters, fixed backgrounds, and canvas effects are tested on mobile.
- [ ] Server response and caching are configured.
- [ ] Static/server rendering strategy supports public content.
- [ ] Layout shift is tested through cookie, ad, embed, font, and async states.
- [ ] Slow network and low-end device tests are complete.
- [ ] Performance regression checks run in CI or release review.
- [ ] A static/low-fidelity fallback exists for immersive content.

### 81.8 SEO and sharing
- [ ] Public pages return correct status codes.
- [ ] Titles and descriptions are unique and useful.
- [ ] Canonical URLs are correct.
- [ ] Robots directives are intentional.
- [ ] XML sitemap is current where needed.
- [ ] Internal links are crawlable anchors.
- [ ] Mobile content has parity.
- [ ] Structured data matches visible content and validates.
- [ ] Open Graph/social preview metadata is present.
- [ ] Social images are legible at common crops.
- [ ] Redirects preserve important old URLs.
- [ ] No important page is orphaned.
- [ ] Pagination and faceted URLs have a crawl strategy.
- [ ] Search pages are indexed or excluded deliberately.
- [ ] Author, date, and update context exists for relevant content.
- [ ] Image/video metadata supports discovery where important.
- [ ] Public content is present in resilient HTML.
- [ ] Consent or interstitial UI does not block all content.
- [ ] Broken-link and missing-asset scans pass.
- [ ] Search Console or equivalent monitoring is configured.

### 81.9 Privacy, analytics, and security
- [ ] Data collection is minimized.
- [ ] Each analytics event has a product question and owner.
- [ ] Sensitive data is excluded from analytics, logs, and URLs.
- [ ] Consent choices are balanced and accessible.
- [ ] Optional tracking waits for valid consent where required.
- [ ] Preference withdrawal works.
- [ ] Privacy notice matches actual implementation.
- [ ] Retention and deletion behavior is implemented.
- [ ] External embeds are inventoried.
- [ ] Content Security Policy and security headers are configured appropriately.
- [ ] Authentication and recovery have threat-model review.
- [ ] Session expiry and device management are understandable.
- [ ] Permission prompts happen in context.
- [ ] File uploads are constrained and safely processed.
- [ ] User-generated content has moderation/reporting paths.
- [ ] Error messages do not expose secrets.
- [ ] Forms and APIs protect against abuse.
- [ ] Destructive and financial actions are auditable.
- [ ] Dependency and third-party risk are reviewed.
- [ ] Incident communication and status ownership exist.

### 81.10 Operations and post-launch
- [ ] Monitoring covers availability and core transactions.
- [ ] Error reporting preserves privacy.
- [ ] Real-user performance monitoring is active.
- [ ] Conversion/task funnels are verified with test data.
- [ ] Alerts have meaningful thresholds and owners.
- [ ] Content owners know the publishing workflow.
- [ ] Legal, price, availability, and team content have review dates.
- [ ] Redirect and 404 logs are reviewed.
- [ ] Search logs inform content gaps.
- [ ] Accessibility issues have a public or internal reporting route.
- [ ] A post-launch usability review is scheduled.
- [ ] Feature flags can disable risky enhancements.
- [ ] Backup and recovery are tested.
- [ ] Status page and support macros are current.
- [ ] No launch-only banner remains indefinitely.
- [ ] Results are compared with the pre-launch baseline.
- [ ] Metrics are segmented by device and relevant audience.
- [ ] Harm and exclusion signals are reviewed, not only conversion.
- [ ] The team has a process for removing experiments.
- [ ] A design-system/content-debt backlog is maintained.

---
