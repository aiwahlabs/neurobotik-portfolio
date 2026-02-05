
import json
import urllib.request
import urllib.error
import os

def debug_prompt():
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line:
                    k, v = line.strip().split('=', 1)
                    env_vars[k] = v

    # Main Workflow ID
    workflow_id = "erDcGNpNbV5Rxjjv"
    
    if not env_vars.get('N8N_API_KEY') or not env_vars.get('N8N_HOST'):
        print("Missing .env credentials")
        return

    headers = {
        "X-N8N-API-KEY": env_vars.get('N8N_API_KEY', ''),
        "Content-Type": "application/json"
    }

    try:
        # GET Latest Workflow
        req_get = urllib.request.Request(f"{env_vars['N8N_HOST']}/api/v1/workflows/{workflow_id}", headers=headers)
        with urllib.request.urlopen(req_get) as response:
            workflow = json.load(response)

        print("Checking Chat Model Nodes:")
        for node in workflow['nodes']:
            # Check for AI/LLM nodes
            if 'Agent' in node['name'] or 'Chat' in node['name'] or 'Model' in node['name'] or 'LLM' in node['name']:
                print(f"--- Node: {node['name']} (Type: {node['type']}) ---")
                
                # Check for 'options' -> 'systemMessage' (common in LangChain nodes)
                if 'options' in node['parameters'] and 'systemMessage' in node['parameters']['options']:
                    print(f"System Message found in options:\n{node['parameters']['options']['systemMessage']}\n")
                
                # Check for 'prompt' parameter (common in Basic LLM nodes)
                elif 'prompt' in node['parameters']:
                    print(f"Prompt found:\n{node['parameters']['prompt']}\n")
                    
                # Check for 'text' parameter (sometimes used in agents)
                elif 'text' in node['parameters']:
                    print(f"Text found:\n{node['parameters']['text']}\n")
                
                else:
                    print("No explicit system prompt found in top-level parameters.")
                    # print(json.dumps(node['parameters'], indent=2))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_prompt()
