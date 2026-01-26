{ pkgs, ... }:

{
  # Languages
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };

  # Tools
  packages = with pkgs; [
    gh          # GitHub CLI
    jq          # JSON processing
  ];

  # Scripts
  scripts = {
    validate.exec = "./scripts/validate-skills.sh";
    new-skill.exec = ''
      if [ -z "$1" ]; then
        echo "Usage: new-skill <name>"
        exit 1
      fi
      mkdir -p "skills/$1"
      cat > "skills/$1/SKILL.md" << 'EOF'
      ---
      name: $1
      description: TODO - describe when this skill should be used
      ---

      # $1

      TODO - add instructions
      EOF
      echo "Created skills/$1/SKILL.md"
    '';
  };

  # Pre-commit hooks
  git-hooks.hooks = {
    # Custom
    validate-skills = {
      enable = true;
      name = "validate-skills";
      entry = "./scripts/validate-skills.sh";
      pass_filenames = false;
    };

    # Shell
    shellcheck.enable = true;
    shfmt.enable = true;

    # YAML
    yamllint.enable = true;

    # Markdown
    markdownlint.enable = true;

    # JSON
    check-json.enable = true;
    prettier = {
      enable = true;
      types_or = [ "json" "yaml" ];
    };

    # GitHub Actions
    actionlint.enable = true;

    # General
    end-of-file-fixer.enable = true;
    trim-trailing-whitespace.enable = true;
  };

  claude.code.enable = true;
}
