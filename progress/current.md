# Progress — Current session

## Plan

- [x] Fix skip-link peeking out at the top-left corner on page load

## Notes

- `.skip-link` height (~44px) exceeded the `top: -40px` offset, leaving a visible strip.
- Changed `top: -40px` to `top: -100%` and added `white-space: nowrap` so the link is fully hidden until focused.
- `./init.sh` passes after the fix.

## Files touched

- `src/styles/global.css`

## Awaiting human review

- Confirm the skip-link is no longer visible on initial load and appears only on `Tab` focus.
