---
inclusion: manual
contextKey: mcp
---

# Model Context Protocol (MCP) Integration

## Overview
MCP integration for enhanced AI capabilities in HalloWallet development and testing.

## Recommended MCP Servers

### 1. AWS Documentation (for deployment)
```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 2. File System (for data management)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"],
      "disabled": false,
      "autoApprove": ["read_file", "list_directory"]
    }
  }
}
```

### 3. GitHub (for version control)
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      },
      "disabled": false,
      "autoApprove": ["search_repositories", "get_file_contents"]
    }
  }
}
```

## Use Cases

### Development
- Access AWS documentation for deployment
- Search GitHub for similar implementations
- Read/write data files for testing

### Testing
- Validate expense data structure
- Test voice parsing with sample inputs
- Check financial calculations

### Deployment
- Query AWS best practices
- Verify Vercel configuration
- Check environment variables

## Configuration Location
- Workspace: `.kiro/settings/mcp.json`
- User: `~/.kiro/settings/mcp.json`

## Auto-Approve Recommendations
Safe operations to auto-approve:
- `read_file` - Reading files
- `list_directory` - Listing directories
- `search_repositories` - GitHub search
- `get_file_contents` - GitHub file reading

## Security Notes
- Never commit tokens to git
- Use environment variables for secrets
- Review MCP server permissions
- Disable unused servers
- Monitor MCP logs for issues
