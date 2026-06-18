# CHANGE.md

## 0.0.9 - Blank Screen Fix

### Fixed

- Fixed frontend blank white screen caused by an invalid newline string in `src/app/App.js`.
- Corrected console log rendering to use `join("\n")`.

### Notes

This is a frontend-only fix. Upload this panel release and update `app.properties` to tag `0.0.9`.
