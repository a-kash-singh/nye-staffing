#!/bin/bash

# Script to push NYE Staffing to GitHub
# Usage: ./push-to-github.sh <your-github-username> <repo-name>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./push-to-github.sh <your-github-username> <repo-name>"
    echo "Example: ./push-to-github.sh akashsingh nye-staffing"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME=$2

echo "Setting up remote repository..."
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git" 2>/dev/null || \
git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "Repository URL: https://github.com/${GITHUB_USER}/${REPO_NAME}"
