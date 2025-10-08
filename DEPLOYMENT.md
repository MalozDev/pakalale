# GitHub Pages Deployment Guide

This guide explains how to deploy the Pakalale frontend to GitHub Pages.

## Automatic Deployment (Recommended)

The project is configured with GitHub Actions for automatic deployment:

1. **Push to main branch**: The workflow automatically builds and deploys your app
2. **GitHub Pages settings**: Go to your repository Settings → Pages
3. **Source**: Select "GitHub Actions" as the source
4. **URL**: Your app will be available at `https://yourusername.github.io/pakalale/`

## Manual Deployment

If you prefer manual deployment:

```bash
cd frontend
npm run deploy
```

## Configuration Details

- **Base path**: `/pakalale/` (configured in `vite.config.ts`)
- **Build output**: `dist/` directory
- **GitHub Actions workflow**: `.github/workflows/deploy.yml`

## Important Notes

1. **Repository name**: Make sure your GitHub repository is named `pakalale`
2. **Branch**: The workflow deploys from the `main` branch
3. **Permissions**: Ensure GitHub Actions has write permissions in repository settings

## Troubleshooting

- If deployment fails, check the Actions tab in your GitHub repository
- Ensure all dependencies are properly installed
- Verify the repository name matches the base path configuration

## Local Testing

Test the production build locally:

```bash
cd frontend
npm run build
npm run preview
```

This will serve the built files locally to test before deployment.
