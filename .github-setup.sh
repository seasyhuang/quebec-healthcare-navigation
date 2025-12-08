#!/bin/bash
# Script to connect to GitHub repository and push code
# Usage: ./github-setup.sh YOUR_REPO_URL

if [ -z "$1" ]; then
    echo "Usage: ./github-setup.sh YOUR_GITHUB_REPO_URL"
    echo "Example: ./github-setup.sh https://github.com/username/quebec-healthcare-navigation.git"
    exit 1
fi

echo "Adding remote repository..."
git remote add origin "$1"

echo "Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Your code is now on GitHub."
echo "Next step: Go to vercel.com and import this repository."

