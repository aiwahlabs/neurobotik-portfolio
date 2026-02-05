
import json
import urllib.request
import urllib.error
import os

def clean_prompt():
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line:
                    k, v = line.strip().split('=', 1)
                    env_vars[k] = v

    workflow_id = "erDcGNpNbV5Rxjjv"
    
    headers = {
        "X-N8N-API-KEY": env_vars.get('N8N_API_KEY', ''),
        "Content-Type": "application/json"
    }

    req_get = urllib.request.Request(f"{env_vars['N8N_HOST']}/api/v1/workflows/{workflow_id}", headers=headers)
    with urllib.request.urlopen(req_get) as response:
        workflow = json.load(response)

    updated = False
    for node in workflow['nodes']:
        if 'KB Agent' in node['name']:
            # Locate prompt
            if 'options' in node['parameters'] and 'systemMessage' in node['parameters']['options']:
                 current = node['parameters']['options']['systemMessage']
                 param_loc = 'options'
            else:
                continue

            # Identify split points to remove ALL previous iterations of the protocol
            # We look for the start of the section and cut everything after it
            
            clean = current
            
            # 1. Remove "FALLBACK & ESCALATION PROTOCOL" (My added header)
            if "**FALLBACK & ESCALATION PROTOCOL:**" in clean:
                clean = clean.split("**FALLBACK & ESCALATION PROTOCOL:**")[0].strip()
            
            # 2. Remove "ESCALATION:" (Original header, just in case)
            if "**ESCALATION:**" in clean:
                clean = clean.split("**ESCALATION:**")[0].strip()

            # 3. Append the Single Source of Truth
            final_prompt = clean + """

**FALLBACK & ESCALATION PROTOCOL:**
If the user asks about "Voice AI Agents" or ANY information NOT in the knowledge base, OR explicitly asks for a human:

1. **CHECK:** Do you have the user's contact information (email or phone) in the conversation history?
2. **IF NO CONTACT INFO:**
   - DO NOT call the escalation tool yet.
   - Reply exactly: "It would be better if someone from our team reaches out to clarify this for you directly. Could you please share your email address? Feel free to add any specific details you'd like them to know."
3. **IF YOU HAVE CONTACT INFO:**
   - Call the `escalate_issue` tool immediately.
   - Pass the `contact_info` and a clear `summary` of their question/issue.
   - After calling the tool, reply: "Thanks! I've passed your details to the team. They will reach out shortly."
"""
            # Apply update
            node['parameters']['options']['systemMessage'] = final_prompt
            updated = True
            print("Prompt cleaned and updated.")
            break

    if updated:
        payload = {
            "name": workflow['name'],
            "nodes": workflow['nodes'],
            "connections": workflow['connections'],
            "settings": workflow.get('settings', {"executionOrder": "v1"})
        }

        req_put = urllib.request.Request(f"{env_vars['N8N_HOST']}/api/v1/workflows/{workflow_id}", 
                                       data=json.dumps(payload).encode('utf-8'), 
                                       headers=headers, 
                                       method='PUT')
        with urllib.request.urlopen(req_put) as response:
            print(f"CLEANUP_SUCCESS: {workflow_id}")
    else:
        print("No update needed or node not found.")

if __name__ == "__main__":
    clean_prompt()
