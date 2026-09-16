# ChargeKaro Route-First Landing Page

## Goal
Rebuild the homepage around the driver’s trip: enter a starting point and destination, then find suitable charging stops along the route.

## What will change
- Replace the current directory-style hero with a bold route-planning experience and the headline “Never run out of charge on the way.”
- Add a prominent two-stop trip planner with From, To, live-location action, and a “Plan my route” button.
- Send submitted destinations into the existing station experience as search context; use browser location when permission is granted.
- Add a polished abstract route visual showing origin, charging stops, destination, journey distance, and battery context without requiring a live map API.
- Reorder the page into a focused product story: trust strip, three-step “How it works,” route-planning advantages, and a final sign-in/app CTA.
- Remove homepage sections that make the experience feel like a generic listing directory, while keeping the existing Support ChargeKaro section.
- Keep the current ChargeKaro logo, global navigation, light/dark themes, and EV green/teal visual language.

## Interaction and responsive behavior
- Mobile-first stacked planner with large touch targets and no overlapping controls.
- Desktop layout gives equal visual weight to the trip planner and route illustration.
- Location status, input focus, button press, route path, and station markers receive subtle motion with reduced-motion fallbacks.
- Empty submissions remain on the page and clearly indicate which trip field needs attention.

## Technical details
- Update the homepage route and add only the semantic global tokens/animations needed by the new design.
- Use the existing browser location hook and current TanStack navigation/search structure.
- Use current station totals for honest statistics; avoid invented driver counts or live-availability claims.
- Keep one H1 and update homepage title, description, Open Graph, and Twitter metadata for route planning.
- Verify desktop and mobile rendering, location/error states, form navigation, keyboard labels, runtime errors, and the preview build.
