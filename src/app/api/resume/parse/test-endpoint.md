# Testing Resume Parse Endpoint

## Test 1: With Resume ID
```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: multipart/form-data" \
  -F "resumeId=your-resume-id-here"
```

## Test 2: With File Upload
```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/resume.docx"
```

## Expected Response
```json
{
  "success": true,
  "data": {
    "extractedText": "...",
    "keywords": ["software engineer", "full stack developer"],
    "skills": ["javascript", "react", "node", "typescript"]
  },
  "message": "Resume parsed successfully"
}
```
