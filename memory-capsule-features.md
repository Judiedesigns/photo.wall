# Memory Capsule — Features

## Board
- Polaroids scattered across the page with random rotations and coloured pushpins
- Pop-in animation when a new memory is added
- Hover any polaroid to straighten it and reveal the delete button
- Empty state message when the board has no memories yet

## Add Flow
- Fixed **+** button in the bottom right corner
- 3-step modal: **who** → **photo** → **why is it special?**
- Step progress dots visible at the top of the modal
- Back and forward navigation between steps
- Press Enter to advance, Escape to close

## Photos
- Upload any image from your device
- Compressed in the browser before saving (keeps storage light)
- Falls back to a 🌿 icon if no photo is added

## Storage
- Saves to `localStorage` — memories survive closing and reopening the tab
- No backend, no account, fully offline
- Works in any modern browser

## Delete
- Hover a polaroid to reveal the ✕ button
- Deletes with a shrink-and-fade animation
- Anyone on the device can delete any memory

## Loading Screen
- Blurred backdrop with bouncing dots
- Auto-hides after 3 seconds

## Design
- Custom background image (your water/ripple photo)
- Playfair Display + Lora serif fonts — warm, nostalgic feel
- Coloured pushpins randomly assigned to each memory
- Mobile responsive — works on phones and desktops
