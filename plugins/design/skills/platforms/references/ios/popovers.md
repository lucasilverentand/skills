# Popovers
A popover functions as a temporary view that overlays other content upon activation by clicking or tapping an interactive control

## Platform guidance — iOS & iPadOS
**Do not display popovers when the view is compact.** Your application or game must dynamically adapt its layout based on the size class of the content area. Reserve popovers for wide views; instead, utilize all available screen space in compact views by presenting the information within a full-screen modal view, such as a sheet. For further guidance, consult **Modality**.
