# Undo and redo
Undo and redo provide users with simple mechanisms to reverse different actions. Furthermore, these features enable safe exploration and experimentation while learning a new task or interface

## Platform guidance — iOS & iPadOS
- **Avoid redefining standard gestures for undo and redo.** Users have established methods, such as a three-finger swipe or shaking the iPhone, to initiate these actions. As with any standard gesture, overriding this behavior in your interface risks confusing users and creating an unpredictable experience.
- **Briefly and precisely describe the operation to be undone or redone.** The undo and redo alert title automatically incorporates the prefix “Undo ” or “Redo ” (including the trailing space). You must supply one or two additional words to describe what is being reversed or reapplied after this prefix. For example, alert titles could be structured as “Undo Name” or “Redo Address Change.”
