# Color View

Open the Color View playground. The `.color` file opens a color preview in the main editor area. The **Color** sidebar view remains available for trying named and hexadecimal colors interactively; valid values update its background while empty or invalid values preserve the last valid color.

The sidebar view accepts 3, 4, 6, or 8 digit hexadecimal colors and the named colors listed in `src/main.ts`. Empty, incomplete, and unsupported values stay in the input while the last valid background remains visible. Validation prevents input from inserting extra CSS declarations, and the styles target only this sample's classes.

Each sidebar view instance owns its input and background state. Edit `src/main.ts` and save to rebuild the preview; **Reset sample** restores the original source and default background.
