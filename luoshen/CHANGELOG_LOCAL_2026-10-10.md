# LUOSHEN local visual update

This package updates the local Windows version only. The hosted Site has not been updated.

- Four navigation labels now distinguish overview, member profiles, household information, and history.
- The top-right connection control opens an API information panel.
- Water-source flow cards expand to reveal step-specific detail.
- Device catalog pictures are clean, text-free product images.
- Record cards use event-specific color, photography, and a restrained lotus-water ornament.
- AI recommendation copy states that it is advice, not a medical diagnosis.
- Profiles now includes one "Add a device by photo" entry. The visual guide covers finding a device, photographing its front and optional label, confirming its type and location, stating whether it has an existing app, and reviewing exactly what will be saved.
- With a server-side `OPENAI_API_KEY`, the guide suggests a device category and any clearly legible model from the photos. The user can correct both. Without a key or when recognition fails, it continues through manual selection.
- Added device profiles are stored in this browser. The connection review distinguishes a saved device from a service connection; it never marks an unverified device as connected.

The existing household data endpoints in this self-contained package are example data for UI display. The new photo recognition endpoint requires a user-supplied server-side key and sends selected photos to the recognition service. The package does not establish a live device or vendor connection. A listed smart app remains "awaiting connection approval" until an authorized vendor integration is implemented.
