# Color View

Open the Color View playground. The Color sidebar opens automatically with a text input for its background color. Try `purple`, `tomato`, or `#0f8`; the background updates through the view instance's `getCss()` after each input event.

The sample accepts 3, 4, 6, or 8 digit hexadecimal colors and the named colors listed in `src/main.ts`. Empty, incomplete, and unsupported values stay in the input while the last valid background remains visible. Validation prevents input from inserting extra CSS declarations, and the styles target only this sample's classes.

Each view instance owns its input and background state. Edit `src/main.ts` and save to rebuild the preview; **Reset sample** restores the original source and default background.
