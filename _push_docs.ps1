#!/usr/bin/env pwsh
# Git operations for alti.code.studio monorepo
# Clear any inherited git env vars that might corrupt context
$env:GIT_DIR = $null
$env:GIT_WORK_TREE = $null
$env:GIT_INDEX_FILE = $null
Remove-Item Env:\GIT_DIR -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_WORK_TREE -ErrorAction SilentlyContinue
Set-Location "c:\Users\hyper\Desktop\workspace\alti.code.studio"
Write-Host "PWD: $(Get-Location)"
git status --short
Write-Host "Staging all..."
git add README.md CHANGELOG.md ROADMAP.md RELEASE_NOTES.md
git status --short
Write-Host "Committing..."
git commit -m "docs(v3.0): update monorepo docs — README, CHANGELOG, ROADMAP, RELEASE_NOTES" -m "Grand Swarm (v3.0): 120+ agents, 21 cloud providers, 46 languages, hardened BaseSpecialistAgent, 114-route CapabilityRouter"
Write-Host "Pushing..."
git push origin main
Write-Host "Done!"
git log --oneline -3
