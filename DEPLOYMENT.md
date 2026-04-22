# Deployment Guide

Production deployment guide for the Lab Report Analyzer.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Option 1: Vercel + AWS ECS](#option-1-vercel--aws-ecs-recommended)
  - [Option 2: Vercel Only (Serverless)](#option-2-vercel-only-serverless)
- [CI/CD Setup](#cicd-setup)
- [Monitoring](#monitoring)
- [Cost Estimates](#cost-estimates)
- [Security Checklist](#security-checklist)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Vercel CDN    │  Static React App
│   (Frontend)    │  Global edge network
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   AWS ECS       │  Express API Server
│   (Backend)     │  Auto-scaling containers
└────────┬────────┘
         │
         ├──► Anthropic API (Claude)
         └──► AWS Secrets Manager
```

---

## ✅ Prerequisites

- Domain name (optional but recommended)
- Anthropic API key with sufficient credits
- AWS account or Vercel account
- Git repository (GitHub recommended)
- Node.js 18+ and pnpm installed locally

---

## 🔐 Environment Variables

### Backend (Server)

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=3001
NODE_ENV=production
```

### Frontend (Client)

```bash
VITE_API_URL=https://api.yourdomain.com
```

---

## 🚀 Deployment Options

### Option 1: Vercel + AWS ECS (Recommended)

**Best for:** Production deployments with auto-scaling and high availability

#### Backend: AWS ECS Fargate

**Steps:**

1. **Create ECR Repository**
   - Navigate to AWS ECR console
   - Create repository named `lab-report-api`
   - Note the repository URI

2. **Store API Key in Secrets Manager**
   - Go to AWS Secrets Manager
   - Create new secret with key `ANTHROPIC_API_KEY`
   - Note the secret ARN

3. **Create Dockerfile**
   - Add `Dockerfile` in `packages/server/`
   - Configure for Node.js 18 with pnpm
   - Expose port 3001

4. **Build and Push Docker Image**
   - Authenticate with ECR
   - Build Docker image locally
   - Tag and push to ECR repository

5. **Create ECS Task Definition**
   - CPU: 512 (0.5 vCPU)
   - Memory: 1024 MB (1 GB)
   - Container port: 3001
   - Link Secrets Manager for API key
   - Configure CloudWatch logging

6. **Create Application Load Balancer**
   - Create ALB in VPC
   - Configure target group (port 3001)
   - Set health check path: `/health`
   - Configure HTTPS with SSL certificate

7. **Create ECS Service**
   - Launch type: Fargate
   - Desired tasks: 2 (for high availability)
   - Attach to load balancer
   - Enable auto-scaling (2-10 tasks)
   - Configure scaling based on CPU/memory

8. **Configure Auto-Scaling**
   - Target CPU utilization: 70%
   - Min tasks: 2
   - Max tasks: 10

**Result:** API available at ALB DNS name or custom domain

#### Frontend: Vercel

**Steps:**

1. **Connect GitHub Repository**
   - Sign in to Vercel
   - Import Git repository
   - Select `packages/client` as root directory

2. **Configure Build Settings**
   - Framework: Vite
   - Build command: `pnpm build`
   - Output directory: `dist`
   - Install command: `pnpm install`

3. **Set Environment Variables**
   - Add `VITE_API_URL` with your ECS ALB URL
   - Example: `https://api.yourdomain.com`

4. **Deploy**
   - Click "Deploy"
   - Vercel auto-deploys on every push to main branch

5. **Configure Custom Domain** (Optional)
   - Add custom domain in Vercel settings
   - Update DNS records as instructed
   - SSL certificate auto-provisioned

**Result:** Frontend available at Vercel URL or custom domain

---

### Option 2: Vercel Only (Serverless)

**Best for:** Low-traffic deployments, minimal infrastructure

**Steps:**

1. **Convert Server to Serverless Functions**
   - Create `api/` folder in client package
   - Convert Express routes to Vercel serverless functions
   - Configure `vercel.json` for API routes

2. **Deploy Both Frontend and API to Vercel**
   - Single deployment for full stack
   - API routes available at `/api/*`
   - No separate backend infrastructure needed

3. **Configure Environment Variables**
   - Add `ANTHROPIC_API_KEY` in Vercel dashboard
   - Mark as secret/sensitive

**Limitations:**
- 10-second timeout on Hobby plan (may not be enough for Claude API)
- Consider Pro plan for 60-second timeout
- Less control over scaling and resources

---

## 🔄 CI/CD Setup

### GitHub Actions

**Create `.github/workflows/deploy.yml`:**

**Workflow triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

1. **Deploy Backend (AWS ECS)**
   - Checkout code
   - Configure AWS credentials
   - Build Docker image
   - Push to ECR
   - Update ECS service with new image

2. **Deploy Frontend (Vercel)**
   - Checkout code
   - Install dependencies
   - Build client
   - Deploy to Vercel using Vercel CLI or GitHub integration

**Secrets to configure in GitHub:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ANTHROPIC_API_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 📊 Monitoring

### AWS CloudWatch (for ECS)

**Metrics to monitor:**
- CPU utilization
- Memory utilization
- Request count
- Error rate (4xx, 5xx)
- Response time

**Alarms to set up:**
- Error rate > 5%
- CPU utilization > 80%
- Memory utilization > 80%
- Response time > 40 seconds

**Log groups:**
- `/ecs/lab-report-api` - Application logs
- View logs in CloudWatch Logs console

### Vercel Analytics

**Built-in metrics:**
- Page views
- Performance scores
- Web Vitals
- Geographic distribution

**Enable in Vercel dashboard:**
- Go to project settings
- Enable Analytics
- View real-time data

### Anthropic API Monitoring

**Track usage:**
- Monitor API usage in Anthropic console
- Set up billing alerts
- Track cost per report processed

---

## 💰 Cost Estimates

### Vercel + AWS ECS (Recommended)

| Service | Usage | Cost/Month |
|---------|-------|------------|
| Vercel (Frontend) | Free tier | $0 |
| AWS ECS Fargate | 2 tasks, 0.5 vCPU, 1GB | ~$30 |
| AWS ALB | 1 load balancer | ~$20 |
| AWS Secrets Manager | 1 secret | ~$0.40 |
| Anthropic API | 1000 reports/month | ~$3-10 |
| **Total** | | **~$53-60/month** |

### Vercel Only (Serverless)

| Service | Usage | Cost/Month |
|---------|-------|------------|
| Vercel Pro | Required for 60s timeout | $20 |
| Anthropic API | 1000 reports/month | ~$3-10 |
| **Total** | | **~$23-30/month** |

**Note:** Vercel Hobby (free) has 10-second timeout which is insufficient for Claude API processing (~30-35 seconds).

---

## 🔒 Security Checklist

### API Key Security
- [ ] Store `ANTHROPIC_API_KEY` in AWS Secrets Manager or Vercel environment variables
- [ ] Never commit API keys to Git
- [ ] Rotate API keys regularly (quarterly)
- [ ] Use separate keys for dev/staging/production

### HTTPS/TLS
- [ ] Enable HTTPS for all endpoints
- [ ] Use valid SSL certificates (AWS Certificate Manager or Vercel auto-SSL)
- [ ] Enforce HTTPS redirects

### CORS Configuration
- [ ] Restrict origins to production domain only
- [ ] Remove `localhost` origins in production
- [ ] Update CORS settings in `packages/server/src/index.ts`

### Rate Limiting
- [ ] Implement rate limiting on upload endpoint
- [ ] Consider AWS API Gateway for advanced rate limiting
- [ ] Set reasonable limits (e.g., 10 requests/minute per IP)

### File Validation
- [ ] Validate file size (10MB limit enforced)
- [ ] Validate file type (PDF only)
- [ ] Consider malware scanning for uploaded files

### Access Control
- [ ] Implement authentication if handling real patient data
- [ ] Add API key authentication for programmatic access
- [ ] Consider OAuth 2.0 for user authentication

### Compliance
- [ ] Review HIPAA compliance if handling real patient data
- [ ] Implement data retention policies
- [ ] Add privacy policy and terms of service
- [ ] Ensure data encryption at rest and in transit

### Monitoring & Alerts
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Monitor API usage and costs
- [ ] Configure uptime monitoring
- [ ] Set up alerts for high error rates

---

## 🚨 Troubleshooting

### Common Issues

**CORS errors in production:**
- Update allowed origins in server CORS configuration
- Ensure frontend URL matches CORS settings exactly

**API timeout errors:**
- Increase ECS task timeout settings
- Increase ALB timeout to 60+ seconds
- Verify client timeout is set to 60 seconds

**High API costs:**
- Implement caching for repeated uploads
- Add request throttling
- Monitor usage in Anthropic dashboard
- Consider batch processing for multiple reports

**Container fails to start:**
- Check CloudWatch logs for errors
- Verify Secrets Manager permissions
- Ensure environment variables are set correctly

**Deployment failures:**
- Verify AWS credentials in GitHub secrets
- Check ECR repository permissions
- Review ECS task definition configuration

---

## 📞 Support

**For deployment issues:**
1. Check service logs (CloudWatch or Vercel logs)
2. Review this deployment guide
3. Consult cloud provider documentation
4. Open GitHub issue with deployment details

**Useful Resources:**
- AWS ECS Documentation: https://docs.aws.amazon.com/ecs/
- Vercel Documentation: https://vercel.com/docs
- Anthropic API Docs: https://docs.anthropic.com/

---

**Last Updated:** April 2026
