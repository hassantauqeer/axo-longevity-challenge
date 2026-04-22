# Lab Report Analyzer API Documentation

REST API for analyzing lab report PDFs and extracting biomarker data with age/sex-specific classifications.

**Base URL:** `http://localhost:3001` (development) or your production URL

**Version:** 1.0.0

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Upload Report](#upload-report)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Response Time](#response-time)

---

## 🔐 Authentication

Currently, the API does not require authentication. For production deployments, consider adding:
- API key authentication
- JWT tokens
- OAuth 2.0

---

## 🔌 Endpoints

### Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
- Status: 200 OK
- Body: `{ "status": "ok" }`

---

### Upload Report

Upload a PDF lab report for analysis. The API will extract biomarkers, translate Spanish to English, standardize units, and classify results.

**Endpoint:** `POST /api/report/upload`

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | PDF file (max 10MB) |

**Success Response (200 OK):**

Returns patient information, biomarkers grouped by category, and metadata.

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `patient.dateOfBirth` | string | Date of birth (YYYY-MM-DD) |
| `patient.age` | number | Calculated age in years |
| `patient.sex` | string | "male" or "female" |
| `patient.bloodType` | string | Blood type (A, B, AB, O) - optional |
| `patient.rhFactor` | string | Rh factor (+ or -) - optional |
| `patient.reportDate` | string | Report date (YYYY-MM-DD) |
| `categories` | array | Biomarkers grouped by medical category |
| `categories[].name` | string | Category name (e.g., "Lipid Panel") |
| `categories[].biomarkers` | array | Array of biomarker objects |
| `biomarkers[].originalName` | string | Original Spanish name from report |
| `biomarkers[].englishName` | string | Standardized English name |
| `biomarkers[].value` | number\|null | Numeric value |
| `biomarkers[].qualifier` | string | "<", ">", or "none" |
| `biomarkers[].originalUnit` | string | Original unit from report |
| `biomarkers[].standardizedUnit` | string | Standardized international unit |
| `biomarkers[].referenceMin` | number\|null | Reference range minimum |
| `biomarkers[].referenceMax` | number\|null | Reference range maximum |
| `biomarkers[].optimalMin` | number\|null | Optimal range minimum |
| `biomarkers[].optimalMax` | number\|null | Optimal range maximum |
| `biomarkers[].category` | string | Medical category |
| `biomarkers[].classification` | string | "optimal", "normal", or "out_of_range" |
| `metadata.extractionMethod` | string | "text" or "vision_fallback" |
| `metadata.processedAt` | string | ISO 8601 timestamp |

**Example Response Structure:**
- Patient object with demographics
- Categories array containing biomarker groups
- Each category has a name and biomarkers array
- Each biomarker includes value, units, reference ranges, optimal ranges, and classification
- Metadata with extraction method and processing timestamp

---

## ❌ Error Handling

All errors follow a consistent format with:
- `error`: Short error description
- `errorCode`: Machine-readable error code
- `message`: User-friendly error message
- `details`: Technical details (optional)

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `NO_FILE` | No file was uploaded |
| 400 | `EMPTY_FILE` | Uploaded file is empty |
| 400 | `FILE_TOO_LARGE` | File exceeds 10MB limit |
| 400 | `INVALID_FILE_TYPE` | File is not a PDF |
| 400 | `CORRUPTED_PDF` | PDF file is corrupted or invalid |
| 400 | `ENCRYPTED_PDF` | PDF is password-protected |
| 422 | `EXTRACTION_FAILED` | Cannot extract biomarker data |
| 429 | `QUOTA_EXCEEDED` | API quota/rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `SERVICE_UNAVAILABLE` | Cannot connect to AI service |
| 504 | `TIMEOUT` | Request timeout |

### Common Error Scenarios

**File Validation Errors (400):**
- No file uploaded
- Empty file
- File too large (>10MB)
- Invalid file type (not PDF)

**PDF Processing Errors (400):**
- Corrupted PDF file
- Password-protected/encrypted PDF

**Extraction Errors (422):**
- Unable to extract biomarker data
- Invalid lab report format
- Missing required fields

**Service Errors (429, 503, 504):**
- API quota exceeded
- AI service unavailable
- Request timeout (>60 seconds)

**Server Errors (500):**
- Unexpected internal errors
- Validation failures

---

## 🚦 Rate Limiting

**Current Limits:** None (development)

**Recommended Production Limits:**
- 10 requests per minute per IP
- 100 requests per hour per IP
- 1000 requests per day per API key

**Implementation Options:**
- Express middleware (express-rate-limit)
- API Gateway (AWS, Google Cloud)
- Reverse proxy (Nginx, Cloudflare)

---

## 📊 Response Time

**Typical Processing Times:**
- PDF text extraction: ~1 second
- Claude API processing: ~30-35 seconds
- Biomarker classification: <1 second
- **Total: ~30-40 seconds**

**Timeout Settings:**
- Server timeout: 60 seconds
- Client timeout: 60 seconds (recommended)

**Performance Considerations:**
- Processing time depends on PDF complexity
- Claude API response time varies
- Consider implementing progress indicators for better UX

---

## 🧪 Testing

### Mock Data Mode

Enable test mode to bypass Claude API calls:
- Set `USE_MOCK_DATA=true` in `.env`
- Upload any PDF file
- Returns pre-defined mock biomarker data
- Useful for development and testing

### Testing Checklist

**File Upload Tests:**
- Valid PDF upload
- Invalid file type rejection
- File size limit enforcement
- Empty file rejection

**Error Handling Tests:**
- No file uploaded
- Corrupted PDF
- Encrypted PDF
- Network timeout

**Response Validation:**
- Patient data extraction
- Biomarker classification accuracy
- Reference range parsing
- Optimal range calculation

---

## 🔄 API Versioning

**Current Version:** 1.0.0

**Future Versioning Strategy:**
- URL versioning: `/api/v1/report/upload`
- Header versioning: `Accept: application/vnd.lab-report.v1+json`

Future versions will maintain backward compatibility or provide migration guides.

---

## 📚 Usage Examples

### Basic Upload Flow

1. Select PDF file from user's device
2. Create FormData with file
3. POST to `/api/report/upload`
4. Handle response or errors
5. Display biomarker results

### Client Integration

**Required:**
- Multipart form data support
- 60-second timeout configuration
- Error handling for all error codes

**Recommended:**
- Progress indicators during upload
- Retry logic for network errors
- User-friendly error messages

### Testing Tools

**Command Line:**
- cURL for basic testing
- HTTPie for formatted output

**API Clients:**
- Postman
- Insomnia
- Thunder Client (VS Code)

**Programming:**
- Axios (JavaScript)
- Fetch API (JavaScript)
- Requests (Python)
- HTTP client libraries in any language

---

## 📞 Support

**Issues & Questions:**
- GitHub Issues: [repository-url]/issues
- Email: support@yourdomain.com
- Documentation: [repository-url]/wiki

**Response Times:**
- Critical issues: 24 hours
- General questions: 48-72 hours

---

**Last Updated:** April 2026  
**API Version:** 1.0.0
