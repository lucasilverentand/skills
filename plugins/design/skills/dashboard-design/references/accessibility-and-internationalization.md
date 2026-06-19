# Accessibility and Internationalization
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 16. Accessibility and internationalization
Target WCAG 2.2 AA unless a stricter requirement applies. WCAG 2.2 covers labels and instructions, error identification, focus, status messages, and minimum target sizing among other criteria.[^wcag22]

### 16.1 Keyboard and focus
MUST:

- make every interactive element operable by keyboard;
- provide a visible focus indicator;
- use a logical focus order;
- return focus sensibly after closing dialogs or drawers;
- keep focus stable during live updates;
- support escape for dismissible overlays where safe;
- avoid keyboard traps in grids, charts, and code editors.

### 16.2 Target size
WCAG 2.2’s minimum target-size criterion uses 24 × 24 CSS pixels with defined exceptions.[^wcag-target] Critical controls SHOULD generally be larger, especially on touch devices.

### 16.3 Forms
- Use semantic labels and fieldsets/legends for grouped controls.
- Identify required fields consistently.
- Associate helper text and errors with controls.
- Provide an error summary for long forms.
- Do not rely on placeholder text.
- Do not ask users to re-enter information already provided in the same process unless necessary.
- Announce save, error, and background status without stealing focus.

### 16.4 Tables and grids
- Use semantic tables for tabular data.
- Associate headers with cells.
- Expose sort state.
- Provide accessible names for row and bulk actions.
- Ensure sticky headers do not obscure focused content.
- Test virtualized grids with keyboard and assistive technologies.
- Offer a simpler detail or export path when a highly interactive grid cannot expose all information accessibly.

### 16.5 Charts
Critical charts SHOULD provide:

- a concise text summary;
- accessible title/description;
- keyboard-accessible data points when interaction is essential;
- a data table or downloadable data;
- non-color distinctions;
- sufficient contrast for graphical elements;
- reduced-motion behavior.

### 16.6 Status messages
Saving, filtering, job completion, and errors SHOULD be announced as status updates without unexpectedly moving focus. A visual toast alone may not be sufficient.

### 16.7 Internationalization
Design for:

- longer translated labels;
- right-to-left layout;
- locale-specific number and date formatting;
- decimal and thousands separators;
- currency and tax context;
- pluralization;
- user-selected timezone;
- daylight-saving transitions;
- week-start differences;
- names and addresses that do not fit a single cultural template.

Store and process exact timestamps independently from how they are displayed.

---
