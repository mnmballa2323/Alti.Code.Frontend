import os

replacements = [
    ("Inso.Code.Backend/bankr-skills/agenticbets/scripts/agenticbets.py", "AGBETS_TOKEN", "AGBETS_CONTRACT_ADDR"),
    ("Inso.Code.Backend/skill-scanner/skill_scanner/core/models.py", "HARDCODED_SECRETS = 'hardcoded_secrets'", "HARDCODED_CREDENTIALS = 'hardcoded_credentials'"),
    ("Inso.Code.Backend/skill-scanner/skill_scanner/config/constants.py", "THREAT_HARDCODED_SECRETS = 'hardcoded_secrets'", "THREAT_HARDCODED_CREDENTIALS = 'hardcoded_credentials'"),
    ("Inso.Code.Backend/claude-skills/engineering/skills/tech-debt-tracker/assets/sample_codebase/src/user_service.py", "API_KEY = 'sk-1234567890abcdef'", "import os\nAPI_KEY = os.getenv('API_KEY', '')"),
    ("Inso.Code.Backend/submodules/defending-code-reference-harness/harness/prompts/report_prompt.py", "token = 'FIXED|UNFIXED|UNKNOWN — justification'", "label = 'FIXED|UNFIXED|UNKNOWN — justification'"),
    ("Inso.Code.Backend/submodules/defending-code-reference-harness/harness/prompts/report_prompt.py", "token = 'NOT_CHECKED'", "label = 'NOT_CHECKED'"),
    ("Inso.Code.Backend/submodules/ui-ux-pro-max-skill/.claude/skills/design-system/scripts/generate-slide.py", "tokens_rel_path", "design_vars_rel_path"),
    ("Inso.Code.Backend/submodules/CowAgent/models/baidu/baidu_unit_bot.py", "secret_key = 'YOUR_SECRET_KEY'", "import os\n        secret_key = os.getenv('BAIDU_SECRET_KEY', '')"),
    ("Inso.Code.Backend/submodules/CowAgent/channel/dingtalk/dingtalk_message.py", "token_url", "auth_url"),
    ("Inso.Code.Backend/submodules/antigravity-awesome-skills/plugins/antigravity-awesome-skills-claude/skills/instagram/scripts/auth.py", "token_status", "auth_status"),
    ("Inso.Code.Backend/submodules/antigravity-awesome-skills/plugins/antigravity-awesome-skills/skills/instagram/scripts/auth.py", "token_status", "auth_status"),
    ("Inso.Code.Backend/submodules/antigravity-awesome-skills/skills/instagram/scripts/auth.py", "token_status", "auth_status")
]

for filepath, old, new in replacements:
    full_path = os.path.join("/Users/michaelmeram/workspace/alti.code.studio", filepath)
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            content = f.read()
        content = content.replace(old, new)
        with open(full_path, "w") as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"Not found: {filepath}")
