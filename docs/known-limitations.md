# Known Limitations

## Current Bugs and Gaps

- Resume parsing can misclassify sections for heavily designed or non-standard layouts.
- Multilingual resumes are not fully optimized and can produce incomplete structured fields.
- Only PDF and DOCX uploads are supported.
- Error responses from upstream providers may surface as generic failures in edge cases.

## Technical Limitations

- The system depends on external OpenAI and Supabase availability.
- Limited built-in observability.

